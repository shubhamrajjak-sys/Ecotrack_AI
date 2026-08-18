import { motion } from "motion/react";
import { useMemo } from "react";

import { useMotionOk } from "./motion";

/** Floating eco particles / leaves used behind hero and app surfaces. */
export function ParticleField({ count = 14, dense = false }: { count?: number; dense?: boolean }) {
  const ok = useMotionOk();

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        size: 6 + ((i * 13) % 16),
        delay: (i % 7) * 0.9,
        duration: 14 + ((i * 5) % 12),
        drift: ((i % 5) - 2) * 30,
        leaf: i % 3 === 0,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-aurora absolute -left-32 top-[-10%] h-[420px] w-[420px] rounded-full bg-gradient-mint opacity-50 blur-3xl" />
      <div className="animate-aurora absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-accent opacity-40 blur-3xl" />
      {dense && (
        <div className="animate-aurora absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-gradient-mint opacity-30 blur-3xl" />
      )}
      {ok &&
        particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-leaf/25"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.leaf ? p.size : p.size * 0.6,
              borderRadius: p.leaf ? "0 100% 0 100%" : "999px",
            }}
            initial={{ y: "110vh", opacity: 0, rotate: 0 }}
            animate={{
              y: "-15vh",
              x: [0, p.drift, 0],
              opacity: [0, 0.85, 0],
              rotate: p.leaf ? 220 : 60,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
    </div>
  );
}
