import { site } from "@/data/site";
import { ogContentType, ogSize } from "@/lib/seo/constants";
import { createOgImage } from "@/lib/seo/og";

export const alt = `Projects — ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function Image() {
  return createOgImage({
    kicker: "Projects",
    title: "Projects",
    subtitle: `Software projects by ${site.name}`,
  });
}
