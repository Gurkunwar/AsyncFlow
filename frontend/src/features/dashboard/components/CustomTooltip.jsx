import React from "react";

export default function CustomTooltip({
  active,
  payload,
  label,
  suffix = "reports",
  color = "#38bdf8",
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1f22] border border-[#3f4147] p-4 rounded-xl shadow-2xl z-50 relative min-w-30">
        <p className="text-[#99AAB5] text-[10px] font-extrabold mb-1 uppercase tracking-widest">
          {label}
        </p>
        <p
          className="font-extrabold text-lg flex items-baseline gap-1"
          style={{ color }}
        >
          {payload[0].value}{" "}
          <span className="text-xs font-medium text-[#99AAB5]">{suffix}</span>
        </p>
      </div>
    );
  }
  return null;
}
