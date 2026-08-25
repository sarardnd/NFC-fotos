"use client";

import { AnimatePresence, motion } from "motion/react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-3xl border border-surface-border bg-blanco p-6 shadow-xl shadow-piedra/15"
            initial={{ y: 20, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-lust px-5 text-base font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 disabled:opacity-50 sm:h-11 sm:w-auto sm:text-sm"
              >
                {pending ? "Borrando…" : "Borrar"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full border border-surface-border bg-blanco px-5 text-base font-medium text-muted-foreground transition-transform duration-150 hover:border-foreground/20 active:scale-95 sm:h-11 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
