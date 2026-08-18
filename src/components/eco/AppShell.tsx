import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  Bot,
  Calculator,
  LayoutDashboard,
  Leaf,
  LogOut,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { ParticleField } from "@/components/eco/ParticleField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/coach", label: "AI Coach", icon: Bot },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/analytics", label: "Campus", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();

  return (
    <div className="relative min-h-screen bg-gradient-hero">
      <ParticleField count={8} />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-card/60 p-4 backdrop-blur-xl lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-2 pt-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
            <Leaf className="size-4.5" />
          </span>
          <span className="font-display text-base font-semibold">EcoTrack AI</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl bg-gradient-primary shadow-soft"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className="relative size-4" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" className="justify-start" onClick={() => void signOut()}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </aside>

      <main className="relative pb-28 lg:pb-12 lg:pl-64">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:pt-10"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="glass-panel fixed inset-x-3 bottom-3 z-50 flex items-center justify-between rounded-3xl px-2 py-2 lg:hidden">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-medium transition-colors",
                active ? "bg-accent/70 text-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
