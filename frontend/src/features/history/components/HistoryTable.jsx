import React from "react";
import { getDiscordAvatarUrl } from "../../../utils/helpers";

export default function HistoryTable({
  viewMode,
  historyData,
  pollHistoryData,
  isLoading,
  displayQuestions,
}) {
  const renderEmptyState = () => (
    <tr>
      <td colSpan={10} className="px-6 py-24 text-center">
        <div
          className="bg-[#1e1f22] w-16 h-16 rounded-full flex items-center justify-center mx-auto 
        mb-4 border border-[#3f4147] shadow-inner"
        >
          <span className="text-3xl grayscale opacity-50">📭</span>
        </div>
        <span className="text-white font-bold text-lg block mb-1">
          No logs found
        </span>
        <span className="text-[#99AAB5]">
          Adjust your search or filters to see results.
        </span>
      </td>
    </tr>
  );

  const renderLoadingState = () => (
    <tr>
      <td colSpan={10} className="px-6 py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#99AAB5] font-medium animate-pulse">
            Fetching records...
          </span>
        </div>
      </td>
    </tr>
  );

  return (
    <div
      className="bg-[#2b2d31] border border-[#1e1f22] rounded-2xl shadow-lg flex flex-col flex-1 
    overflow-hidden mb-6 transition-opacity duration-300"
    >
      <div className="overflow-x-auto overflow-y-auto max-h-200 custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse relative">
          <thead
            className="bg-[#1e1f22] text-[#99AAB5] font-extrabold text-[11px] uppercase 
          tracking-widest sticky top-0 z-10 shadow-sm border-b border-[#3f4147]"
          >
            <tr>
              <th className="px-6 py-4 w-40">Timestamp</th>
              <th className="px-6 py-4 w-56">User</th>
              {viewMode === "standups" ? (
                <>
                  <th className="px-6 py-4 w-32">Status</th>
                  {displayQuestions?.map((q, i) => (
                    <th
                      key={i}
                      className="px-6 py-4 max-w-75 truncate"
                      title={q}
                    >
                      <span className="text-[#5865F2] mr-1.5 font-black bg-[#5865F2]/10 px-1.5 py-0.5 rounded">
                        Q{i + 1}
                      </span>
                      {q}
                    </th>
                  ))}
                </>
              ) : (
                <th className="px-6 py-4">Selected Option</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1e1f22]">
            {isLoading
              ? renderLoadingState()
              : (viewMode === "standups" &&
                    (!historyData || historyData.length === 0)) ||
                  (viewMode === "polls" &&
                    (!pollHistoryData || pollHistoryData.length === 0))
                ? renderEmptyState()
                : viewMode === "standups"
                  ? historyData.map((log, index) => {
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
                          className={`hover:bg-[#35373c] transition-colors group ${
                            index % 2 === 0 ? "bg-[#2b2d31]" : "bg-[#2f3136]"
                          }`}
                        >
                          <td className="px-6 py-4 font-mono text-[11px] text-[#99AAB5] whitespace-nowrap font-medium">
                            {log.date}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={getDiscordAvatarUrl(
                                  log.avatar,
                                  log.user_id,
                                )}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full border border-[#1e1f22] shrink-0 object-cover shadow-sm"
                              />
                              <span
                                className="font-bold text-gray-200 group-hover:text-white transition-colors 
                              truncate max-w-37.5"
                              >
                                {log.user_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isSkipped ? (
                              <span
                                className="bg-[#1e1f22] text-[#da373c] border border-[#3f4147] 
                              px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest 
                              inline-flex items-center shadow-sm"
                              >
                                Skipped
                              </span>
                            ) : (
                              <span
                                className="bg-[#23a559]/10 text-[#23a559] border border-[#23a559]/20 
                              px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest inline-flex 
                              items-center shadow-sm"
                              >
                                Submitted
                              </span>
                            )}
                          </td>
                          {isSkipped ? (
                            <td
                              colSpan={totalQuestionCols}
                              className="px-6 py-4"
                            >
                              <div
                                className="bg-[#1e1f22] border border-[#3f4147] border-dashed rounded-lg 
                              p-3 flex justify-center items-center opacity-60"
                              >
                                <span className="text-[#99AAB5] italic text-sm font-medium flex items-center gap-2">
                                  <span>🌴</span> Out of office / Skipped
                                </span>
                              </div>
                            </td>
                          ) : (
                            <>
                              {(log.answers || []).map((ans, i) => (
                                <td key={i} className="px-6 py-4">
                                  <div
                                    className="max-w-md truncate whitespace-normal line-clamp-2 text-[13px] 
                                    text-gray-300 leading-relaxed group-hover:text-gray-200"
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
                                  <td key={`pad-${i}`} className="px-6 py-4">
                                    <span
                                      className="bg-[#1e1f22] text-[#99AAB5] px-3 py-1 rounded-md 
                                    text-[10px] font-bold border border-[#3f4147]"
                                    >
                                      BLANK
                                    </span>
                                  </td>
                                ))}
                            </>
                          )}
                        </tr>
                      );
                    })
                  : pollHistoryData.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`hover:bg-[#35373c] transition-colors group ${
                          index % 2 === 0 ? "bg-[#2b2d31]" : "bg-[#2f3136]"
                        }`}
                      >
                        <td className="px-6 py-4 font-mono text-[11px] text-[#99AAB5] whitespace-nowrap font-medium">
                          {log.created_at}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getDiscordAvatarUrl(log.avatar, log.user_id)}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full border border-[#1e1f22] shrink-0 object-cover shadow-sm"
                            />
                            <span
                              className="font-bold text-gray-200 group-hover:text-white transition-colors 
                            truncate max-w-37.5"
                            >
                              {log.user_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="bg-[#1e1f22] text-[#38bdf8] border border-[#3f4147] px-3 
                          py-1.5 rounded-lg text-sm font-bold shadow-sm block w-fit"
                          >
                            {log.option}
                          </span>
                        </td>
                      </tr>
                    ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
