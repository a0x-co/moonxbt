import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Lista de assets que están disponibles localmente en /public/assets/
const LOCAL_ASSETS = [
  "assets/x.png",
  "assets/farcaster.png",
  "assets/zora.png",
  "assets/dexlogo.png",
  "assets/moonxbt.png",
  "assets/Base_Network_Logo.svg",
  "assets/moonxbtauction.mp4",
  "assets/moonxbt.mp4",
  "assets/moon-landing.png",
  "assets/moon-landing2.png",
  "assets/favicon.ico",
  "assets/favicon-16x16.png",
  "assets/favicon-32x32.png",
  "assets/apple-touch-icon.png",
  "assets/android-chrome-192x192.png",
  "assets/android-chrome-512x512.png",
  "assets/site.webmanifest",
];

/**
 * Determina si un asset debe cargarse localmente o desde el storage
 * @param filePath - Ruta del archivo en el storage
 * @returns true si el asset está disponible localmente
 */
export function isLocalAsset(filePath: string): boolean {
  return LOCAL_ASSETS.includes(filePath);
}

/**
 * Obtiene la URL local para un asset
 * @param filePath - Ruta del archivo en el storage
 * @returns URL local del asset
 */
export function getLocalAssetUrl(filePath: string): string {
  if (!isLocalAsset(filePath)) {
    throw new Error(`Asset ${filePath} is not available locally`);
  }
  return `/${filePath}`;
}
