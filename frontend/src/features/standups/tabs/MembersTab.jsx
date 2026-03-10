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

  return (
    <div className="animate-fade-in">
      <div className="bg-[#2b2d31] p-6 rounded-xl border border-[#1e1f22] shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Auto-Sync by Role
            </h3>
            <p className="text-[#99AAB5] text-xs mt-1">
              Automatically enroll server members who have this Discord role.
            </p>
          </div>
          <button
            onClick={handleSaveRole}
            disabled={
              isSaving ||
              selectedRole ===
                (standup?.sync_role_id || standup?.SyncRoleID || "")
            }
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-bold transition-all shrink-0 ${
              isSaving ||
              selectedRole ===
                (standup?.sync_role_id || standup?.SyncRoleID || "")
                ? "bg-[#404249] text-[#99AAB5] cursor-not-allowed"
                : "bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-md"
            }`}
          >
            {isSaving ? "Saving..." : "Save Role Sync"}
          </button>
        </div>

        <div className="relative">
          <select
            className="w-full bg-[#1e1f22] p-3 rounded-md border border-transparent focus:border-[#5865F2] 
            outline-none text-white text-sm cursor-pointer shadow-inner appearance-none"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Off (Manual Enrollment Only)</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.id}>
                @{r.name}
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
      </div>

      {/* --- MANUAL ENROLLMENT / MEMBER LIST --- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Manual Roster</h2>
          <p className="text-[#99AAB5] text-sm mt-1">
            Individually manage who receives daily standup prompts.
          </p>
        </div>
        <div
          className="bg-[#2b2d31] px-3 py-1.5 rounded-md text-sm font-bold border border-[#1e1f22] 
        text-[#5865F2]"
        >
          {standup?.participants?.length || 0} Enrolled
        </div>
      </div>

      <div className="relative mb-4">
        <svg
          className="w-5 h-5 absolute left-3 top-3 text-[#99AAB5]"
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
          placeholder="Search server members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1e1f22] pl-10 pr-4 py-3 rounded-lg border border-transparent 
          focus:border-[#5865F2] outline-none text-sm transition-colors shadow-inner"
        />
      </div>

      <div className="bg-[#2b2d31] rounded-lg border border-[#1e1f22] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#99AAB5]">
            Loading members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-[#99AAB5]">
            No members found matching "{searchQuery}"
          </div>
        ) : (
          <div className="max-h-125 overflow-y-auto custom-scrollbar divide-y divide-[#1e1f22]">
            {filteredMembers.map((member) => {
              const isEnrolled = standup?.participants?.some(
                (p) => p.user_id === member.id || p.UserID === member.id,
              );
              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 
                  hover:bg-[#313338] transition-colors group gap-4 sm:gap-0"
                >
                  <div className="flex items-center gap-4">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full shadow-md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center font-bold shadow-md">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-[15px]">
                      {member.username}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleMember(member.id, isEnrolled)}
                    className={`cursor-pointer w-full sm:w-auto px-5 py-1.5 rounded-md text-sm font-bold 
                      transition-all transform active:scale-95 border ${
                        isEnrolled
                          ? "bg-transparent border-[#da373c] text-[#da373c] hover:bg-[#da373c] hover:text-white"
                          : "bg-[#23a559] border-[#23a559] text-white hover:bg-[#1d8a4a]"
                      }`}
                  >
                    {isEnrolled ? "Remove" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
