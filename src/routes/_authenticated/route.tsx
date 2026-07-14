import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      throw redirect({ to: "/auth" });
    }

    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (!res.ok) {
        throw redirect({ to: "/auth" });
      }
      return {};
    } catch {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
