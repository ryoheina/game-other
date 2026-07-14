const INSTALL_TOKEN_COOKIE = "loe_install_token";

export function createInstallToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export function parseCookies(cookieHeader: string | null) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return;
    cookies.set(rawKey, decodeURIComponent(rawValue.join("=")));
  });
  return cookies;
}

export function getInstallTokenFromRequest(request: Request, bodyToken?: unknown) {
  if (typeof bodyToken === "string" && bodyToken.length >= 32 && bodyToken.length <= 160) {
    return bodyToken;
  }

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken && queryToken.length >= 32 && queryToken.length <= 160) {
    return queryToken;
  }

  return parseCookies(request.headers.get("cookie")).get(INSTALL_TOKEN_COOKIE) || null;
}

export function createInstallTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 30;
  return `${INSTALL_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`;
}

export function clearInstallTokenCookie() {
  return `${INSTALL_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly`;
}
