import React, { useState } from "react";
import { useGetHistoryQuery } from "../../../store/apiSlice";

export default function HistoryTab({ standupId, standup, guildMembers }) {
  const [selectedUser, setSelectedUser] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");

  const sID = standupId || standup?.id || standup?.ID || "";
  const shouldSkip = !sID || sID === "undefined";
  const { data: rawData, isLoading } = useGetHistoryQuery(
    { id: sID },
    { skip: shouldSkip },
  );

  const rawHistories = rawData?.data || [];
  const validHistories = rawHistories;

  const filteredHistories = validHistories.filter((h) => {
    const uid = h.UserID || h.user_id;
    const d = h.Date || h.date;

    const matchUser = selectedUser === "ALL" || uid === selectedUser;
    const matchDate = selectedDate === "" || d === selectedDate;
    return matchUser && matchDate;
  });

  const getUserInfo = (userId) => {
    const member = guildMembers.find((m) => m.id === userId);
    if (member) return member;
    return { username: "Unknown User", avatar: null };
  };

  const HistorySkeleton = () => (
    <div className="bg-[#2b2d31] rounded-xl border border-[#1e1f22] overflow-hidden shadow-sm animate-pulse">
      <div className="bg-[#232428] px-6 py-4 border-b border-[#1e1f22] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#3f4147]"></div>
          <div className="h-5 w-32 bg-[#3f4147] rounded-md"></div>
        </div>
        <div className="h-6 w-24 bg-[#1e1f22] rounded-md"></div>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <div className="h-4 w-48 bg-[#3f4147] rounded-md mb-3"></div>
          <div className="h-16 w-full bg-[#1e1f22] rounded-lg"></div>
        </div>
        <div>
          <div className="h-4 w-40 bg-[#3f4147] rounded-md mb-3"></div>
          <div className="h-12 w-full bg-[#1e1f22] rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in flex flex-col h-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Report History</h2>
          <p className="text-[#99AAB5] text-sm">
            Review past daily updates from your team.
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#2b2d31] p-2 
        rounded-xl border border-[#1e1f22] shadow-sm"
        >
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#1e1f22] px-4 py-2.5 rounded-lg border border-[#3f4147] focus:border-[#5865F2] 
              outline-none text-white text-sm cursor-pointer shadow-inner w-full sm:w-auto transition-colors"
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-[#3f4147]"></div>

          <div className="relative">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-[#1e1f22] px-4 py-2.5 pr-10 rounded-lg border border-[#3f4147] focus:border-[#5865F2] 
              outline-none text-white text-sm cursor-pointer shadow-inner min-w-0 sm:min-w-50 w-full 
              sm:w-auto appearance-none transition-colors"
            >
              <option value="ALL">All Team Members</option>
              {standup?.participants?.map((p) => {
                const uID = p.UserID || p.user_id;
                const user = getUserInfo(uID);
                return (
                  <option key={uID} value={uID}>
                    {user.username}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#99AAB5]">
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
      </div>

      <div className="space-y-6 pb-12">
        {isLoading ? (
          <>
            <HistorySkeleton />
            <HistorySkeleton />
          </>
        ) : filteredHistories.length === 0 ? (
          <div
            className="bg-[#2b2d31] py-20 px-6 rounded-2xl border-2 border-dashed border-[#3f4147] 
          text-center shadow-sm flex flex-col items-center"
          >
            <div className="bg-[#1e1f22] p-5 rounded-full mb-6 shadow-inner">
              <svg
                className="w-10 h-10 text-[#5865F2]"
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
            <h3 className="text-white font-bold text-xl mb-2">
              No reports found
            </h3>
            <p className="text-[#99AAB5] text-sm max-w-md">
              No standup submissions match your current filters. Check back
              later after your team submits their updates.
            </p>
          </div>
        ) : (
          filteredHistories.map((log, index) => {
            const uID = log.UserID || log.user_id;
            const d = log.Date || log.date;
            const ans = log.Answers || log.answers || [];
            const user = getUserInfo(uID);

            const isSkipped =
              log.is_skipped || (ans.length > 0 && ans[0] === "Skipped / OOO");

            return (
              <div
                key={log.ID || log.id || index}
                className={`bg-[#2b2d31] rounded-2xl border overflow-hidden shadow-md transition-all duration-200
                  ${isSkipped ? "border-[#1e1f22] opacity-80 hover:opacity-100" : "border-[#1e1f22] hover:border-[#5865F2]/30"}`}
              >
                <div
                  className={`h-1.5 w-full ${isSkipped ? "bg-[#404249]" : "bg-[#5865F2]"}`}
                ></div>

                <div
                  className="bg-[#232428] px-6 py-4 border-b border-[#1e1f22] flex flex-col 
                sm:flex-row sm:items-center justify-between gap-4 sm:gap-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className={`w-10 h-10 rounded-full shadow-sm object-cover border border-[#1e1f22] 
                            ${isSkipped ? "grayscale" : ""}`}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center 
                        font-bold text-white shadow-sm border border-[#1e1f22]"
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!isSkipped && (
                        <div
                          className="absolute -bottom-1 -right-1 bg-[#23a559] w-3.5 h-3.5 rounded-full border-2 
                          border-[#232428]"
                          title="Submitted"
                        ></div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-[15px] ${isSkipped ? "text-[#99AAB5] line-through decoration-2 decoration-[#da373c]/50" : "text-white"}`}
                        >
                          {user.username}
                        </span>
                        {isSkipped && (
                          <span
                            className="text-[10px] font-extrabold text-[#da373c] bg-[#da373c]/10 border 
                          border-[#da373c]/20 px-2 py-0.5 rounded uppercase tracking-wider"
                          >
                            Skipped
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#99AAB5]">ID: {uID}</span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 text-xs font-bold text-[#99AAB5] bg-[#1e1f22] px-3 
                  py-1.5 rounded-lg border border-[#3f4147]/50 shadow-inner w-fit"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {d}
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {isSkipped ? (
                    <div
                      className="flex flex-col items-center justify-center py-6 text-center bg-[#1e1f22]/50 
                    rounded-xl border border-[#3f4147]/20 border-dashed"
                    >
                      <span className="text-3xl mb-2 grayscale opacity-50">
                        🌴
                      </span>
                      <p className="text-[#99AAB5] font-medium">
                        User skipped today's standup or is out of office.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {ans.map((answer, i) => {
                        const qList =
                          standup?.questions || standup?.Questions || [];
                        const question = qList[i] || `Question ${i + 1}`;
                        return (
                          <div key={i} className="group">
                            <h4
                              className="text-xs font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2.5 
                            flex items-center gap-2"
                            >
                              <span
                                className="bg-[#1e1f22] text-[#5865F2] w-5 h-5 flex items-center justify-center 
                              rounded-md border border-[#3f4147] shadow-sm text-[10px]"
                              >
                                {i + 1}
                              </span>
                              {question}
                            </h4>
                            <div className="relative">
                              <div
                                className="absolute left-0 top-0 bottom-0 w-1 bg-[#404249] group-hover:bg-[#5865F2] 
                              rounded-l-md transition-colors"
                              ></div>
                              <p
                                className="text-[#dcddde] text-[15px] leading-relaxed bg-[#1e1f22] pl-5 pr-4 
                              py-3.5 rounded-lg border border-[#3f4147]/30 shadow-inner whitespace-pre-wrap"
                              >
                                {answer}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
