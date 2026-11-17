import { site } from "@/data/site";
import { DEFAULT_TITLE, ogContentType, ogSize } from "@/lib/seo/constants";
import { createOgImage } from "@/lib/seo/og";

export const alt = DEFAULT_TITLE;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    kicker: "Portfolio",
    title: site.name,
    subtitle: site.title,
  });
}
