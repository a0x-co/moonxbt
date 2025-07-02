import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface AsyncRequestState {
  ticketId: string | null;
  status: "idle" | "pending" | "processing" | "completed" | "failed";
  progress: number;
  result: any | null;
  error: string | null;
  estimatedTime: string | null;
  isLoading: boolean;
}

interface UseAsyncRequestOptions {
  pollInterval?: number; // in milliseconds
  maxPollingTime?: number; // in milliseconds
  onCompleted?: (result: any) => void;
  onFailed?: (error: string) => void;
}

export function useAsyncRequest(options: UseAsyncRequestOptions = {}) {
  const {
    pollInterval = 2000,
    maxPollingTime = 10 * 60 * 1000, // 10 minutes
    onCompleted,
    onFailed,
  } = options;

  const [state, setState] = useState<AsyncRequestState>({
    ticketId: null,
    status: "idle",
    progress: 0,
    result: null,
    error: null,
    estimatedTime: null,
    isLoading: false,
  });

  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

  // Function to submit an async request
  const submitRequest = useCallback(
    async (endpoint: string, data: any) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        status: "pending",
        error: null,
        result: null,
      }));

      try {
        const response = await axios.post(endpoint, data);

        if (response.data.isAsync) {
          // It's an async request, start polling
          setState((prev) => ({
            ...prev,
            ticketId: response.data.ticketId,
            status: response.data.status,
            estimatedTime: response.data.estimatedTime,
          }));
          setPollingStartTime(Date.now());
        } else {
          // It's a synchronous response (fallback)
          setState((prev) => ({
            ...prev,
            status: "completed",
            progress: 100,
            result: response.data,
            isLoading: false,
          }));
          onCompleted?.(response.data);
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: error.message || "Request failed",
          isLoading: false,
        }));
        onFailed?.(error.message || "Request failed");
      }
    },
    [onCompleted, onFailed]
  );

  // Function to poll for status
  const pollStatus = useCallback(
    async (ticketId: string) => {
      try {
        const response = await axios.get(`/api/async-status/${ticketId}`);
        const statusData = response.data;

        setState((prev) => ({
          ...prev,
          status: statusData.status,
          progress: statusData.progress || 0,
          result: statusData.syntheticResponse || statusData.result,
          error: statusData.error,
        }));

        if (statusData.status === "completed") {
          setState((prev) => ({ ...prev, isLoading: false }));
          onCompleted?.(statusData.syntheticResponse || statusData.result);
          return false; // Stop polling
        }

        if (statusData.status === "failed") {
          setState((prev) => ({ ...prev, isLoading: false }));
          onFailed?.(statusData.error || "Request failed");
          return false; // Stop polling
        }

        return true; // Continue polling
      } catch (error: any) {
        console.error("Polling error:", error);
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: "Failed to get status",
          isLoading: false,
        }));
        onFailed?.("Failed to get status");
        return false; // Stop polling
      }
    },
    [onCompleted, onFailed]
  );

  // Polling effect
  useEffect(() => {
    if (
      !state.ticketId ||
      state.status === "completed" ||
      state.status === "failed"
    ) {
      return;
    }

    const poll = async () => {
      // Check if we've exceeded max polling time
      if (pollingStartTime && Date.now() - pollingStartTime > maxPollingTime) {
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: "Request timeout",
          isLoading: false,
        }));
        onFailed?.("Request timeout");
        return;
      }

      const shouldContinue = await pollStatus(state.ticketId!);

      if (shouldContinue) {
        setTimeout(poll, pollInterval);
      }
    };

    const timeoutId = setTimeout(poll, pollInterval);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    state.ticketId,
    state.status,
    pollStatus,
    pollInterval,
    maxPollingTime,
    pollingStartTime,
    onFailed,
  ]);

  // Reset function
  const reset = useCallback(() => {
    setState({
      ticketId: null,
      status: "idle",
      progress: 0,
      result: null,
      error: null,
      estimatedTime: null,
      isLoading: false,
    });
    setPollingStartTime(null);
  }, []);

  return {
    ...state,
    submitRequest,
    reset,
  };
}
