import React from "react";

export default function PollResultsChart({ poll, chartData, totalVotes }) {
  return (
    <div className="bg-[#2b2d31] p-6 md:p-10 rounded-2xl border border-[#1e1f22] shadow-md">
      <h2 className="text-2xl font-bold mb-10 flex items-start gap-4 leading-tight text-white">
        <span className="bg-[#1e1f22] p-2 rounded-lg border border-[#3f4147] shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-[#38bdf8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 
              01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </span>
        {poll.Question}
      </h2>

      <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-start">
        <div className="flex-1 space-y-7 w-full">
          {chartData.map((option) => (
            <div key={option.ID} className="relative group">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors pr-4">
                  {option.Label}
                </span>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="text-xs text-[#99AAB5] font-medium">
                    ({option.votes})
                  </span>
                  <span
                    className="text-sm font-extrabold w-10 text-right"
                    style={{ color: option.color }}
                  >
                    {Math.round(option.percentage)}%
                  </span>
                </div>
              </div>
              <div className="h-3.5 w-full bg-[#1e1f22] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 relative"
                  style={{
                    width: `${option.percentage}%`,
                    backgroundColor: option.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="w-56 h-56 shrink-0 relative flex items-center justify-center">
          <svg
            viewBox="0 0 42 42"
            className="w-full h-full -rotate-90 drop-shadow-2xl"
          >
            <circle
              cx="21"
              cy="21"
              r="15.91549431"
              fill="transparent"
              stroke="#1e1f22"
              strokeWidth="6"
            />
            {chartData.map(
              (option) =>
                option.votes > 0 && (
                  <circle
                    key={option.ID}
                    cx="21"
                    cy="21"
                    r="15.91549431"
                    fill="transparent"
                    stroke={option.color}
                    strokeWidth="6"
                    strokeDasharray={option.dashArray}
                    strokeDashoffset={option.dashOffset}
                    className="transition-all duration-1000 origin-center"
                  />
                ),
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none 
          bg-[#2b2d31] rounded-full m-3.5 shadow-inner border border-[#1e1f22]/50">
            <span className="text-3xl font-extrabold text-white">
              {totalVotes}
            </span>
            <span className="text-[10px] font-bold text-[#99AAB5] uppercase tracking-widest mt-0.5">
              Total Votes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
