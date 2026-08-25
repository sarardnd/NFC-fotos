"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type AlbumWelcomeProps = {
  slug: string;
  name: string;
  emoji: string;
};

export function AlbumWelcome({ slug, name, emoji }: AlbumWelcomeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = `welcome_seen_${slug}`;
    if (!sessionStorage.getItem(key)) {
      setVisible(true);
      sessionStorage.setItem(key, "1");
    }
  }, [slug]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-arena/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setVisible(false)}
        >
          <motion.div
            className="flex flex-col items-center gap-3 px-8 text-center"
            initial={{ y: 16, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-7xl">{emoji}</span>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{name}</h1>
            <p className="text-sm text-muted-foreground">Toca para ver las fotos</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
