"use client";

import { useState } from "react";
import { getIESData, faviconUrl } from "@/lib/ies-data";

interface UniversityAvatarProps {
  sigla: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "w-8 h-8",  text: "text-[9px]",  pad: "p-1"   },
  md: { container: "w-12 h-12", text: "text-[11px]", pad: "p-1.5" },
  lg: { container: "w-16 h-16", text: "text-sm",     pad: "p-2"   },
};

export function UniversityAvatar({ sigla, size = "md", className = "" }: UniversityAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const iesData = getIESData(sigla);
  const { container, text, pad } = SIZE_MAP[size];

  const logoSrc = iesData.site ? faviconUrl(iesData.site) : null;
  const label = sigla.length <= 5 ? sigla : sigla.slice(0, 5);

  if (logoSrc && !imgFailed) {
    return (
      <div
        className={`${container} rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 ${pad} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={`Logo ${sigla}`}
          className="w-full h-full object-contain"
          style={{ filter: "grayscale(100%) contrast(1.1)" }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Fallback: iniciais com fundo escuro
  return (
    <div
      className={`${container} rounded-xl flex items-center justify-center shrink-0 bg-gray-900 ${className}`}
    >
      <span className={`${text} font-bold text-white leading-none tracking-tight text-center`}>
        {label}
      </span>
    </div>
  );
}
