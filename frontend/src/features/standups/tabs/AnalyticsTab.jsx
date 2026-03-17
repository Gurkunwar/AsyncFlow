import React, { useState } from "react";
import { useGetStandupStatsQuery } from "../../../store/apiSlice";

export default function AnalyticsTab({ standupId, guildMembers = [] }) {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useGetStandupStatsQuery({ id: standupId, days });

  const exportToCSV = () => {
    if (!data?.stats) return;

    const headers = [
      "Username",
      "User ID",
      "Attended",
      "Skipped",
      "Ignored",
      "Health (%)",
    ];
    const rows = data.stats.map((s) =>
      [s.username, s.user_id, s.attended, s.skipped, s.ignored, s.health].join(
        ",",
      ),
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `standup_stats_${days}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-[#99AAB5] animate-pulse">
        Loading analytics...
      </div>
    );
  }

  const stats = data?.stats || [];
  const totalDays = data?.total_days || 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Team Analytics</h2>
          <p className="text-[#99AAB5] text-sm">
            Standup ran <strong>{totalDays} times</strong> in this period.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[#1e1f22] text-sm text-white px-4 py-2 rounded-lg border border-[#3f4147] outline-none"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button
            onClick={exportToCSV}
            className="cursor-pointer bg-[#2b2d31] hover:bg-[#35373c] text-white text-sm font-bold px-4 py-2 rounded-lg border border-[#3f4147] transition-colors"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#2b2d31] rounded-2xl border border-[#1e1f22] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#232428] text-[#99AAB5] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-extrabold">Team Member</th>
                <th className="px-6 py-4 font-extrabold text-center">
                  ✅ Attended
                </th>
                <th className="px-6 py-4 font-extrabold text-center">
                  🌴 Skipped
                </th>
                <th className="px-6 py-4 font-extrabold text-center">
                  👻 Ignored
                </th>
                <th className="px-6 py-4 font-extrabold w-48">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1f22]">
              {stats.map((stat) => {
                // 👇 CROSS-REFERENCE FOR FRESH AVATAR 👇
                const freshMember = guildMembers.find(
                  (m) => m.id === stat.user_id,
                );
                const displayAvatar = freshMember?.avatar || stat.avatar;
                const displayUsername = freshMember?.username || stat.username;

                return (
                  <tr
                    key={stat.user_id}
                    className="hover:bg-[#35373c]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {displayAvatar && displayAvatar !== "null" ? (
                          <img
                            src={displayAvatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full bg-[#1e1f22] object-cover shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://cdn.discordapp.com/embed/avatars/0.png";
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-inner">
                            {displayUsername.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-white truncate max-w-37.5">
                          {displayUsername}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-200">
                      {stat.attended}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-200">
                      {stat.skipped}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-[#da373c]">
                      {stat.ignored}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-[#1e1f22] rounded-full overflow-hidden border border-[#3f4147]/50">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${stat.health >= 70 ? "bg-[#23a559]" : stat.health >= 40 ? "bg-[#facc15]" : "bg-[#da373c]"}`}
                            style={{ width: `${stat.health}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#99AAB5] w-8 text-right">
                          {stat.health}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {stats.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-[#99AAB5]"
                  >
                    No participation data found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
