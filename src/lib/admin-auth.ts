const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.STUDIO_ADMIN_PASSWORD;
const ADMIN_COOKIE_NAME = "admin-auth-token";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminPassword() {
  return ADMIN_PASSWORD || "";
}

async function signAdminPayload(secret: string, payload: string) {
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function isAdminAuthorized(request: Request) {
  const password = getAdminPassword();
  if (!password) return false;
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((chunk) => {
      const [name, ...rest] = chunk.trim().split("=");
      return [name, rest.join("=")];
    }),
  );
  const cookieValue = cookies[ADMIN_COOKIE_NAME];
  if (!cookieValue) return false;

  const [issuedAtRaw, signature] = cookieValue.split(".");
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || !signature) return false;
  if (Date.now() - issuedAt > ADMIN_SESSION_MAX_AGE_SECONDS * 1000) return false;

  const expected = await signAdminPayload(password, `studio-admin-auth.${issuedAtRaw}`);
  return constantTimeEqual(signature, expected);
}

export async function createAdminAuthCookie() {
  const password = getAdminPassword();
  const issuedAt = String(Date.now());
  const value = `${issuedAt}.${await signAdminPayload(password, `studio-admin-auth.${issuedAt}`)}`;
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}${secure}`;
}

export async function clearAdminAuthCookie() {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=deleted; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
