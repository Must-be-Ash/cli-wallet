"use client";

import { useState, useEffect, useRef } from "react";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useScreenSize } from "@/hooks/use-screen-size";

export default function Home() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const commands = [
    {
      command: "npx add-wallet",
      description: "Create a new wallet and get funding link",
    },
    {
      command: "npx add-wallet sol",
      description: "Create a Solana wallet",
    },
    {
      command: "npx add-wallet topup",
      description: "Generate funding link for existing wallet",
    },
    {
      command: "npx add-wallet topup testnet",
      description: "Generate testnet funding link",
    },
  ];
  const screenSize = useScreenSize();
  const trailContainerRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async (command: string) => {
    await navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Simulate mouse movement for continuous visual effect - 12 independent trails
  useEffect(() => {
    const container = trailContainerRef.current;
    if (!container) return;

    const pixelSize = screenSize.lessThan("md") ? 24 : 32;
    const animationFrameIds: number[] = [];

    // Helper function to build pixel map
    const buildPixelMap = (): Map<string, HTMLElement> => {
      const pixelMap = new Map<string, HTMLElement>();
      const allPixels = document.querySelectorAll('[id*="-pixel-"]');
      
      allPixels.forEach((pixel) => {
        const id = pixel.id;
        const match = id.match(/-pixel-(\d+)-(\d+)/);
        if (match) {
          const pixelX = parseInt(match[1]);
          const pixelY = parseInt(match[2]);
          pixelMap.set(`${pixelX}-${pixelY}`, pixel as HTMLElement);
        }
      });
      
      return pixelMap;
    };

    // Cache pixel elements and create lookup map for performance
    const pixelTrailContainer = container.querySelector(
      '[class*="absolute inset-0"]'
    ) as HTMLDivElement;
    
    if (!pixelTrailContainer) return;

    // Build initial pixel map
    let pixelMap = buildPixelMap();
    
    // On mobile, pixels might not be ready yet, so rebuild map after a delay
    let mapRebuildAttempts = 0;
    const maxRebuildAttempts = 10;
    const rebuildPixelMap = () => {
      if (pixelMap.size === 0 && mapRebuildAttempts < maxRebuildAttempts) {
        mapRebuildAttempts++;
        pixelMap = buildPixelMap();
        if (pixelMap.size === 0) {
          setTimeout(rebuildPixelMap, 100);
        }
      }
    };
    
    // Try rebuilding after initial render (especially important for mobile)
    setTimeout(rebuildPixelMap, 300);

    // Create animation function for a single trail
    const createTrailAnimation = (startX: number, startY: number) => {
      let currentX = startX;
      let currentY = startY;
      
      // Velocity-based movement for smooth continuous motion
      let velocityX = (Math.random() - 0.5) * 2;
      let velocityY = (Math.random() - 0.5) * 2;
      const speed = 1.5; // Base speed
      
      // For circular/scribble patterns
      let angle = Math.random() * Math.PI * 2;
      let angleVelocity = (Math.random() - 0.5) * 0.05;
      let circleRadius = 0;
      let circleCenterX = currentX;
      let circleCenterY = currentY;
      let circleProgress = 0;
      let movementMode: 'scribble' | 'circle' = Math.random() > 0.3 ? 'scribble' : 'circle';
      let modeChangeCounter = 0;

      const animateMovement = () => {
        modeChangeCounter++;
        
        // Change movement mode every 2-4 seconds (roughly)
        if (modeChangeCounter > 120 && Math.random() > 0.98) {
          movementMode = Math.random() > 0.3 ? 'scribble' : 'circle';
          modeChangeCounter = 0;
          
          if (movementMode === 'circle') {
            circleCenterX = currentX;
            circleCenterY = currentY;
            circleRadius = 50 + Math.random() * 100;
            circleProgress = 0;
            angleVelocity = (Math.random() - 0.5) * 0.08;
          } else {
            // Reset velocity for scribble
            velocityX = (Math.random() - 0.5) * 2;
            velocityY = (Math.random() - 0.5) * 2;
          }
        }

        if (movementMode === 'circle') {
          // Circular motion
          circleProgress += 0.02;
          angle += angleVelocity;
          
          currentX = circleCenterX + Math.cos(angle) * circleRadius;
          currentY = circleCenterY + Math.sin(angle) * circleRadius;
          
          // Occasionally change circle parameters
          if (Math.random() > 0.95) {
            angleVelocity += (Math.random() - 0.5) * 0.02;
            angleVelocity = Math.max(-0.1, Math.min(0.1, angleVelocity));
          }
        } else {
          // Continuous scribble motion
          // Add slight random variations to velocity for organic feel
          velocityX += (Math.random() - 0.5) * 0.3;
          velocityY += (Math.random() - 0.5) * 0.3;
          
          // Dampen velocity slightly for smoother motion
          velocityX *= 0.98;
          velocityY *= 0.98;
          
          // Keep velocity within reasonable bounds
          const maxVel = 3;
          velocityX = Math.max(-maxVel, Math.min(maxVel, velocityX));
          velocityY = Math.max(-maxVel, Math.min(maxVel, velocityY));
          
          // Update position
          currentX += velocityX * speed;
          currentY += velocityY * speed;
          
          // Bounce off edges with slight randomness
          if (currentX < 0 || currentX > window.innerWidth) {
            velocityX *= -0.8;
            velocityX += (Math.random() - 0.5) * 0.5;
            currentX = Math.max(0, Math.min(window.innerWidth, currentX));
          }
          if (currentY < 0 || currentY > window.innerHeight) {
            velocityY *= -0.8;
            velocityY += (Math.random() - 0.5) * 0.5;
            currentY = Math.max(0, Math.min(window.innerHeight, currentY));
          }
        }

        // Find and animate pixel using cached lookup map
        // Rebuild map if empty (for mobile delayed rendering)
        if (pixelMap.size === 0) {
          pixelMap = buildPixelMap();
        }
        
        // Get fresh rect for mobile (dimensions might change)
        const rect = pixelTrailContainer.getBoundingClientRect();
        const x = Math.floor((currentX - rect.left) / pixelSize);
        const y = Math.floor((currentY - rect.top) / pixelSize);
        const pixelKey = `${x}-${y}`;
        
        const pixel = pixelMap.get(pixelKey);
        if (pixel) {
          const animatePixel = (pixel as any).__animatePixel;
          if (animatePixel) {
            animatePixel();
          }
        }

        const frameId = requestAnimationFrame(animateMovement);
        animationFrameIds.push(frameId);
      };

      // Start this trail's animation
      const frameId = requestAnimationFrame(animateMovement);
      animationFrameIds.push(frameId);
    };

    // Create 12 trails at different starting positions
    createTrailAnimation(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    createTrailAnimation(
      window.innerWidth * 0.25,
      window.innerHeight * 0.3
    );
    createTrailAnimation(
      window.innerWidth * 0.75,
      window.innerHeight * 0.7
    );
    createTrailAnimation(
      window.innerWidth * 0.15,
      window.innerHeight * 0.7
    );
    createTrailAnimation(
      window.innerWidth * 0.85,
      window.innerHeight * 0.25
    );
    createTrailAnimation(
      window.innerWidth * 0.5,
      window.innerHeight * 0.15
    );
    createTrailAnimation(
      window.innerWidth * 0.1,
      window.innerHeight * 0.5
    );
    createTrailAnimation(
      window.innerWidth * 0.9,
      window.innerHeight * 0.5
    );
    createTrailAnimation(
      window.innerWidth * 0.3,
      window.innerHeight * 0.8
    );
    createTrailAnimation(
      window.innerWidth * 0.7,
      window.innerHeight * 0.2
    );
    createTrailAnimation(
      window.innerWidth * 0.4,
      window.innerHeight * 0.1
    );
    createTrailAnimation(
      window.innerWidth * 0.6,
      window.innerHeight * 0.9
    );

    // Cleanup
    return () => {
      animationFrameIds.forEach((id) => {
        cancelAnimationFrame(id);
      });
    };
  }, [screenSize]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Gooey Effect Background */}
      <GooeyFilter id="gooey-filter-pixel-trail" strength={8} />
      <div
        ref={trailContainerRef}
        className="absolute inset-0 z-0"
        style={{ filter: "url(#gooey-filter-pixel-trail)" }}
      >
        <PixelTrail
          pixelSize={screenSize.lessThan("md") ? 24 : 32}
          fadeDuration={0}
          delay={800}
          pixelClassName={screenSize.lessThan("md") ? "bg-[#1a1a1a]" : "bg-[#141414]"}
        />
      </div>

      <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-4">
          <h1
            className="font-jersey text-6xl md:text-8xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: "#fafafa" }}
            onClick={() => copyToClipboard(commands[0].command)}
            title="Click to copy"
          >
            npx add-wallet
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

        {/* Terminal-style Command Section */}
        <div
          className="rounded-lg p-1 w-full md:max-w-lg mx-auto text-left"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <div
            className="rounded-md p-6 space-y-4 text-left"
            style={{ backgroundColor: "#141414" }}
          >
            {commands.map((cmd, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() => copyToClipboard(cmd.command)}
              >
                <div className="flex items-start text-left">
                  <div className="flex-1 min-w-0 text-left">
            <code
                      className="text-base md:text-lg font-mono tracking-wide block text-left"
              style={{ color: "#fafafa" }}
            >
                      {cmd.command}
            </code>
                    <p
                      className="text-sm mt-1 text-left"
                      style={{ color: "#666666" }}
                    >
                      {cmd.description}
                    </p>
                  </div>
            <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(cmd.command);
                    }}
                    className="p-1.5 rounded transition-all duration-200 hover:scale-110 flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: "#2a2a2a" }}
                    aria-label={`Copy ${cmd.command} to clipboard`}
            >
                    {copiedCommand === cmd.command ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                        width="16"
                        height="16"
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
                {index < commands.length - 1 && (
                  <div
                    className="mt-4 h-px"
                    style={{ backgroundColor: "#2a2a2a" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div
          className="flex flex-wrap justify-center gap-8 text-sm"
          style={{ color: "#666666" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "#22c55e" }}>✓</span>
            <span>Only you see your keys</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#22c55e" }}>✓</span>
            <span>You own the wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#22c55e" }}>✓</span>
            <span>Takes 10 seconds to create</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center justify-center gap-6">
          <ShimmerButton
            href="https://www.npmjs.com/package/add-wallet"
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
