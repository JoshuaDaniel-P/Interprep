"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Send, Lightbulb, Mic, MicOff } from "lucide-react";

interface AnswerInputProps {
  onSubmit: (answerText: string) => void;
  isSubmitting?: boolean;
}

export function AnswerInput({ onSubmit, isSubmitting = false }: AnswerInputProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setText((prev) => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${currentTranscript}` : currentTranscript;
            });
          }
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
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Could not start recognition:", e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSubmit(text.trim());
    setText("");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-900 block">
                Your Answer
              </label>
              {isListening && (
                <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  Listening...
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {text.length} characters
            </span>
          </div>

          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type or click the microphone to speak your response. Structure with STAR (Situation, Task, Action, Result)..."
            className="w-full p-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y placeholder:text-gray-400 font-sans"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Tip: Use the STAR method (Situation, Task, Action, Result).</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isSubmitting}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isListening
                    ? "bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400/20"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
                title={isListening ? "Stop voice dictation" : "Dictate answer with your microphone"}
              >
                {isListening ? <MicOff className="w-4 h-4 text-rose-600 animate-pulse" /> : <Mic className="w-4 h-4 text-slate-600" />}
                <span>{isListening ? "Stop Voice" : "Speak Answer"}</span>
              </button>

              <Button
                type="submit"
                size="md"
                disabled={!text.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1 sm:flex-initial px-6 gap-2"
              >
                <span>Submit Answer</span>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
