import React, { useState, useEffect } from "react";
import {
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
} from "../../store/apiSlice";

const COMMON_TIMEZONES = [
  { label: "Universal Time (UTC)", value: "UTC" },
  { label: "US Pacific (PST/PDT)", value: "America/Los_Angeles" },
  { label: "US Central (CST/CDT)", value: "America/Chicago" },
  { label: "US East (EST/EDT)", value: "America/New_York" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Europe Central (CET)", value: "Europe/Paris" },
  { label: "India (IST)", value: "Asia/Kolkata" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Japan (JST)", value: "Asia/Tokyo" },
  { label: "Australia East (AEST)", value: "Australia/Sydney" },
];

export default function Settings() {
  const { data: settings, isLoading } = useGetUserSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateUserSettingsMutation();

  const [timezone, setTimezone] = useState("UTC");
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });

  const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=274877959232&scope=bot+applications.commands`;

  useEffect(() => {
    if (settings?.timezone) {
      setTimezone(settings.timezone);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({ timezone }).unwrap();
      setSaveStatus({
        message: "Settings saved successfully!",
        type: "success",
      });
      setTimeout(() => setSaveStatus({ message: "", type: "" }), 3000);
    } catch (err) {
      setSaveStatus({ message: "Failed to save settings.", type: "error" });
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">User Preferences</h2>
        <p className="text-[#99AAB5] text-sm">
          Manage your personal bot settings and timezone configurations.
        </p>
      </div>

      {/* Date & Time Settings */}
      <div className="bg-[#2b2d31] border border-[#1e1f22] rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#99AAB5] mb-4">
          Date & Time
        </h3>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-gray-200">
              Your Timezone
            </label>
            <p className="text-[#99AAB5] text-xs leading-relaxed mb-3 max-w-md">
              This timezone determines when you receive your daily Standup
              reminders from the bot. By default, this is set to UTC.
            </p>

            {isLoading ? (
              <div className="h-10 w-full md:w-72 bg-[#1e1f22] animate-pulse rounded-md border border-[#3f4147]"></div>
            ) : (
              <div className="relative w-full md:w-72">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#1e1f22] text-sm text-gray-200 px-4 py-2.5 rounded-md outline-none 
                  border border-[#3f4147] focus:border-[#5865F2] cursor-pointer shadow-inner appearance-none 
                  transition-colors"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-[#99AAB5]">
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
            )}
          </div>
        </div>

        <div
          className="mt-8 pt-6 border-t border-[#3f4147]/50 flex flex-col sm:flex-row items-center 
        justify-between gap-4"
        >
          <div className="text-sm font-medium w-full sm:w-auto text-center sm:text-left">
            {saveStatus.message && (
              <span
                className={
                  saveStatus.type === "success"
                    ? "text-[#43b581]"
                    : "text-[#da373c]"
                }
              >
                {saveStatus.type === "success" ? "✓ " : "❌ "}
                {saveStatus.message}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={
              isLoading || isUpdating || timezone === settings?.timezone
            }
            className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#5865F2]/50 
            disabled:cursor-not-allowed px-6 py-2 rounded font-semibold text-sm transition-colors 
            cursor-pointer shadow-md flex justify-center items-center gap-2"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Bot Integration / Invite */}
      <div className="bg-[#2b2d31] border border-[#1e1f22] rounded-xl shadow-sm p-6 mb-6 flex flex-col 
      md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#99AAB5] mb-2">
            Bot Integration
          </h3>
          <h4 className="text-lg font-bold text-gray-200 mb-1">
            Add to another server
          </h4>
          <p className="text-[#99AAB5] text-sm max-w-md">
            Want to automate standups for a different team? Invite AsyncFlow to
            another Discord server you manage.
          </p>
        </div>
        <a
          href={INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-[#1e1f22] hover:bg-[#35373c] border border-[#3f4147] 
          text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors shadow-sm flex justify-center 
          items-center gap-2 cursor-pointer shrink-0 group"
        >
          <svg
            className="w-5 h-5 text-[#5865F2] group-hover:scale-110 transition-transform"
            viewBox="0 0 127.14 96.36"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,
            72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,
            96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,
            0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,
            0,.04-.06.09-.09C129.67,52.82,122.93,28.21,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,
            46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.3,46,96.19,53,
            91.08,65.69,84.69,65.69Z" />
          </svg>
          Invite AsyncFlow
        </a>
      </div>

      {/* Notifications WIP */}
      <div
        className="bg-[#2b2d31] border border-[#1e1f22] rounded-xl shadow-sm p-6 opacity-60 grayscale 
      cursor-not-allowed"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#99AAB5] mb-1">
              Notifications (Coming Soon)
            </h3>
            <p className="text-gray-400 text-sm">
              Configure DM notifications and email alerts.
            </p>
          </div>
          <div className="bg-[#1e1f22] text-[#99AAB5] text-xs px-3 py-1 rounded font-bold tracking-wider border 
          border-[#3f4147]">
            WIP
          </div>
        </div>
      </div>
    </div>
  );
}
