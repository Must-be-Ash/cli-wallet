"use client";

import React, { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ShimmerButton({
  href,
  icon,
  children,
  className,
}: ShimmerButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative flex items-center gap-2 px-5 py-2.5 rounded-md transition-all duration-300 hover:scale-105 overflow-hidden",
        className
      )}
      style={{
        backgroundColor: isHovered ? "#fafafa" : "#1f1f1f",
        color: isHovered ? "#0a0a0a" : "#fafafa",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shimmer overlay */}
      {isHovered && (
        <motion.div
          className="absolute z-0"
          initial={{ x: "-150%", y: "-50%" }}
          animate={{ x: "150%", y: "50%" }}
          transition={{
            duration: 2.5,
            repeat: 0,
            ease: "easeInOut",
          }}
          style={{
            width: "200%",
            height: "200%",
            background:
              "linear-gradient(120deg, transparent 20%, rgba(180,180,180,0.7) 50%, transparent 80%)",
          }}
        />
      )}
      <span className="relative z-10 transition-colors duration-300">
        {icon}
      </span>
      <span className="relative z-10 font-medium transition-colors duration-300">
        {children}
      </span>
    </a>
  );
}

