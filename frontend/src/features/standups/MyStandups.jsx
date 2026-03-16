import React, { useState, useEffect } from "react";
import {
  useGetManagedStandupsQuery,
  useDeleteStandupMutation,
  useGetUserGuildsQuery,
} from "../../store/apiSlice";
import CreateStandupModal from "./components/CreateStandupModal";
import StandupFilterBar from "./components/StandupFilterBar";
import StandupCard from "./components/StandupCard";

export default function MyStandups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedGuild, setSelectedGuild] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: guilds = [], isLoading: isLoadingGuilds } =
    useGetUserGuildsQuery();
  const [deleteStandup] = useDeleteStandupMutation();

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
          className="cursor-pointer w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752C4] px-5 py-2.5 
          rounded-md font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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

      <StandupFilterBar
        showOnlyMine={showOnlyMine}
        onTabChange={handleTabChange}
        selectedGuild={selectedGuild}
        setSelectedGuild={(val) => {
          setSelectedGuild(val);
          setPage(1);
        }}
        guilds={guilds}
        isLoadingGuilds={isLoadingGuilds}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse opacity-50">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-[#2b2d31] rounded-xl border border-[#1e1f22]"
            ></div>
          ))}
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity 
              duration-300 ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {standups.map((s) => (
              <StandupCard key={s.id} standup={s} onDelete={handleDelete} />
            ))}

            {standups.length === 0 && (
              <div
                className="col-span-full py-24 px-6 flex flex-col items-center justify-center 
              text-center bg-[#2b2d31] rounded-xl border-2 border-dashed border-[#3f4147]"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  No standups found
                </h3>
                <p className="text-[#99AAB5] max-w-sm mb-6">
                  {debouncedSearch
                    ? "We couldn't find any standups matching your search criteria."
                    : "You haven't created any automated standups yet."}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-lg 
                font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[#99AAB5] text-sm">
                  Page {page} of {totalPages}
                </span>
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-lg 
                font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
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
