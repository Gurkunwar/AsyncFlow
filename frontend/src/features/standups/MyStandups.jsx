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
    }, 300);
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
        "Are you sure you want to delete this standup? All history will be lost.",
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
    if (showOnlyMine !== mineOnly) {
      setShowOnlyMine(mineOnly);
      setPage(1);
    }
  };

  const SkeletonCard = () => (
    <div className="bg-[#2b2d31] p-6 rounded-xl border border-[#1e1f22] animate-pulse h-50 flex flex-col">
      <div className="h-6 bg-[#3f4147] rounded-md w-3/4 mb-3"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-4 bg-[#3f4147] rounded-md w-1/4"></div>
        <div className="h-4 bg-[#3f4147] rounded-md w-1/3"></div>
      </div>
      <div className="flex-1"></div>
      <div className="space-y-3 pt-4 border-t border-[#3f4147]">
        <div className="flex justify-between">
          <div className="h-4 bg-[#3f4147] rounded-md w-1/5"></div>
          <div className="h-5 bg-[#3f4147] rounded-md w-1/4"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-[#3f4147] rounded-md w-1/5"></div>
          <div className="h-5 bg-[#3f4147] rounded-md w-1/3"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Managed Standups</h2>
          <p className="text-[#99AAB5] text-sm">
            Create and manage your automated daily syncs.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752C4] px-5 py-2.5 rounded-md 
          font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Standup
        </button>
      </div>

      <div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-[#2b2d31] 
      p-4 rounded-xl border border-[#1e1f22] shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* Segmented Toggle */}
          <div className="flex bg-[#1e1f22] p-1 rounded-lg border border-[#3f4147] w-full sm:w-auto shrink-0">
            <button
              onClick={() => handleTabChange(false)}
              className={`cursor-pointer flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all
                duration-200 ${
                  !showOnlyMine
                    ? "bg-[#4752C4] text-white shadow-sm"
                    : "text-[#99AAB5] hover:text-white hover:bg-[#35373c]"
                }`}
            >
              All Standups
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`cursor-pointer flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all 
                duration-200 ${
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
              onChange={(e) => {
                setSelectedGuild(e.target.value);
                setPage(1);
              }}
              disabled={isLoadingGuilds}
              className="w-full bg-[#1e1f22] text-sm text-gray-200 pl-3 pr-8 py-2 rounded-lg outline-none border 
              border-[#3f4147] focus:border-[#5865F2] cursor-pointer appearance-none disabled:opacity-50 transition-colors"
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
            placeholder="Search standups..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1e1f22] text-sm text-white pl-9 pr-3 py-2 rounded-lg 
            outline-none border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder-[#99AAB5]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 
              ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {standups.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/standups/${s.id}`)}
                className="bg-[#2b2d31] p-6 rounded-xl border border-[#1e1f22] 
                hover:border-[#5865F2] hover:-translate-y-1 hover:shadow-xl transition-all duration-200 
                cursor-pointer group relative flex flex-col h-full"
              >
                <button
                  onClick={(e) => handleDelete(e, s.id)}
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
                      {s.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 mb-4 flex-wrap">
                      <span
                        className="bg-[#1e1f22] border border-[#3f4147] px-2 py-0.5 rounded text-[10px] 
                      text-gray-300 font-bold tracking-wider truncate max-w-30"
                      >
                        {s.guild_name}
                      </span>
                      <span className="text-[11px] text-[#99AAB5] truncate max-w-30">
                        By {s.creator_name || "Unknown"}
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
                      {s.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#99AAB5] font-medium text-xs uppercase tracking-wider">
                      Channel
                    </span>
                    <span className="text-gray-200 font-medium flex items-center gap-1 truncate max-w-37.5">
                      <span className="text-[#99AAB5] text-lg shrink-0">#</span>
                      <span className="truncate">{s.channel_name}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {standups.length === 0 && (
              <div
                className="col-span-full py-24 px-6 flex flex-col items-center justify-center text-center 
              bg-[#2b2d31] rounded-xl border-2 border-dashed border-[#3f4147]"
              >
                <div className="bg-[#1e1f22] p-4 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-[#5865F2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 
                      0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 
                      1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No standups found
                </h3>
                <p className="text-[#99AAB5] max-w-sm mb-6">
                  {debouncedSearch
                    ? "We couldn't find any standups matching your search criteria. Try clearing your filters."
                    : "You haven't created any automated standups for this server yet. Set one up to get started!"}
                </p>
                {!debouncedSearch && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2 rounded-md font-semibold 
                    transition-colors"
                  >
                    Create your first Standup
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-lg 
                font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#35373c] 
                hover:border-[#5865F2] transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[#99AAB5] text-sm">Page</span>
                <span
                  className="text-white text-sm font-bold bg-[#1e1f22] px-3 py-1.5 rounded border 
                border-[#3f4147]"
                >
                  {page}
                </span>
                <span className="text-[#99AAB5] text-sm">of {totalPages}</span>
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-lg 
                font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#35373c] 
                hover:border-[#5865F2] transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <CreateStandupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
