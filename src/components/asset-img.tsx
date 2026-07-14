import { useState, type ImgHTMLAttributes } from "react";
import { assetSources, type ImgKey } from "@/lib/assets";

type AssetImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  asset: ImgKey;
};

export function AssetImg({ asset, onError, loading = "lazy", decoding = "async", ...props }: AssetImgProps) {
  const { local, cdn } = assetSources(asset);
  const [src, setSrc] = useState(local);

  return (
    <img
      {...props}
      src={src}
      loading={loading}
      decoding={decoding}
      onError={(e) => {
        if (src !== cdn) setSrc(cdn);
        onError?.(e);
      }}
    />
  );
}
