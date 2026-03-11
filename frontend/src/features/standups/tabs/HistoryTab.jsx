import React, { useState, useMemo } from "react";
import { useGetHistoryQuery } from "../../../store/apiSlice";

export default function HistoryTab({ standupId, standup, guildMembers }) {
  const [selectedUser, setSelectedUser] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");

  const sID = standupId || standup?.id || standup?.ID || "";
  const shouldSkip = !sID || sID === "undefined";
  const { data: rawData, isLoading } = useGetHistoryQuery(
    { id: sID },
    { skip: shouldSkip }
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

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Report History</h2>
          <p className="text-[#99AAB5] text-sm mt-1">
            Review past daily updates from your team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#1e1f22] p-2 rounded-md border border-transparent focus:border-[#5865F2] 
            outline-none text-white text-sm cursor-pointer shadow-inner w-full sm:w-auto"
          />
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-[#1e1f22] p-2 rounded-md border border-transparent focus:border-[#5865F2] 
            outline-none text-white text-sm cursor-pointer shadow-inner min-w-0 sm:min-w-37.5 w-full sm:w-auto"
          >
            <option value="ALL">All Members</option>
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
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-[#2b2d31] p-8 rounded-xl border border-[#1e1f22] text-center text-[#99AAB5]">
            <span className="animate-pulse font-semibold">
              Loading reports...
            </span>
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="bg-[#2b2d31] p-10 rounded-xl border border-[#1e1f22] text-center shadow-sm">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-white font-bold text-lg mb-1">
              No reports found
            </h3>
            <p className="text-[#99AAB5] text-sm">
              No standup submissions match your current filters.
            </p>
          </div>
        ) : (
          filteredHistories.map((log, index) => {
            const uID = log.UserID || log.user_id;
            const d = log.Date || log.date;
            const ans = log.Answers || log.answers || [];
            const user = getUserInfo(uID);

            // 🚀 PROPER CHECK: Uses the boolean, but falls back to the magic string for older records
            const isSkipped = log.is_skipped || (ans.length > 0 && ans[0] === "Skipped / OOO");

            return (
              <div
                key={log.ID || log.id || index}
                className="bg-[#2b2d31] rounded-xl border border-[#1e1f22] overflow-hidden shadow-sm 
                hover:border-[#3f4147] transition-colors"
              >
                <div className="bg-[#232428] px-5 py-3 border-b border-[#1e1f22] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className={`w-8 h-8 rounded-full shadow-sm ${isSkipped ? "opacity-50 grayscale" : ""}`}
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center font-bold 
                      text-xs text-white shadow-sm"
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`font-bold text-sm ${isSkipped ? "text-[#99AAB5] line-through" : "text-white"}`}
                    >
                      {user.username}
                    </span>

                    {isSkipped && (
                      <span className="text-[9px] font-bold text-[#da373c] bg-[#da373c]/20 px-1.5 py-0.5 
                      rounded uppercase tracking-widest ml-2">
                        Skipped
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs font-bold text-[#99AAB5] bg-[#1e1f22] px-2.5 py-1 rounded border 
                  border-[#3f4147]/50"
                  >
                    {d}
                  </div>
                </div>

                <div className="p-5">
                  {isSkipped ? (
                    <div className="flex items-center justify-center py-4 text-[#99AAB5] italic 
                    bg-[#1e1f22]/50 rounded-md border border-[#3f4147]/20 border-dashed">
                      <span className="mr-2">⏭️</span> User indicated they are
                      out of office or skipping today's update.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ans.map((answer, i) => {
                        const qList =
                          standup?.questions || standup?.Questions || [];
                        const question = qList[i] || `Question ${i + 1}`;
                        return (
                          <div key={i}>
                            <h4
                              className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-1.5 flex 
                            items-center gap-2"
                            >
                              <span
                                className="bg-[#1e1f22] text-[#5865F2] w-4 h-4 flex items-center justify-center 
                              rounded-full text-[9px]"
                              >
                                {i + 1}
                              </span>
                              {question}
                            </h4>
                            <p
                              className="text-[#dcddde] text-sm leading-relaxed bg-[#1e1f22] p-3 rounded-md border 
                            border-[#3f4147]/30 wrap-break-word whitespace-pre-wrap"
                            >
                              {answer}
                            </p>
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