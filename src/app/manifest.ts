import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { DEFAULT_TITLE, homeDescription, palette } from "@/lib/seo/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEFAULT_TITLE,
    short_name: site.name,
    description: homeDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: palette.ink,
    theme_color: palette.ink,
    lang: "en",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
