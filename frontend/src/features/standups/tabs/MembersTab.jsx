import React, { useState, useEffect } from "react";

export default function MembersTab({
  standup,
  guildMembers,
  roles,
  isLoading,
  onToggleMember,
  onUpdateStandup,
  isSaving,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (standup) {
      setSelectedRole(standup.sync_role_id || standup.SyncRoleID || "");
    }
  }, [standup]);

  const filteredMembers = guildMembers.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSaveRole = () => {
    onUpdateStandup({
      name: standup.name || standup.Name,
      time: standup.time || standup.Time,
      days: standup.days || standup.Days,
      report_channel_id: standup.report_channel_id || standup.ReportChannelID,
      questions: standup.questions || standup.Questions,
      sync_role_id: selectedRole,
    });
  };

  const currentEnrolledCount = standup?.participants?.length || 0;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-[#2b2d31] p-6 md:p-8 rounded-2xl border border-[#1e1f22] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/10 rounded-full blur-3xl -translate-y-1/2 
        translate-x-1/2 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#5865F2]">🔄</span> Auto-Sync by Role
            </h3>
            <p className="text-[#99AAB5] text-sm mt-1 max-w-md">
              Automatically enroll (and remove) server members based on a
              specific Discord role.
            </p>
          </div>
          <button
            onClick={handleSaveRole}
            disabled={
              isSaving ||
              selectedRole ===
                (standup?.sync_role_id || standup?.SyncRoleID || "")
            }
            className={`cursor-pointer px-6 py-2.5 rounded-lg text-sm font-bold transition-all shrink-0 shadow-sm
              ${
                isSaving ||
                selectedRole ===
                  (standup?.sync_role_id || standup?.SyncRoleID || "")
                  ? "bg-[#1e1f22] text-[#99AAB5] border border-[#3f4147] cursor-not-allowed"
                  : "bg-[#5865F2] hover:bg-[#4752C4] text-white hover:-translate-y-0.5 hover:shadow-md"
              }`}
          >
            {isSaving ? "Saving Config..." : "Save Role Sync"}
          </button>
        </div>

        <div className="relative z-10">
          <select
            className="w-full bg-[#1e1f22] px-4 py-3.5 rounded-lg border border-[#3f4147] focus:border-[#5865F2] 
            outline-none text-white text-sm cursor-pointer shadow-inner appearance-none transition-colors"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Off (Manual Enrollment Only)</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.id} className="font-medium">
                @{r.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#99AAB5]">
            <svg
              className="w-5 h-5"
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
      </div>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Manual Roster
            </h2>
            <p className="text-[#99AAB5] text-sm">
              Individually manage who receives daily standup prompts.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <svg
                className="w-4 h-4 absolute left-3.5 top-3 text-[#99AAB5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e1f22] pl-10 pr-4 py-2.5 rounded-lg border border-[#3f4147] 
                focus:border-[#5865F2] outline-none text-sm transition-colors text-white placeholder-[#99AAB5]/60"
              />
            </div>
            <div className="bg-[#1e1f22] px-4 py-2.5 rounded-lg text-sm font-extrabold border border-[#3f4147] 
            text-white whitespace-nowrap shadow-sm">
              <span className="text-[#5865F2]">{currentEnrolledCount}</span>{" "}
              Enrolled
            </div>
          </div>
        </div>

        <div className="bg-[#2b2d31] p-2 rounded-2xl border border-[#1e1f22] shadow-md min-h-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#99AAB5] font-medium animate-pulse">
                Loading server members...
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="bg-[#1e1f22] p-4 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-[#99AAB5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 
                    7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                No members found
              </h3>
              <p className="text-[#99AAB5] text-sm">
                We couldn't find anyone matching "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-150 overflow-y-auto custom-scrollbar p-2">
              {filteredMembers.map((member) => {
                const isEnrolled = standup?.participants?.some(
                  (p) => p.user_id === member.id || p.UserID === member.id,
                );

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 border group
                      ${
                        isEnrolled
                          ? "bg-[#1e1f22] border-[#3f4147] shadow-sm hover:border-[#5865F2]/50"
                          : "bg-transparent border-transparent hover:bg-[#35373c]"
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <div className="relative shrink-0">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt="avatar"
                            className="w-10 h-10 rounded-full bg-[#1e1f22] object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center 
                          font-bold text-white shadow-inner">
                            {member.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isEnrolled && (
                          <div
                            className="absolute -bottom-1 -right-1 bg-[#23a559] w-3.5 h-3.5 rounded-full 
                            border-2 border-[#1e1f22] shadow-sm"
                            title="Enrolled"
                          ></div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-bold text-sm truncate ${isEnrolled ? "text-white" : 
                            "text-gray-300 group-hover:text-white"}`}
                        >
                          {member.username}
                        </span>
                        {isEnrolled && (
                          <span className="text-[10px] text-[#23a559] font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleMember(member.id, isEnrolled)}
                      className={`cursor-pointer shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm
                        ${
                          isEnrolled
                            ? "bg-transparent border border-[#da373c]/50 text-[#da373c] hover:bg-[#da373c] hover:text-white hover:border-[#da373c]"
                            : "bg-[#2b2d31] border border-[#3f4147] text-white hover:bg-[#5865F2] hover:border-[#5865F2] opacity-0 group-hover:opacity-100 focus:opacity-100"
                        }`}
                    >
                      {isEnrolled ? "Remove" : "Add to Team"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
