import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "War Monitor — Iran / Israel / USA",
  description: "Daily launch pattern tracker for the Feb–Mar 2026 conflict",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
