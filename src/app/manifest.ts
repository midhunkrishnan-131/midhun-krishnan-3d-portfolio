import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { DEFAULT_TITLE, homeDescription, palette } from "@/lib/seo/constants";
import { withBasePath } from "@/lib/env";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEFAULT_TITLE,
    short_name: site.name,
    description: homeDescription,
    start_url: withBasePath("/"),
    scope: withBasePath("/"),
    display: "standalone",
    background_color: palette.ink,
    theme_color: palette.ink,
    lang: "en",
    icons: [
      { src: withBasePath("/icon"), sizes: "32x32", type: "image/png" },
      { src: withBasePath("/apple-icon"), sizes: "180x180", type: "image/png" },
    ],
  };
}
