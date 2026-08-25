"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { publicMediaUrl } from "@/lib/storage";
import type { Media } from "@/lib/types";

const SWIPE_OFFSET = 80;
const SWIPE_VELOCITY = 500;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "70%" : "-70%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-70%" : "70%",
    opacity: 0,
  }),
};

type PhotoLightboxProps = {
  media: Media[];
  index: number;
  direction: number;
  coverPath: string | null;
  isSettingCover: boolean;
  justSetCover: boolean;
  /** true cuando el dueño está autenticado: muestra botones de acción */
  isAdmin?: boolean;
  onIndexChange: (index: number, direction: number) => void;
  onClose: () => void;
  onSetCover: (item: Media) => void;
  onRequestDelete: (item: Media) => void;
};

export function PhotoLightbox({
  media,
  index,
  direction,
  coverPath,
  isSettingCover,
  justSetCover,
  isAdmin = false,
  onIndexChange,
  onClose,
  onSetCover,
  onRequestDelete,
}: PhotoLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const item = media[index];
  const isCover = item.storage_path === coverPath;
  const canPrev = index > 0;
  const canNext = index < media.length - 1;
  const neighborIndexes = [index - 1, index + 1].filter(
    (i) => i >= 0 && i < media.length,
  );

  const goTo = useCallback(
    (newIndex: number, dir: number) => {
      onIndexChange(newIndex, dir);
    },
    [onIndexChange],
  );

  const onDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x > SWIPE_OFFSET || velocity.x > SWIPE_VELOCITY) {
        if (canPrev) goTo(index - 1, -1);
      } else if (offset.x < -SWIPE_OFFSET || velocity.x < -SWIPE_VELOCITY) {
        if (canNext) goTo(index + 1, 1);
      }
    },
    [canPrev, canNext, index, goTo],
  );

  // Focus al abrir para capturar teclas
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Navegación por teclado
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && canPrev) goTo(index - 1, -1);
      else if (e.key === "ArrowRight" && canNext) goTo(index + 1, 1);
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canPrev, canNext, index, goTo, onClose]);

  return (
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-piedra outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* ── Cabecera ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
        <p className="text-sm font-medium tabular-nums text-blanco/70">
          {index + 1} / {media.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-blanco/25 text-xl leading-none text-blanco transition-transform duration-150 hover:bg-blanco/10 active:scale-95"
        >
          ×
        </button>
      </div>

      {/* ── Área de imagen ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-2 sm:px-12">
        {canPrev ? (
          <button
            type="button"
            onClick={() => goTo(index - 1, -1)}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-blanco/25 bg-piedra/40 text-2xl text-blanco backdrop-blur-sm transition-transform duration-150 hover:bg-blanco/15 active:scale-95 sm:inline-flex"
          >
            ‹
          </button>
        ) : null}
        {canNext ? (
          <button
            type="button"
            onClick={() => goTo(index + 1, 1)}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-blanco/25 bg-piedra/40 text-2xl text-blanco backdrop-blur-sm transition-transform duration-150 hover:bg-blanco/15 active:scale-95 sm:inline-flex"
          >
            ›
          </button>
        ) : null}

        <div className="relative h-full w-full max-w-4xl overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={item.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={onDragEnd}
              className="absolute inset-0 flex cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing"
            >
              <div className="relative h-full w-full">
                <Image
                  src={publicMediaUrl(item.storage_path)}
                  alt={`Foto ${index + 1} del álbum`}
                  fill
                  priority
                  sizes="100vw"
                  className="pointer-events-none select-none object-contain"
                  draggable={false}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prefetch de imágenes vecinas (ocultas) */}
        <div
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
          aria-hidden
        >
          {neighborIndexes.map((i) => (
            <Image
              key={media[i].id}
              src={publicMediaUrl(media[i].storage_path)}
              alt=""
              width={32}
              height={32}
            />
          ))}
        </div>
      </div>

      {/* ── Footer de acciones: solo visible para el dueño autenticado ────── */}
      {isAdmin && (
        <div className="relative z-20 shrink-0 border-t border-blanco/10 bg-piedra/80 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => onSetCover(item)}
              disabled={isCover || isSettingCover}
              className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full border border-tierra bg-tierra/20 px-5 text-base font-semibold text-blanco transition-transform duration-150 hover:bg-tierra/30 active:scale-95 disabled:cursor-default disabled:border-blanco/20 disabled:bg-transparent disabled:text-blanco/45 disabled:active:scale-100 sm:h-11 sm:w-auto sm:text-sm"
            >
              {isCover
                ? "Es la portada"
                : isSettingCover
                  ? "Guardando…"
                  : "Usar de portada"}
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(item)}
              className="inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-lust px-5 text-base font-semibold text-blanco transition-transform duration-150 hover:opacity-90 active:scale-95 sm:h-11 sm:w-auto sm:text-sm"
            >
              Borrar foto
            </button>
          </div>
          {justSetCover ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center text-sm text-blanco/75"
            >
              Listo, ya es la portada
            </motion.p>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
