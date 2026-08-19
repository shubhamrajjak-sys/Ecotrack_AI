import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const MARKETING_LINKS = [
  { to: "/", label: "Home" },
  { to: "/methodology", label: "Methodology" },
  { to: "/architecture", label: "Architecture" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const changeName = () => {
    signOut();
    void navigate({ to: "/auth", replace: true });
  };
  const initial = (user?.name ?? "?").charAt(0).toUpperCase();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3"
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled ? "glass-panel shadow-lift" : "bg-transparent border border-transparent",
        )}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Leaf className="size-4.5" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">EcoTrack AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {MARKETING_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
                pathname === l.to && "bg-accent/70 text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <span className="h-8 w-32 animate-pulse rounded-full bg-accent/50" aria-hidden />
          ) : user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                {(
                  <span className="flex size-7 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {initial}
                  </span>
                )}
                <span className="max-w-[10rem] truncate">{user.name}</span>
              </Link>
              <Button variant="hero" size="sm" asChild>
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={changeName}>
                Change name
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Enter name</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mx-auto mt-2 max-w-6xl rounded-3xl p-3 md:hidden"
        >
          {MARKETING_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/60"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-2">
            <Button variant="hero" asChild onClick={() => setOpen(false)}>
              <Link to={user ? "/dashboard" : "/auth"}>{user ? "Open dashboard" : "Get started"}</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
