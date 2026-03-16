import { useState, useEffect, useRef } from "react";

export function useLiveDashboard(refetchStandups, refetchPolls) {
  const [isLive, setIsLive] = useState(false);
  const liveRefs = useRef({ refetchStandups, refetchPolls });

  useEffect(() => {
    liveRefs.current = { refetchStandups, refetchPolls };
  }, [refetchStandups, refetchPolls]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const wsProtocol =
      window.location.protocol === "https:" ? "wss://" : "ws://";
    let apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/";
    if (!apiBase.endsWith("/")) apiBase += "/";
    const wsBase = apiBase.replace(/^http(s?):\/\//, wsProtocol);

    let ws = null;
    let pingInterval = null;
    let reconnectTimeout = null;
    let isIntentionallyClosing = false;

    const connectWebSocket = () => {
      ws = new WebSocket(`${wsBase}ws?token=${token}`);

      ws.onopen = () => {
        setIsLive(true);
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (
            update.type === "NEW_STANDUP_REPORT" &&
            liveRefs.current.refetchStandups
          ) {
            liveRefs.current.refetchStandups().unwrap();
          }
          if (
            update.type === "NEW_POLL_VOTE" &&
            liveRefs.current.refetchPolls
          ) {
            liveRefs.current.refetchPolls().unwrap();
          }
        } catch (err) {
          console.error("Failed to parse live update", err);
        }
      };

      ws.onclose = () => {
        setIsLive(false);
        clearInterval(pingInterval);
        if (!isIntentionallyClosing) {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      isIntentionallyClosing = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  return { isLive };
}
