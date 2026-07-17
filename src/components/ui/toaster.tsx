"use client";

import * as React from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

let externalToast: ((t: Omit<Toast, "id">) => void) | null = null;
export function toast(t: Omit<Toast, "id">) {
  externalToast?.(t);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    externalToast = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, ...t }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 4000);
    };
    return () => {
      externalToast = null;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          className={`pointer-events-auto cursor-pointer rounded-lg border p-4 shadow-lg animate-fade-in ${
            t.variant === "destructive"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : t.variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          {t.title && <div className="text-sm font-semibold">{t.title}</div>}
          {t.description && <div className="mt-1 text-sm opacity-90">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
