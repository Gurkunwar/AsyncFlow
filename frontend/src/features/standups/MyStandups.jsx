import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetManagedStandupsQuery,
  useDeleteStandupMutation,
  useGetUserGuildsQuery,
} from "../../store/apiSlice";
import CreateStandupModal from "./components/CreateStandupModal";

export default function MyStandups() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedGuild, setSelectedGuild] = useState("All");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: guilds = [], isLoading: isLoadingGuilds } =
    useGetUserGuildsQuery();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    data: standupData,
    isLoading,
    isFetching,
  } = useGetManagedStandupsQuery({
    filter: showOnlyMine ? "me" : "all",
    page,
    limit: 12,
    search: debouncedSearch,
    guild_id: selectedGuild === "All" ? "" : selectedGuild,
  });

  const [deleteStandup] = useDeleteStandupMutation();
  const standups = standupData?.data || [];
  const totalPages = standupData?.total_pages || 1;

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (
      window.confirm(
        "🗑️ Are you sure you want to delete this standup? All history will be lost.",
      )
    ) {
      try {
        await deleteStandup(id).unwrap();
      } catch (err) {
        alert("Could not delete the standup.");
      }
    }
  };

  const handleTabChange = (mineOnly) => {
    setShowOnlyMine(mineOnly);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Managed Standups</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 rounded 
          font-semibold text-sm transition-colors cursor-pointer shadow-md"
        >
          + New Standup
        </button>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-[#1e1f22] p-1 rounded-lg border border-[#3f4147] w-full sm:w-auto">
            <button
              onClick={() => handleTabChange(false)}
              className={`cursor-pointer flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                !showOnlyMine
                  ? "bg-[#5865F2] text-white shadow-sm"
                  : "text-[#99AAB5] hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`cursor-pointer flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                showOnlyMine
                  ? "bg-[#5865F2] text-white shadow-sm"
                  : "text-[#99AAB5] hover:text-white"
              }`}
            >
              Created by me
            </button>
          </div>

          <select
            value={selectedGuild}
            onChange={(e) => {
              setSelectedGuild(e.target.value);
              setPage(1);
            }}
            disabled={isLoadingGuilds}
            className="bg-[#1e1f22] text-sm text-white px-3 py-2 rounded-md outline-none border 
            border-[#3f4147] focus:border-[#5865F2] cursor-pointer w-full sm:w-auto disabled:opacity-50 
            disabled:cursor-not-allowed"
          >
            <option value="All">
              {isLoadingGuilds ? "Loading servers..." : "All Servers"}
            </option>
            {guilds.map((guild) => (
              <option key={guild.id} value={guild.id}>
                {guild.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full xl:w-72">
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
            placeholder="Search standups by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1e1f22] text-sm text-white pl-9 pr-3 py-2 rounded-md 
            outline-none border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder-[#99AAB5]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-[#99AAB5]">
          Loading standups...
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity 
              duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}
          >
            {standups.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/standups/${s.id}`)}
                className="bg-[#2b2d31] p-6 rounded-xl border border-[#1e1f22] 
                hover:border-[#5865F2] transition-all cursor-pointer group shadow-lg relative flex flex-col h-full"
              >
                <button
                  onClick={(e) => handleDelete(e, s.id)}
                  className="cursor-pointer absolute top-4 right-4 text-[#404249] hover:text-[#da373c] 
                  hover:bg-[#da373c]/10 p-2 rounded-md transition-all opacity-0 group-hover:opacity-100"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 
                      4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <div className="flex justify-between items-start mb-1 pr-8">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-[#5865F2] transition-colors line-clamp-2">
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 mb-4 flex-wrap">
                      <span className="text-[10px] text-[#5865F2] font-bold uppercase tracking-widest">
                        {s.guild_name}
                      </span>
                      <span className="text-[#404249]">•</span>
                      <span className="text-[10px] text-[#99AAB5] uppercase tracking-widest truncate max-w-30 sm:max-w-30">
                        By {s.creator_name || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1"></div>
                <div className="space-y-3 text-sm pt-4 border-t border-[#3f4147] mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#99AAB5]">Schedule</span>
                    <span className="text-white bg-[#313338] px-2 py-1 rounded-md text-xs font-semibold">
                      🕒 {s.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#99AAB5]">Channel</span>
                    <span className="text-[#43b581] font-bold flex items-center gap-1 truncate max-w-37.5">
                      <span className="text-lg shrink-0">#</span>{" "}
                      <span className="truncate">{s.channel_name}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {standups.length === 0 && (
              <div
                className="col-span-full py-20 text-center bg-[#2b2d31] rounded-xl border-2 
              border-dashed border-[#404249]"
              >
                <p className="text-[#99AAB5] mb-2 text-4xl">🔍</p>
                <p className="text-[#99AAB5]">
                  No standups match your search or filters.
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-md 
                font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35373c] transition-colors"
              >
                ← Previous
              </button>
              <span
                className="text-[#99AAB5] text-sm font-bold bg-[#1e1f22] px-4 py-2 rounded-md border 
              border-[#3f4147]"
              >
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-md 
                font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35373c] transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <CreateStandupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
