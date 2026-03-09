import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar"; 

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let pageName = "Dashboard"; // Default fallback

    if (path.includes("/dashboard")) pageName = "Dashboard";
    else if (path.includes("/standups")) pageName = "My Standups";
    else if (path.includes("/polls")) pageName = "My Polls";
    else if (path.includes("/history")) pageName = "History";
    else if (path.includes("/settings")) pageName = "Settings";

    document.title = `${pageName} | AsyncFlow`;
  }, [location.pathname]);
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#313338] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-10">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}