import React, { useMemo, useState } from "react";
import {
  useGetDashboardStatsQuery,
  useGetPollDashboardStatsQuery,
} from "../../store/apiSlice";
import { useLiveDashboard } from "./hooks/useLiveDashboard";

import StatCards from "./components/StatCards";
import TrendChart from "./components/TrendChart";
import DistributionChart from "./components/DistributionChart";
import BlockersWidget from "./components/BlockersWidget";
import PollsFeedWidget from "./components/PollsFeedWidget";

export default function Dashboard() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const [viewMode, setViewMode] = useState("standups");

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

  const { isLive } = useLiveDashboard(refetchStandups, refetchPolls);

  const currentStats = viewMode === "standups" ? standupStats : pollStats;
  const isLoading =
    viewMode === "standups" ? isStandupsLoading : isPollsLoading;
  const themeColor = viewMode === "standups" ? "#38bdf8" : "#c084fc";

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

  return (
    <div className="w-full space-y-8 pb-8 overflow-x-hidden animate-fade-in">
      {/* HEADER & TOGGLES */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-white">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-[#99AAB5]">
              {userData.username || "Manager"}
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-[#99AAB5] text-sm font-medium">
              Here is your server's pulse overview
            </p>
            {isLive && (
              <span
                className="flex items-center gap-2 bg-[#23a559]/10 text-[#23a559] border 
              border-[#23a559]/20 px-2.5 py-1 rounded-md text-[10px] uppercase font-extrabold tracking-widest shadow-sm"
              >
                <span className="w-2 h-2 bg-[#23a559] rounded-full animate-pulse shadow-[0_0_8px_#23a559]"></span>{" "}
                Live Feed
              </span>
            )}
          </div>
        </div>

        <div className="flex bg-[#1e1f22] p-1.5 rounded-xl border border-[#3f4147] shadow-inner">
          <button
            onClick={() => setViewMode("standups")}
            className={`cursor-pointer px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 
              ${
                viewMode === "standups"
                  ? "bg-[#5865F2] text-white shadow-md transform scale-105"
                  : "text-[#99AAB5] hover:text-white"
              }`}
          >
            Standups
          </button>
          <button
            onClick={() => setViewMode("polls")}
            className={`cursor-pointer px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 
              ${
                viewMode === "polls"
                  ? "bg-[#c084fc] text-white shadow-md transform scale-105"
                  : "text-[#99AAB5] hover:text-white"
              }`}
          >
            Polls
          </button>
        </div>
      </div>

      <StatCards
        stats={currentStats}
        viewMode={viewMode}
        isLoading={isLoading}
        themeColor={themeColor}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-96">
        <TrendChart
          data={lineChartData}
          viewMode={viewMode}
          isLoading={isLoading}
          themeColor={themeColor}
        />

        <div className="lg:col-span-1 h-96 min-w-0">
          {viewMode === "standups" ? (
            <BlockersWidget
              blockers={standupStats?.blockers}
              isLoading={isStandupsLoading}
            />
          ) : (
            <PollsFeedWidget
              polls={pollStats?.recent_polls}
              isLoading={isPollsLoading}
            />
          )}
        </div>
      </div>

      <DistributionChart
        stats={currentStats}
        viewMode={viewMode}
        isLoading={isLoading}
        themeColor={themeColor}
      />
    </div>
  );
}
