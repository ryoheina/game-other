import crypto from "crypto";

const COOKIE_NAME = "me_admin";
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function base64url(input: Buffer) {
  return input.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function sign(data: string, secret: string) {
  return base64url(crypto.createHmac("sha256", secret).update(data).digest());
}

export function createAuthToken(secret: string, maxAgeSeconds = DEFAULT_MAX_AGE) {
  const payload = JSON.stringify({ u: "admin", exp: Date.now() + maxAgeSeconds * 1000 });
  const b = base64url(Buffer.from(payload));
  const sig = sign(b, secret);
  return `${b}.${sig}`;
}

export function verifyAuthToken(token: string | null | undefined, secret: string) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [b, sig] = parts;
  const expected = sign(b, secret);
  // timing-safe compare
  const a = Buffer.from(sig);
  const e = Buffer.from(expected);
  if (a.length !== e.length) return false;
  if (!crypto.timingSafeEqual(a, e)) return false;
  try {
    const payload = JSON.parse(Buffer.from(b, "base64").toString());
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function buildSetCookie(token: string, opts?: { maxAge?: number; path?: string; secure?: boolean }) {
  const maxAge = opts?.maxAge ?? DEFAULT_MAX_AGE;
  const path = opts?.path ?? "/";
  const secure = opts?.secure ?? (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production");
  const parts = [`${COOKIE_NAME}=${token}`, `HttpOnly`, `Path=${path}`, `Max-Age=${maxAge}`, `SameSite=Strict`];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearCookie() {
  return `${COOKIE_NAME}=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`;
}

export function getTokenFromRequest(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(COOKIE_NAME + "=")) return p.substring(COOKIE_NAME.length + 1);
  }
  return null;
}
