import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://add-wallet.vercel.app"),
  title: "add-wallet | Create a Crypto Wallet in Seconds",
  description:
    "One command to create a crypto wallet. Instant setup, private key exported, Base Mainnet ready. No account needed.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "add-wallet | Create a Crypto Wallet in Seconds",
    description:
      "One command to create a crypto wallet. Instant setup, private key exported, Base Mainnet ready. No account needed.",
    url: "https://add-wallet.vercel.app",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "add-wallet | Create a Crypto Wallet in Seconds",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "add-wallet | Create a Crypto Wallet in Seconds",
    description:
      "One command to create a crypto wallet. Instant setup, private key exported, Base Mainnet ready. No account needed.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jersey+25&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
