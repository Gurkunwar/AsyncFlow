import React from "react";

const AvatarGroup = ({ users, label, onViewAll }) => {
  const displayUsers = users.slice(0, 5);
  const overflow = users.length - 5;
  return (
    <div className="flex flex-col group">
      <div className="flex -space-x-3 mb-3">
        {displayUsers.map((u, i) => (
          <div
            key={u.id}
            className="relative z-10 transition-transform hover:-translate-y-1 hover:z-20"
            style={{ zIndex: 10 - i }}
          >
            <img
              src={u.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
              alt={u.username}
              className="w-10 h-10 rounded-full border-2 border-[#2b2d31] bg-[#1e1f22] object-cover"
            />
          </div>
        ))}
        {overflow > 0 && (
          <div
            className="w-10 h-10 rounded-full border-2 border-[#2b2d31] bg-[#1e1f22] flex 
          items-center justify-center text-xs font-bold text-[#99AAB5] z-0 shadow-sm"
          >
            +{overflow}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#99AAB5] uppercase tracking-wider">
          {label}: {users.length}
        </span>
        {users.length > 0 && (
          <button
            onClick={onViewAll}
            className="cursor-pointer text-[11px] text-[#5865F2] hover:text-[#4752c4] 
            font-semibold bg-[#5865F2]/10 px-2 py-0.5 rounded"
          >
            View List
          </button>
        )}
      </div>
    </div>
  );
};

export default function ParticipationCard({
  participationRate,
  uniqueVoterIds,
  totalEligible,
  votedUsers,
  unvotedUsers,
  setUserModal,
}) {
  return (
    <div className="bg-[#2b2d31] p-6 md:p-8 rounded-2xl border border-[#1e1f22] shadow-md relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-64 h-64 bg-[#2dd4bf]/5 rounded-full 
      blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
      ></div>
      <h2 className="text-xs font-extrabold text-[#99AAB5] uppercase tracking-widest mb-2 relative z-10">
        Server Participation
      </h2>
      <div className="flex items-end gap-3 mb-6 relative z-10">
        <span
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r 
        from-white to-[#99AAB5]"
        >
          {participationRate}%
        </span>
        <span
          className="text-sm text-[#99AAB5] font-medium mb-2 bg-[#1e1f22] px-3 py-1 
        rounded-md border border-[#3f4147]"
        >
          Voted: <strong className="text-white">{uniqueVoterIds.length}</strong>{" "}
          / {totalEligible}
        </span>
      </div>
      <div
        className="h-4 w-full bg-[#1e1f22] rounded-full overflow-hidden mb-8 shadow-inner relative 
      z-10 border border-[#1e1f22]"
      >
        <div
          className="h-full bg-linear-to-r from-[#2dd4bf] to-[#38bdf8] rounded-full transition-all duration-1000"
          style={{ width: `${participationRate}%` }}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 relative z-10">
        <AvatarGroup
          users={votedUsers}
          label="Cast a Vote"
          onViewAll={() =>
            setUserModal({ title: "Users Who Voted", users: votedUsers })
          }
        />
        <AvatarGroup
          users={unvotedUsers}
          label="Pending"
          onViewAll={() =>
            setUserModal({
              title: "Users Who Haven't Voted",
              users: unvotedUsers,
            })
          }
        />
      </div>
    </div>
  );
}
