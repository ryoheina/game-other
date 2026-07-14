import azrael from "@/assets/azrael.png.asset.json";
import background from "@/assets/background.png.asset.json";
import elysia from "@/assets/elysia.png.asset.json";
import lucas from "@/assets/lucas.png.asset.json";
import zerevok from "@/assets/zerevok.png.asset.json";

export type ImgKey = "azrael" | "background" | "elysia" | "lucas" | "zerevok";

const LOCAL: Record<ImgKey, string> = {
  azrael: "/AZRAEL.png",
  background: "/Background.png",
  elysia: "/ELYSIA.png",
  lucas: "/LUCAS.png",
  zerevok: "/ZEREVOK.png",
};

const CDN: Record<ImgKey, string> = {
  azrael: azrael.url,
  background: background.url,
  elysia: elysia.url,
  lucas: lucas.url,
  zerevok: zerevok.url,
};

// Prefer local `public/` images; CDN URLs are used as runtime fallback via AssetImg.
export const IMG: Record<ImgKey, string> = { ...LOCAL };

export function assetSources(key: ImgKey) {
  return { local: LOCAL[key], cdn: CDN[key] };
}
