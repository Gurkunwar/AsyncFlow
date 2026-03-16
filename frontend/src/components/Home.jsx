import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function useIntersectionObserver(options = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up", "opacity-100");
          entry.target.classList.remove("opacity-0", "translate-y-8");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, ...options },
    );

    if (elementRef.current) {
      elementRef.current.classList.add(
        "opacity-0",
        "translate-y-8",
        "transition-all",
        "duration-1000",
        "ease-out",
      );
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return elementRef;
}

const ScrollFadeIn = ({ children, delay = 0, className = "" }) => {
  const ref = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={className}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Automated Routines",
      desc: "Set your schedule and let AsyncFlow prompt your team automatically. No more manual pings.",
    },
    {
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 
            2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Rich Web Dashboard",
      desc: "Review daily updates, spot active blockers instantly, and export reports to CSV for stakeholders.",
    },
    {
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Smart Polls & Check-ins",
      desc: "Gauge team health, vote on sprint priorities, and gather quick consensus right inside Discord.",
    },
    {
      icon: (
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
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 
            8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Timezone Aware",
      desc: "Remote work spans the globe. AsyncFlow respects local timezones so nobody gets pinged at 3 AM.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Add to Server",
      desc: "Invite the bot to your Discord and log in.",
    },
    {
      num: "02",
      title: "Set Rules",
      desc: "Define your questions and standup schedule.",
    },
    {
      num: "03",
      title: "Go Async",
      desc: "Team answers in chat. You review online.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#1e1f22] font-sans text-white selection:bg-[#5865F2] 
    selection:text-white overflow-x-hidden"
    >
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-16 flex flex-col items-center text-center">
        <ScrollFadeIn delay={0}>
          <div
            className="inline-block bg-[#2b2d31] text-[#5865F2] font-semibold px-4 py-1.5 
          rounded-full text-sm mb-8 border border-[#3f4147] shadow-sm"
          >
            ✨ Built for modern remote teams
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={100}>
          <h1
            className="animate-fade-in-up [animation-delay:100ms] text-5xl md:text-7xl font-extrabold 
          tracking-tight mb-8 text-white md:text-transparent bg-clip-text bg-linear-to-r from-white via-gray-200 
          to-[#99AAB5] leading-tight max-w-4xl"
          >
            Kill the sync meetings. <br className="hidden md:block" />
            Embrace <span className="text-[#5865F2]">AsyncFlow</span>.
          </h1>
        </ScrollFadeIn>

        <ScrollFadeIn delay={200}>
          <p className="text-lg md:text-xl text-[#99AAB5] max-w-2xl mb-12 leading-relaxed">
            AsyncFlow lives directly in your Discord server. Collect daily
            updates, spot blockers early, and track team progress without ever
            leaving your workflow.
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn delay={300}>
          <button
            onClick={() => navigate("/login")}
            className="group bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-4 px-8 
            rounded-xl text-lg flex items-center gap-3 transition-all duration-300 
            shadow-[0_0_20px_rgba(88,101,242,0.3)] hover:shadow-[0_0_40px_rgba(88,101,242,0.6)] 
            hover:-translate-y-1 cursor-pointer"
          >
            <svg
              className="w-6 h-6 transform transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 127.14 96.36"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,
              0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,
              105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,
              32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,
              1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,
              0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,
              0,.04-.06.09-.09C129.67,52.82,122.93,28.21,107.7,8.07ZM42.45,65.69C36.18,65.69,
              31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,
              0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.3,46,96.19,53,91.08,65.69,
              84.69,65.69Z"
              />
            </svg>
            Add to Discord
          </button>
        </ScrollFadeIn>
      </main>

      {/* Feature Section 1: Standups */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <ScrollFadeIn className="lg:w-1/2" delay={100}>
            <div className="text-[#5865F2] font-bold tracking-wider uppercase mb-2 text-sm">
              Automated Standups
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Keep everyone aligned, <br />
              asynchronously.
            </h2>
            <p className="text-[#99AAB5] text-lg mb-8 leading-relaxed">
              No more interrupting deep work for a 15-minute status update.
              AsyncFlow prompts your team at their scheduled time, collects
              their responses, and formats them into a clean, scannable thread.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#43b581]"
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
                Customizable questions for any workflow
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#43b581]"
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
                Easy "Skip" options for PTO days
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#43b581]"
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
                Works flawlessly in Direct Messages
              </li>
            </ul>
          </ScrollFadeIn>

          <ScrollFadeIn className="lg:w-1/2 w-full" delay={300}>
            {/* MOCKUP 1: Standups */}
            <div
              className="bg-[#313338] rounded-xl border border-[#3f4147] shadow-2xl overflow-hidden 
            flex flex-col group h-100 hover:-translate-y-2 transition-transform duration-500"
            >
              <div
                className="bg-[#2b2d31] px-4 py-3 border-b border-[#1e1f22] flex items-center 
              justify-between shrink-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#da373c]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#faa61a]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#43b581]"></div>
                  <div className="ml-4 flex gap-4">
                    <span className="text-xs font-bold text-[#f2f3f5] tracking-widest uppercase flex items-center gap-1">
                      <span className="text-[#99AAB5]">#</span> daily-standup
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex gap-4">
                  <img
                    src="/asyncflow-logo.svg"
                    alt="Bot"
                    className="w-10 h-10 rounded-full shadow-sm bg-[#1e1f22] p-1 shrink-0"
                  />
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-white text-[15px]">
                        AsyncFlow
                      </span>
                      <span
                        className="bg-[#5865F2] text-white text-[9px] px-1.5 rounded uppercase 
                      font-bold tracking-wide"
                      >
                        Bot
                      </span>
                      <span className="text-xs text-[#99AAB5]">
                        Today at 9:00 AM
                      </span>
                    </div>
                    <p className="text-gray-300 text-[15px] mb-3">
                      Ready to submit your daily standup?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="bg-[#5865F2] text-white px-4 py-1.5 rounded text-sm font-semibold 
                      hover:bg-[#4752C4] transition-colors cursor-default"
                      >
                        Fill Standup
                      </button>
                      <button
                        className="bg-[#4e5058] text-white px-4 py-1.5 rounded text-sm font-semibold 
                      hover:bg-[#6d6f78] transition-colors cursor-default"
                      >
                        ⏭️ Skip Today
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="flex gap-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity 
                duration-700 lg:delay-300"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-blue-500 shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-white text-[15px]">
                        AlexDev
                      </span>
                      <span className="text-xs text-[#99AAB5]">
                        Today at 9:04 AM
                      </span>
                    </div>
                    <div className="bg-[#2b2d31] border-l-4 border-[#5865F2] rounded-r-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src="/asyncflow-logo.svg"
                          className="w-5 h-5 rounded-full bg-[#1e1f22] p-0.5"
                          alt="author"
                        />
                        <span className="text-white font-bold text-sm">
                          AlexDev's Standup
                        </span>
                      </div>
                      <h4 className="text-[#5865F2] font-bold mb-1">
                        🚀 Engineering Update
                      </h4>
                      <p className="text-gray-300 text-[13px] mb-4">
                        Progress report from **AlexDev**
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[13px] font-bold text-white mb-1">
                            What did you do yesterday?
                          </p>
                          <p className="text-gray-300 text-[13px]">
                            👉 Shipped the new Redis cache layer.
                          </p>
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white mb-1">
                            Any blockers?
                          </p>
                          <p className="text-[#da373c] text-[13px]">
                            👉 Blocked waiting for PR #142 review.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Feature Section 2: Polls */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-[#3f4147]/30">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <ScrollFadeIn className="lg:w-1/2" delay={100}>
            <div className="text-[#38bdf8] font-bold tracking-wider uppercase mb-2 text-sm">
              Native Polls
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Decisions made simple.
            </h2>
            <p className="text-[#99AAB5] text-lg mb-8 leading-relaxed">
              Stop endlessly scrolling through chat to count emojis. Launch
              beautiful, interactive native Discord polls to gauge team health,
              vote on sprint priorities, or just decide what's for lunch.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#38bdf8]"
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
                Utilizes Discord's new native poll UI
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#38bdf8]"
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
                Set custom expiration timers
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#38bdf8]"
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
                Audit logs available for server admins
              </li>
            </ul>
          </ScrollFadeIn>

          <ScrollFadeIn className="lg:w-1/2 w-full" delay={300}>
            {/* MOCKUP 2: Polls */}
            <div
              className="bg-[#313338] rounded-xl border border-[#3f4147] shadow-2xl overflow-hidden 
            flex flex-col group h-100 hover:-translate-y-2 transition-transform duration-500"
            >
              <div
                className="bg-[#2b2d31] px-4 py-3 border-b border-[#1e1f22] flex items-center 
              justify-between shrink-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#da373c]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#faa61a]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#43b581]"></div>
                  <div className="ml-4 flex gap-4">
                    <span className="text-xs font-bold text-[#f2f3f5] tracking-widest uppercase flex items-center gap-1">
                      <span className="text-[#99AAB5]">#</span> team-decisions
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex gap-4 items-center pl-14 opacity-70">
                  <span className="text-[#99AAB5] text-xs font-bold">
                    AlexDev used
                  </span>
                  <span
                    className="bg-[#4752C4]/20 text-[#99AAB5] text-xs px-1.5 py-0.5 rounded 
                  font-mono border border-[#4752C4]/30"
                  >
                    /poll
                  </span>
                </div>

                <div className="flex gap-4">
                  <img
                    src="/asyncflow-logo.svg"
                    alt="Bot"
                    className="w-10 h-10 rounded-full shadow-sm bg-[#1e1f22] p-1 shrink-0"
                  />
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-white text-[15px]">
                        AsyncFlow
                      </span>
                      <span
                        className="bg-[#5865F2] text-white text-[9px] px-1.5 rounded uppercase 
                      font-bold tracking-wide"
                      >
                        Bot
                      </span>
                      <span className="text-xs text-[#99AAB5]">
                        Today at 10:30 AM
                      </span>
                    </div>

                    <div className="bg-[#2b2d31] border border-[#1e1f22] rounded-xl p-4 shadow-sm mt-2 w-full max-w-90">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-xl bg-[#1e1f22] p-1.5 rounded-md">
                          📊
                        </span>
                        <div>
                          <h4 className="text-white font-bold text-[15px] leading-tight">
                            What feature should we tackle next sprint?
                          </h4>
                          <p className="text-xs text-[#99AAB5] mt-1">
                            Select one or more answers
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div
                          className="relative bg-[#1e1f22] border border-[#5865F2] rounded-lg p-3 
                        overflow-hidden transition-all duration-1000"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-[#5865F2]/20 w-[60%] lg:w-0 lg:group-hover:w-[60%] 
                          z-0 rounded-l-lg transition-all duration-1000 ease-out lg:delay-500"
                          ></div>
                          <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded border-2 border-[#5865F2] bg-[#5865F2] 
                              flex items-center justify-center"
                              >
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <span className="text-[14px] text-white font-semibold">
                                User Settings Page
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
                            transition-opacity duration-500 lg:delay-1000"
                            >
                              <div className="flex -space-x-1">
                                <div
                                  className="w-4 h-4 rounded-full bg-linear-to-tr from-blue-500 
                                to-cyan-400 border border-[#1e1f22]"
                                ></div>
                                <div
                                  className="w-4 h-4 rounded-full bg-linear-to-tr from-green-500 
                                to-emerald-400 border border-[#1e1f22]"
                                ></div>
                                <div
                                  className="w-4 h-4 rounded-full bg-linear-to-tr from-red-500 
                                to-orange-400 border border-[#1e1f22]"
                                ></div>
                              </div>
                              <span className="text-xs text-white font-bold">
                                60%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="relative bg-[#1e1f22] border border-[#3f4147] rounded-lg p-3 overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-[#3f4147]/50 w-[30%] lg:w-0 lg:group-hover:w-[30%] 
                          z-0 rounded-l-lg transition-all duration-1000 ease-out lg:delay-500"
                          ></div>
                          <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded border-2 border-[#80848e]"></div>
                              <span className="text-[14px] text-gray-300 font-medium">
                                Jira Integration
                              </span>
                            </div>
                            <span
                              className="text-xs text-[#99AAB5] font-bold opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
                            transition-opacity duration-500 lg:delay-1000"
                            >
                              30%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-xs font-medium text-[#99AAB5] flex items-center justify-between">
                        <span
                          className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity 
                        duration-500 lg:delay-1000"
                        >
                          5 votes
                        </span>
                        <span>Ends in 24 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Feature Section 3: Dashboard & History */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-[#3f4147]/30">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <ScrollFadeIn className="lg:w-1/2" delay={100}>
            <div className="text-[#a855f7] font-bold tracking-wider uppercase mb-2 text-sm">
              Dashboard & History
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Data that drives <br />
              decisions.
            </h2>
            <p className="text-[#99AAB5] text-lg mb-8 leading-relaxed">
              Don't let valuable team updates get lost in the chat history. The
              AsyncFlow web dashboard provides a bird's-eye view of your team's
              health, auto-detects blockers, and lets you review past logs
              instantly.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#a855f7]"
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
                AI-powered blocker detection
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#a855f7]"
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
                Filterable history for performance reviews
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#a855f7]"
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
                One-click CSV exports for stakeholders
              </li>
            </ul>
          </ScrollFadeIn>

          <ScrollFadeIn className="lg:w-1/2 w-full" delay={300}>
            {/* MOCKUP 3: Web Dashboard/History Table */}
            <div
              className="bg-[#1e1f22] rounded-xl border border-[#3f4147] shadow-2xl overflow-hidden 
            flex flex-col h-100 hover:-translate-y-2 transition-transform duration-500"
            >
              {/* Fake Browser Top */}
              <div className="bg-[#2b2d31] px-4 py-2 border-b border-[#1e1f22] flex items-center gap-3 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#da373c]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#faa61a]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#43b581]"></div>
                </div>
                <div
                  className="bg-[#1e1f22] rounded-md px-3 py-1 text-xs text-[#99AAB5] flex-1 
                text-center font-medium mx-4"
                >
                  app.asyncflow.space/history
                </div>
              </div>

              <div className="p-5 flex-1 bg-[#2b2d31]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Standup Logs</h3>
                  <button
                    className="bg-[#43b581] text-white text-[10px] font-bold px-3 py-1.5 
                  rounded flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      ></path>
                    </svg>
                    Export CSV
                  </button>
                </div>

                <div className="border border-[#3f4147] rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#1e1f22] text-[#99AAB5]">
                      <tr>
                        <th className="p-2 font-semibold">Date</th>
                        <th className="p-2 font-semibold">User</th>
                        <th className="p-2 font-semibold">Status</th>
                        <th className="p-2 font-semibold truncate max-w-30">
                          Blockers?
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3f4147]">
                      <tr className="bg-[#2b2d31] hover:bg-[#35373c]">
                        <td className="p-2 text-[#99AAB5]">Today</td>
                        <td className="p-2 font-medium flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                          AlexDev
                        </td>
                        <td className="p-2">
                          <span className="bg-[#da373c]/20 text-[#da373c] px-1.5 py-0.5 rounded font-bold">
                            Blocked
                          </span>
                        </td>
                        <td className="p-2 text-gray-300 truncate max-w-30">
                          Waiting for PR #142 review.
                        </td>
                      </tr>
                      <tr className="bg-[#2f3136] hover:bg-[#35373c]">
                        <td className="p-2 text-[#99AAB5]">Yesterday</td>
                        <td className="p-2 font-medium flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          SarahP
                        </td>
                        <td className="p-2">
                          <span className="bg-[#43b581]/20 text-[#43b581] px-1.5 py-0.5 rounded font-bold">
                            Submitted
                          </span>
                        </td>
                        <td className="p-2 text-gray-300 truncate max-w-30">
                          None. Smooth sailing.
                        </td>
                      </tr>
                      <tr className="bg-[#2b2d31] hover:bg-[#35373c]">
                        <td className="p-2 text-[#99AAB5]">Mar 10</td>
                        <td className="p-2 font-medium flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                          MikeT
                        </td>
                        <td className="p-2">
                          <span className="bg-[#99AAB5]/20 text-[#99AAB5] px-1.5 py-0.5 rounded font-bold">
                            Skipped
                          </span>
                        </td>
                        <td className="p-2 text-gray-400 italic">
                          No data reported
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <ScrollFadeIn delay={100}>
        <section className="bg-[#232428] border-y border-[#3f4147]/30 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything an agile team needs
              </h2>
              <p className="text-[#99AAB5] max-w-2xl mx-auto">
                No complex setups. No steep learning curves. Just pure
                productivity right where you already chat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-[#2b2d31] p-6 rounded-2xl border border-[#3f4147]/50 hover:border-[#5865F2] 
                  transition-colors shadow-sm group hover:-translate-y-1 duration-300"
                >
                  <div
                    className="w-12 h-12 bg-[#5865F2]/10 text-[#5865F2] rounded-lg flex items-center 
                  justify-center mb-5 group-hover:scale-110 transition-transform"
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-[#99AAB5] text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* How it Works / Steps */}
      <ScrollFadeIn delay={100}>
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-[#99AAB5]">
              Set it up once, save hours every week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-[#3f4147] z-0"></div>

            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 bg-[#1e1f22] border-2 border-[#5865F2] text-[#5865F2] 
                text-xl font-extrabold rounded-full flex items-center justify-center mb-6 
                shadow-[0_0_15px_rgba(88,101,242,0.2)] hover:scale-110 transition-transform duration-300"
                >
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-[#99AAB5] text-sm max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollFadeIn>

      {/* Bottom CTA */}
      <ScrollFadeIn delay={100}>
        <section className="bg-linear-to-t from-[#2b2d31] to-[#1e1f22] py-24 text-center px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to upgrade your workflow?
          </h2>
          <p className="text-[#99AAB5] mb-10 max-w-xl mx-auto">
            Join smart teams using AsyncFlow to run better, faster, and more
            asynchronous daily standups.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-black font-bold py-4 px-10 rounded-full text-lg hover:scale-105 
            transition-transform shadow-lg cursor-pointer"
          >
            Try AsyncFlow for Free
          </button>
        </section>
      </ScrollFadeIn>

      {/* Footer */}
      <footer className="bg-[#1e1f22] border-t border-[#3f4147]/50 py-10 px-6 text-center text-sm text-[#99AAB5]">
        <div className="flex justify-center items-center gap-2 mb-4">
          <img
            src="/asyncflow-logo.svg"
            alt="Logo"
            className="w-5 h-5 opacity-50 grayscale"
          />
          <span className="font-semibold tracking-wide">AsyncFlow</span>
        </div>
        <p>
          © {new Date().getFullYear()} AsyncFlow. Built to make work better.
        </p>
      </footer>
    </div>
  );
}
