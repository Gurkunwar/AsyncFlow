import React from "react";

export default function BuyMeCoffee() {
  return (
    <a
      href="https://buymeacoffee.com/gurkunwarsingh"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-[#FFDD00]/10 text-[#FFDD00] border border-[#FFDD00]/20 
      hover:bg-[#FFDD00] hover:text-black px-4 py-1.5 rounded-full text-sm font-bold transition-all 
      shadow-sm group"
    >
      <svg
        className="w-4 h-4 group-hover:animate-bounce"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20 8h-2M4 8h12M4 11h12M4 14h12M4 17h12M5 21h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        ></path>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M18 8v4a2 2 0 002 2h0a2 2 0 002-2V8h-4z"
        ></path>
      </svg>
      <span className="hidden sm:inline">Buy me a coffee</span>
    </a>
  );
}