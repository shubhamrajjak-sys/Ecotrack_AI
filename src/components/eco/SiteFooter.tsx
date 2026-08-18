import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
              <Leaf className="size-4.5" />
            </span>
            <span className="font-display text-base font-semibold">EcoTrack AI</span>
          </div>
          <p className="mt-3 font-display text-lg tracking-tight text-foreground">
            Measure. Understand. Reduce.
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Campus carbon intelligence built on your own activity data. All figures are estimated
            CO₂e based on published emission factors — never exact measurements.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Product</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/calculator" className="transition-colors hover:text-foreground">
                Carbon Calculator
              </Link>
            </li>
            <li>
              <Link to="/coach" className="transition-colors hover:text-foreground">
                AI Coach
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className="transition-colors hover:text-foreground">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="transition-colors hover:text-foreground">
                Campus Analytics
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/methodology" className="transition-colors hover:text-foreground">
                Methodology
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-6 py-5">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} EcoTrack AI · Built for AVINYA 2026. Your location is used
          only with your permission to calculate travel distance. EcoTrack AI does not continuously
          track your location unless explicitly enabled.
        </p>
      </div>
    </footer>
  );
}
