'use client';

import { useEffect } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastState {
  kind: ToastKind;
  title: string;
  detail?: string;
}

export function Toast({
  toast,
  onClose,
  ms = 6500,
}: {
  toast: ToastState | null;
  onClose: () => void;
  ms?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, ms);
    return () => window.clearTimeout(t);
  }, [toast, onClose, ms]);

  if (!toast) return null;

  const border =
    toast.kind === 'success'
      ? 'border-emerald-500/50 bg-emerald-950/90'
      : toast.kind === 'error'
        ? 'border-critical/50 bg-red-950/90'
        : 'border-accent/40 bg-ink-900/95';

  const badge =
    toast.kind === 'success' ? 'TEST PASSED' : toast.kind === 'error' ? 'TEST FAILED' : 'INFO';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div
        className={`pointer-events-auto w-full max-w-lg rounded-xl border px-4 py-3 shadow-xl backdrop-blur ${border}`}
        role="status"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">{badge}</p>
            <p className="mt-1 text-sm font-medium text-white">{toast.title}</p>
            {toast.detail ? (
              <p className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap break-words text-xs text-ink-300">
                {toast.detail}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-xs text-ink-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
