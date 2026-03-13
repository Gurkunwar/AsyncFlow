import React, { useState, useEffect } from "react";
import {
  useGetManagedStandupsQuery,
  useGetHistoryQuery,
  useGetStandupByIdQuery,
  useGetManagedPollsQuery,
  useGetPollHistoryQuery,
} from "../../store/apiSlice";

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
    if (viewMode === "standups" && standups.length > 0) {
      if (!standups.some((st) => st.id.toString() === selectedStandupId))
        setSelectedStandupId(standups[0].id.toString());
    }
  }, [standups, selectedStandupId, viewMode]);

  useEffect(() => {
    if (viewMode === "polls" && polls.length > 0) {
      if (!polls.some((p) => p.id.toString() === selectedPollId))
        setSelectedPollId(polls[0].id.toString());
    }
  }, [polls, selectedPollId, viewMode]);

  const getDiscordAvatarUrl = (avatarStr, userId) => {
    if (!avatarStr || avatarStr === "0" || avatarStr === "") {
      const id = userId ? BigInt(userId) : 0n;
      return `https://cdn.discordapp.com/embed/avatars/${Number((id >> 22n) % 6n)}.png`;
    }
    if (avatarStr.startsWith("http")) return avatarStr;
    const cleanHash = avatarStr.includes("/")
      ? avatarStr.split("/")[1]
      : avatarStr;
    return `https://cdn.discordapp.com/avatars/${userId}/${cleanHash}.png`;
  };

  const handleExportCSV = () => {
    let csvContent = "";
    let filename = "";

    if (viewMode === "standups") {
      if (!historyData || historyData.length === 0 || !standupConfig) return;
      const questions =
        standupConfig.questions || standupConfig.Questions || [];
      const headers = ["Date", "User", "Status", ...questions];
      const rows = historyData.map((row) => {
        const isSkipped =
          row.is_skipped ||
          (row.answers &&
            row.answers.length > 0 &&
            row.answers[0] === "Skipped / OOO");
        const statusStr = isSkipped ? "Skipped" : "Submitted";

        return [
          `"${row.date}"`,
          `"${row.user_name}"`,
          statusStr,
          ...(row.answers || []).map((a) => `"${a.replace(/"/g, '""')}"`),
        ].join(",");
      });
      csvContent = [headers.join(","), ...rows].join("\n");
      filename = `standup_history_${selectedStandupId}_page_${page}.csv`;
    } else {
      if (!pollHistoryData || pollHistoryData.length === 0) return;
      const headers = ["Date", "User", "Voted For"];
      const rows = pollHistoryData.map(
        (row) =>
          `"${row.created_at}","${row.user_name}","${row.option.replace(/"/g, '""')}"`,
      );
      csvContent = [headers.join(","), ...rows].join("\n");
      filename = `poll_history_${selectedPollId}_page_${page}.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🚀 FIX: Smart Toggle for Filter Chips
  const toggleFilterToken = (token) => {
    setSearchInput((prev) => {
      const current = prev || "";
      if (current.includes(token)) {
        // If it exists, remove it and clean up extra spaces
        return current.replace(token, "").replace(/\s+/g, " ").trim();
      }
      // If it doesn't exist, append it
      return `${current} ${token}`.trim();
    });
  };

  // Dynamic Date calculations
  const yesterdayDateToken = `date:${new Date(Date.now() - 86400000).toISOString().split("T")[0]}`;

  const displayQuestions = standupConfig?.questions || standupConfig?.Questions;
  const isExportDisabled =
    viewMode === "standups"
      ? historyData.length === 0
      : pollHistoryData.length === 0;
  const currentTotalPages =
    viewMode === "standups" ? historyTotalPages : pollTotalPages;

  return (
    <>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">
          {viewMode === "standups" ? "Standup Logs" : "Poll Vote Logs"}
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-[#1e1f22] p-1 rounded-lg border border-[#3f4147] shadow-sm w-full sm:w-auto">
            <button
              onClick={() => setViewMode("standups")}
              className={`cursor-pointer flex-1 sm:flex-none px-5 py-1.5 text-sm font-bold rounded-md transition-all 
                ${viewMode === "standups" ? "bg-[#5865F2] text-white shadow" : "text-[#99AAB5] hover:text-white"}`}
            >
              Standups
            </button>
            <button
              onClick={() => setViewMode("polls")}
              className={`cursor-pointer flex-1 sm:flex-none px-5 py-1.5 text-sm font-bold rounded-md transition-all 
                ${viewMode === "polls" ? "bg-[#38bdf8] text-white shadow" : "text-[#99AAB5] hover:text-white"}`}
            >
              Polls
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExportDisabled}
            className="bg-[#43b581] hover:bg-[#3ca374] disabled:bg-[#43b581]/50 disabled:cursor-not-allowed px-4 
            py-2 rounded font-semibold text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center 
            gap-2 w-full sm:w-auto"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            Export Page to CSV
          </button>
        </div>
      </div>

      <div className="mb-4 bg-[#2b2d31] p-4 rounded-xl border border-[#1e1f22] shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <span className="text-sm font-bold text-[#99AAB5] shrink-0">
          {viewMode === "standups" ? "Target Team:" : "Target Poll:"}
        </span>

        {viewMode === "standups" ? (
          isLoadingStandups ? (
            <span className="text-sm text-[#99AAB5] animate-pulse">
              Loading teams...
            </span>
          ) : standups.length === 0 ? (
            <span className="text-sm text-[#da373c]">
              You are not managing any standups.
            </span>
          ) : (
            <select
              value={selectedStandupId}
              onChange={(e) => setSelectedStandupId(e.target.value)}
              className="bg-[#1e1f22] text-sm font-medium text-white px-4 py-2.5 rounded-md outline-none 
              border border-[#3f4147] focus:border-[#5865F2] cursor-pointer w-full sm:w-auto min-w-0 
              sm:min-w-64 shadow-inner"
            >
              {standups.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — ({st.guild_name})
                </option>
              ))}
            </select>
          )
        ) : isLoadingPolls ? (
          <span className="text-sm text-[#99AAB5] animate-pulse">
            Loading polls...
          </span>
        ) : polls.length === 0 ? (
          <span className="text-sm text-[#da373c]">
            You have not created any polls.
          </span>
        ) : (
          <select
            value={selectedPollId}
            onChange={(e) => setSelectedPollId(e.target.value)}
            className="bg-[#1e1f22] text-sm font-medium text-white px-4 py-2.5 rounded-md outline-none 
            border border-[#3f4147] focus:border-[#38bdf8] cursor-pointer w-full sm:w-auto min-w-0 
            sm:min-w-64 shadow-inner"
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
        )}
      </div>

      {/* SMART SEARCH UI */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative w-full">
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
            placeholder="Search username, answers, or use filters (e.g., is:skipped date:today)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1e1f22] text-sm text-white pl-9 pr-3 py-3 rounded-md outline-none border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder-[#99AAB5] shadow-inner"
          />
        </div>

        {/* Dynamic Helper Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#99AAB5] mr-1">
            Quick Filters:
          </span>

          {viewMode === "standups" && (
            <>
              <button
                onClick={() => toggleFilterToken("is:submitted")}
                className={`text-[11px] px-2 py-1 rounded cursor-pointer transition-colors border ${
                  searchInput.includes("is:submitted")
                    ? "bg-[#43b581] text-white border-[#43b581]"
                    : "bg-[#43b581]/10 text-[#43b581] border-[#43b581]/20 hover:bg-[#43b581]/20"
                }`}
              >
                is:submitted
              </button>
              <button
                onClick={() => toggleFilterToken("is:skipped")}
                className={`text-[11px] px-2 py-1 rounded cursor-pointer transition-colors border ${
                  searchInput.includes("is:skipped")
                    ? "bg-[#da373c] text-white border-[#da373c]"
                    : "bg-[#da373c]/10 text-[#da373c] border-[#da373c]/20 hover:bg-[#da373c]/20"
                }`}
              >
                is:skipped
              </button>
            </>
          )}

          <button
            onClick={() => toggleFilterToken("date:today")}
            className={`text-[11px] px-2 py-1 rounded cursor-pointer transition-colors border ${
              searchInput.includes("date:today")
                ? "bg-[#5865F2] text-white border-[#5865F2]"
                : "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20 hover:bg-[#5865F2]/20"
            }`}
          >
            date:today
          </button>

          <button
            onClick={() => toggleFilterToken(yesterdayDateToken)}
            className={`text-[11px] px-2 py-1 rounded cursor-pointer transition-colors border ${
              searchInput.includes(yesterdayDateToken)
                ? "bg-[#99AAB5] text-[#1e1f22] border-[#99AAB5]"
                : "bg-[#1e1f22] text-[#99AAB5] border-[#3f4147] hover:bg-[#2b2d31]"
            }`}
          >
            date:yesterday
          </button>

          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="text-[11px] text-[#99AAB5] hover:text-white underline ml-auto cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div
        className={`bg-[#2b2d31] border border-[#1e1f22] rounded-xl shadow-sm flex flex-col 
      overflow-hidden mb-6 transition-opacity duration-200 ${
        isFetchingHistory || isFetchingPolls ? "opacity-50" : "opacity-100"
      }`}
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead
              className="bg-[#1e1f22] text-[#99AAB5] font-bold text-[11px] uppercase tracking-widest 
            border-b border-[#3f4147]"
            >
              <tr>
                <th className="px-5 py-4 w-32">Date</th>
                <th className="px-5 py-4 w-48">User</th>
                {viewMode === "standups" ? (
                  <>
                    <th className="px-5 py-4 w-32">Status</th>
                    {displayQuestions?.map((q, i) => (
                      <th
                        key={i}
                        className="px-5 py-4 max-w-62.5 truncate"
                        title={q}
                      >
                        <span className="text-[#5865F2] mr-1">Q{i + 1}:</span>
                        {q}
                      </th>
                    ))}
                  </>
                ) : (
                  <th className="px-5 py-4">Voted For</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3f4147]/50">
              {(
                viewMode === "standups"
                  ? isLoadingHistory
                  : isLoadingPollHistory
              ) ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-12 text-center text-[#99AAB5] font-medium"
                  >
                    Fetching logs...
                  </td>
                </tr>
              ) : (viewMode === "standups" &&
                  (!historyData || historyData.length === 0)) ||
                (viewMode === "polls" &&
                  (!pollHistoryData || pollHistoryData.length === 0)) ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center">
                    <span className="text-4xl mb-3 block opacity-50">📭</span>
                    <span className="text-[#99AAB5] font-medium">
                      No matching logs found.
                    </span>
                  </td>
                </tr>
              ) : viewMode === "standups" ? (
                historyData.map((log, index) => {
                  const isSkipped =
                    log.is_skipped ||
                    (log.answers &&
                      log.answers.length > 0 &&
                      log.answers[0] === "Skipped / OOO");
                  const totalQuestionCols = displayQuestions
                    ? displayQuestions.length
                    : 1;

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-[#35373c]/80 transition-colors 
                        ${index % 2 === 0 ? "bg-[#2b2d31]" : "bg-[#2f3136]"}`}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-[#99AAB5] whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getDiscordAvatarUrl(log.avatar, log.user_id)}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full border border-[#1e1f22] shrink-0 object-cover"
                          />
                          <span className="font-semibold text-gray-200 truncate max-w-30">
                            {log.user_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {isSkipped ? (
                          <span
                            className="bg-[#da373c]/10 text-[#da373c] border border-[#da373c]/20 
                          px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest inline-flex 
                          items-center gap-1.5"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                            Skipped
                          </span>
                        ) : (
                          <span
                            className="bg-[#43b581]/10 text-[#43b581] border border-[#43b581]/20 
                          px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest inline-flex 
                          items-center gap-1.5"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            Submitted
                          </span>
                        )}
                      </td>
                      {isSkipped ? (
                        <td
                          colSpan={totalQuestionCols}
                          className="px-5 py-3 text-center"
                        >
                          <span className="text-[#99AAB5] italic text-sm opacity-60">
                            No data reported
                          </span>
                        </td>
                      ) : (
                        <>
                          {(log.answers || []).map((ans, i) => (
                            <td key={i} className="px-5 py-3">
                              <div
                                className="max-w-md truncate whitespace-normal line-clamp-2 text-sm 
                                text-gray-300 leading-relaxed"
                                title={ans}
                              >
                                {ans}
                              </div>
                            </td>
                          ))}
                          {displayQuestions &&
                            (log.answers || []).length <
                              displayQuestions.length &&
                            Array.from({
                              length:
                                displayQuestions.length -
                                (log.answers || []).length,
                            }).map((_, i) => (
                              <td key={`pad-${i}`} className="px-5 py-3">
                                <span className="bg-[#1e1f22] text-[#99AAB5] px-2 py-0.5 rounded text-xs">
                                  N/A
                                </span>
                              </td>
                            ))}
                        </>
                      )}
                    </tr>
                  );
                })
              ) : (
                pollHistoryData.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-[#35373c]/80 transition-colors 
                      ${index % 2 === 0 ? "bg-[#2b2d31]" : "bg-[#2f3136]"}`}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-[#99AAB5] whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getDiscordAvatarUrl(log.avatar, log.user_id)}
                          alt="Avatar"
                          className="w-7 h-7 rounded-full border border-[#1e1f22] shrink-0 object-cover"
                        />
                        <span className="font-semibold text-gray-200 truncate max-w-30">
                          {log.user_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-3 
                      py-1 rounded text-xs font-bold shadow-sm"
                      >
                        {log.option}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {currentTotalPages > 1 && (
        <div className="flex justify-center items-center gap-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-md 
            font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35373c] transition-colors"
          >
            ← Previous
          </button>
          <span className="text-[#99AAB5] text-sm font-bold bg-[#1e1f22] px-4 py-2 rounded-md border border-[#3f4147]">
            Page {page} of {currentTotalPages}
          </span>
          <button
            disabled={page === currentTotalPages}
            onClick={() => setPage((p) => p + 1)}
            className="cursor-pointer px-4 py-2 bg-[#2b2d31] border border-[#3f4147] rounded-md 
            font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35373c] transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
