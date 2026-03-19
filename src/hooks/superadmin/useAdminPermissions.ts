import { useMemo } from "react";

export function useAdminPermissions(_: unknown) {
  return useMemo(
    () => ({
      hasAccess: true,
      isLoading: false,
    }),
    []
  );
}
