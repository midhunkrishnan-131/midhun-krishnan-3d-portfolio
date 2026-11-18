import { site } from "@/data/site";
import { ogContentType, ogSize } from "@/lib/seo/constants";
import { createOgImage } from "@/lib/seo/og";

export const alt = `Index — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return createOgImage({
    kicker: "Directory & Archive",
    title: "Index",
    subtitle: `Chapters, projects, and capabilities by ${site.name}`,
  });
}
