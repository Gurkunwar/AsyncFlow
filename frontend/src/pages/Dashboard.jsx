import React, { useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { useGetDashboardStatsQuery } from "../store/apiSlice";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1f22] border border-[#3f4147] p-3 rounded-lg shadow-xl">
        <p className="text-[#99AAB5] text-xs font-bold mb-1 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[#38bdf8] font-extrabold text-sm">
          {payload[0].value} reports
        </p>
      </div>
    );
  }
  return null;
};

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const then = new Date(dateString);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return "just now";
  const mins = Math.floor(diffInSeconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function Dashboard() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 60000,
    refetchOnFocus: true,
  });

  const lineChartData = useMemo(() => {
    const rawData =
      Array.isArray(stats?.weekly_data) && stats.weekly_data.length === 7
        ? stats.weekly_data
        : [0, 0, 0, 0, 0, 0, 0];

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return rawData.map((val, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { day: daysOfWeek[d.getDay()], reports: val };
    });
  }, [stats?.weekly_data]);

  const breakdownData = stats?.breakdown_data || [];
  const todaysBlockers = stats?.blockers || [];
  const busiestDay = stats?.busiest_day || "N/A";

  const Skeleton = ({ className }) => (
    <div
      className={`animate-pulse bg-[#3f4147]/50 rounded-lg ${className}`}
    ></div>
  );
  const getDiscordAvatarUrl = (avatarStr, userId) => {
    // 1. If no custom avatar hash, use Discord's default avatar logic
    if (!avatarStr || avatarStr === "0" || avatarStr === "") {
      try {
        // Fallback calculation if userId is missing or invalid
        const id = userId ? BigInt(userId) : 0n;
        const defaultIndex = Number((id >> 22n) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
      } catch (e) {
        return `https://cdn.discordapp.com/embed/avatars/0.png`;
      }
    }

    // 2. Custom avatar: Discord expects https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png
    // If your backend already sends "userId/hash", we just append .png
    if (avatarStr.includes("/")) {
      return `https://cdn.discordapp.com/avatars/${avatarStr}.png`;
    }

    // 3. Fallback: if backend only sends hash, we need the userId separately
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarStr}.png`;
  };

  return (
    <div className="flex h-screen bg-[#313338] font-sans text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
        <div className="flex flex-col min-h-full w-full max-w-7xl mx-auto gap-6 pb-2">
          <div className="shrink-0">
            <h1 className="text-3xl font-extrabold mb-1">
              sup! {userData.username || "manager"}
            </h1>
            <p className="text-[#99AAB5] text-sm font-medium">
              here's your summary
            </p>
          </div>

          <div className="shrink-0 min-h-30">
            <h3 className="text-[10px] font-bold text-[#99AAB5] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#da373c] animate-pulse"></span>
              Latest Standup Updates
            </h3>

            <div className="flex flex-row gap-4 overflow-x-auto pb-3 pt-1 snap-x scroll-smooth custom-scrollbar">
              {isLoading ? (
                <>{/* Skeletons */}</>
              ) : todaysBlockers.length > 0 ? (
                todaysBlockers.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#da373c]/5 border border-[#da373c]/20 p-4 rounded-xl flex flex-col
                   gap-2 shadow-sm hover:border-[#da373c]/50 transition-colors w-[320px] shrink-0 snap-start"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <img
                          src={getDiscordAvatarUrl(b.avatar, b.user_id)}
                          alt="avatar"
                          className="w-6 h-6 rounded-full border border-[#2b2d31] shrink-0 object-cover"
                          onError={(e) => { e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png"; }}
                        />
                        <span className="font-bold text-[#da373c] text-sm truncate">
                          {b.user}
                        </span>
                      </div>
                      {/* ADDED: Relative Time Badge */}
                      <span className="text-[9px] font-bold text-[#99AAB5] bg-[#1e1f22] px-1.5 py-0.5 rounded uppercase">
                        {formatRelativeTime(b.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <p className="text-gray-300 text-sm line-clamp-2 leading-snug flex-1" title={b.task}>
                        "{b.task}"
                      </p>
                      <span className="text-[9px] font-bold text-[#da373c] bg-[#da373c]/20 px-2 py-1 rounded 
                      uppercase tracking-widest truncate shrink-0 max-w-20 ml-2">
                        {b.team}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center h-22 text-[#99AAB5] text-sm bg-[#2b2d31]/50 rounded-xl border border-dashed border-[#3f4147] min-w-[320px]">
                  No updates or blockers reported today.
                </div>
              )}
            </div>
          </div>

          {/* TOP GRID: CHARTS - UNTOUCHED */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-75">
            {/* LINE CHART */}
            <div className="lg:col-span-2 bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-sm font-bold text-[#99AAB5] flex items-center gap-2">
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
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    ></path>
                  </svg>
                  Responses over time
                </h3>
                <span
                  className="bg-[#1e1f22] text-xs font-semibold text-[#99AAB5] px-3 py-1.5 rounded border 
                border-[#3f4147]"
                >
                  past 7 days
                </span>
              </div>
              <div className="flex-1 min-h-0 w-full">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={lineChartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorReports"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#38bdf8"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#38bdf8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#3f4147"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#99AAB5"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#99AAB5"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="reports"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorReports)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* BAR CHART */}
            <div className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-[#99AAB5] flex items-center gap-2 mb-4 shrink-0">
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  ></path>
                </svg>
                Responses per team
              </h3>
              <div className="flex-1 w-full min-h-0">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : breakdownData.length === 0 ? (
                  <div
                    className="w-full h-full flex items-center justify-center text-[#99AAB5] text-sm border 
                  border-dashed border-[#3f4147] rounded-xl"
                  >
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={breakdownData}
                      margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#3f4147"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="team_name"
                        stroke="#99AAB5"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        tickFormatter={(val) => val.substring(0, 6)}
                      />
                      <YAxis
                        stroke="#99AAB5"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#35373c" }}
                        content={<CustomTooltip />}
                      />
                      <Bar
                        dataKey="count"
                        fill="#38bdf8"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM GRID: STATS - UNTOUCHED */}
          <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
            justify-center items-center text-center h-30"
            >
              <h3 className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2">
                Active Teams
              </h3>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-4xl font-extrabold mb-1">
                  {stats?.total_teams || 0}
                </div>
              )}
            </div>

            <div
              className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
            justify-center items-center text-center h-30"
            >
              <h3 className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2">
                Total Participants
              </h3>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-4xl font-extrabold mb-1">
                  {stats?.total_members || 0}
                </div>
              )}
            </div>

            <div
              className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
            justify-center items-center text-center h-30 group"
            >
              <h3
                className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2 flex items-center 
              justify-center gap-1.5 w-full"
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
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
                Busiest Day
              </h3>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-4xl font-extrabold group-hover:scale-110 transition-transform">
                  {busiestDay}
                </div>
              )}
            </div>

            <div
              className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
            justify-center items-center text-center h-30 group"
            >
              <h3
                className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2 flex items-center 
              justify-center gap-1.5 w-full"
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
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 
                  1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                7-Day Responses
              </h3>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-4xl font-extrabold group-hover:scale-110 transition-transform">
                  {stats?.recent_reports || 0}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
