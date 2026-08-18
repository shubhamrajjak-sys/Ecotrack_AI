import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell, PageHeading } from "@/components/eco/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { coachChat } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({
    meta: [
      { title: "AI Sustainability Coach — EcoTrack AI" },
      { name: "description", content: "Ask the EcoTrack AI coach how to cut your estimated campus carbon footprint, grounded in your own data." },
      { property: "og:title", content: "AI Sustainability Coach — EcoTrack AI" },
      { property: "og:description", content: "Personalised, data-grounded sustainability guidance." },
    ],
  }),
  component: Coach,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What is my biggest emission source and why?",
  "How can I cut my commute emissions this month?",
  "Suggest a realistic goal based on my data",
  "Explain how my footprint is calculated",
];

function Coach() {
  const send = useServerFn(coachChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    try {
      const res = await send({ data: { messages: next } });
      const reply =
        res.ok === true
          ? res.text
          : res.reason === "not_configured"
            ? "The AI Coach is not configured yet — an AI key is missing on the server."
            : (res.message ?? "The AI Coach could not answer right now.");
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong reaching the AI Coach. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeading
        title="AI Sustainability Coach"
        subtitle="The coach only reasons about your own logged data and will tell you when data is missing rather than inventing it."
      />

      <div className="glass-panel flex h-[calc(100vh-16rem)] min-h-[480px] flex-col rounded-3xl">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex size-14 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground"
              >
                <Sparkles className="size-6" />
              </motion.span>
              <p className="mt-4 font-display text-xl font-semibold">Ask about your footprint</p>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Grounded in your calculations, travel records and goals.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void ask(s)}
                    className="rounded-full border border-border bg-background/60 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-primary text-primary-foreground"
                      : "border border-border/70 bg-card/80"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <UserRound className="size-4" />
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex size-8 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
                <Bot className="size-4" />
              </span>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border/60 p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void ask(draft);
                }
              }}
              placeholder="Ask about your emissions, goals or commute…"
              className="max-h-32 min-h-11 resize-none rounded-2xl"
            />
            <Button variant="hero" size="icon" disabled={busy} onClick={() => void ask(draft)}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
