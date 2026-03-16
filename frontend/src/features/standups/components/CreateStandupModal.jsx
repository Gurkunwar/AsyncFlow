import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TimePicker from "../../../components/TimePicker";
import {
  useGetUserGuildsQuery,
  useGetGuildChannelsQuery,
  useCreateStandupMutation,
} from "../../../store/apiSlice";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STANDUP_TEMPLATES = [
  {
    id: "daily_scrum",
    name: "Daily Agile Scrum",
    icon: "📅",
    questions: [
      "What did you accomplish yesterday?",
      "What will you do today?",
      "Are you stuck anywhere?",
    ],
  },
  {
    id: "weekly_retro",
    name: "Weekly Retrospective",
    icon: "🔄",
    questions: [
      "What went well this week?",
      "What could have gone better?",
      "What are our action items for next week?",
    ],
  },
  {
    id: "mental_health",
    name: "Mental Health & Workload",
    icon: "🧠",
    questions: [
      "How are you feeling today (1-10)?",
      "How is your current workload?",
      "Is there anything blocking you or causing stress?",
    ],
  },
  {
    id: "custom",
    name: "Custom (Start from scratch)",
    icon: "✨",
    questions: [""],
  },
];

export default function CreateStandupModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("daily_scrum");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    time: "09:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    guild_id: "",
    report_channel_id: "",
    questions: [...STANDUP_TEMPLATES[0].questions],
  });

  const {
    data: guilds = [],
    isLoading: isLoadingGuilds,
    isFetching: isFetchingGuilds,
    refetch: refetchGuilds,
  } = useGetUserGuildsQuery(undefined, { skip: !isOpen });
  const { data: channels = [], isFetching: isFetchingChannels } =
    useGetGuildChannelsQuery(formData.guild_id, { skip: !formData.guild_id });
  const [createStandup, { isLoading: isCreating }] = useCreateStandupMutation();

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedTemplate("daily_scrum");
      setActiveDropdown(null);
      setFormData({
        name: "",
        time: "09:00",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        guild_id: "",
        report_channel_id: "",
        questions: [...STANDUP_TEMPLATES[0].questions],
      });
    }
  }, [isOpen]);

  const toggleDropdown = (e, dropdownName) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleTemplateChange = (tId) => {
    setSelectedTemplate(tId);
    setActiveDropdown(null);
    const template = STANDUP_TEMPLATES.find((t) => t.id === tId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        questions: [...template.questions],
        name: prev.name === "" && tId !== "custom" ? template.name : prev.name,
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    if (formData.questions.length < 5)
      setFormData({ ...formData, questions: [...formData.questions, ""] });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) return;
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, questions: items });
  };

  const handleNext = () => {
    if (currentStep === 1 && (!formData.name || !formData.report_channel_id)) {
      alert(
        "Please enter a name and select a report channel before continuing.",
      );
      return;
    }
    if (currentStep === 2 && formData.days.length === 0) {
      alert("Please select at least one active day.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleSubmit = async () => {
    const cleanedQuestions = formData.questions
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
    if (cleanedQuestions.length === 0)
      return alert("Please ensure you have at least one question.");
    try {
      await createStandup({
        ...formData,
        questions: cleanedQuestions,
        days: formData.days.join(","),
      }).unwrap();
      onClose();
    } catch (err) {
      alert(
        `⚠️ Setup Failed\n\n${err?.data?.error || "Failed to create standup."}`,
      );
    }
  };

  if (!isOpen) return null;

  const selectedChannelName = channels.find(
    (c) => c.id === formData.report_channel_id,
  )?.name;
  const selectedGuildObj = guilds.find((g) => g.id === formData.guild_id);
  const currentTemplateObj = STANDUP_TEMPLATES.find(
    (t) => t.id === selectedTemplate,
  );

  const steps = [
    { num: 1, title: "Basics", desc: "Name & Location" },
    { num: 2, title: "Schedule", desc: "When to run it" },
    { num: 3, title: "Questions", desc: "What to ask" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#313338] w-full max-w-4xl rounded-2xl border border-[#1e1f22] shadow-2xl flex 
        min-h-137.5 overflow-hidden"
      >
        <div className="w-1/3 bg-[#2b2d31] p-8 border-r border-[#1e1f22] hidden md:block relative">
          <h2 className="text-xl font-extrabold text-white mb-10 flex items-center gap-2 tracking-tight">
            <span className="text-[#facc15] bg-[#facc15]/10 p-2 rounded-lg">
              ✨
            </span>{" "}
            New Standup
          </h2>
          <div
            className="space-y-10 relative before:absolute before:inset-0 before:ml-3.75 
          before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-[#5865F2] 
          before:via-[#404249] before:to-transparent"
          >
            {steps.map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className="relative flex items-center gap-5"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm 
                      shrink-0 z-10 transition-all duration-300
                      ${
                        isActive
                          ? "bg-[#5865F2] text-white shadow-[0_0_12px_rgba(88,101,242,0.4)] ring-4 ring-[#5865F2]/20"
                          : isCompleted
                            ? "bg-[#5865F2] text-white"
                            : "bg-[#1e1f22] text-[#99AAB5] border border-[#404249]"
                      }`}
                  >
                    {isCompleted ? (
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3
                      className={`font-bold transition-colors ${
                        isActive || isCompleted
                          ? "text-white"
                          : "text-[#99AAB5]"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-[11px] font-medium transition-colors ${
                        isActive ? "text-[#99AAB5]" : "text-[#404249]"
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#313338] max-h-[90vh] overflow-y-auto custom-scrollbar relative">
          <div className="flex-1 p-8 md:p-10">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Let's set up the basics
                  </h3>
                </div>

                <div className="bg-[#2b2d31] p-5 rounded-xl border border-[#3f4147] shadow-sm mb-6 relative">
                  <label
                    className="text-[11px] font-extrabold text-[#facc15] uppercase tracking-wider 
                  mb-2 flex items-center gap-2"
                  >
                    ⚡ Quick Start Template
                  </label>
                  <div className="relative">
                    <button
                      onClick={(e) => toggleDropdown(e, "template")}
                      className="w-full bg-[#1e1f22] hover:bg-[#25262a] text-sm text-white px-4 py-3 
                      rounded-lg border border-[#3f4147] focus:border-[#5865F2] transition-colors flex 
                      justify-between items-center outline-none shadow-inner"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span>{currentTemplateObj?.icon}</span>
                        {currentTemplateObj?.name}
                      </span>
                      <svg
                        className={`w-4 h-4 text-[#99AAB5] transition-transform ${
                          activeDropdown === "template" ? "rotate-180" : ""
                        }`}
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
                    </button>
                    {activeDropdown === "template" && (
                      <div
                        className="absolute z-50 w-[calc(100%-40px)] mt-2 bg-[#2b2d31] border 
                      border-[#3f4147] rounded-xl shadow-2xl py-2 custom-scrollbar"
                      >
                        {STANDUP_TEMPLATES.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleTemplateChange(t.id)}
                            className={`px-4 py-3 flex items-center gap-3 cursor-pointer mx-2 rounded-lg 
                              transition-colors ${
                                selectedTemplate === t.id
                                  ? "bg-[#5865F2]/10 text-white"
                                  : "text-[#99AAB5] hover:bg-[#1e1f22] hover:text-white"
                              }`}
                          >
                            <span className="text-lg">{t.icon}</span>
                            <span className="font-medium text-sm">
                              {t.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {currentTemplateObj && currentTemplateObj.id !== "custom" && (
                    <div className="mt-4 p-4 bg-[#1e1f22] rounded-lg border border-[#3f4147]/50 shadow-inner">
                      <span className="text-[10px] text-[#99AAB5] font-bold uppercase tracking-widest mb-3 block">
                        Preview Questions:
                      </span>
                      <ul className="text-xs text-gray-300 list-disc list-inside space-y-2">
                        {currentTemplateObj.questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
                    Team Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#1e1f22] px-4 py-3.5 rounded-lg border border-[#3f4147] 
                    focus:border-[#5865F2] outline-none text-white text-sm transition-all focus:ring-2 
                    focus:ring-[#5865F2]/30 shadow-inner placeholder-[#99AAB5]/40"
                    placeholder="e.g. Frontend Sync"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label
                      className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider 
                    mb-2 flex justify-between items-center"
                    >
                      <span>Discord Server</span>
                    </label>
                    <button
                      onClick={(e) => toggleDropdown(e, "guild")}
                      className="w-full bg-[#1e1f22] hover:bg-[#25262a] text-sm text-white px-4 
                      py-3.5 rounded-lg border border-[#3f4147] transition-colors flex justify-between 
                      items-center shadow-inner"
                    >
                      <span className="font-medium truncate pr-4">
                        {isLoadingGuilds
                          ? "Loading..."
                          : selectedGuildObj?.name || "Select a server..."}
                      </span>
                      <svg
                        className="w-4 h-4 shrink-0 text-[#99AAB5]"
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
                    </button>
                    {activeDropdown === "guild" && (
                      <div
                        className="absolute z-50 w-[calc(100%-40px)] mt-2 bg-[#2b2d31] border 
                      border-[#3f4147] rounded-xl shadow-2xl max-h-60 overflow-y-auto py-2 custom-scrollbar"
                      >
                        {guilds.map((g) => (
                          <div
                            key={g.id}
                            onClick={() => {
                              if (g.bot_present) {
                                setFormData({
                                  ...formData,
                                  guild_id: g.id,
                                  report_channel_id: "",
                                });
                                setActiveDropdown(null);
                              }
                            }}
                            className={`px-4 py-3 flex items-center justify-between mx-2 rounded-lg 
                              transition-colors ${
                                g.bot_present
                                  ? "cursor-pointer hover:bg-[#5865F2]/10 text-gray-200 hover:text-white"
                                  : "cursor-default opacity-50 text-[#99AAB5]"
                              }`}
                          >
                            <span className="font-medium text-sm truncate pr-2">
                              {g.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
                      Report Channel
                    </label>
                    <button
                      onClick={(e) =>
                        formData.guild_id &&
                        channels.length > 0 &&
                        toggleDropdown(e, "channel")
                      }
                      disabled={!formData.guild_id}
                      className={`w-full bg-[#1e1f22] px-4 py-3.5 rounded-lg border border-[#3f4147] 
                        transition-colors flex justify-between items-center shadow-inner 
                        ${
                          !formData.guild_id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-[#25262a] text-white cursor-pointer"
                        }`}
                    >
                      <span className="font-medium text-sm truncate pr-4 flex items-center gap-2">
                        {selectedChannelName && (
                          <span className="text-[#99AAB5] font-light">#</span>
                        )}
                        {!formData.guild_id
                          ? "Select server first..."
                          : selectedChannelName || "Select text channel..."}
                      </span>
                      <svg
                        className="w-4 h-4 shrink-0 text-[#99AAB5]"
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
                    </button>
                    {activeDropdown === "channel" && (
                      <div
                        className="absolute z-50 w-[calc(100%-40px)] mt-2 bg-[#2b2d31] border 
                      border-[#3f4147] rounded-xl shadow-2xl max-h-60 overflow-y-auto py-2 custom-scrollbar"
                      >
                        {channels.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                report_channel_id: c.id,
                              });
                              setActiveDropdown(null);
                            }}
                            className="px-4 py-3 text-sm text-[#99AAB5] hover:bg-[#5865F2]/10 
                            hover:text-white cursor-pointer flex items-center gap-3 mx-2 rounded-lg font-medium"
                          >
                            <span className="text-lg opacity-50">#</span>{" "}
                            {c.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-2">
                  When should the standup happen?
                </h3>
                <div>
                  <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-3 block">
                    Trigger Time
                  </label>
                  <TimePicker
                    value={formData.time}
                    onChange={(val) => setFormData({ ...formData, time: val })}
                  />
                  <p
                    className="text-xs text-[#99AAB5] mt-3 bg-[#2b2d31] p-3 rounded-lg border 
                  border-[#3f4147] flex items-start gap-2 shadow-sm"
                  >
                    <span className="text-lg">🌍</span>
                    <span>
                      Team members will receive DMs exactly at this time based
                      on their <strong>own local timezone</strong>.
                    </span>
                  </p>
                </div>
                <div className="pt-6 border-t border-[#3f4147]">
                  <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-4 block">
                    Active Days
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const isActive = formData.days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border flex 
                            items-center gap-2 hover:-translate-y-0.5 shadow-sm ${
                              isActive
                                ? "bg-[#5865F2] border-[#5865F2] text-white shadow-[#5865F2]/20"
                                : "bg-[#1e1f22] border-[#3f4147] text-[#99AAB5] hover:text-white hover:border-[#5865F2]/50"
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    What to ask your team
                  </h3>
                  <p className="text-[#99AAB5] text-sm">
                    Provide up to 5 questions for the daily prompt.
                  </p>
                </div>

                <div className="flex justify-between items-center bg-[#2b2d31] p-3 rounded-lg border border-[#1e1f22]">
                  <span className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider pl-1">
                    Prompt Questions
                  </span>
                  <span
                    className="text-[10px] font-bold bg-[#1e1f22] text-white px-2.5 py-1 
                  rounded border border-[#3f4147] shadow-sm"
                  >
                    {formData.questions.length} / 5 LIMIT
                  </span>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="questions-list">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {formData.questions.map((q, index) => (
                          <Draggable
                            key={`q-${index}`}
                            draggableId={`q-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center gap-3 bg-[#1e1f22] p-2 pr-4 rounded-xl border 
                                  transition-all duration-200 group ${
                                    snapshot.isDragging
                                      ? "border-[#5865F2] shadow-2xl scale-[1.02] bg-[#25262a] z-50"
                                      : "border-[#3f4147] hover:border-[#5865F2]/50 shadow-sm"
                                  }`}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-[#404249] hover:text-[#99AAB5] cursor-grab active:cursor-grabbing 
                                  p-3 transition-colors"
                                >
                                  <svg
                                    width="12"
                                    height="20"
                                    fill="currentColor"
                                    viewBox="0 0 10 16"
                                  >
                                    <circle cx="3" cy="3" r="1.5" />
                                    <circle cx="3" cy="8" r="1.5" />
                                    <circle cx="3" cy="13" r="1.5" />
                                    <circle cx="7" cy="3" r="1.5" />
                                    <circle cx="7" cy="8" r="1.5" />
                                    <circle cx="7" cy="13" r="1.5" />
                                  </svg>
                                </div>
                                <div
                                  className="text-[10px] text-[#99AAB5] font-extrabold w-6 h-6 flex 
                                justify-center items-center bg-[#2b2d31] rounded-full shrink-0 border 
                                border-[#1e1f22] shadow-sm"
                                >
                                  {index + 1}
                                </div>
                                <input
                                  type="text"
                                  placeholder="Enter your question here..."
                                  className="flex-1 bg-transparent outline-none text-sm text-white py-3 
                                  placeholder-[#99AAB5]/40"
                                  value={q}
                                  onChange={(e) =>
                                    handleQuestionChange(index, e.target.value)
                                  }
                                />
                                {formData.questions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="cursor-pointer text-[#404249] hover:text-[#da373c] 
                                    p-2 rounded-lg bg-transparent hover:bg-[#da373c]/10 transition-all 
                                    opacity-0 group-hover:opacity-100"
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
                    className="w-full py-3.5 mt-2 rounded-xl border-2 border-dashed border-[#3f4147] 
                    hover:border-[#5865F2] hover:bg-[#5865F2]/5 text-[#99AAB5] hover:text-[#5865F2] 
                    font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="bg-[#2b2d31] p-1 rounded group-hover:bg-[#5865F2]/20 transition-colors">
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
                    Add another question
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#2b2d31] px-8 py-5 border-t border-[#1e1f22] flex justify-between items-center shrink-0">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="cursor-pointer px-5 py-2.5 rounded-lg font-bold text-sm text-[#99AAB5] 
              hover:text-white hover:bg-[#1e1f22] transition-colors border border-transparent hover:border-[#3f4147]"
            >
              {currentStep === 1 ? "Cancel" : "← Back"}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer bg-[#5865F2] hover:bg-[#4752C4] px-8 py-2.5 rounded-lg 
                font-bold text-sm text-white transition-all shadow-md hover:shadow-lg 
                hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                Continue{" "}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
                className={`cursor-pointer bg-[#23a559] hover:bg-[#1d8a4a] px-8 py-2.5 rounded-lg 
                  font-bold text-sm text-white transition-all shadow-md hover:shadow-lg 
                  hover:-translate-y-0.5 flex items-center gap-2 
                  ${isCreating ? "opacity-70 pointer-events-none cursor-not-allowed" : ""}`}
              >
                {isCreating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Finish Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }`,
        }}
      />
    </div>
  );
}
