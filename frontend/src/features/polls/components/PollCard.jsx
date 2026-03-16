import React from "react";
import { useNavigate } from "react-router-dom";

export default function PollCard({ poll, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/polls/${poll.id}`)}
      className="bg-[#2b2d31] p-6 rounded-xl border border-[#1e1f22] hover:border-[#5865F2] 
      hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer group 
      relative flex flex-col h-full"
    >
      <button
        onClick={(e) => onDelete(e, poll.id)}
        className="absolute top-4 right-4 text-[#99AAB5] hover:text-[#da373c] 
        hover:bg-[#da373c]/10 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
        title="Delete Poll"
      >
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 
            1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      <div className="flex justify-between items-start mb-1 pr-8">
        <div>
          <h3 className="text-xl font-bold group-hover:text-[#5865F2] transition-colors line-clamp-2 leading-tight">
            {poll.question}
          </h3>
          <div className="flex items-center gap-2 mt-2 mb-4 flex-wrap">
            <span
              className="bg-[#1e1f22] border border-[#3f4147] px-2 py-0.5 rounded 
            text-[10px] text-gray-300 font-bold tracking-wider truncate max-w-30"
            >
              {poll.guild_name}
            </span>
            <span className="text-[11px] text-[#99AAB5] truncate max-w-30">
              By {poll.creator_name || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="space-y-3 text-sm pt-4 border-t border-[#3f4147] mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[#99AAB5] font-medium text-xs uppercase tracking-wider">
            Status
          </span>
          <span
            className={`px-2 py-1 rounded border text-xs font-semibold flex items-center gap-1.5 
                ${
                  poll.is_active
                    ? "bg-[#23a559]/10 border-[#23a559]/20 text-[#23a559]"
                    : "bg-[#1e1f22] border-[#3f4147] text-[#99AAB5]"
                }`}
          >
            {poll.is_active ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#23a559] animate-pulse"></span>{" "}
                Active
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#404249]"></span>{" "}
                Closed
              </>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#99AAB5] font-medium text-xs uppercase tracking-wider">
            Channel
          </span>
          <span className="text-gray-200 font-medium flex items-center gap-1 truncate max-w-37.5">
            <span className="text-[#99AAB5] text-lg shrink-0">#</span>
            <span className="truncate">{poll.channel_name}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
