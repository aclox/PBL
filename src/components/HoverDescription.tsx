import React, { useState } from "react";
import { Info, HelpCircle } from "lucide-react";

export interface HoverDescriptionContent {
  title: string;
  badge?: string;
  summary?: string;
  details?: string;
  // Backward compatibility helpers
  whatItMeans?: string;
  dataSource?: string;
  scientificRole?: string;
}

interface HoverTileProps {
  children: React.ReactNode;
  content: HoverDescriptionContent;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  key?: React.Key;
}

export function HoverTile({
  children,
  content,
  className = "",
  position = "bottom",
  align = "center",
}: HoverTileProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Position classes
  let posClass = "top-full mt-2";
  if (position === "top") posClass = "bottom-full mb-2";
  else if (position === "left") posClass = "right-full mr-2 top-0";
  else if (position === "right") posClass = "left-full ml-2 top-0";

  // Alignment classes
  let alignClass = "left-1/2 -translate-x-1/2";
  if (align === "start") alignClass = "left-0";
  else if (align === "end") alignClass = "right-0";

  // Resolve short text
  const mainText = content.summary || content.whatItMeans || "";
  const subText = content.details || content.dataSource || content.scientificRole || "";

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      {/* Tile Content */}
      {children}

      {/* Floating Compact Card */}
      <div
        role="tooltip"
        className={`absolute ${posClass} ${alignClass} w-64 sm:w-72 bg-stone-900/95 text-stone-100 p-2.5 rounded-xl shadow-xl border border-stone-700/80 backdrop-blur-md z-50 transition-all duration-150 pointer-events-none text-left ${
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-stone-800 mb-1.5">
          <span className="font-bold text-xs text-white truncate">
            {content.title}
          </span>
          {content.badge && (
            <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded shrink-0">
              {content.badge}
            </span>
          )}
        </div>

        <p className="text-stone-200 text-[11px] leading-snug">
          {mainText}
        </p>

        {subText && (
          <div className="mt-1.5 pt-1 border-t border-stone-800/80 text-[10px] text-stone-400 leading-normal">
            <span className="text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-semibold mr-1">
              Ref:
            </span>
            <span>{subText}</span>
          </div>
        )}

        {/* Pointer Arrow */}
        {position === "bottom" && (
          <div
            className={`absolute -top-1 ${
              align === "center"
                ? "left-1/2 -translate-x-1/2"
                : align === "start"
                ? "left-6"
                : "right-6"
            } w-2 h-2 bg-stone-900 border-t border-l border-stone-700/80 rotate-45`}
          />
        )}
        {position === "top" && (
          <div
            className={`absolute -bottom-1 ${
              align === "center"
                ? "left-1/2 -translate-x-1/2"
                : align === "start"
                ? "left-6"
                : "right-6"
            } w-2 h-2 bg-stone-900 border-b border-r border-stone-700/80 rotate-45`}
          />
        )}
      </div>
    </div>
  );
}

interface HoverIconProps {
  content: HoverDescriptionContent;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export function HoverIcon({
  content,
  className = "",
  position = "top",
  align = "center",
}: HoverIconProps) {
  return (
    <HoverTile
      content={content}
      position={position}
      align={align}
      className={`inline-flex items-center justify-center cursor-help ${className}`}
    >
      <span className="text-stone-400 hover:text-emerald-700 transition p-0.5 rounded-full hover:bg-stone-100">
        <HelpCircle className="w-3.5 h-3.5" />
      </span>
    </HoverTile>
  );
}
