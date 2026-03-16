import React from "react";

export default function UserListModal({ userModal, setUserModal }) {
  if (!userModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 
    backdrop-blur-sm animate-fade-in"
    >
      <div
        className="bg-[#313338] w-full max-w-md rounded-2xl border border-[#1e1f22] 
      shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 bg-[#2b2d31] border-b border-[#1e1f22]">
          <div>
            <h2 className="text-lg font-bold text-white">{userModal.title}</h2>
            <p className="text-xs text-[#99AAB5] font-medium mt-1">
              {userModal.users.length} members found
            </p>
          </div>
          <button
            onClick={() => setUserModal(null)}
            className="cursor-pointer text-[#99AAB5] hover:text-[#da373c] bg-[#1e1f22] 
            hover:bg-[#da373c]/10 p-2 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
          {userModal.users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 bg-[#2b2d31] hover:bg-[#35373c] p-3 rounded-xl 
              border border-[#1e1f22] transition-colors group"
            >
              <img
                src={
                  u.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"
                }
                alt="avatar"
                className="w-10 h-10 rounded-full bg-[#1e1f22] border border-[#3f4147]"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-sm text-gray-200 group-hover:text-white truncate">
                  {u.username}
                </span>
                <span className="text-[10px] text-[#99AAB5] font-mono truncate">
                  ID: {u.id}
                </span>
              </div>
              {u.votedFor && (
                <span
                  className="text-[11px] bg-[#1e1f22] text-[#99AAB5] border border-[#3f4147] 
                px-3 py-1.5 rounded-lg font-bold shrink-0 max-w-30 truncate shadow-sm"
                >
                  {u.votedFor}
                </span>
              )}
            </div>
          ))}
          {userModal.users.length === 0 && (
            <div className="text-center py-12 px-4 text-[#99AAB5]">
              No users found in this list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
