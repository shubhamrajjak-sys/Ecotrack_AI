import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/eco/SiteFooter";
import { SiteHeader } from "@/components/eco/SiteHeader";
import { LiftCard, Reveal } from "@/components/eco/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the EcoTrack AI team" },
      { name: "description", content: "Questions about deploying EcoTrack AI on your campus? Reach the sustainability engineering team." },
      { property: "og:title", content: "Contact the EcoTrack AI team" },
      { property: "og:description", content: "Get in touch about campus deployments, data and partnerships." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Talk to us
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Deploying EcoTrack AI across a department, hostel block or an entire campus? Tell us
            about your setup.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <LiftCard>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.name || !form.email || !form.message) {
                    toast.error("Please complete every field");
                    return;
                  }
                  toast.success("Thanks — message noted", {
                    description: "Messaging is not connected to an inbox yet, so please also email us directly.",
                  });
                  setForm({ name: "", email: "", message: "" });
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="n">Name</Label>
                  <Input
                    id="n"
                    className="rounded-xl"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e">Email</Label>
                  <Input
                    id="e"
                    type="email"
                    className="rounded-xl"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m">Message</Label>
                  <Textarea
                    id="m"
                    rows={5}
                    className="rounded-2xl"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <Button variant="hero" type="submit" className="w-full">
                  <MessageSquare className="size-4" /> Send message
                </Button>
              </form>
            </LiftCard>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid h-fit gap-4">
              <LiftCard>
                <Mail className="size-5 text-primary" />
                <h2 className="mt-3 font-display text-lg font-semibold">Email</h2>
                <p className="mt-1 text-sm text-muted-foreground">sustainability@ecotrack.ai</p>
              </LiftCard>
              <LiftCard>
                <MapPin className="size-5 text-primary" />
                <h2 className="mt-3 font-display text-lg font-semibold">Campus pilots</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Available for university sustainability offices and student green clubs.
                </p>
              </LiftCard>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
