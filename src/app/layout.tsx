import type { Metadata } from "next";
import { SITE_URL } from "@/lib/env";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Midhun Krishnan — A Story Still Being Written",
  description: "Personal portfolio of Midhun Krishnan. Work in progress.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
