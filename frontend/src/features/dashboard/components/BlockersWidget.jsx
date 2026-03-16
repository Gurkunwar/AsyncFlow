import React from "react";
import { Skeleton } from "../../../components/Skeleton";
import {
  formatRelativeTime,
  getDiscordAvatarUrl,
} from "../../../utils/helpers";

export default function BlockersWidget({ blockers, isLoading }) {
  const safeBlockers = blockers || [];

  return (
    <div className="bg-[#2b2d31] rounded-2xl border border-[#1e1f22] shadow-md flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-[#1e1f22] bg-[#232428] shrink-0 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#da373c] flex items-center gap-2 uppercase tracking-wider">
          <span className="bg-[#da373c]/10 p-1.5 rounded-md">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 
                0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </span>
          Active Blockers
        </h3>
        <span
          className="bg-[#da373c]/20 text-[#da373c] text-xs px-3 py-1 rounded-full font-bold border 
        border-[#da373c]/30"
        >
          {safeBlockers.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {isLoading ? (
          <>
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
          </>
        ) : safeBlockers.length > 0 ? (
          safeBlockers.map((b) => (
            <div
              key={b.id}
              className="bg-[#1e1f22] border-l-4 border-[#da373c] p-4 rounded-xl flex flex-col gap-3 
              shadow-sm hover:translate-x-1 transition-transform"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <img
                    src={getDiscordAvatarUrl(b.avatar, b.user_id)}
                    alt="avatar"
                    className="w-7 h-7 rounded-full shadow-sm object-cover shrink-0 border border-[#2b2d31]"
                  />
                  <span className="font-bold text-white text-sm truncate">
                    {b.user}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#99AAB5] uppercase tracking-wider shrink-0">
                  {formatRelativeTime(b.created_at)}
                </span>
              </div>
              <p className="text-[#dcddde] text-sm leading-relaxed italic wrap-break-word">
                "{b.task}"
              </p>
              <div className="flex items-center justify-end">
                <span
                  className="text-[10px] font-extrabold text-[#da373c] bg-[#da373c]/10 border 
                border-[#da373c]/20 px-2 py-1 rounded uppercase tracking-widest"
                >
                  {b.team}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#99AAB5] space-y-3 opacity-80">
            <div className="bg-[#1e1f22] p-4 rounded-full shadow-inner">
              <span className="text-4xl">🎉</span>
            </div>
            <p className="text-sm font-bold text-white">
              Zero blockers reported!
            </p>
            <p className="text-xs text-center px-4">
              Your team is moving fast with no obstacles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
