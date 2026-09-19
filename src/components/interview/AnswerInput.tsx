"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Send, Lightbulb, Mic, MicOff, Check, X, RefreshCw, AlertCircle, Award } from "lucide-react";
import { useInterview } from "@/context/InterviewContext";

interface AnswerInputProps {
  onSubmit: (answerText: string) => void;
  isSubmitting?: boolean;
}

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
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");

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
          console.warn("Speech recognition error:", e);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Capture the current textarea content before voice recognition starts
      baseTextRef.current = text.trim();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Could not start recognition:", e);
      }
    }
  };

  const isYesNoQuestion =
    currentQuestion?.questionType === "yes_no" || !!currentQuestion?.yesNoOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    baseTextRef.current = "";
    onSubmit(text.trim());
    setText("");
  };

  const handleQuickYesNo = (val: "Yes" | "No") => {
    if (isSubmitting) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    baseTextRef.current = "";
    onSubmit(val);
    setText("");
  };

  return (
    <div className="glass-secondary p-6 sm:p-7 space-y-4">
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
            <span className="text-xs text-blue-700 font-semibold">Quick Answer or Type Below</span>
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
                Listening...
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {text.length} characters
          </span>
        </div>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          placeholder={
            isYesNoQuestion
              ? "You can also explain your experience directly (e.g., 'Yes, I used Git flow with daily feature branches...')"
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
              {isListening ? <MicOff className="w-4 h-4 text-rose-600 animate-pulse" /> : <Mic className="w-4 h-4 text-slate-600" />}
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
