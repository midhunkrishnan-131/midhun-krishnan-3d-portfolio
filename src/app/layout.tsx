import type { Metadata, Viewport } from "next";
import { rootMetadata, rootViewport } from "@/lib/seo/metadata";
import { instrumentSerif, inter } from "@/styles/fonts";
import { SkipLink } from "@/components/navigation/SkipLink";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RenderEngine } from "@/components/three/core/RenderEngine";
import "@/styles/globals.css";

export const metadata: Metadata = rootMetadata;
export const viewport: Viewport = rootViewport;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <SkipLink targetId="main" />
        <SiteHeader />
        {children}
        <SiteFooter />
        <RenderEngine />
      </body>
    </html>
  );
}
