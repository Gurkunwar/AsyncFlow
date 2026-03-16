import React from "react";

export default function PollsFilterBar({
  showOnlyMine,
  onTabChange,
  selectedGuild,
  setSelectedGuild,
  guilds,
  isLoadingGuilds,
  searchInput,
  setSearchInput,
}) {
  return (
    <div
      className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 
    bg-[#2b2d31] p-4 rounded-xl border border-[#1e1f22] shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
        <div className="flex bg-[#1e1f22] p-1 rounded-lg border border-[#3f4147] w-full sm:w-auto shrink-0">
          <button
            onClick={() => onTabChange(false)}
            className={`cursor-pointer flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md 
                transition-all duration-200 ${
                  !showOnlyMine
                    ? "bg-[#4752C4] text-white shadow-sm"
                    : "text-[#99AAB5] hover:text-white hover:bg-[#35373c]"
                }`}
          >
            All Polls
          </button>
          <button
            onClick={() => onTabChange(true)}
            className={`cursor-pointer flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md 
                transition-all duration-200 ${
                  showOnlyMine
                    ? "bg-[#4752C4] text-white shadow-sm"
                    : "text-[#99AAB5] hover:text-white hover:bg-[#35373c]"
                }`}
          >
            Created by me
          </button>
        </div>

        <div className="relative w-full sm:w-48 shrink-0">
          <select
            value={selectedGuild}
            onChange={(e) => setSelectedGuild(e.target.value)}
            disabled={isLoadingGuilds}
            className="w-full bg-[#1e1f22] text-sm text-gray-200 pl-3 pr-8 py-2 rounded-lg 
            outline-none border border-[#3f4147] focus:border-[#5865F2] cursor-pointer 
            appearance-none disabled:opacity-50 transition-colors"
          >
            <option value="All">
              {isLoadingGuilds ? "Loading..." : "All Servers"}
            </option>
            {guilds.map((guild) => (
              <option key={guild.id} value={guild.id} className="truncate">
                {guild.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-2.5 pointer-events-none text-[#99AAB5]">
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative w-full lg:w-72 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
          placeholder="Search polls by question..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-[#1e1f22] text-sm text-white pl-9 pr-3 py-2 rounded-lg outline-none 
          border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder-[#99AAB5]"
        />
      </div>
    </div>
  );
}
