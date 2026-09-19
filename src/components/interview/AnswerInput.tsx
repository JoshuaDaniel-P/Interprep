"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Send,
  Lightbulb,
  Mic,
  MicOff,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Award,
  Activity,
  Zap,
  Volume2,
  Sparkles,
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";

interface AnswerInputProps {
  onSubmit: (answerText: string) => void;
  isSubmitting?: boolean;
}

// Common conversational filler words in spoken technical interviews
const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "you know",
  "actually",
  "basically",
  "literally",
  "sort of",
  "kind of",
  "i mean",
];

const STAR_ASSERTION_KEYWORDS = [
  "implemented",
  "architected",
  "reduced",
  "increased",
  "improved",
  "optimized",
  "resolved",
  "delivered",
  "led",
  "designed",
  "metric",
  "latency",
  "throughput",
  "result",
  "trade-off",
];

export function AnswerInput({ onSubmit, isSubmitting = false }: AnswerInputProps) {
  const {
    currentQuestion,
    currentQuestionIndex,
    errorMessage,
    retryLastAnswer,
    finishEarlyAndEvaluate,
  } = useInterview();

  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speakingDurationSeconds, setSpeakingDurationSeconds] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 40, 60, 35, 75, 45, 20]);

  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech-to-Text Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN"; // Indian English Speech-to-Text

        recognition.onresult = (event: any) => {
          let finalSessionTranscript = "";
          let interimSessionTranscript = "";

          for (let i = 0; i < event.results.length; i++) {
            const part = event.results[i][0]?.transcript || "";
            if (event.results[i].isFinal) {
              finalSessionTranscript += " " + part;
            } else {
              interimSessionTranscript += " " + part;
            }
          }

          const base = baseTextRef.current;
          const combined = `${base} ${finalSessionTranscript} ${interimSessionTranscript}`
            .replace(/\s+/g, " ")
            .trim();

          setText(combined);
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e);
          stopListening();
        };

        recognition.onend = () => {
          stopListening();
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      cleanupAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Cleanup Web Audio resources
  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((t) => t.stop());
      microphoneStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Start Web Audio Frequency Analyser
  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Pick 12 representative frequency bins
        const bins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const levels = bins.map((bin) => {
          const val = dataArray[bin] || 0;
          return Math.max(12, Math.min(100, Math.round((val / 255) * 100)));
        });

        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
    } catch {
      // If mic permission blocked, fallback to gentle simulated soundwave
      const fallbackInterval = setInterval(() => {
        setAudioLevels((prev) =>
          prev.map(() => Math.floor(Math.random() * 55) + 20)
        );
      }, 120);

      speakingTimerRef.current = fallbackInterval;
    }
  };

  const startListening = () => {
    baseTextRef.current = text.trim();
    try {
      recognitionRef.current?.start();
      setIsListening(true);
      setSpeakingDurationSeconds(0);

      // Start elapsed duration timer for pace (WPM) calculation
      const timer = setInterval(() => {
        setSpeakingDurationSeconds((s) => s + 1);
      }, 1000);
      speakingTimerRef.current = timer;

      startAudioVisualizer();
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
    cleanupAudio();
    setAudioLevels([15, 25, 40, 60, 35, 75, 45, 20]);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Real-time Speech Identification, Confidence & Suggestions Analysis
  const speechAnalysis = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        wordCount: 0,
        paceWpm: 0,
        paceStatus: "Awaiting Input",
        fillerCount: 0,
        detectedFillers: [] as string[],
        confidenceScore: 0,
        confidenceLevel: "Pending",
        suggestions: ["Speak or type your answer clearly using the STAR method."],
      };
    }

    const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Calculate Pace (Words Per Minute)
    const effectiveMinutes = Math.max(speakingDurationSeconds, 12) / 60;
    const paceWpm = Math.round(wordCount / effectiveMinutes);

    let paceStatus = "Optimal Pace";
    if (paceWpm < 100) paceStatus = "Deliberate Pace";
    else if (paceWpm > 165) paceStatus = "Rapid Cadence";

    // Detect Filler Words
    const detectedFillers: string[] = [];
    const textLower = trimmed.toLowerCase();

    FILLER_WORDS.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = textLower.match(regex);
      if (matches) {
        matches.forEach(() => detectedFillers.push(filler));
      }
    });

    // Detect Assertive / STAR Technical Keywords
    let assertionPoints = 0;
    STAR_ASSERTION_KEYWORDS.forEach((kw) => {
      if (textLower.includes(kw)) assertionPoints++;
    });

    // Compute Dynamic Delivery Confidence (0–100%)
    let score = 82; // Solid neutral baseline

    // Adjust for pace
    if (paceWpm >= 115 && paceWpm <= 155) score += 6;
    else if (paceWpm > 175) score -= 8;
    else if (paceWpm < 85) score -= 6;

    // Deduct for filler words
    score -= detectedFillers.length * 6;

    // Reward assertive STAR terminology
    score += Math.min(assertionPoints * 4, 16);

    // Reward substantive length
    if (wordCount >= 45) score += 6;
    if (wordCount < 15) score -= 12;

    const confidenceScore = Math.max(25, Math.min(96, score));

    let confidenceLevel: "High Confidence" | "Steady Delivery" | "Hesitant" = "Steady Delivery";
    if (confidenceScore >= 80) confidenceLevel = "High Confidence";
    else if (confidenceScore < 60) confidenceLevel = "Hesitant";

    // Generate Targeted Real-Time Suggestions
    const suggestions: string[] = [];

    if (detectedFillers.length > 0) {
      const unique = Array.from(new Set(detectedFillers)).slice(0, 2).join("', '");
      suggestions.push(`Detected filler word ('${unique}'). Pause silently instead of bridging with filler sounds.`);
    }

    if (paceWpm > 170) {
      suggestions.push("Speaking slightly fast (>170 WPM). Pace yourself to give the interviewer time to absorb key points.");
    } else if (paceWpm < 85 && wordCount > 10) {
      suggestions.push("Steady pace detected. Accelerate smoothly into the concrete Actions you took.");
    }

    if (assertionPoints >= 2) {
      suggestions.push("Strong assertive technical phrasing detected. Excellent execution-oriented language!");
    } else if (wordCount > 25) {
      suggestions.push("Tip: Mention an engineering trade-off or quantifiable metric (e.g. % latency decrease) to seal the answer.");
    }

    if (suggestions.length === 0) {
      suggestions.push("Delivery is structured and articulate. Keep this confident delivery going!");
    }

    return {
      wordCount,
      paceWpm,
      paceStatus,
      fillerCount: detectedFillers.length,
      detectedFillers: Array.from(new Set(detectedFillers)),
      confidenceScore,
      confidenceLevel,
      suggestions: suggestions.slice(0, 2),
    };
  }, [text, speakingDurationSeconds]);

  const isYesNoQuestion =
    currentQuestion?.questionType === "yes_no" || !!currentQuestion?.yesNoOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    if (isListening) {
      stopListening();
    }

    baseTextRef.current = "";
    onSubmit(text.trim());
    setText("");
    setSpeakingDurationSeconds(0);
  };

  const handleQuickYesNo = (val: "Yes" | "No") => {
    if (isSubmitting) return;
    if (isListening) {
      stopListening();
    }
    baseTextRef.current = "";
    onSubmit(val);
    setText("");
    setSpeakingDurationSeconds(0);
  };

  return (
    <div className="glass-secondary p-6 sm:p-7 space-y-4 rounded-[30px] border-white/95">
      {/* Error Alert with Safe Retry */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-300/60 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-bold">{errorMessage}</span>
          </div>
          {retryLastAnswer && (
            <button
              type="button"
              onClick={retryLastAnswer}
              disabled={isSubmitting}
              className="glass-button-secondary px-4 py-1.5 text-xs text-rose-800 gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
              Retry Submission
            </button>
          )}
        </div>
      )}

      {/* Yes / No Quick Response Option */}
      {isYesNoQuestion && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-900 uppercase tracking-wider">
              Direct Screening Question
            </span>
            <span className="text-xs text-blue-700 font-semibold">Quick Answer or Elaborate Below</span>
          </div>
          <p className="text-xs text-blue-950 font-medium">
            Select Yes or No to proceed. The interviewer will adapt the follow-up question based on your experience.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickYesNo("Yes")}
              className="px-6 py-2 rounded-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex items-center shadow-xs cursor-pointer transition-all active:scale-[0.97]"
            >
              <Check className="w-4 h-4" />
              Yes
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickYesNo("No")}
              className="glass-button-secondary px-6 py-2 text-xs font-bold gap-2 flex items-center"
            >
              <X className="w-4 h-4 text-slate-500" />
              No
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* REAL-TIME SPEECH IDENTIFICATION, CONFIDENCE & AUDIO WAVEFORM BAR */}
      {/* =================================================================== */}
      {(isListening || text.trim().length > 0) && (
        <div className="glass-capsule p-4 rounded-2xl border-white/95 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Audio Waveform Visualizer */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 shrink-0">
                {isListening ? <Activity className="w-4 h-4 animate-pulse text-blue-600" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
              </div>

              {/* Reactive Audio Frequency Waveform Bars */}
              <div className="flex items-center gap-1 h-6">
                {audioLevels.slice(0, 10).map((lvl, idx) => (
                  <span
                    key={idx}
                    style={{ height: `${Math.max(15, lvl)}%` }}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isListening
                        ? "bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs font-black text-slate-700">
                {isListening ? "Speech Analysis Active" : "Delivery Analysis"}
              </span>
            </div>

            {/* Speech Identification & Confidence Badges */}
            <div className="flex items-center gap-2">
              {/* Confidence Meter Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs border ${
                  speechAnalysis.confidenceScore >= 80
                    ? "bg-emerald-500/15 text-emerald-900 border-emerald-300"
                    : speechAnalysis.confidenceScore >= 60
                    ? "bg-blue-500/15 text-blue-900 border-blue-300"
                    : "bg-amber-500/15 text-amber-900 border-amber-300"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>{speechAnalysis.confidenceLevel} ({speechAnalysis.confidenceScore}%)</span>
              </div>

              {/* Delivery Pace Badge */}
              {speechAnalysis.wordCount > 5 && (
                <div className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/80 text-slate-700 border border-white/90">
                  {speechAnalysis.paceWpm} WPM • {speechAnalysis.paceStatus}
                </div>
              )}

              {/* Filler Words Badge */}
              {speechAnalysis.fillerCount > 0 && (
                <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-900 border border-amber-300">
                  {speechAnalysis.fillerCount} Filler{speechAnalysis.fillerCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {/* Real-time Coach Suggestion Pills */}
          {speechAnalysis.suggestions.length > 0 && (
            <div className="pt-2 border-t border-slate-200/50 space-y-1.5">
              {speechAnalysis.suggestions.map((sug, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Candidate Text Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-extrabold text-slate-900 block tracking-tight">
              {isYesNoQuestion ? "Or elaborate your response:" : "Your Response:"}
            </label>
            {isListening && (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600 shadow-xs"></span>
                Listening in English...
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {text.length} characters • {speechAnalysis.wordCount} words
          </span>
        </div>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          placeholder={
            isYesNoQuestion
              ? "You can also explain your experience directly (e.g., 'Yes, I implemented Git flow with automated canary deployments...')"
              : "Type or click the microphone to speak your response. Structure with STAR (Situation, Task, Action, Result)..."
          }
          className="w-full p-4 text-sm text-slate-900 bg-white/90 border border-white/95 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y placeholder:text-slate-400 font-sans leading-relaxed shadow-xs"
          style={{ boxShadow: "inset 0 2px 3px rgba(0, 0, 0, 0.03)" }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Tip: Clearly state your role, the trade-offs considered, and measurable impact.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isListening
                  ? "bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-400/30"
                  : "bg-white/80 text-slate-700 border-white/95 hover:bg-white hover:border-white"
              }`}
              title={isListening ? "Stop voice dictation" : "Dictate answer with your microphone"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-rose-600 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 text-slate-600" />
              )}
              <span>{isListening ? "Stop Voice" : "Speak Answer"}</span>
            </button>

            {currentQuestionIndex >= 3 && finishEarlyAndEvaluate && (
              <button
                type="button"
                onClick={finishEarlyAndEvaluate}
                disabled={isSubmitting}
                className="glass-button-secondary w-full sm:w-auto text-xs px-4 py-2 gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Finish & Evaluate ({currentQuestionIndex} Qs)
              </button>
            )}

            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="glass-button-primary w-full sm:w-auto px-6 py-2.5 text-xs font-black gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{isSubmitting ? "Evaluating..." : "Submit Answer"}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
