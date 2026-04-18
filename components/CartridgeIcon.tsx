"use client";
import { theme } from "@/lib/theme";

interface CartridgeIconProps {
  loaded: boolean;
  size?: number;
}

export function CartridgeIcon({ loaded, size = 22 }: CartridgeIconProps) {
  const fill = loaded ? theme.plum72 : "transparent";
  const stroke = loaded ? theme.plum72 : theme.moss62;
  return (
    <svg
      width={size * 2.2}
      height={size}
      viewBox="0 0 44 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <rect x="1" y="3" width="28" height="14" rx="1.5" stroke={stroke} strokeWidth="1.4" fill={fill} />
      <path d="M29 3 L40 6 L40 14 L29 17 Z" stroke={stroke} strokeWidth="1.4" fill={fill} />
      <line x1="5" y1="3" x2="5" y2="17" stroke={stroke} strokeWidth="1" opacity={loaded ? 0.4 : 0.25} />
    </svg>
  );
}
