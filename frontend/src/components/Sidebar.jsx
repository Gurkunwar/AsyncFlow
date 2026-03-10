import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

function NavItem({ to, icon, label, isCollapsed, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
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

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const handleLogout = () => {
    // FIX: Added a confirmation dialog before logging out
    if (window.confirm("Are you sure you want to log out of AsyncFlow?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const avatarUrl = userData.avatar
    ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const effectiveIsCollapsed = isMobileOpen ? false : isCollapsed;

  return (
    <div className="shrink-0 flex flex-col md:h-screen md:sticky md:top-0 z-50">
      <div
        className="md:hidden flex items-center justify-between bg-[#2b2d31] p-4 border-b 
      border-[#1e1f22] relative z-40"
      >
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <span className="text-xl">🤖</span> AsyncFlow
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-[#1e1f22] rounded-md text-[#99AAB5] hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMobileOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          ${effectiveIsCollapsed ? "md:w-20" : "md:w-64"} w-64
          bg-[#2b2d31] flex flex-col transition-all duration-300 border-r border-[#1e1f22] h-screen shrink-0
          transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <button
          onClick={toggleSidebar}
          className="hidden md:flex cursor-pointer absolute -right-3 top-6 bg-[#5865F2] w-6 h-6 rounded-full items-center 
          justify-center text-white text-[10px] hover:scale-110 transition-transform z-10 shadow-lg 
          border-2 border-[#1e1f22]"
        >
          {effectiveIsCollapsed ? "❯" : "❮"}
        </button>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="h-14 flex items-center px-5 border-b border-[#1e1f22] shrink-0">
            <span className="mr-3 text-xl min-w-6 text-center">🤖</span>
            {!effectiveIsCollapsed && (
              <span className="font-bold text-lg tracking-wide whitespace-nowrap text-white">
                AsyncFlow
              </span>
            )}
          </div>

          <nav className="p-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar overflow-x-hidden flex-1 flex flex-col">
            <NavItem
              to="/dashboard"
              icon="📊"
              label="Dashboard"
              isCollapsed={effectiveIsCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />
            <NavItem
              to="/standups"
              icon="👥"
              label="My Standups"
              isCollapsed={effectiveIsCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />
            <NavItem
              to="/polls"
              icon="🗳️"
              label="Polls"
              isCollapsed={effectiveIsCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />
            <NavItem
              to="/history"
              icon="📜"
              label="History"
              isCollapsed={effectiveIsCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />
            <NavItem
              to="/settings"
              icon="⚙️"
              label="Settings"
              isCollapsed={effectiveIsCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />

            <div className="mt-auto pt-4">
              <a
                href="https://buymeacoffee.com/gurkunwarsingh"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 bg-[#FFDD00]/10 text-[#FFDD00] 
                border border-[#FFDD00]/20 hover:bg-[#FFDD00] hover:text-black rounded-md font-bold 
                transition-all shadow-sm group ${effectiveIsCollapsed ? "p-2.5 mx-1" : "px-4 py-2 mx-1"}`}
                title={effectiveIsCollapsed ? "Buy me a coffee" : ""}
              >
                <svg
                  className="w-4 h-4 group-hover:animate-bounce shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 8h-2M4 8h12M4 11h12M4 14h12M4 17h12M5 21h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 
                    2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 8v4a2 2 0 002 2h0a2 2 0 002-2V8h-4z"
                  ></path>
                </svg>
                {!effectiveIsCollapsed && (
                  <span className="text-xs whitespace-nowrap">
                    Buy me a coffee
                  </span>
                )}
              </a>
            </div>
          </nav>
        </div>

        <div
          className={`bg-[#232428] p-3 flex items-center shrink-0 min-h-16 ${
            effectiveIsCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link
            to="/settings"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden group rounded-md transition-colors hover:bg-[#2b2d31]
             p-1 -ml-1 cursor-pointer"
            title={effectiveIsCollapsed ? "Go to Settings" : ""}
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-9 h-9 rounded-full shrink-0 border border-[#1e1f22] group-hover:border-[#5865F2] transition-colors"
            />
            {!effectiveIsCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold truncate text-white group-hover:text-[#5865F2] transition-colors">
                  {userData.username || "Guest"}
                </span>
              </div>
            )}
          </Link>

          {!effectiveIsCollapsed && (
            <button
              onClick={handleLogout}
              className="text-[#99AAB5] hover:text-[#da373c] p-2 rounded-md hover:bg-[#313338] 
              transition-colors cursor-pointer shrink-0"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
