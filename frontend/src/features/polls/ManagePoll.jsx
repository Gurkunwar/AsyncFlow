import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPollByIdQuery,
  useGetGuildMembersQuery,
  useEndPollMutation,
  useDeletePollMutation,
} from "../../store/apiSlice";

import ParticipationCard from "./components/ParticipationCard";
import PollResultsChart from "./components/PollResultsChart";
import UserListModal from "./components/UserListModal";

const CHART_COLORS = [
  "#2dd4bf",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#e879f9",
  "#f472b6",
  "#fb923c",
];

export default function ManagePoll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userModal, setUserModal] = useState(null);

  const { data: poll, isLoading: isPollLoading } = useGetPollByIdQuery(id, {
    pollingInterval: 3000,
  });
  const { data: guildMembers = [] } = useGetGuildMembersQuery(
    poll?.GuildID || poll?.guild_id,
    { skip: !poll },
  );

  const [endPollMutation, { isLoading: isEnding }] = useEndPollMutation();
  const [deletePoll, { isLoading: isDeleting }] = useDeletePollMutation();

  const handleEndPoll = async () => {
    if (
      window.confirm(
        "🚨 Are you sure you want to end this poll early? Discord will close voting immediately.",
      )
    ) {
      try {
        await endPollMutation(id).unwrap();
      } catch (err) {
        alert(`⚠️ Failed to end poll.`);
      }
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "🚨 Are you sure you want to permanently delete this poll? This cannot be undone.",
      )
    ) {
      try {
        await deletePoll(id).unwrap();
        navigate("/polls");
      } catch (err) {
        alert("Failed to delete the poll.");
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE}/polls/export?id=${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to generate CSV");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      a.download = `poll_${id}_results.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to export CSV.");
    }
  };

  const calculatedData = useMemo(() => {
    if (!poll) return {};
    const tVotes = poll.Votes?.length || 0;
    const uVoterIds = [...new Set(poll.Votes?.map((v) => v.UserID) || [])];

    const vUsers = uVoterIds.map((userId) => {
      const member = guildMembers.find((m) => m.id === userId);
      const voteRecord = poll.Votes?.find((v) => v.UserID === userId);
      const option = poll.Options?.find((o) => o.ID === voteRecord?.OptionID);
      return {
        ...(member || {
          id: userId,
          username: `User ${userId.substring(0, 4)}...`,
        }),
        votedFor: option?.Label || "Unknown",
      };
    });

    const unUsers = guildMembers.filter((m) => !uVoterIds.includes(m.id));
    const tEligible = Math.max(guildMembers.length, uVoterIds.length) || 1;
    const pRate = Math.round((uVoterIds.length / tEligible) * 100);

    let currentCumulative = 0;
    const cData =
      poll.Options?.map((option, index) => {
        const votesForOption =
          poll.Votes?.filter((v) => v.OptionID === option.ID).length || 0;
        const percentage = tVotes === 0 ? 0 : (votesForOption / tVotes) * 100;
        const dashArray = `${percentage} ${100 - percentage}`;
        const dashOffset = 100 - currentCumulative;
        currentCumulative += percentage;
        return {
          ...option,
          votes: votesForOption,
          percentage,
          dashArray,
          dashOffset,
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
      }) || [];

    return {
      totalVotes: tVotes,
      uniqueVoterIds: uVoterIds,
      votedUsers: vUsers,
      unvotedUsers: unUsers,
      participationRate: pRate,
      totalEligible: tEligible,
      chartData: cData,
    };
  }, [poll, guildMembers]);

  if (isPollLoading)
    return (
      <div className="text-center py-20 text-[#99AAB5] animate-pulse">
        Loading analytics...
      </div>
    );
  if (!poll) return null;

  return (
    <div className="animate-fade-in pb-8">
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 
      max-w-5xl mx-auto w-full"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/polls")}
            className="cursor-pointer text-[#99AAB5] hover:text-white bg-[#2b2d31] px-4 py-2.5 
            rounded-lg border border-[#1e1f22]"
          >
            ← Back to Polls
          </button>
          <div
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest border 
              ${
                poll.IsActive
                  ? "bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20"
                  : "bg-[#1e1f22] text-[#99AAB5] border-[#3f4147]"
              }`}
          >
            {poll.IsActive ? "LIVE" : "CLOSED"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-bold border border-[#3f4147] 
            text-[#99AAB5] hover:text-white hover:bg-[#2b2d31]"
          >
            Export CSV
          </button>
          {poll.IsActive && (
            <button
              onClick={handleEndPoll}
              disabled={isEnding}
              className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-bold border 
              border-[#fb923c]/30 text-[#fb923c] hover:bg-[#fb923c] hover:text-white"
            >
              {isEnding ? "Ending..." : "End Early"}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-bold border border-[#da373c]/30 
            text-[#da373c] hover:bg-[#da373c] hover:text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <ParticipationCard {...calculatedData} setUserModal={setUserModal} />
        <PollResultsChart
          poll={poll}
          chartData={calculatedData.chartData}
          totalVotes={calculatedData.totalVotes}
        />
      </div>

      <UserListModal userModal={userModal} setUserModal={setUserModal} />
    </div>
  );
}