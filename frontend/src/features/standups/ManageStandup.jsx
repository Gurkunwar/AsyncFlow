import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MembersTab from "./tabs/MembersTab";
import SettingsTab from "./tabs/SettingsTab";
import HistoryTab from "./tabs/HistoryTab";
import {
  useGetStandupByIdQuery,
  useGetGuildMembersQuery,
  useGetGuildChannelsQuery,
  useGetGuildRolesQuery,
  useToggleMemberMutation,
  useUpdateStandupMutation,
  useDeleteStandupMutation,
  useTestStandupMutation,
  useGetUserGuildsQuery,
} from "../../store/apiSlice";

export default function ManageStandup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("members");

  const { data: standup, isLoading: isStandupLoading } =
    useGetStandupByIdQuery(id);
  const skipSecondaryFetches = !standup?.guild_id && !standup?.GuildID;

  const { data: guilds = [] } = useGetUserGuildsQuery();

  const { data: guildMembers = [], isLoading: isMembersLoading } =
    useGetGuildMembersQuery(standup?.guild_id || standup?.GuildID, {
      skip: skipSecondaryFetches,
    });

  const { data: channels = [] } = useGetGuildChannelsQuery(
    standup?.guild_id || standup?.GuildID,
    {
      skip: skipSecondaryFetches,
    },
  );

  const { data: roles = [] } = useGetGuildRolesQuery(
    standup?.guild_id || standup?.GuildID,
    {
      skip: skipSecondaryFetches,
    },
  );

  const isLoading = isStandupLoading || isMembersLoading;

  const [toggleMemberMutation] = useToggleMemberMutation();
  const [updateStandupMutation, { isLoading: isSaving }] =
    useUpdateStandupMutation();
  const [deleteStandupMutation] = useDeleteStandupMutation();
  const [testStandupMutation, { isLoading: isTesting }] =
    useTestStandupMutation();

  const toggleMember = async (userId, isCurrentlyMember) => {
    try {
      await toggleMemberMutation({
        standupId: id,
        userId,
        isCurrentlyMember,
      }).unwrap();
    } catch (err) {
      console.error("Failed to toggle member", err);
    }
  };

  const updateStandup = async (updatedData) => {
    try {
      await updateStandupMutation({
        id: parseInt(id),
        ...updatedData,
      }).unwrap();
      alert("✨ Standup configuration saved successfully!");
    } catch (err) {
      const errorMsg = err?.data?.error || "Failed to save.";
      alert(`⚠️ Action Failed\n\n${errorMsg}`);
    }
  };

  const deleteStandup = async () => {
    try {
      await deleteStandupMutation(id).unwrap();
      navigate("/standups");
    } catch (err) {
      alert("Failed to delete standup.");
    }
  };

  const triggerTestRun = async () => {
    try {
      await testStandupMutation(id).unwrap();
      alert("🚀 Test run initiated! Check your Discord DMs.");
    } catch (err) {
      alert("⚠️ Failed to send test run. Is the bot online and in the server?");
    }
  };

  const tabs = [
    { id: "members", label: "👥 Team Members" },
    { id: "settings", label: "⚙️ Configuration" },
    { id: "history", label: "📜 Report Logs" },
  ];

  if (isStandupLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#99AAB5] animate-pulse font-semibold">
        Loading standup details...
      </div>
    );
  }

  const resolvedGuildName =
    standup?.guild_name ||
    guilds.find((g) => g.id === (standup?.guild_id || standup?.GuildID))
      ?.name ||
    "Unknown Server";

  return (
    <div className="animate-fade-in pb-8">
      {/* Header Section */}
      <div className="border-b border-[#1e1f22] mb-8 pb-2">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/standups")}
            className="cursor-pointer text-[#99AAB5] hover:text-white transition-colors flex items-center 
            gap-2 text-sm font-semibold bg-[#2b2d31] hover:bg-[#35373c] px-4 py-2.5 rounded-lg border 
            border-[#1e1f22] shadow-sm"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-white truncate tracking-tight">
              {standup?.name || standup?.Name || "Unnamed Standup"}
            </h1>
            <span className="text-xs font-bold text-[#5865F2] uppercase tracking-widest mt-1">
              {resolvedGuildName}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 overflow-x-auto custom-scrollbar px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer pb-4 text-sm font-bold transition-all whitespace-nowrap relative group
                ${activeTab === tab.id ? "text-white" : "text-[#99AAB5] hover:text-[#dcddde]"}`}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#5865F2] rounded-t-md 
                shadow-[0_-2px_10px_rgba(88,101,242,0.5)]" />
              ) : (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#404249] rounded-t-md 
                opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {activeTab === "members" && (
          <MembersTab
            standup={standup}
            guildMembers={guildMembers}
            roles={roles}
            isLoading={isLoading}
            onToggleMember={toggleMember}
            onUpdateStandup={updateStandup}
            isSaving={isSaving}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            standup={standup}
            channels={channels}
            onSave={updateStandup}
            onDelete={deleteStandup}
            isSaving={isSaving}
            onTestRun={triggerTestRun}
            isTesting={isTesting}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab
            standupId={id}
            standup={standup}
            guildMembers={guildMembers}
          />
        )}
      </div>
    </div>
  );
}
