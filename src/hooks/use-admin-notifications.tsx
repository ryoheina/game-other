import { useEffect, useRef, useState } from "react";

type NotificationRow = any;

export default function useAdminNotifications(initial: NotificationRow[] = []) {
  const [notifications, setNotifications] = useState<NotificationRow[]>(initial);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function poll() {
      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!mountedRef.current) return;
        setNotifications(data.notifications || []);
      } catch {
        // ignore
      }
    }

    void poll();
    const iv = setInterval(poll, 3000);

    return () => {
      mountedRef.current = false;
      clearInterval(iv);
    };
  }, []);

  const markRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/mark-notification-read", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {}
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch("/api/admin/delete-notification", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {}
  };

  const clearAll = async () => {
    try {
      const res = await fetch("/api/admin/clear-notifications", { method: "POST", credentials: "include" });
      if (res.ok) setNotifications([]);
    } catch (e) {}
  };

  return { notifications, setNotifications, markRead, remove, clearAll };
}
