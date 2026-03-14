import React, { useState, useEffect, useRef } from "react";
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
    const handleFocus = () => {
      if (isOpen) refetchGuilds();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isOpen, refetchGuilds]);

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

  const addQuestion = () => {
    if (formData.questions.length < 5) {
      setFormData({ ...formData, questions: [...formData.questions, ""] });
    }
  };

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

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    const cleanedQuestions = formData.questions
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
    if (cleanedQuestions.length === 0) {
      alert("Please ensure you have at least one question.");
      return;
    }

    try {
      await createStandup({
        ...formData,
        questions: cleanedQuestions,
        days: formData.days.join(","),
      }).unwrap();
      onClose();
    } catch (err) {
      const errorMsg = err?.data?.error || "Failed to create standup.";
      alert(`⚠️ Setup Failed\n\n${errorMsg}`);
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
        className="bg-[#313338] w-full max-w-4xl rounded-2xl border border-[#1e1f22] shadow-2xl flex min-h-137.5"
      >
        {/* LEFT SIDEBAR: Stepper - Added rounded-l-2xl */}
        <div className="w-1/3 bg-[#2b2d31] p-8 border-r border-[#1e1f22] hidden md:block rounded-l-2xl">
          <h2 className="text-xl font-extrabold text-white mb-8 flex items-center gap-2">
            <span className="text-[#5865F2]">✨</span> New Standup
          </h2>
          <div
            className="space-y-8 relative before:absolute before:inset-0 before:ml-3.75 before:-translate-x-px 
          md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b 
          before:from-transparent before:via-[#404249] before:to-transparent"
          >
            {steps.map((step) => (
              <div key={step.num} className="relative flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 
                    transition-colors shadow-md ${
                      currentStep >= step.num
                        ? "bg-[#5865F2] text-white ring-4 ring-[#5865F2]/20"
                        : "bg-[#1e1f22] text-[#99AAB5] border border-[#404249]"
                    }`}
                >
                  {currentStep > step.num ? (
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
                <div>
                  <h3
                    className={`font-bold ${currentStep >= step.num ? "text-white" : "text-[#99AAB5]"}`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#99AAB5]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 md:p-10 bg-[#313338] rounded-2xl md:rounded-l-none md:rounded-r-2xl">
          <div className="flex-1">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Let's set up the basics
                </h3>

                <div className="bg-[#2b2d31] p-5 rounded-xl border border-[#3f4147] shadow-sm mb-6 relative">
                  <label
                    className="text-[11px] font-extrabold text-[#5865F2] uppercase tracking-wider 
                  mb-2 flex items-center gap-2"
                  >
                    ⚡ Quick Start Template
                  </label>
                  <div className="relative">
                    <button
                      onClick={(e) => toggleDropdown(e, "template")}
                      className="w-full bg-[#1e1f22] hover:bg-[#25262a] text-sm text-white 
                      px-4 py-3 rounded-lg border border-[#3f4147] focus:border-[#5865F2] 
                      transition-colors flex justify-between items-center outline-none focus:ring-2 focus:ring-[#5865F2]/30"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span>{currentTemplateObj?.icon}</span>
                        {currentTemplateObj?.name}
                      </span>
                      <svg
                        className={`w-4 h-4 text-[#99AAB5] transition-transform 
                          ${activeDropdown === "template" ? "rotate-180" : ""}`}
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
                        className="absolute z-50 w-full mt-2 bg-[#2b2d31] border border-[#3f4147] 
                      rounded-lg shadow-2xl py-1 overflow-hidden animate-fade-in"
                      >
                        {STANDUP_TEMPLATES.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleTemplateChange(t.id)}
                            className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors 
                              ${
                                selectedTemplate === t.id
                                  ? "bg-[#5865F2]/10 text-white"
                                  : "text-[#99AAB5] hover:bg-[#1e1f22] hover:text-white"
                              }`}
                          >
                            <span className="text-lg">{t.icon}</span>
                            <span className="font-medium text-sm">
                              {t.name}
                            </span>
                            {selectedTemplate === t.id && (
                              <svg
                                className="w-4 h-4 ml-auto text-[#5865F2]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {currentTemplateObj && currentTemplateObj.id !== "custom" && (
                    <div className="mt-4 p-4 bg-[#1e1f22] rounded-lg border border-[#3f4147]/50">
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

                {/* Team Name Input */}
                <div>
                  <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
                    Team Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#1e1f22] px-4 py-3 rounded-lg border border-[#3f4147] 
                    focus:border-[#5865F2] outline-none text-white text-sm transition-all focus:ring-2 
                    focus:ring-[#5865F2]/30 placeholder-[#99AAB5]/50"
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
                      <button
                        onClick={() => refetchGuilds()}
                        className={`hover:text-white transition-colors ${
                          isFetchingGuilds ? "animate-spin text-[#5865F2]" : ""
                        }`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 
                            0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </label>
                    <button
                      onClick={(e) => toggleDropdown(e, "guild")}
                      className="w-full bg-[#1e1f22] hover:bg-[#25262a] text-sm text-white px-4 py-3 
                      rounded-lg border border-[#3f4147] focus:border-[#5865F2] transition-colors flex 
                      justify-between items-center outline-none focus:ring-2 focus:ring-[#5865F2]/30"
                    >
                      <span className="font-medium truncate pr-4">
                        {isLoadingGuilds
                          ? "Loading..."
                          : selectedGuildObj?.name || "Select a server..."}
                      </span>
                      <svg
                        className={`w-4 h-4 shrink-0 text-[#99AAB5] transition-transform 
                          ${activeDropdown === "guild" ? "rotate-180" : ""}`}
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
                        className="absolute z-50 w-full mt-2 bg-[#2b2d31] border border-[#3f4147] 
                      rounded-lg shadow-2xl max-h-48 overflow-y-auto py-1 custom-scrollbar"
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
                            className={`px-4 py-3 flex items-center justify-between transition-colors 
                              ${
                                g.bot_present
                                  ? "cursor-pointer hover:bg-[#1e1f22] text-white"
                                  : "cursor-default opacity-70 text-[#99AAB5]"
                              }`}
                          >
                            <span className="font-medium text-sm truncate pr-2">
                              {g.name}
                            </span>
                            {!g.bot_present && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}&disable_guild_select=true`,
                                    "_blank",
                                    "width=500,height=700",
                                  );
                                }}
                                className="cursor-pointer shrink-0 text-[10px] px-2.5 py-1 rounded font-bold 
                                uppercase bg-[#23a559] hover:bg-[#1d8a4a] text-white transition-colors"
                              >
                                Invite
                              </button>
                            )}
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
                      className={`w-full bg-[#1e1f22] px-4 py-3 rounded-lg border border-[#3f4147] 
                        transition-colors flex justify-between items-center outline-none 
                        ${
                          !formData.guild_id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-[#25262a] text-white focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/30 cursor-pointer"
                        }`}
                    >
                      <span className="font-medium text-sm truncate pr-4">
                        {!formData.guild_id
                          ? "Select server first..."
                          : isFetchingChannels
                            ? "Loading..."
                            : selectedChannelName || "Select channel..."}
                      </span>
                      <svg
                        className={`w-4 h-4 shrink-0 text-[#99AAB5] transition-transform 
                          ${activeDropdown === "channel" ? "rotate-180" : ""}`}
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
                        className="absolute z-50 w-full mt-2 bg-[#2b2d31] border border-[#3f4147] 
                      rounded-lg shadow-2xl max-h-48 overflow-y-auto py-1 custom-scrollbar"
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
                            className="px-4 py-2.5 text-sm text-[#99AAB5] hover:bg-[#1e1f22] 
                            hover:text-white cursor-pointer flex items-center gap-2"
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

            {/* STEP 2: SCHEDULE */}
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
                  border-[#3f4147] flex items-start gap-2"
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in flex flex-col h-full">
                <h3 className="text-2xl font-bold text-white mb-4">
                  What to ask your team
                </h3>
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
                                className={`flex items-center gap-3 bg-[#1e1f22] p-2 pr-4 rounded-lg 
                                  border transition-all ${
                                    snapshot.isDragging
                                      ? "border-[#5865F2] shadow-2xl scale-[1.02] z-50 bg-[#25262a]"
                                      : "border-[#3f4147] hover:border-[#404249]"
                                  }`}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-[#404249] hover:text-[#99AAB5] cursor-grab 
                                  active:cursor-grabbing p-2 transition-colors"
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
                                <input
                                  type="text"
                                  placeholder="Enter your question here..."
                                  className="flex-1 bg-transparent outline-none text-sm text-white py-2 
                                  placeholder-[#99AAB5]/50"
                                  value={q}
                                  onChange={(e) =>
                                    handleQuestionChange(index, e.target.value)
                                  }
                                />
                                {formData.questions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="cursor-pointer text-[#404249] hover:text-[#da373c] p-1.5 
                                    rounded bg-transparent hover:bg-[#da373c]/10 transition-colors"
                                    title="Remove Question"
                                  >
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
                    className="mt-4 flex items-center gap-2 text-sm text-[#99AAB5] hover:text-[#5865F2] 
                    font-bold transition-colors w-max group"
                  >
                    <div className="bg-[#2b2d31] p-1 rounded group-hover:bg-[#5865F2]/10 transition-colors">
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

          <div className="flex justify-between items-center pt-6 mt-8 border-t border-[#3f4147]">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="cursor-pointer px-6 py-2.5 rounded-lg font-bold text-sm text-[#99AAB5] 
              hover:text-white hover:bg-[#2b2d31] transition-colors"
            >
              {currentStep === 1 ? "Cancel" : "← Back"}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer bg-[#5865F2] hover:bg-[#4752C4] px-8 py-2.5 rounded-lg 
                font-bold text-sm text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
                className={`cursor-pointer bg-[#23a559] hover:bg-[#1d8a4a] px-8 py-2.5 rounded-lg 
                  font-bold text-sm text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 
                  flex items-center gap-2 ${isCreating ? "opacity-70 pointer-events-none cursor-not-allowed" : ""}`}
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
                    </svg>
                    Creating...
                  </>
                ) : (
                  "✨ Finish Setup"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
