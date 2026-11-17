import type { Metadata } from "next";
import "./site.css";

export const metadata: Metadata = { title: "Preview · Quicker" };

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
