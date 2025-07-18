# 🗂️ Assets con URLs Firmadas - Guía de Implementación

Esta guía te ayudará a implementar y usar la feature de assets con URLs firmadas para Google Cloud Storage en tu aplicación.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Configuración del Backend](#configuración-del-backend)
- [Configuración del Frontend](#configuración-del-frontend)
- [Uso de los Hooks](#uso-de-los-hooks)
- [Ejemplos de Implementación](#ejemplos-de-implementación)
- [Manejo de Errores](#manejo-de-errores)
- [Optimizaciones](#optimizaciones)
- [Troubleshooting](#troubleshooting)

## 🎯 Descripción General

La feature de assets con URLs firmadas permite acceder de forma segura a archivos privados almacenados en Google Cloud Storage. En lugar de hacer públicos todos los archivos, se generan URLs temporales que expiran después de un tiempo determinado.

### Características Principales

- ✅ **Seguridad**: URLs temporales que expiran automáticamente
- ✅ **Caché Inteligente**: Evita requests duplicados
- ✅ **Manejo de Errores**: Fallback a URLs públicas cuando es posible
- ✅ **Batch Loading**: Carga múltiples assets simultáneamente
- ✅ **Auto-refresh**: Renueva URLs antes de que expiren
- ✅ **TypeScript**: Tipado completo para mejor DX

## 🏗️ Arquitectura

```
Frontend (React)                    Backend (Express)              Google Cloud Storage
     │                                    │                              │
     │ 1. Request signed URL              │                              │
     ├────────────────────────────────────►│                              │
     │                                    │ 2. Generate signed URL       │
     │                                    ├──────────────────────────────►│
     │                                    │ 3. Return signed URL        │
     │                                    │◄─────────────────────────────┤
     │ 4. Return signed URL               │                              │
     │◄────────────────────────────────────┤                              │
     │                                    │                              │
     │ 5. Use signed URL to access file   │                              │
     └────────────────────────────────────┴──────────────────────────────►│
```

## 🔧 Configuración del Backend

### 1. Variables de Entorno

Asegúrate de tener configuradas las siguientes variables de entorno en tu backend:

```bash
# Google Cloud Storage Credentials
GCS_CREDENTIALS_PATH=/path/to/service-account.json
# O alternativamente:
GCP_PROJECT_ID=your-project-id
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GCP_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# API URL para el frontend
A0X_MIRROR_API_URL=http://localhost:3001
```

### 2. Estructura de Archivos

```
backend/
├── src/
│   ├── internal/
│   │   ├── bucket-storage/
│   │   │   ├── service.ts          # CloudStorageService
│   │   │   └── index.ts
│   │   └── http/
│   │       ├── agent/
│   │       │   └── get-signed-asset-url-handler.ts
│   │       └── a0x-agent/
│   │           └── routes.ts
```

### 3. Configuración del Router

El handler ya está configurado en `routes.ts`:

```typescript
// En routes.ts
a0xAgentRouter.get("/signed-asset-url", getSignedAssetUrlHandler(ctx));
```

### 4. CloudStorageService

El servicio ya incluye el método `getSignedUrl`:

```typescript
// Ejemplo de uso en el backend
const signedUrl = await cloudStorageService.getSignedUrl(bucketName, filePath, {
  version: "v4",
  action: "read",
  expires: Date.now() + 3600 * 1000, // 1 hora
});
```

## 🎨 Configuración del Frontend

### 1. Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Estructura de Archivos

```
frontend/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── assets/
│   │           └── signed-url/
│   │               └── route.ts
│   └── hooks/
│       ├── useAssetManager.ts
│       └── useAssets.ts
```

### 3. API Route

La API route ya está configurada en `frontend/src/app/api/assets/signed-url/route.ts` y maneja:

- ✅ Validación de parámetros
- ✅ Manejo de errores específicos
- ✅ Timeout configurado
- ✅ Soporte para GET y POST requests

## 🪝 Uso de los Hooks

### Hook `useAssets` (Recomendado)

```typescript
import { useAssets, useAsset } from "@/hooks/useAssets";

// Hook principal para múltiples assets
function MyComponent() {
  const { getAsset, getAssets, getAssetState, preloadAsset } = useAssets();

  // Cargar un solo asset
  const loadAsset = async () => {
    try {
      const asset = await getAsset("my-bucket", "images/photo.jpg", 3600);
      console.log("Asset loaded:", asset.signedUrl);
    } catch (error) {
      console.error("Failed to load asset:", error);
    }
  };

  // Cargar múltiples assets
  const loadMultipleAssets = async () => {
    const assets = await getAssets([
      { bucketName: "my-bucket", filePath: "images/photo1.jpg" },
      { bucketName: "my-bucket", filePath: "images/photo2.jpg" },
    ]);
    console.log("Assets loaded:", assets);
  };

  // Preload asset (fire and forget)
  preloadAsset("my-bucket", "images/photo.jpg");

  // Obtener estado de un asset
  const assetState = getAssetState("my-bucket", "images/photo.jpg");
  console.log("Asset state:", assetState);

  return (
    <div>
      {assetState.isLoading && <p>Loading...</p>}
      {assetState.error && <p>Error: {assetState.error}</p>}
      {assetState.signedUrl && <img src={assetState.signedUrl} alt="Asset" />}
    </div>
  );
}
```

### Hook `useAsset` (Para un solo asset)

```typescript
import { useAsset } from "@/hooks/useAssets";

function SingleAssetComponent() {
  const { signedUrl, isLoading, error, reload } = useAsset(
    "my-bucket",
    "images/photo.jpg",
    3600, // expiresIn en segundos
    true // autoLoad
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {signedUrl && <img src={signedUrl} alt="Asset" />}
      <button onClick={reload}>Reload Asset</button>
    </div>
  );
}
```

### AssetManager (Singleton)

```typescript
import { assetManager } from "@/hooks/useAssetManager";

// Uso directo del singleton
async function loadAssetDirectly() {
  try {
    const asset = await assetManager.getAsset("my-bucket", "images/photo.jpg");
    console.log("Asset loaded:", asset.signedUrl);
  } catch (error) {
    console.error("Failed to load asset:", error);
  }
}

// Suscribirse a cambios
const unsubscribe = assetManager.subscribe(
  "my-bucket",
  "images/photo.jpg",
  (state) => {
    console.log("Asset state changed:", state);
  }
);

// Limpiar cache
assetManager.clearCache("my-bucket", "images/photo.jpg");
```

## 📝 Ejemplos de Implementación

### 1. Galería de Imágenes

```typescript
import { useAssets } from "@/hooks/useAssets";

function ImageGallery({
  images,
}: {
  images: Array<{ bucketName: string; filePath: string }>;
}) {
  const { getAssets, getAssetState } = useAssets();
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const assets = await getAssets(images);
        setLoadedImages(assets.map((asset) => asset.signedUrl));
      } catch (error) {
        console.error("Failed to load images:", error);
      }
    };

    loadImages();
  }, [images, getAssets]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => {
        const state = getAssetState(image.bucketName, image.filePath);

        return (
          <div key={index} className="relative">
            {state.isLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {state.error && (
              <div className="absolute inset-0 bg-red-100 text-red-600 flex items-center justify-center">
                Error loading image
              </div>
            )}
            {state.signedUrl && (
              <img
                src={state.signedUrl}
                alt={`Image ${index}`}
                className="w-full h-48 object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### 2. Video Player con Preload

```typescript
import { useAsset } from "@/hooks/useAssets";

function VideoPlayer({
  bucketName,
  filePath,
}: {
  bucketName: string;
  filePath: string;
}) {
  const { signedUrl, isLoading, error, reload } = useAsset(
    bucketName,
    filePath,
    7200
  ); // 2 horas

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center">
        <span>Loading video...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-red-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading video</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <video controls className="w-full h-64" src={signedUrl || undefined}>
      Your browser does not support the video tag.
    </video>
  );
}
```

### 3. Document Viewer

```typescript
import { useAsset } from "@/hooks/useAssets";

function DocumentViewer({
  bucketName,
  filePath,
}: {
  bucketName: string;
  filePath: string;
}) {
  const { signedUrl, isLoading, error } = useAsset(bucketName, filePath, 1800); // 30 minutos

  if (isLoading) return <div>Loading document...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full h-screen">
      <iframe
        src={signedUrl || ""}
        className="w-full h-full border-0"
        title="Document Viewer"
      />
    </div>
  );
}
```

## ⚠️ Manejo de Errores

### Errores Comunes y Soluciones

1. **404 - Asset not found**

   ```typescript
   // Verificar que el archivo existe en el bucket
   const state = getAssetState("my-bucket", "images/photo.jpg");
   if (state.error?.includes("not found")) {
     // Mostrar placeholder o imagen por defecto
   }
   ```

2. **403 - Access denied**

   ```typescript
   // Verificar permisos del service account
   // Asegurarse de que las credenciales estén configuradas correctamente
   ```

3. **URL expired**
   ```typescript
   // El hook maneja automáticamente la renovación
   // Pero puedes forzar un reload:
   const { reload } = useAsset("my-bucket", "images/photo.jpg");
   reload();
   ```

### Error Boundaries

```typescript
import { ErrorBoundary } from "react-error-boundary";

function AssetErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h3 className="text-red-800 font-semibold">Error loading asset</h3>
      <p className="text-red-600 text-sm">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
      >
        Retry
      </button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={AssetErrorFallback}>
      <ImageGallery images={images} />
    </ErrorBoundary>
  );
}
```

## 🚀 Optimizaciones

### 1. Preload Assets

```typescript
// Preload assets críticos en el layout
function Layout({ children }: { children: React.ReactNode }) {
  const { preloadAsset } = useAssets();

  useEffect(() => {
    // Preload assets importantes
    preloadAsset("my-bucket", "images/logo.png");
    preloadAsset("my-bucket", "images/hero-bg.jpg");
  }, [preloadAsset]);

  return <div>{children}</div>;
}
```

### 2. Lazy Loading

```typescript
import { lazy, Suspense } from "react";

const LazyImageGallery = lazy(() => import("./ImageGallery"));

function App() {
  return (
    <Suspense fallback={<div>Loading gallery...</div>}>
      <LazyImageGallery images={images} />
    </Suspense>
  );
}
```

### 3. Cache Management

```typescript
import { useAssets } from "@/hooks/useAssets";

function CacheManager() {
  const { clearCache } = useAssets();

  const handleClearCache = () => {
    // Limpiar cache específico
    clearCache("my-bucket", "images/photo.jpg");

    // O limpiar todo el cache
    clearCache();
  };

  return <button onClick={handleClearCache}>Clear Cache</button>;
}
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **"Failed to get signed URL"**

   - Verificar que las credenciales de GCS estén configuradas
   - Revisar logs del backend para errores específicos
   - Verificar que el bucket y archivo existan

2. **URLs expiran muy rápido**

   - Aumentar el `expiresIn` en la llamada a `getAsset`
   - Verificar que el reloj del servidor esté sincronizado

3. **Cache no funciona**

   - Verificar que no haya múltiples instancias del hook
   - Limpiar cache manualmente si es necesario

4. **Performance lenta**
   - Usar `getAssets` para cargar múltiples archivos
   - Implementar preload para assets críticos
   - Considerar usar CDN para assets públicos

### Debugging

```typescript
// Habilitar logs detallados
const DEBUG_ASSETS = process.env.NODE_ENV === "development";

if (DEBUG_ASSETS) {
  console.log("Asset request:", { bucketName, filePath, expiresIn });
  console.log("Asset response:", asset);
}
```

### Monitoreo

```typescript
// Agregar métricas de performance
const startTime = performance.now();
const asset = await getAsset("my-bucket", "images/photo.jpg");
const endTime = performance.now();
console.log(`Asset loaded in ${endTime - startTime}ms`);
```

## 📚 Referencias

- [Google Cloud Storage Signed URLs](https://cloud.google.com/storage/docs/access-control/signed-urls)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://react.dev/reference/react/hooks)

## 🤝 Contribución

Para contribuir a esta feature:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Agrega tests si es necesario
5. Envía un pull request

---

**Nota**: Esta implementación está optimizada para aplicaciones React/Next.js con backend Express y Google Cloud Storage. Ajusta según tus necesidades específicas.
