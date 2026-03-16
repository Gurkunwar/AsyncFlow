import React from "react";

export default function HistoryFilters({
  viewMode,
  searchInput,
  setSearchInput,
}) {
  const toggleFilterToken = (token) => {
    setSearchInput((prev) => {
      const current = prev || "";
      if (current.includes(token)) {
        return current.replace(token, "").replace(/\s+/g, " ").trim();
      }
      return `${current} ${token}`.trim();
    });
  };

  const yesterdayDateToken = `date:${new Date(Date.now() - 86400000).toISOString().split("T")[0]}`;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-[#99AAB5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search username, answers, or filter syntax..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-[#1e1f22] text-sm text-white pl-11 pr-4 py-3.5 rounded-xl outline-none 
          border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder-[#99AAB5]/60 shadow-inner"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-[#99AAB5] uppercase tracking-widest mr-2">
          Quick Filters
        </span>

        {viewMode === "standups" && (
          <>
            <button
              onClick={() => toggleFilterToken("is:submitted")}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border shadow-sm ${
                searchInput.includes("is:submitted")
                  ? "bg-[#23a559] text-white border-[#23a559]"
                  : "bg-[#1e1f22] text-[#99AAB5] border-[#3f4147] hover:border-[#23a559]/50 hover:text-white"
              }`}
            >
              is:submitted
            </button>
            <button
              onClick={() => toggleFilterToken("is:skipped")}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border shadow-sm ${
                searchInput.includes("is:skipped")
                  ? "bg-[#da373c] text-white border-[#da373c]"
                  : "bg-[#1e1f22] text-[#99AAB5] border-[#3f4147] hover:border-[#da373c]/50 hover:text-white"
              }`}
            >
              is:skipped
            </button>
          </>
        )}

        <button
          onClick={() => toggleFilterToken("date:today")}
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border shadow-sm ${
            searchInput.includes("date:today")
              ? "bg-[#5865F2] text-white border-[#5865F2]"
              : "bg-[#1e1f22] text-[#99AAB5] border-[#3f4147] hover:border-[#5865F2]/50 hover:text-white"
          }`}
        >
          date:today
        </button>

        <button
          onClick={() => toggleFilterToken(yesterdayDateToken)}
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border shadow-sm ${
            searchInput.includes(yesterdayDateToken)
              ? "bg-[#99AAB5] text-[#1e1f22] border-[#99AAB5]"
              : "bg-[#1e1f22] text-[#99AAB5] border-[#3f4147] hover:border-[#99AAB5]/50 hover:text-white"
          }`}
        >
          date:yesterday
        </button>

        {searchInput && (
          <button
            onClick={() => setSearchInput("")}
            className="text-[11px] font-bold text-[#da373c] hover:text-[#ff4f56] bg-[#da373c]/10 px-3 py-1.5 
            rounded-lg ml-auto cursor-pointer transition-colors border border-[#da373c]/20"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
