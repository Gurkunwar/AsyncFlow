import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "../../../components/Skeleton";
import CustomTooltip from "./CustomTooltip";

export default function TrendChart({ data, viewMode, isLoading, themeColor }) {
  return (
    <div className="lg:col-span-2 bg-[#2b2d31] p-6 rounded-2xl border border-[#1e1f22] shadow-md flex 
    flex-col h-96 min-w-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
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
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              ></path>
            </svg>
          </span>
          {viewMode === "standups" ? "Responses Over Time" : "Votes Over Time"}
        </h3>
        <span className="bg-[#1e1f22] text-[10px] font-bold text-[#99AAB5] px-3 py-1 rounded-md border 
        border-[#3f4147] uppercase tracking-widest shadow-sm">
          Past 7 Days
        </span>
      </div>
      <div className="flex-1 min-h-0 w-full relative">
        {isLoading ? (
          <Skeleton className="absolute inset-0 w-full h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              style={{ overflow: "hidden" }}
            >
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeColor} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#3f4147"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="day"
                stroke="#99AAB5"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
                fontWeight="bold"
              />
              <YAxis
                stroke="#99AAB5"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, "auto"]}
                fontWeight="bold"
              />
              <Tooltip
                content={
                  <CustomTooltip
                    suffix={viewMode === "standups" ? "reports" : "votes"}
                    color={themeColor}
                  />
                }
                cursor={{
                  stroke: "#3f4147",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={themeColor}
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorReports)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
