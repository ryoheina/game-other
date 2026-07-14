import { useEffect, useRef, useState } from "react";

export type DesktopNotificationState = {
  permission: "granted" | "denied" | "default" | "loading";
  notificationCount: number;
  lastError: string | null;
};

/**
 * Enhanced desktop notification hook with Realtime subscription + polling fallback.
 * Captures full event details (IP, country, device, browser, filename).
 * Stores notifications in Supabase notifications table.
 * Shows rich browser desktop notifications automatically.
 * Prevents duplicates by tracking shown notification IDs.
 */
export function useDesktopNotifications() {
  const [notificationState, setNotificationState] = useState<DesktopNotificationState>({
    permission: "default",
    notificationCount: 0,
    lastError: null,
  });

  const shownNotificationIdsRef = useRef<Set<string>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  async function showStoredNotification(note: any) {
    const notifId = String(note.id || `${note.type}-${note.session_id}-${note.created_at}`);
    if (shownNotificationIdsRef.current.has(notifId)) return;
    shownNotificationIdsRef.current.add(notifId);

    const isVisitor =
      note.type_detail === "visitor" ||
      note.payload?.type_detail === "visitor" ||
      note.type === "visitor" ||
      note.type === "visitor_arrival" ||
      note.type === "visitor_left";
    const title = note.title || (isVisitor ? "Visitor Activity" : "Download Activity");
    const body =
      note.body ||
      [
        note.session_id ? `Session: ${String(note.session_id).slice(0, 8)}` : null,
        `IP: ${note.ip_address || note.payload?.ip_address || "unknown"}`,
        `Country: ${note.country || note.payload?.country || "unknown"}`,
        note.device || note.payload?.device ? `Device: ${note.device || note.payload?.device}` : null,
        note.browser || note.payload?.browser ? `Browser: ${note.browser || note.payload?.browser}` : null,
        note.filename || note.payload?.filename ? `File: ${note.filename || note.payload?.filename}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          const notif = new Notification(title, {
            body,
            icon: "/favicon.ico",
            tag: notifId,
            badge: "/favicon.ico",
          });

          console.log("[Desktop Notifications] Browser notification sent:", { title, body });

          notif.onclick = () => {
            try {
              window.focus();
              window.location.href = "/admin";
            } catch (e) {
              console.error("[Desktop Notifications] Focus failed:", e);
            }
          };

          setNotificationState((prev) => ({
            ...prev,
            notificationCount: prev.notificationCount + 1,
          }));
        } catch (err) {
          console.error("[Desktop Notifications] Browser notification failed:", err);
          setNotificationState((prev) => ({
            ...prev,
            lastError: `Browser notification failed: ${String(err)}`,
          }));
        }
      }
    } catch (err) {
      console.error("[Desktop Notifications] Unexpected error in showNotification:", err);
    }
  }
  useEffect(() => {
    mountedRef.current = true;

    if (typeof Notification === "undefined") {
      console.warn("[Desktop Notifications] Browser does not support Notifications API");
      setNotificationState((prev) => ({
        ...prev,
        permission: "denied",
        lastError: "Browser does not support notifications",
      }));
      return;
    }

    const currentPermission = Notification.permission;
    setNotificationState((prev) => ({ ...prev, permission: currentPermission as any }));
    console.log("[Desktop Notifications] Notification permission:", currentPermission);

    if (currentPermission === "default") {
      console.log("[Desktop Notifications] Requesting notification permission...");
      setNotificationState((prev) => ({ ...prev, permission: "loading" }));

      Notification.requestPermission()
        .then((permission) => {
          if (!mountedRef.current) return;
          console.log("[Desktop Notifications] Notification permission:", permission);
          setNotificationState((prev) => ({
            ...prev,
            permission: permission as any,
            lastError: permission === "denied" ? "Notifications denied by user" : null,
          }));
        })
        .catch((err) => {
          if (!mountedRef.current) return;
          console.error("[Desktop Notifications] Permission request failed:", err);
          setNotificationState((prev) => ({
            ...prev,
            permission: "denied",
            lastError: `Permission error: ${String(err)}`,
          }));
        });
    } else if (currentPermission === "denied") {
      setNotificationState((prev) => ({
        ...prev,
        lastError: "Notifications denied by user or browser policy",
      }));
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Poll stored admin notifications. The server creates these when visitors arrive
  // or downloads complete, so this catches events even when the sessions diff is unchanged.
  useEffect(() => {
    if (!mountedRef.current || notificationState.permission !== "granted") return;

    async function pollDashboard() {
      if (!mountedRef.current) return;

      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "include" });
        if (!res.ok || res.status === 401) return;

        const data = await res.json();
        if (!mountedRef.current) return;

        const unreadNotifications = (data.notifications || []).filter((note: any) => note.read !== true);

        unreadNotifications
          .slice()
          .reverse()
          .forEach((note: any) => {
            void showStoredNotification(note);
          });
      } catch (err) {
        console.error("[Desktop Notifications] Polling error:", err);
      }
    }

    void pollDashboard();
    pollingIntervalRef.current = setInterval(pollDashboard, 2500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [notificationState.permission]);

  return notificationState;
}
