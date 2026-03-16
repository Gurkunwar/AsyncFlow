import React from "react";
import { Skeleton } from "../../../components/Skeleton";

export default function StatCards({ stats, viewMode, isLoading, themeColor }) {
  const cards = [
    {
      title: viewMode === "standups" ? "Active Teams" : "Total Polls",
      val: viewMode === "standups" ? stats?.total_teams : stats?.total_polls,
      icon: viewMode === "standups" ? "👥" : "📊",
    },
    {
      title: viewMode === "standups" ? "Total Participants" : "Active Polls",
      val: viewMode === "standups" ? stats?.total_members : stats?.active_polls,
      icon: viewMode === "standups" ? "🧑‍💻" : "🟢",
    },
    {
      title: "Busiest Day",
      val: stats?.busiest_day || "N/A",
      icon: "🔥",
    },
    {
      title: viewMode === "standups" ? "7-Day Responses" : "Total Votes Cast",
      val: viewMode === "standups" ? stats?.recent_reports : stats?.total_votes,
      icon: "📈",
    },
  ];

  return (
    <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((stat, i) => (
        <div
          key={i}
          className="bg-[#2b2d31] p-6 rounded-2xl border border-[#1e1f22] shadow-md hover:shadow-lg 
          hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden group"
        >
          <div
            className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ backgroundColor: themeColor }}
          ></div>

          <div className="flex justify-between items-start">
            <h3 className="text-[#99AAB5] text-[11px] font-extrabold uppercase tracking-widest">
              {stat.title}
            </h3>
            <span className="text-xl grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
              {stat.icon}
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div
              className="text-4xl font-black tracking-tight"
              style={{ color: themeColor }}
            >
              {stat.val || 0}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
