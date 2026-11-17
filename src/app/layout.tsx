import type { Metadata, Viewport } from "next";
import { rootMetadata, rootViewport } from "@/lib/seo/metadata";
import { instrumentSerif, inter } from "@/styles/fonts";
import { SkipLink } from "@/components/navigation/SkipLink";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RenderEngine } from "@/components/three/core/RenderEngine";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { CustomCursor } from "@/components/interaction/CustomCursor";
import { ScrollAnimations } from "@/components/animations/ScrollAnimations";
import { MotionProvider } from "@/components/animations/MotionProvider";
import "@/styles/globals.css";

export const metadata: Metadata = rootMetadata;
export const viewport: Viewport = rootViewport;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <MotionProvider>
          <SkipLink targetId="main" />
          <SiteHeader />
          {children}
          <SiteFooter />
        </MotionProvider>
        <RenderEngine />
        <SmoothScroll />
        <CustomCursor />
        <ScrollAnimations />
      </body>
    </html>
  );
}
