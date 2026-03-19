import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

export function toast({ title, description, variant = "default" }: ToastOptions) {
  const message = title ?? "";

  if (variant === "destructive") {
    return sonnerToast.error(message, { description });
  }

  return sonnerToast(message, { description });
}

export function useToast() {
  return { toast };
}
