const countryCache = new Map<string, string | null>();

const UNKNOWN_COUNTRY_CODES = new Set(["XX", "T1", "ZZ"]);

export function isPrivateIp(ip: string): boolean {
  const normalized = ip.trim().toLowerCase();
  if (!normalized || normalized === "unknown") return true;
  if (normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (/^127\.|^10\.|^192\.168\.|^169\.254\.|^0\./.test(normalized)) return true;
  const parts = normalized.split(".");
  if (parts.length === 4 && parts[0] === "172") {
    const second = Number(parts[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export function getCountryFromHeaders(headers: Headers): string | null {
  const raw =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-client-geo-country") ||
    headers.get("x-appengine-country") ||
    headers.get("x-country-code") ||
    headers.get("cloudfront-viewer-country") ||
    null;

  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (!code || UNKNOWN_COUNTRY_CODES.has(code)) return null;
  return code;
}

export async function lookupCountryByIp(ip: string): Promise<string | null> {
  if (!ip || isPrivateIp(ip)) return null;

  if (countryCache.has(ip)) {
    return countryCache.get(ip) ?? null;
  }

  try {
    const res = await fetch(
      `https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) {
      countryCache.set(ip, null);
      return null;
    }

    const data = (await res.json()) as { status?: string; countryCode?: string };
    const code = data.status === "success" && data.countryCode ? data.countryCode.toUpperCase() : null;
    countryCache.set(ip, code);
    return code;
  } catch {
    countryCache.set(ip, null);
    return null;
  }
}

export async function resolveCountry(headers: Headers, ip: string | null): Promise<string | null> {
  const fromHeaders = getCountryFromHeaders(headers);
  if (fromHeaders) return fromHeaders;
  if (!ip) return null;
  return lookupCountryByIp(ip);
}
