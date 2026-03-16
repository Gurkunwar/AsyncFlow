import React from "react";
import { useNavigate } from "react-router-dom";

export default function StandupCard({ standup, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/standups/${standup.id}`)}
      className="bg-[#2b2d31] p-6 rounded-xl border border-[#1e1f22] hover:border-[#5865F2] 
      hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer group relative flex flex-col h-full"
    >
      <button
        onClick={(e) => onDelete(e, standup.id)}
        className="absolute top-4 right-4 text-[#99AAB5] hover:text-[#da373c] 
        hover:bg-[#da373c]/10 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
        title="Delete Standup"
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
            {standup.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 mb-4 flex-wrap">
            <span
              className="bg-[#1e1f22] border border-[#3f4147] px-2 py-0.5 rounded text-[10px] 
            text-gray-300 font-bold tracking-wider truncate max-w-30"
            >
              {standup.guild_name}
            </span>
            <span className="text-[11px] text-[#99AAB5] truncate max-w-30">
              By {standup.creator_name || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="space-y-3 text-sm pt-4 border-t border-[#3f4147] mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[#99AAB5] font-medium text-xs uppercase tracking-wider">
            Schedule
          </span>
          <span
            className="text-white bg-[#1e1f22] border border-[#3f4147] px-2 py-1 rounded 
          text-xs font-semibold flex items-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5 text-[#5865F2]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {standup.time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#99AAB5] font-medium text-xs uppercase tracking-wider">
            Channel
          </span>
          <span className="text-gray-200 font-medium flex items-center gap-1 truncate max-w-37.5">
            <span className="text-[#99AAB5] text-lg shrink-0">#</span>
            <span className="truncate">{standup.channel_name}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
