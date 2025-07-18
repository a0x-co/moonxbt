import { useState, useEffect, useCallback, useRef } from "react";

interface AssetRequest {
  bucketName: string;
  filePath: string;
  expiresIn?: number;
}

interface AssetState {
  signedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  expiresAt: number | null;
}

interface Asset {
  signedUrl: string;
  expiresAt: number;
}

interface AssetCache {
  [key: string]: AssetState;
}

class AssetManager {
  private cache: AssetCache = {};
  private subscribers: Map<string, Set<(state: AssetState) => void>> =
    new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

  private getCacheKey(bucketName: string, filePath: string): string {
    return `${bucketName}:${filePath}`;
  }

  private notifySubscribers(
    bucketName: string,
    filePath: string,
    state: AssetState
  ) {
    const key = this.getCacheKey(bucketName, filePath);
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => callback(state));
    }
  }

  private scheduleRefresh(
    bucketName: string,
    filePath: string,
    expiresAt: number
  ) {
    const key = this.getCacheKey(bucketName, filePath);
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry

    // Clear existing timer
    const existingTimer = this.refreshTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.refreshAsset(bucketName, filePath);
    }, refreshTime);

    this.refreshTimers.set(key, timer);
  }

  private async refreshAsset(bucketName: string, filePath: string) {
    const key = this.getCacheKey(bucketName, filePath);
    const currentState = this.cache[key];

    if (!currentState) return;

    try {
      const asset = await this.getAsset(bucketName, filePath);
      this.cache[key] = {
        signedUrl: asset.signedUrl,
        isLoading: false,
        error: null,
        expiresAt: asset.expiresAt,
      };
      this.notifySubscribers(bucketName, filePath, this.cache[key]);
      this.scheduleRefresh(bucketName, filePath, asset.expiresAt);
    } catch (error) {
      this.cache[key] = {
        ...currentState,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to refresh asset",
      };
      this.notifySubscribers(bucketName, filePath, this.cache[key]);
    }
  }

  async getAsset(
    bucketName: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<Asset> {
    const key = this.getCacheKey(bucketName, filePath);
    const cached = this.cache[key];

    // Return cached asset if it's still valid
    if (
      cached &&
      cached.signedUrl &&
      cached.expiresAt &&
      Date.now() < cached.expiresAt
    ) {
      return {
        signedUrl: cached.signedUrl,
        expiresAt: cached.expiresAt,
      };
    }

    // Set loading state
    this.cache[key] = {
      signedUrl: null,
      isLoading: true,
      error: null,
      expiresAt: null,
    };
    this.notifySubscribers(bucketName, filePath, this.cache[key]);

    try {
      const response = await fetch("/api/assets/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketName,
          filePath,
          expiresIn,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }

      const data = await response.json();
      const expiresAt = new Date(data.expiresAt).getTime();

      const asset: Asset = {
        signedUrl: data.signedUrl,
        expiresAt,
      };

      // Update cache
      this.cache[key] = {
        signedUrl: asset.signedUrl,
        isLoading: false,
        error: null,
        expiresAt: asset.expiresAt,
      };

      this.notifySubscribers(bucketName, filePath, this.cache[key]);
      this.scheduleRefresh(bucketName, filePath, asset.expiresAt);

      return asset;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get signed URL";
      this.cache[key] = {
        signedUrl: null,
        isLoading: false,
        error: errorMessage,
        expiresAt: null,
      };
      this.notifySubscribers(bucketName, filePath, this.cache[key]);
      throw error;
    }
  }

  async getAssets(requests: AssetRequest[]): Promise<Asset[]> {
    const promises = requests.map((request) =>
      this.getAsset(request.bucketName, request.filePath, request.expiresIn)
    );
    return Promise.all(promises);
  }

  getAssetState(bucketName: string, filePath: string): AssetState {
    const key = this.getCacheKey(bucketName, filePath);
    return (
      this.cache[key] || {
        signedUrl: null,
        isLoading: false,
        error: null,
        expiresAt: null,
      }
    );
  }

  subscribe(
    bucketName: string,
    filePath: string,
    callback: (state: AssetState) => void
  ): () => void {
    const key = this.getCacheKey(bucketName, filePath);

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  clearCache(bucketName?: string, filePath?: string) {
    if (bucketName && filePath) {
      const key = this.getCacheKey(bucketName, filePath);
      delete this.cache[key];

      // Clear timer
      const timer = this.refreshTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.refreshTimers.delete(key);
      }
    } else {
      // Clear all cache
      this.cache = {};
      this.refreshTimers.forEach((timer) => clearTimeout(timer));
      this.refreshTimers.clear();
    }
  }

  preloadAsset(bucketName: string, filePath: string, expiresIn: number = 3600) {
    this.getAsset(bucketName, filePath, expiresIn).catch(() => {
      // Silently fail for preload
    });
  }
}

// Singleton instance
export const assetManager = new AssetManager();

// Hook for managing multiple assets
export function useAssets() {
  const [states, setStates] = useState<AssetCache>({});

  const getAsset = useCallback(
    async (
      bucketName: string,
      filePath: string,
      expiresIn: number = 3600
    ): Promise<Asset> => {
      return assetManager.getAsset(bucketName, filePath, expiresIn);
    },
    []
  );

  const getAssets = useCallback(
    async (requests: AssetRequest[]): Promise<Asset[]> => {
      return assetManager.getAssets(requests);
    },
    []
  );

  const getAssetState = useCallback(
    (bucketName: string, filePath: string): AssetState => {
      return assetManager.getAssetState(bucketName, filePath);
    },
    []
  );

  const preloadAsset = useCallback(
    (bucketName: string, filePath: string, expiresIn: number = 3600) => {
      assetManager.preloadAsset(bucketName, filePath, expiresIn);
    },
    []
  );

  const clearCache = useCallback((bucketName?: string, filePath?: string) => {
    assetManager.clearCache(bucketName, filePath);
  }, []);

  // Subscribe to all asset changes
  useEffect(() => {
    const unsubscribe = assetManager.subscribe("*", "*", (state) => {
      setStates((prev) => ({ ...prev }));
    });

    return unsubscribe;
  }, []);

  return {
    getAsset,
    getAssets,
    getAssetState,
    preloadAsset,
    clearCache,
  };
}

// Hook for a single asset
export function useAsset(
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600,
  autoLoad: boolean = true
) {
  const [state, setState] = useState<AssetState>({
    signedUrl: null,
    isLoading: false,
    error: null,
    expiresAt: null,
  });

  const reload = useCallback(async () => {
    try {
      const asset = await assetManager.getAsset(
        bucketName,
        filePath,
        expiresIn
      );
      setState({
        signedUrl: asset.signedUrl,
        isLoading: false,
        error: null,
        expiresAt: asset.expiresAt,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load asset",
      }));
    }
  }, [bucketName, filePath, expiresIn]);

  // Subscribe to asset changes
  useEffect(() => {
    const unsubscribe = assetManager.subscribe(bucketName, filePath, setState);
    return unsubscribe;
  }, [bucketName, filePath]);

  // Auto-load asset
  useEffect(() => {
    if (autoLoad) {
      reload();
    }
  }, [autoLoad, reload]);

  return {
    ...state,
    reload,
  };
}
