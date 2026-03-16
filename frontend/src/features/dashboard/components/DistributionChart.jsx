import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "../../../components/Skeleton";
import CustomTooltip from "./CustomTooltip";

export default function DistributionChart({
  stats,
  viewMode,
  isLoading,
  themeColor,
}) {
  const data =
    viewMode === "standups"
      ? stats?.breakdown_data || []
      : stats?.top_polls || [];
  const isEmpty = data.length === 0;

  return (
    <div className="w-full h-80 bg-[#2b2d31] p-6 rounded-2xl border border-[#1e1f22] shadow-md flex flex-col min-w-0">
      <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-6 shrink-0 uppercase tracking-wider">
        <span className="p-1.5 rounded-md bg-[#1e1f22] border border-[#3f4147]">
          <svg
            className="w-4 h-4 text-[#99AAB5]"
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
        </span>
        {viewMode === "standups" ? "Responses Per Team" : "Most Voted Polls"}
      </h3>

      <div className="flex-1 w-full min-h-0 relative">
        {isLoading ? (
          <Skeleton className="absolute inset-0 w-full h-full" />
        ) : isEmpty ? (
          <div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center 
          text-[#99AAB5] border-2 border-dashed border-[#3f4147] rounded-xl bg-[#1e1f22]/50"
          >
            <span className="text-2xl mb-2 opacity-50">📊</span>
            <span className="text-sm font-bold">Not enough data yet</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#3f4147"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey={
                  viewMode === "standups" ? "team_name" : "poll_question"
                }
                stroke="#99AAB5"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                dy={10}
                tickFormatter={(val) => (val ? val.substring(0, 8) + ".." : "")}
              />
              <YAxis
                stroke="#99AAB5"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#35373c", opacity: 0.4 }}
                content={
                  <CustomTooltip
                    suffix={viewMode === "standups" ? "reports" : "votes"}
                    color={themeColor}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill={themeColor}
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
