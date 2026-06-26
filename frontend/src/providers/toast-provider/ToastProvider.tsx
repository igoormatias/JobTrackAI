"use client";

import { Toaster } from "sonner";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-card text-foreground",
          title: "text-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
};
