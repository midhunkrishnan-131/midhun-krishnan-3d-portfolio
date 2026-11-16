import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/env";
import { instrumentSerif, inter } from "@/styles/fonts";
import { SkipLink } from "@/components/navigation/SkipLink";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Midhun Krishnan — A Story Still Being Written",
  description: "Personal portfolio of Midhun Krishnan. Work in progress.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <SkipLink targetId="main" />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
