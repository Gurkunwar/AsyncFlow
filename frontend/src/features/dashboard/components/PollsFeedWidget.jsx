import React from "react";
import { Skeleton } from "../../../components/Skeleton";
import { formatRelativeTime } from "../../../utils/helpers";

export default function PollsFeedWidget({ polls, isLoading }) {
  const safePolls = polls || [];

  return (
    <div className="bg-[#2b2d31] rounded-2xl border border-[#1e1f22] shadow-md flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-[#1e1f22] bg-[#232428] shrink-0 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#c084fc] flex items-center gap-2 uppercase tracking-wider">
          <span className="bg-[#c084fc]/10 p-1.5 rounded-md">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 
                012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
          </span>
          Live Polls Feed
        </h3>
        <span className="bg-[#c084fc]/20 text-[#c084fc] text-xs px-3 py-1 rounded-full font-bold border 
        border-[#c084fc]/30">
          {safePolls.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {isLoading ? (
          <>
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
          </>
        ) : safePolls.length > 0 ? (
          safePolls.map((p) => (
            <div
              key={p.id}
              className="bg-[#1e1f22] border-l-4 border-[#c084fc] p-4 rounded-xl flex flex-col gap-3 
              shadow-sm hover:translate-x-1 transition-transform"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-widest 
                  ${p.is_active ? "bg-[#23a559]/10 text-[#23a559] border-[#23a559]/20" : 
                  "bg-[#404249] text-[#99AAB5] border-[#3f4147]"}`}
                >
                  {p.is_active ? "Live" : "Ended"}
                </span>
                <span className="text-[10px] font-bold text-[#99AAB5] uppercase tracking-wider shrink-0">
                  {formatRelativeTime(p.created_at)}
                </span>
              </div>
              <p className="text-white text-sm font-medium leading-relaxed wrap-break-word line-clamp-2">
                {p.question}
              </p>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#99AAB5] space-y-3 opacity-80">
            <div className="bg-[#1e1f22] p-4 rounded-full shadow-inner">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-sm font-bold text-white">No active polls.</p>
          </div>
        )}
      </div>
    </div>
  );
}
