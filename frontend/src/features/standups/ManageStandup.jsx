import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MembersTab from "./tabs/MembersTab";
import SettingsTab from "./tabs/SettingsTab";
import HistoryTab from "./tabs/HistoryTab";
import {
  useGetStandupByIdQuery,
  useGetGuildMembersQuery,
  useGetGuildChannelsQuery,
  useToggleMemberMutation,
  useUpdateStandupMutation,
  useDeleteStandupMutation,
} from "../../store/apiSlice";

export default function ManageStandup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("members");

  const { data: standup, isLoading: isStandupLoading } =
    useGetStandupByIdQuery(id);
  const skipSecondaryFetches = !standup?.guild_id;

  const { data: guildMembers = [], isLoading: isMembersLoading } =
    useGetGuildMembersQuery(standup?.guild_id, { skip: skipSecondaryFetches });
  const { data: channels = [] } = useGetGuildChannelsQuery(standup?.guild_id, {
    skip: skipSecondaryFetches,
  });

  const isLoading = isStandupLoading || isMembersLoading;

  const [toggleMemberMutation] = useToggleMemberMutation();
  const [updateStandupMutation, { isLoading: isSaving }] =
    useUpdateStandupMutation();
  const [deleteStandupMutation] = useDeleteStandupMutation();

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
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings.");
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

  const tabs = [
    { id: "members", label: "👥 Members" },
    { id: "settings", label: "⚙️ Settings" },
    { id: "history", label: "📜 History" },
  ];

  return (
    <>
      <div className="border-b border-[#1e1f22] mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/standups")}
            className="cursor-pointer text-[#99AAB5] hover:text-white transition-colors flex items-center 
            gap-1 text-sm font-semibold bg-[#2b2d31] px-3 py-1.5 rounded-md border border-[#1e1f22]"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold truncate">
            {standup?.name || "Loading..."}
          </h1>
        </div>

        <div className="flex gap-6 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer pb-3 text-sm font-semibold transition-colors whitespace-nowrap 
                relative ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-[#99AAB5] hover:text-[#dcddde]"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#5865F2] rounded-t-md" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        {activeTab === "members" && (
          <MembersTab
            standup={standup}
            guildMembers={guildMembers}
            isLoading={isLoading}
            onToggleMember={toggleMember}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            standup={standup}
            channels={channels}
            onSave={updateStandup}
            onDelete={deleteStandup}
            isSaving={isSaving}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab standup={standup} guildMembers={guildMembers} />
        )}
      </div>
    </>
  );
}
