import { motion } from "motion/react";

import { Counter, useMotionOk } from "./motion";

/** Large circular animated carbon score indicator. */
export function ScoreRing({
  value,
  max,
  label = "kg CO₂e / month",
  caption,
  size = 240,
}: {
  value: number;
  max: number;
  label?: string;
  caption?: string;
  size?: number;
}) {
  const ok = useMotionOk();
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--chart-1)" />
              <stop offset="100%" stopColor="var(--chart-2)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={ok ? { strokeDashoffset: c } : false}
            animate={{ strokeDashoffset: c - c * pct }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-semibold tracking-tight text-foreground">
            <Counter value={value} decimals={1} />
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
      </div>
      {caption && <p className="mt-4 text-sm text-muted-foreground">{caption}</p>}
    </div>
  );
}
