type NotificationInsert = {
  type: string;
  type_detail?: string;
  title: string;
  body?: string | null;
  session_id?: string | null;
  ip_address?: string | null;
  country?: string | null;
  browser?: string | null;
  device?: string | null;
  filename?: string | null;
  user_id?: string | null;
  payload?: Record<string, unknown> | null;
  read?: boolean;
  delivered?: boolean;
};

function isSchemaMismatch(error: unknown) {
  const message = error && typeof error === "object" && "message" in error ? String((error as any).message) : String(error);
  return /column .* does not exist|schema cache|Could not find .* column/i.test(message);
}

export async function insertAdminNotification(supabaseAdmin: any, notification: NotificationInsert) {
  const fullNotification = {
    read: false,
    delivered: false,
    ...notification,
  };

  const { error } = await supabaseAdmin.from("notifications").insert(fullNotification);
  if (!error) return { ok: true };
  if (!isSchemaMismatch(error)) return { ok: false, error };

  const fallbackPayload = {
    ...(notification.payload || {}),
    type_detail: notification.type_detail,
    session_id: notification.session_id,
    ip_address: notification.ip_address,
    country: notification.country,
    browser: notification.browser,
    device: notification.device,
    filename: notification.filename,
    user_id: notification.user_id,
    read: notification.read ?? false,
  };

  const fallback = {
    type: notification.type_detail || notification.type,
    title: notification.title,
    body: notification.body ?? null,
    payload: fallbackPayload,
    delivered: notification.delivered ?? false,
  };

  const fallbackResult = await supabaseAdmin.from("notifications").insert(fallback);
  if (fallbackResult.error) return { ok: false, error: fallbackResult.error };
  return { ok: true, fallback: true };
}
