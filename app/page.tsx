"use client";

import { useState } from "react";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useScreenSize } from "@/hooks/use-screen-size";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const command = "npx @add-wallet";
  const screenSize = useScreenSize();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Gooey Effect Background */}
      <GooeyFilter id="gooey-filter-pixel-trail" strength={8} />
      <div
        className="absolute inset-0 z-0"
        style={{ filter: "url(#gooey-filter-pixel-trail)" }}
      >
        <PixelTrail
          pixelSize={screenSize.lessThan("md") ? 24 : 32}
          fadeDuration={0}
          delay={800}
          pixelClassName="bg-[#3a3a3a]"
        />
      </div>

      <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-4">
          <h1
            className="font-jersey text-6xl md:text-8xl tracking-tight"
            style={{ color: "#fafafa" }}
          >
            npx @add-wallet
          </h1>
          <p
            className="text-lg md:text-xl md:max-w-none mx-auto leading-relaxed md:whitespace-nowrap"
            style={{ color: "#888888" }}
          >
            Create a crypto wallet and fund it
            <br className="md:hidden" />
            <span className="hidden md:inline"> </span>
            in seconds with one command
          </p>
        </div>

        {/* Command Box */}
        <div
          className="rounded-lg p-1 inline-block mx-auto"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <div
            className="flex items-center gap-3 rounded-md px-6 py-4"
            style={{ backgroundColor: "#141414" }}
          >
            <code
              className="text-lg md:text-xl font-mono tracking-wide"
              style={{ color: "#fafafa" }}
            >
              {command}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-md transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{ backgroundColor: "#2a2a2a" }}
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#888888"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Features */}
        <div
          className="flex flex-wrap justify-center gap-8 text-sm"
          style={{ color: "#666666" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "#22c55e" }}>✓</span>
            <span>No account needed</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#22c55e" }}>✓</span>
            <span>Private key exported</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#22c55e" }}>✓</span>
            <span>Base Mainnet ready</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center justify-center gap-6">
          <ShimmerButton
            href="https://www.npmjs.com/package/@add-wallet"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
              </svg>
            }
          >
            npm
          </ShimmerButton>
          <ShimmerButton
            href="https://github.com/Must-be-Ash/cli-wallet"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            }
          >
            GitHub
          </ShimmerButton>
        </div>

        {/* Footer */}
        <a
          href="https://cdp.coinbase.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:opacity-80 transition-opacity"
        >
          <TextShimmer
            className="text-xs [--base-color:#444444] [--base-gradient-color:#888888]"
            duration={3}
          >
            Powered by Coinbase Developer Platform
          </TextShimmer>
        </a>
      </div>
    </main>
  );
}
