export type Theme = "light" | "dark";

export function useTheme(): { theme: Theme } {
  return { theme: "light" };
}
