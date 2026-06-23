"use client";

import { toast } from "sonner";

function show(message: string, type: "success" | "error" | "info" | "warning") {
  toast[type](message);
}

export const showToast = {
  success: (message: string) => show(message, "success"),
  error: (message: string) => show(message, "error"),
  info: (message: string) => show(message, "info"),
  warning: (message: string) => show(message, "warning"),
};
