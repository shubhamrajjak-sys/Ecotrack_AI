import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function useMotionOk() {
  return !useReducedMotion();
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Scroll-reveal wrapper. Falls back to a plain div when reduced motion is set. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ok = useMotionOk();
  const Comp = motion[as];

  if (!ok) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Comp
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}

/** Animated statistics counter. */
export function Counter({
  value,
  decimals = 0,
  suffix = "",
  className,
  duration = 1200,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ok = useMotionOk();
  const [display, setDisplay] = useState(ok ? 0 : value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!ok || !inView) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, inView, ok, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Card with hover lift + tap micro-interaction. */
export function LiftCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ok = useMotionOk();
  return (
    <motion.div
      whileHover={ok ? { y: -6, boxShadow: "var(--shadow-lift)" } : undefined}
      whileTap={onClick && ok ? { scale: 0.99 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={onClick}
      className={cn(
        "glass-panel rounded-3xl p-6",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/** Animated progress bar. */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const ok = useMotionOk();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-primary"
        initial={ok ? { width: 0 } : false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
