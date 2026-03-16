import { useCallback } from "react";

export function useHistoryExport({
  viewMode,
  historyData,
  pollHistoryData,
  standupConfig,
  selectedStandupId,
  selectedPollId,
  page,
}) {
  const handleExportCSV = useCallback(() => {
    let csvContent = "";
    let filename = "";

    if (viewMode === "standups") {
      if (!historyData || historyData.length === 0 || !standupConfig) return;
      const questions =
        standupConfig.questions || standupConfig.Questions || [];
      const headers = ["Date", "User", "Status", ...questions];

      const rows = historyData.map((row) => {
        const isSkipped =
          row.is_skipped ||
          (row.answers &&
            row.answers.length > 0 &&
            row.answers[0] === "Skipped / OOO");
        const statusStr = isSkipped ? "Skipped" : "Submitted";

        return [
          `"${row.date}"`,
          `"${row.user_name}"`,
          statusStr,
          ...(row.answers || []).map((a) => `"${a.replace(/"/g, '""')}"`),
        ].join(",");
      });

      csvContent = [headers.join(","), ...rows].join("\n");
      filename = `standup_history_${selectedStandupId}_page_${page}.csv`;
    } else {
      if (!pollHistoryData || pollHistoryData.length === 0) return;
      const headers = ["Date", "User", "Voted For"];

      const rows = pollHistoryData.map(
        (row) =>
          `"${row.created_at}","${row.user_name}","${row.option.replace(/"/g, '""')}"`,
      );

      csvContent = [headers.join(","), ...rows].join("\n");
      filename = `poll_history_${selectedPollId}_page_${page}.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [
    viewMode,
    historyData,
    pollHistoryData,
    standupConfig,
    selectedStandupId,
    selectedPollId,
    page,
  ]);

  return { handleExportCSV };
}