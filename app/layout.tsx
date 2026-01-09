import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "add-wallet | Create a Crypto Wallet in Seconds",
  description:
    "One command to create a crypto wallet. Instant setup, private key exported, Base Mainnet ready. No account needed.",
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
      <body>{children}</body>
    </html>
  );
}
