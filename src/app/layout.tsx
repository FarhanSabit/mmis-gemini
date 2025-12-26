import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MMIS - Multi-Vendor Management System",
  description: "Regional Trade Logistics Platform for Uganda Markets",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
