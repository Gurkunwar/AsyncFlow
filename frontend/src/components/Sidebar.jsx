import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function NavItem({ to, icon, label, isCollapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
          isActive
            ? "bg-[#5865F2]/10 text-[#5865F2]"
            : "text-[#99AAB5] hover:bg-[#35373c] hover:text-gray-200"
        }`
      }
      title={isCollapsed ? label : ""}
    >
      <span className="text-lg min-w-6 text-center">{icon}</span>
      {!isCollapsed && (
        <span className="font-semibold text-sm whitespace-nowrap truncate">
          {label}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const avatarUrl = userData.avatar
    ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"} bg-[#2b2d31] flex flex-col transition-all duration-300 border-r 
      border-[#1e1f22] relative z-50 shrink-0 h-screen`}
    >
      <button
        onClick={toggleSidebar}
        className="cursor-pointer absolute -right-3 top-6 bg-[#5865F2] w-6 h-6 rounded-full flex items-center 
        justify-center text-white text-[10px] hover:scale-110 transition-transform z-10 shadow-lg 
        border-2 border-[#1e1f22]"
      >
        {isCollapsed ? "❯" : "❮"}
      </button>

      {/* Top: Branding & Navigation */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="h-14 flex items-center px-5 border-b border-[#1e1f22] shrink-0">
          <span className="mr-3 text-xl min-w-6 text-center">🤖</span>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-wide whitespace-nowrap text-white">
              AsyncFlow
            </span>
          )}
        </div>

        <nav className="p-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <NavItem
            to="/dashboard"
            icon="📊"
            label="Dashboard"
            isCollapsed={isCollapsed}
          />
          <NavItem
            to="/standups"
            icon="👥"
            label="My Standups"
            isCollapsed={isCollapsed}
          />
          <NavItem
            to="/polls"
            icon="🗳️"
            label="Polls"
            isCollapsed={isCollapsed}
          />
          <NavItem
            to="/history"
            icon="📜"
            label="History"
            isCollapsed={isCollapsed}
          />
          <NavItem
            to="/settings"
            icon="⚙️"
            label="Settings"
            isCollapsed={isCollapsed}
          />
        </nav>
      </div>

      {/* Bottom: User Profile & Logout */}
      <div className="bg-[#232428] p-3 flex items-center justify-between mt-auto shrink-0 min-h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-9 h-9 rounded-full shrink-0 border border-gray-700"
          />
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold truncate text-white">
                {userData.username || "Guest"}
              </span>
              <span className="text-xs text-[#99AAB5] truncate">Manager</span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="text-[#99AAB5] hover:text-[#da373c] p-2 rounded-md hover:bg-[#313338] transition-colors 
            cursor-pointer shrink-0"
            title="Logout"
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
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 
              3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
