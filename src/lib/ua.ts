import { getCountryFromHeaders } from "./geo";

export function parseUA(ua: string | null | undefined) {
  const u = (ua || "").toLowerCase();
  let browser = "Unknown";
  if (u.includes("edg/")) browser = "Edge";
  else if (u.includes("chrome/") && !u.includes("chromium")) browser = "Chrome";
  else if (u.includes("firefox/")) browser = "Firefox";
  else if (u.includes("safari/") && !u.includes("chrome")) browser = "Safari";
  else if (u.includes("opr/") || u.includes("opera")) browser = "Opera";

  let os = "Unknown";
  if (u.includes("windows")) os = "Windows";
  else if (u.includes("mac os") || u.includes("macintosh")) os = "macOS";
  else if (u.includes("android")) os = "Android";
  else if (u.includes("iphone") || u.includes("ipad") || u.includes("ios")) os = "iOS";
  else if (u.includes("linux")) os = "Linux";

  let device = "Desktop";
  if (u.includes("mobile") || u.includes("iphone") || u.includes("android")) device = "Mobile";
  else if (u.includes("tablet") || u.includes("ipad")) device = "Tablet";

  return { browser, os, device };
}

function normalizeForwardedIp(value: string | null | undefined) {
  if (!value) return null;
  let ip = value.trim();
  if (!ip) return null;
  if (ip.startsWith("[") && ip.includes("]")) ip = ip.slice(1, ip.indexOf("]"));
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) ip = ip.slice(0, ip.lastIndexOf(":"));
  return ip || null;
}

function isPrivateIp(ip: string) {
  return /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|fc00:|fd00:|fe80:)/i.test(ip);
}

export function getClientMeta(request: Request) {
  const headers = request.headers;
  const forwardedIps = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((ip) => normalizeForwardedIp(ip))
    .filter(Boolean);
  const directCandidates = [
    headers.get("cf-connecting-ip"),
    headers.get("true-client-ip"),
    headers.get("x-real-ip"),
    headers.get("x-client-ip"),
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-nf-client-connection-ip"),
    headers.get("fly-client-ip"),
    headers.get("fastly-client-ip"),
    headers.get("x-forwarded"),
    headers.get("forwarded")?.match(/for="?([^";,]+)"?/i)?.[1],
  ]
    .map((ip) => normalizeForwardedIp(ip))
    .filter(Boolean) as string[];
  const ip =
    directCandidates.find((candidate) => !isPrivateIp(candidate)) ||
    forwardedIps?.find((candidate) => !isPrivateIp(candidate)) ||
    directCandidates[0] ||
    forwardedIps?.[0] ||
    null;
  const country = getCountryFromHeaders(headers);
  const ua = headers.get("user-agent") || "";
  const referrer = headers.get("referer") || null;
  const parsed = parseUA(ua);
  return { ip, country, ua, referrer, ...parsed };
}
