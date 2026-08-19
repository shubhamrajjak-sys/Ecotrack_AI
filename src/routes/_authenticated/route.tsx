import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { NAME_KEY } from "@/lib/local-db";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const name = window.localStorage.getItem(NAME_KEY)?.trim();
    if (!name) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
