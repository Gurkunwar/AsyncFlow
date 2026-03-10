import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  useGetDashboardStatsQuery,
  useGetPollDashboardStatsQuery,
} from "../../store/apiSlice";
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

const CustomTooltip = ({ active, payload, label, suffix = "reports" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1f22] border border-[#3f4147] p-3 rounded-lg shadow-xl">
        <p className="text-[#99AAB5] text-xs font-bold mb-1 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[#38bdf8] font-extrabold text-sm">
          {payload[0].value} {suffix}
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

const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse bg-[#3f4147]/50 rounded-lg ${className}`}
  ></div>
);

export default function Dashboard() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const [viewMode, setViewMode] = useState("standups");
  const [isLive, setIsLive] = useState(false);

  const {
    data: standupStats,
    isLoading: isStandupsLoading,
    refetch: refetchStandups,
  } = useGetDashboardStatsQuery(undefined, { skip: viewMode !== "standups" });

  const {
    data: pollStats,
    isLoading: isPollsLoading,
    refetch: refetchPolls,
  } = useGetPollDashboardStatsQuery(undefined, { skip: viewMode !== "polls" });

  const liveRefs = useRef({ refetchStandups, refetchPolls });
  useEffect(() => {
    liveRefs.current = { refetchStandups, refetchPolls };
  }, [refetchStandups, refetchPolls]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const wsProtocol =
      window.location.protocol === "https:" ? "wss://" : "ws://";
    let apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/";
    if (!apiBase.endsWith("/")) apiBase += "/";
    const wsBase = apiBase.replace(/^http(s?):\/\//, wsProtocol);

    let ws = null;
    let pingInterval = null;
    let reconnectTimeout = null;
    let isIntentionallyClosing = false;

    const connectWebSocket = () => {
      ws = new WebSocket(`${wsBase}ws?token=${token}`);

      ws.onopen = () => {
        setIsLive(true);
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN)
            ws.send(JSON.stringify({ type: "ping" }));
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === "NEW_STANDUP_REPORT") {
            liveRefs.current.refetchStandups().unwrap();
          }
          if (update.type === "NEW_POLL_VOTE") {
            liveRefs.current.refetchPolls().unwrap();
          }
        } catch (err) {
          // ignore parsing errors for raw text pongs
        }
      };

      ws.onclose = () => {
        setIsLive(false);
        clearInterval(pingInterval);
        if (!isIntentionallyClosing) {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      isIntentionallyClosing = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const getDiscordAvatarUrl = (avatarStr, userId) => {
    if (!avatarStr || avatarStr === "0" || avatarStr === "") {
      try {
        const id = userId ? BigInt(userId) : 0n;
        const defaultIndex = Number((id >> 22n) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
      } catch (e) {
        return `https://cdn.discordapp.com/embed/avatars/0.png`;
      }
    }
    if (avatarStr.startsWith("http")) return avatarStr;
    const cleanHash = avatarStr.includes("/")
      ? avatarStr.split("/")[1]
      : avatarStr;
    return `https://cdn.discordapp.com/avatars/${userId}/${cleanHash}.png`;
  };

  const currentStats = viewMode === "standups" ? standupStats : pollStats;
  const isLoading =
    viewMode === "standups" ? isStandupsLoading : isPollsLoading;

  const lineChartData = useMemo(() => {
    const rawData =
      Array.isArray(currentStats?.weekly_data) &&
      currentStats.weekly_data.length === 7
        ? currentStats.weekly_data
        : [0, 0, 0, 0, 0, 0, 0];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return rawData.map((val, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { day: daysOfWeek[d.getDay()], count: val };
    });
  }, [currentStats?.weekly_data]);

  const renderStandupsActivity = () => {
    const blockers = standupStats?.blockers || [];
    return blockers.length > 0 ? (
      blockers.map((b) => (
        <div
          key={b.id}
          className="bg-[#da373c]/5 border border-[#da373c]/20 p-4 rounded-xl flex flex-col gap-2 shadow-sm 
          hover:border-[#da373c]/50 transition-colors w-[320px] shrink-0 snap-start"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <img
                src={getDiscordAvatarUrl(b.avatar, b.user_id)}
                alt="avatar"
                className="w-6 h-6 rounded-full border border-[#2b2d31] shrink-0 object-cover"
              />
              <span className="font-bold text-[#da373c] text-sm truncate">
                {b.user}
              </span>
            </div>
            <span className="text-[9px] font-bold text-[#99AAB5] bg-[#1e1f22] px-1.5 py-0.5 rounded uppercase">
              {formatRelativeTime(b.created_at)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p
              className="text-gray-300 text-sm line-clamp-2 leading-snug flex-1"
              title={b.task}
            >
              "{b.task}"
            </p>
            <span
              className="text-[9px] font-bold text-[#da373c] bg-[#da373c]/20 px-2 py-1 rounded uppercase 
            tracking-widest truncate shrink-0 max-w-20 ml-2"
            >
              {b.team}
            </span>
          </div>
        </div>
      ))
    ) : (
      <div
        className="flex-1 flex items-center justify-center h-22 text-[#99AAB5] text-sm bg-[#2b2d31]/50 
      rounded-xl border border-dashed border-[#3f4147] min-w-[320px]"
      >
        No updates or blockers reported today.
      </div>
    );
  };

  const renderPollsActivity = () => {
    const polls = pollStats?.recent_polls || [];
    return polls.length > 0 ? (
      polls.map((p) => (
        <div
          key={p.id}
          className="bg-[#38bdf8]/5 border border-[#38bdf8]/20 p-4 rounded-xl flex flex-col gap-2 shadow-sm 
          hover:border-[#38bdf8]/50 transition-colors w-[320px] shrink-0 snap-start"
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                p.is_active
                  ? "bg-[#43b581]/20 text-[#43b581]"
                  : "bg-[#404249] text-[#99AAB5]"
              }`}
            >
              {p.is_active ? "Live" : "Ended"}
            </span>
            <span className="text-[9px] font-bold text-[#99AAB5] bg-[#1e1f22] px-1.5 py-0.5 rounded uppercase">
              {formatRelativeTime(p.created_at)}
            </span>
          </div>
          <p
            className="text-gray-200 text-sm font-semibold line-clamp-2"
            title={p.question}
          >
            {p.question}
          </p>
        </div>
      ))
    ) : (
      <div
        className="flex-1 flex items-center justify-center h-22 text-[#99AAB5] text-sm bg-[#2b2d31]/50 
      rounded-xl border border-dashed border-[#3f4147] min-w-[320px]"
      >
        No recent polls found.
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full min-h-[calc(100vh-4rem)] relative">
      {/* Header & Toggle */}
      <div className="shrink-0 flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">
            sup! {userData.username || "manager"}
          </h1>
          <p className="text-[#99AAB5] text-sm font-medium flex items-center gap-2">
            here's your summary
            {isLive && (
              <span
                className="flex items-center gap-1 bg-[#23a559]/20 text-[#23a559] px-2 py-0.5 rounded 
              text-[10px] uppercase font-bold tracking-widest"
              >
                <span className="w-1.5 h-1.5 bg-[#23a559] rounded-full animate-pulse"></span>
                Live Feed
              </span>
            )}
          </p>
        </div>
        <div className="flex bg-[#1e1f22] p-1 rounded-lg border border-[#3f4147] shadow-sm">
          <button
            onClick={() => setViewMode("standups")}
            className={`cursor-pointer px-5 py-1.5 text-sm font-bold rounded-md transition-all 
              ${
                viewMode === "standups"
                  ? "bg-[#5865F2] text-white shadow"
                  : "text-[#99AAB5] hover:text-white"
              }`}
          >
            Standups
          </button>
          <button
            onClick={() => setViewMode("polls")}
            className={`cursor-pointer px-5 py-1.5 text-sm font-bold rounded-md transition-all 
              ${
                viewMode === "polls"
                  ? "bg-[#38bdf8] text-white shadow"
                  : "text-[#99AAB5] hover:text-white"
              }`}
          >
            Polls
          </button>
        </div>
      </div>

      {/* Horizontal Feed */}
      <div className="shrink-0 min-h-30 mb-6">
        <h3
          className={`text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 
            ${viewMode === "standups" ? "text-[#da373c]" : "text-[#38bdf8]"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isLive ? "animate-pulse" : ""} 
              ${viewMode === "standups" ? "bg-[#da373c]" : "bg-[#38bdf8]"}`}
          ></span>
          {viewMode === "standups"
            ? "Latest Standup Updates"
            : "Recent Polls Feed"}
        </h3>
        <div className="flex flex-row gap-4 overflow-x-auto pb-3 pt-1 snap-x scroll-smooth custom-scrollbar">
          {isLoading ? (
            <Skeleton className="w-[320px] h-24 shrink-0" />
          ) : viewMode === "standups" ? (
            renderStandupsActivity()
          ) : (
            renderPollsActivity()
          )}
        </div>
      </div>

      {/* Charts Block */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 min-h-75">
        <div
          className="lg:col-span-2 bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm 
        flex flex-col h-full"
        >
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
              {viewMode === "standups"
                ? "Responses over time"
                : "Polls Published"}
            </h3>
            <span
              className="bg-[#1e1f22] text-xs font-semibold text-[#99AAB5] px-3 py-1.5 rounded border 
            border-[#3f4147]"
            >
              past 7 days
            </span>
          </div>
          <div className="flex-1 min-h-0 w-full relative">
            {isLoading ? (
              <Skeleton className="absolute inset-0 w-full h-full" />
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
                        stopColor={
                          viewMode === "standups" ? "#38bdf8" : "#a855f7"
                        }
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          viewMode === "standups" ? "#38bdf8" : "#a855f7"
                        }
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
                  <Tooltip
                    content={
                      <CustomTooltip
                        suffix={viewMode === "standups" ? "reports" : "polls"}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={viewMode === "standups" ? "#38bdf8" : "#a855f7"}
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

        {/* Bar Chart */}
        <div className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col h-full">
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
            {viewMode === "standups"
              ? "Responses per team"
              : "Most Voted Polls"}
          </h3>
          <div className="flex-1 w-full min-h-0 relative">
            {isLoading ? (
              <Skeleton className="absolute inset-0 w-full h-full" />
            ) : (viewMode === "standups" &&
                !standupStats?.breakdown_data?.length) ||
              (viewMode === "polls" && !pollStats?.top_polls?.length) ? (
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center text-[#99AAB5] 
              text-sm border border-dashed border-[#3f4147] rounded-xl"
              >
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    viewMode === "standups"
                      ? standupStats?.breakdown_data || []
                      : pollStats?.top_polls || []
                  }
                  margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#3f4147"
                    vertical={false}
                  />
                  <XAxis
                    dataKey={
                      viewMode === "standups" ? "team_name" : "poll_question"
                    }
                    stroke="#99AAB5"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    tickFormatter={(val) =>
                      val ? val.substring(0, 6) + ".." : ""
                    }
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
                    content={<CustomTooltip suffix="votes" />}
                  />
                  <Bar
                    dataKey="count"
                    fill={viewMode === "standups" ? "#38bdf8" : "#a855f7"}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
        justify-center items-center text-center h-28"
        >
          <h3 className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2">
            {viewMode === "standups" ? "Active Teams" : "Total Polls"}
          </h3>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-4xl font-extrabold mb-1">
              {viewMode === "standups"
                ? currentStats?.total_teams || 0
                : currentStats?.total_polls || 0}
            </div>
          )}
        </div>
        <div
          className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
        justify-center items-center text-center h-28"
        >
          <h3 className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2">
            {viewMode === "standups" ? "Total Participants" : "Active Polls"}
          </h3>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-4xl font-extrabold mb-1">
              {viewMode === "standups"
                ? currentStats?.total_members || 0
                : currentStats?.active_polls || 0}
            </div>
          )}
        </div>
        <div
          className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
        justify-center items-center text-center h-28 group"
        >
          <h3
            className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2 flex items-center 
          justify-center gap-1.5 w-full"
          >
            Busiest Day
          </h3>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-4xl font-extrabold group-hover:scale-110 transition-transform">
              {currentStats?.busiest_day || "N/A"}
            </div>
          )}
        </div>
        <div
          className="bg-[#2b2d31] p-5 rounded-2xl border border-[#1e1f22] shadow-sm flex flex-col 
        justify-center items-center text-center h-28 group"
        >
          <h3
            className="text-[#99AAB5] text-xs font-bold uppercase tracking-wider mb-2 flex items-center 
          justify-center gap-1.5 w-full"
          >
            {viewMode === "standups" ? "7-Day Responses" : "Total Votes Cast"}
          </h3>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-4xl font-extrabold group-hover:scale-110 transition-transform">
              {viewMode === "standups"
                ? currentStats?.recent_reports || 0
                : currentStats?.total_votes || 0}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
