import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  fallback: ["PingFang SC", "Noto Sans SC", "system-ui", "sans-serif"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  fallback: ["PingFang SC", "Noto Sans SC", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Gotly AI",
  description:
    "Gotly AI is a lightweight AI-powered capture tool for collecting, refining, and retrieving ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="light">
      <body
        className={`${inter.variable} ${manrope.variable} min-h-full flex flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
