import { createIcon } from "@/lib/seo/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return createIcon(size.width);
}
