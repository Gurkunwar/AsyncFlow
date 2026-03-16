import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TimePicker from "../../../components/TimePicker";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SettingsTab({
  standup,
  channels,
  onSave,
  onDelete,
  isSaving,
  onTestRun,
  isTesting,
}) {
  const [formData, setFormData] = useState({
    name: "",
    time: "09:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    report_channel_id: "",
    sync_role_id: "",
    questions: [],
  });

  useEffect(() => {
    if (standup) {
      let parsedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const daysStr = standup.days || standup.Days;
      if (daysStr) parsedDays = daysStr.split(",").map((d) => d.trim());
      setFormData({
        name: standup.name || standup.Name || "",
        time: standup.time || standup.Time || "09:00",
        days: parsedDays,
        report_channel_id:
          standup.report_channel_id || standup.ReportChannelID || "",
        sync_role_id: standup.sync_role_id || standup.SyncRoleID || "",
        questions: standup.questions || standup.Questions || [],
      });
    }
  }, [standup]);

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const newDays = prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () =>
    setFormData({ ...formData, questions: [...formData.questions, ""] });

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) return;
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, questions: items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedQuestions = formData.questions
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (cleanedQuestions.length === 0) {
      alert("You must have at least one valid question.");
      return;
    }
    if (formData.days.length === 0) {
      alert("You must select at least one active day.");
      return;
    }

    try {
      await onSave({
        ...formData,
        questions: cleanedQuestions,
        days: formData.days.join(","),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Configuration</h2>
        <p className="text-[#99AAB5] text-sm">
          Manage your standup's core details, schedule, and daily prompt
          questions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#2b2d31] p-6 md:p-10 rounded-2xl border border-[#1e1f22] shadow-md space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
              Team Name
            </label>
            <input
              type="text"
              className="w-full bg-[#1e1f22] px-4 py-3.5 rounded-lg border border-[#3f4147] 
              focus:border-[#5865F2] outline-none text-white text-sm transition-all focus:ring-2 
              focus:ring-[#5865F2]/30 shadow-inner"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
              Daily Trigger Time
            </label>
            <TimePicker
              value={formData.time}
              onChange={(newTime) =>
                setFormData({ ...formData, time: newTime })
              }
            />
            <p className="text-[10px] text-[#99AAB5] mt-2 font-medium flex items-center gap-1">
              <span className="text-xs">🌍</span> Sent in each user's local
              timezone.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#3f4147]">
          <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-4 block">
            Active Days
          </label>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isActive = formData.days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`cursor-pointer px-5 py-2.5 rounded-lg text-sm font-bold transition-all 
                    border flex items-center gap-2 hover:-translate-y-0.5 shadow-sm
                    ${
                      isActive
                        ? "bg-[#5865F2] border-[#5865F2] text-white shadow-[#5865F2]/20"
                        : "bg-[#1e1f22] border-[#3f4147] text-[#99AAB5] hover:text-white hover:border-[#5865F2]/50 hover:bg-[#25262a]"
                    }`}
                >
                  {isActive && (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {day.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-8 border-t border-[#3f4147]">
          <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
            Report Channel
          </label>
          <div className="relative md:w-1/2">
            <select
              className="w-full bg-[#1e1f22] px-4 py-3.5 rounded-lg border border-[#3f4147] 
              focus:border-[#5865F2] outline-none text-white text-sm cursor-pointer shadow-inner 
              appearance-none transition-colors"
              value={formData.report_channel_id}
              onChange={(e) =>
                setFormData({ ...formData, report_channel_id: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select a target text channel...
              </option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  # {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#99AAB5]">
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#3f4147]">
          <div className="flex justify-between items-center mb-6">
            <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider flex items-center gap-2">
              Daily Prompt Questions
            </label>
            <span className="bg-[#1e1f22] px-3 py-1 rounded-md text-[10px] font-bold border border-[#3f4147] 
            text-white shadow-sm">
              {formData.questions.length} / 5 LIMIT
            </span>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="settings-questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {formData.questions.map((q, index) => (
                    <Draggable
                      key={`sq-${index}`}
                      draggableId={`sq-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 bg-[#1e1f22] p-2 pr-4 rounded-xl border 
                            transition-all duration-200 group
                            ${snapshot.isDragging ? "border-[#5865F2] shadow-2xl scale-[1.02] bg-[#25262a] z-50" : 
                            "border-[#3f4147] hover:border-[#5865F2]/50 shadow-sm"}`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-[#404249] hover:text-[#99AAB5] cursor-grab active:cursor-grabbing 
                            p-3 transition-colors"
                          >
                            <svg
                              width="12"
                              height="20"
                              viewBox="0 0 10 16"
                              fill="currentColor"
                            >
                              <circle cx="3" cy="3" r="1.5" />
                              <circle cx="3" cy="8" r="1.5" />
                              <circle cx="3" cy="13" r="1.5" />
                              <circle cx="7" cy="3" r="1.5" />
                              <circle cx="7" cy="8" r="1.5" />
                              <circle cx="7" cy="13" r="1.5" />
                            </svg>
                          </div>

                          <div className="text-[10px] font-extrabold text-[#99AAB5] bg-[#2b2d31] 
                          w-6 h-6 flex items-center justify-center rounded-full shrink-0 border border-[#3f4147]">
                            {index + 1}
                          </div>

                          <input
                            type="text"
                            className="flex-1 bg-transparent outline-none text-sm text-white py-3 placeholder-[#99AAB5]/40"
                            value={q}
                            placeholder="Enter your question here..."
                            onChange={(e) =>
                              handleQuestionChange(index, e.target.value)
                            }
                            required
                          />

                          {formData.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="text-[#404249] hover:text-[#da373c] p-2 rounded-lg 
                              hover:bg-[#da373c]/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Remove Question"
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
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {formData.questions.length < 5 && (
            <button
              type="button"
              onClick={addQuestion}
              className="cursor-pointer mt-6 flex items-center gap-2 text-sm text-[#99AAB5] 
              hover:text-[#5865F2] font-bold transition-colors group"
            >
              <div className="bg-[#1e1f22] p-1.5 rounded-md group-hover:bg-[#5865F2]/10 
              transition-colors border border-[#3f4147] group-hover:border-[#5865F2]/30">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              Add Question
            </button>
          )}
        </div>

        <div className="pt-8 mt-4 border-t border-[#3f4147] flex flex-col-reverse sm:flex-row 
        justify-between items-center gap-6 sm:gap-0">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "🚨 Are you absolutely sure you want to permanently delete this standup? This action cannot be undone.",
                )
              ) {
                onDelete();
              }
            }}
            className="cursor-pointer px-5 py-2.5 rounded-lg font-bold text-sm text-[#99AAB5] 
            hover:text-[#da373c] hover:bg-[#da373c]/10 transition-colors w-full sm:w-auto"
          >
            Delete Standup
          </button>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onTestRun}
              disabled={isTesting || isSaving}
              className={`cursor-pointer px-6 py-2.5 rounded-lg font-bold text-sm transition-all 
                shadow-md flex items-center justify-center gap-2 w-full sm:w-auto
                ${
                  isTesting || isSaving
                    ? "bg-[#1e1f22] text-[#99AAB5] border border-[#3f4147] cursor-not-allowed"
                    : "bg-[#2b2d31] border border-[#404249] text-white hover:bg-[#35373c] hover:border-[#5865F2]/50 hover:-translate-y-0.5"
                }`}
            >
              {isTesting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-[#99AAB5]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                      3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>{" "}
                  Sending...
                </>
              ) : (
                "🧪 Send Test Run"
              )}
            </button>
            <button
              type="submit"
              disabled={isSaving || isTesting}
              className={`cursor-pointer px-8 py-2.5 rounded-lg font-bold text-sm text-white transition-all 
                shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto
                ${
                  isSaving || isTesting
                    ? "bg-[#23a559]/50 cursor-not-allowed"
                    : "bg-[#23a559] hover:bg-[#1d8a4a] hover:-translate-y-0.5"
                }`}
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
