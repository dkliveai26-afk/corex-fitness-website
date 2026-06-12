"use client";

type AdminNotificationPayload = {
  details: Record<string, string | number | undefined>;
  subject: string;
  type: "booking" | "contact" | "join" | "payment";
};

export function notifyAdmin(payload: AdminNotificationPayload) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const queued = navigator.sendBeacon("/api/notifications/admin-email", new Blob([body], { type: "application/json" }));
    if (queued) return;
  }

  void fetch("/api/notifications/admin-email", {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST"
  }).catch(() => undefined);
}
