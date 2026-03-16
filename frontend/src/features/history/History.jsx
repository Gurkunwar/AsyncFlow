import React, { useState, useEffect } from "react";
import {
  useGetManagedStandupsQuery,
  useGetHistoryQuery,
  useGetStandupByIdQuery,
  useGetManagedPollsQuery,
  useGetPollHistoryQuery,
} from "../../store/apiSlice";

import { useHistoryExport } from "./hooks/useHistoryExport";
import HistoryFilters from "./components/HistoryFilters";
import HistoryTable from "./components/HistoryTable";
import Pagination from "./components/Pagination";

export default function History() {
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("historyViewMode") || "standups",
  );
  const [selectedStandupId, setSelectedStandupId] = useState(
    () => localStorage.getItem("historyStandupId") || "",
  );
  const [selectedPollId, setSelectedPollId] = useState(
    () => localStorage.getItem("historyPollId") || "",
  );

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("historyViewMode", viewMode);
    setPage(1);
    setSearchInput("");
    setDebouncedSearch("");
  }, [viewMode]);

  useEffect(() => {
    if (selectedStandupId) {
      localStorage.setItem("historyStandupId", selectedStandupId);
      setPage(1);
    }
  }, [selectedStandupId]);

  useEffect(() => {
    if (selectedPollId) {
      localStorage.setItem("historyPollId", selectedPollId);
      setPage(1);
    }
  }, [selectedPollId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: standupsData, isLoading: isLoadingStandups } =
    useGetManagedStandupsQuery(
      { filter: "all", page: 1, limit: 50 },
      { skip: viewMode !== "standups" },
    );
  const standups = standupsData?.data || [];

  const { data: standupConfig } = useGetStandupByIdQuery(selectedStandupId, {
    skip: viewMode !== "standups" || !selectedStandupId,
  });

  const {
    data: historyResponse,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
  } = useGetHistoryQuery(
    { id: selectedStandupId, page, limit: 20, search: debouncedSearch },
    { skip: viewMode !== "standups" || !selectedStandupId },
  );
  const historyData = historyResponse?.data || [];
  const historyTotalPages = historyResponse?.total_pages || 1;

  const { data: pollsData, isLoading: isLoadingPolls } =
    useGetManagedPollsQuery(
      { filter: "all", page: 1, limit: 50 },
      { skip: viewMode !== "polls" },
    );
  const polls = pollsData?.data || [];

  const {
    data: pollHistoryResponse,
    isLoading: isLoadingPollHistory,
    isFetching: isFetchingPolls,
  } = useGetPollHistoryQuery(
    { id: selectedPollId, page, limit: 20, search: debouncedSearch },
    { skip: viewMode !== "polls" || !selectedPollId },
  );
  const pollHistoryData = pollHistoryResponse?.data || [];
  const pollTotalPages = pollHistoryResponse?.total_pages || 1;

  useEffect(() => {
    if (
      viewMode === "standups" &&
      standups.length > 0 &&
      !standups.some((st) => st.id.toString() === selectedStandupId)
    ) {
      setSelectedStandupId(standups[0].id.toString());
    }
  }, [standups, selectedStandupId, viewMode]);

  useEffect(() => {
    if (
      viewMode === "polls" &&
      polls.length > 0 &&
      !polls.some((p) => p.id.toString() === selectedPollId)
    ) {
      setSelectedPollId(polls[0].id.toString());
    }
  }, [polls, selectedPollId, viewMode]);

  const { handleExportCSV } = useHistoryExport({
    viewMode,
    historyData,
    pollHistoryData,
    standupConfig,
    selectedStandupId,
    selectedPollId,
    page,
  });

  const isExportDisabled =
    viewMode === "standups"
      ? historyData.length === 0
      : pollHistoryData.length === 0;
  const currentTotalPages =
    viewMode === "standups" ? historyTotalPages : pollTotalPages;
  const isDataLoading =
    viewMode === "standups" ? isFetchingHistory : isFetchingPolls;

  return (
    <div className="animate-fade-in pb-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Global Logs</h2>
          <div className="bg-[#1e1f22] p-1.5 rounded-lg border border-[#3f4147] shadow-sm w-full sm:w-auto inline-flex">
            <button
              onClick={() => setViewMode("standups")}
              className={`cursor-pointer flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-md transition-all 
                ${
                  viewMode === "standups"
                    ? "bg-[#5865F2] text-white shadow-md"
                    : "text-[#99AAB5] hover:text-white hover:bg-[#2b2d31]"
                }`}
            >
              Standups
            </button>
            <button
              onClick={() => setViewMode("polls")}
              className={`cursor-pointer flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-md transition-all 
                ${
                  viewMode === "polls"
                    ? "bg-[#38bdf8] text-white shadow-md"
                    : "text-[#99AAB5] hover:text-white hover:bg-[#2b2d31]"
                }`}
            >
              Polls
            </button>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={isExportDisabled}
          className="bg-[#2b2d31] hover:bg-[#35373c] disabled:opacity-50 disabled:cursor-not-allowed px-5 
          py-2.5 rounded-lg font-bold text-sm text-[#99AAB5] hover:text-white transition-all border border-[#3f4147] 
          hover:border-[#5865F2] shadow-sm flex items-center justify-center gap-2 shrink-0"
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
              d="M4 16v1a3 3 0 003 3h10a3 
            3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
          Export CSV
        </button>
      </div>

      <div className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-md flex flex-col gap-5 mb-6">
        <div className="relative w-full lg:w-1/3 shrink-0">
          <label
            className="absolute -top-2 left-3 bg-[#2b2d31] px-1 text-[10px] font-extrabold 
          text-[#5865F2] uppercase tracking-widest z-10"
          >
            {viewMode === "standups" ? "Target Standup" : "Target Poll"}
          </label>

          {viewMode === "standups" ? (
            isLoadingStandups ? (
              <div className="h-12 w-full bg-[#1e1f22] rounded-lg animate-pulse border border-[#3f4147]"></div>
            ) : standups.length === 0 ? (
              <div
                className="h-12 w-full bg-[#1e1f22] rounded-lg border border-[#da373c]/50 flex 
              items-center px-4 text-sm text-[#da373c]"
              >
                No standups found.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedStandupId}
                  onChange={(e) => setSelectedStandupId(e.target.value)}
                  className="w-full bg-[#1e1f22] text-sm font-medium text-white px-4 py-3.5 rounded-lg outline-none 
                  border border-[#3f4147] focus:border-[#5865F2] cursor-pointer appearance-none shadow-inner"
                >
                  {standups.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — ({st.guild_name})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#99AAB5]">
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
                    ></path>
                  </svg>
                </div>
              </div>
            )
          ) : isLoadingPolls ? (
            <div className="h-12 w-full bg-[#1e1f22] rounded-lg animate-pulse border border-[#3f4147]"></div>
          ) : polls.length === 0 ? (
            <div
              className="h-12 w-full bg-[#1e1f22] rounded-lg border border-[#da373c]/50 flex 
            items-center px-4 text-sm text-[#da373c]"
            >
              No polls found.
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedPollId}
                onChange={(e) => setSelectedPollId(e.target.value)}
                className="w-full bg-[#1e1f22] text-sm font-medium text-white px-4 py-3.5 rounded-lg outline-none 
                border border-[#3f4147] focus:border-[#38bdf8] cursor-pointer appearance-none shadow-inner"
              >
                {polls.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.question.length > 50
                      ? p.question.substring(0, 47) + "..."
                      : p.question}{" "}
                    — ({p.guild_name})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#99AAB5]">
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
                  ></path>
                </svg>
              </div>
            </div>
          )}
        </div>

        <HistoryFilters
          viewMode={viewMode}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
      </div>

      <div
        className={`transition-opacity duration-300 ${isDataLoading ? "opacity-50" : "opacity-100"}`}
      >
        <HistoryTable
          viewMode={viewMode}
          historyData={historyData}
          pollHistoryData={pollHistoryData}
          isLoading={isLoadingHistory || isLoadingPollHistory}
          displayQuestions={
            standupConfig?.questions || standupConfig?.Questions
          }
        />
      </div>

      <Pagination
        page={page}
        setPage={setPage}
        totalPages={currentTotalPages}
      />
    </div>
  );
}
