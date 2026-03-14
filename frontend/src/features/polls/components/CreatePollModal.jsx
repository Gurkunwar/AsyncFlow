import React, { useState, useEffect } from "react";
import {
  useGetUserGuildsQuery,
  useGetGuildChannelsQuery,
  useCreatePollMutation,
} from "../../../store/apiSlice";

const POLL_DURATIONS = [
  { value: 1, label: "1 Hour" },
  { value: 4, label: "4 Hours" },
  { value: 8, label: "8 Hours" },
  { value: 24, label: "24 Hours" },
  { value: 72, label: "3 Days" },
  { value: 168, label: "1 Week" },
];

export default function CreatePollModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [formData, setFormData] = useState({
    guild_id: "",
    report_channel_id: "",
    question: "",
    duration: 24,
    options: ["", ""],
  });

  const {
    data: guilds = [],
    isLoading: isLoadingGuilds,
    isFetching: isFetchingGuilds,
    refetch: refetchGuilds,
  } = useGetUserGuildsQuery(undefined, { skip: !isOpen });

  const { data: channels = [], isFetching: isFetchingChannels } =
    useGetGuildChannelsQuery(formData.guild_id, { skip: !formData.guild_id });

  const [createPoll, { isLoading: isCreating }] = useCreatePollMutation();

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
      setActiveDropdown(null);
      setFormData({
        guild_id: "",
        report_channel_id: "",
        question: "",
        duration: 24,
        options: ["", ""],
      });
    }
  }, [isOpen]);

  const toggleDropdown = (e, dropdownName) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleNext = () => {
    if (
      currentStep === 1 &&
      (!formData.guild_id || !formData.report_channel_id)
    ) {
      alert("Please select a server and a channel before continuing.");
      return;
    }
    if (currentStep === 2 && !formData.question.trim()) {
      alert("Please enter a question for your poll.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    const cleanedOptions = formData.options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (cleanedOptions.length < 2) {
      alert("Please provide at least 2 valid options for the poll.");
      return;
    }

    try {
      await createPoll({
        guild_id: formData.guild_id,
        channel_id: formData.report_channel_id,
        question: formData.question.trim(),
        duration: formData.duration,
        options: cleanedOptions,
      }).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to create poll", err);
      alert("Failed to create poll.");
    }
  };

  if (!isOpen) return null;

  const selectedChannelName = channels.find(
    (c) => c.id === formData.report_channel_id,
  )?.name;
  const selectedGuildObj = guilds.find((g) => g.id === formData.guild_id);
  const selectedDurationLabel = POLL_DURATIONS.find(
    (d) => d.value === formData.duration,
  )?.label;

  const steps = [
    { num: 1, title: "Location", desc: "Server & Channel" },
    { num: 2, title: "Details", desc: "Question & Duration" },
    { num: 3, title: "Options", desc: "Poll Answers" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#313338] w-full max-w-4xl rounded-2xl border border-[#1e1f22] shadow-2xl flex min-h-137.5"
      >
        <div className="w-1/3 bg-[#2b2d31] p-8 border-r border-[#1e1f22] hidden md:block rounded-l-2xl">
          <h2 className="text-xl font-extrabold text-white mb-8 flex items-center gap-2">
            <span className="text-[#5865F2]">🗳️</span> New Poll
          </h2>
          <div
            className="space-y-8 relative before:absolute before:inset-0 before:ml-3.75 before:-translate-x-px 
          md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b 
          before:from-transparent before:via-[#404249] before:to-transparent"
          >
            {steps.map((step) => (
              <div key={step.num} className="relative flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 
                    z-10 transition-colors shadow-md ${
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

        <div
          className="flex-1 flex flex-col p-6 md:p-10 bg-[#313338] rounded-2xl md:rounded-l-none 
        md:rounded-r-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative"
        >
          <div className="flex-1">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Where should we post this?
                </h3>

                <div className="space-y-6">
                  {/* Custom Guild Dropdown */}
                  <div className="relative">
                    <label
                      className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 
                    flex justify-between items-center"
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 
                            01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </label>
                    <button
                      onClick={(e) => toggleDropdown(e, "guild")}
                      className="w-full bg-[#1e1f22] hover:bg-[#25262a] text-sm text-white px-4 py-3.5 
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
                      Post In Channel
                    </label>
                    <button
                      onClick={(e) =>
                        formData.guild_id &&
                        channels.length > 0 &&
                        toggleDropdown(e, "channel")
                      }
                      disabled={!formData.guild_id}
                      className={`w-full bg-[#1e1f22] px-4 py-3.5 rounded-lg border border-[#3f4147] 
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
                        className="absolute z-50 w-full mt-2 bg-[#2b2d31] border border-[#3f4147] rounded-lg 
                      shadow-2xl max-h-48 overflow-y-auto py-1 custom-scrollbar"
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
                            className="px-4 py-3 text-sm text-[#99AAB5] hover:bg-[#1e1f22] hover:text-white 
                            cursor-pointer flex items-center gap-2"
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

            {/* STEP 2: DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-6">
                  What's the question?
                </h3>

                <div>
                  <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
                    Question
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#1e1f22] px-4 py-3.5 rounded-lg border border-[#3f4147] 
                    focus:border-[#5865F2] outline-none text-white text-sm transition-all focus:ring-2 
                    focus:ring-[#5865F2]/30 placeholder-[#99AAB5]/50"
                    placeholder="e.g. What are we doing for lunch?"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="relative">
                  <label className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider mb-2 block">
                    Duration
                  </label>
                  <button
                    onClick={(e) => toggleDropdown(e, "duration")}
                    className="w-full bg-[#1e1f22] hover:bg-[#25262a] px-4 py-3.5 rounded-lg border 
                    border-[#3f4147] focus:border-[#5865F2] transition-colors flex justify-between items-center 
                    outline-none focus:ring-2 focus:ring-[#5865F2]/30 cursor-pointer text-white text-sm"
                  >
                    <span className="font-medium">
                      {selectedDurationLabel || "Select duration..."}
                    </span>
                    <svg
                      className={`w-4 h-4 shrink-0 text-[#99AAB5] transition-transform 
                        ${activeDropdown === "duration" ? "rotate-180" : ""}`}
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

                  {activeDropdown === "duration" && (
                    <div
                      className="absolute z-50 w-full mt-2 bg-[#2b2d31] border border-[#3f4147] rounded-lg 
                    shadow-2xl py-1 overflow-hidden"
                    >
                      {POLL_DURATIONS.map((d) => (
                        <div
                          key={d.value}
                          onClick={() => {
                            setFormData({ ...formData, duration: d.value });
                            setActiveDropdown(null);
                          }}
                          className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors 
                            ${
                              formData.duration === d.value
                                ? "bg-[#5865F2]/10 text-white"
                                : "text-[#99AAB5] hover:bg-[#1e1f22] hover:text-white"
                            }`}
                        >
                          <span className="font-medium text-sm">{d.label}</span>
                          {formData.duration === d.value && (
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
                  <p
                    className="text-xs text-[#99AAB5] mt-3 bg-[#2b2d31] p-3 rounded-lg border border-[#3f4147] 
                  flex items-start gap-2"
                  >
                    <span className="text-lg">🔒</span>
                    <span>
                      Discord will automatically lock the poll and prevent new
                      votes after this time has passed.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: OPTIONS */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in flex flex-col h-full">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Add your answers
                </h3>

                <label
                  className="text-[11px] font-extrabold text-[#99AAB5] uppercase tracking-wider flex 
                justify-between items-center mb-2"
                >
                  <span>Options</span>
                  <span className="text-[10px] bg-[#1e1f22] px-2 py-0.5 rounded border border-[#404249]">
                    {formData.options.length}/10
                  </span>
                </label>

                <div className="space-y-3">
                  {formData.options.map((opt, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 group relative"
                    >
                      <div
                        className="text-[#99AAB5] font-bold w-6 h-6 flex justify-center items-center 
                      bg-[#1e1f22] rounded-full text-xs shrink-0 border border-[#3f4147]"
                      >
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        className="flex-1 bg-[#1e1f22] px-4 py-3 rounded-lg border border-[#3f4147] 
                        focus:border-[#5865F2] outline-none text-white text-sm transition-all focus:ring-2 
                        focus:ring-[#5865F2]/30 placeholder-[#99AAB5]/50"
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        required
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="absolute right-3 cursor-pointer text-[#404249] hover:text-[#da373c] 
                          p-1.5 rounded bg-[#1e1f22] hover:bg-[#da373c]/10 transition-colors opacity-0 
                          group-hover:opacity-100"
                          title="Remove Option"
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
                  ))}
                </div>

                {formData.options.length < 10 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-4 flex items-center gap-2 text-sm text-[#99AAB5] hover:text-[#5865F2] font-bold
                    transition-colors w-max group"
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
                    Add another option
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 mt-8 border-t border-[#3f4147]">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="cursor-pointer px-6 py-2.5 rounded-lg font-bold text-sm text-[#99AAB5] hover:text-white 
              hover:bg-[#2b2d31] transition-colors"
            >
              {currentStep === 1 ? "Cancel" : "← Back"}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer bg-[#5865F2] hover:bg-[#4752C4] px-8 py-2.5 rounded-lg font-bold text-sm 
                text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
                className={`cursor-pointer bg-[#23a559] hover:bg-[#1d8a4a] px-8 py-2.5 rounded-lg font-bold text-sm 
                  text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                        5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  "✨ Publish to Discord"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
}