"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Send, Lightbulb } from "lucide-react";

interface AnswerInputProps {
  onSubmit: (answerText: string) => void;
  isSubmitting?: boolean;
}

export function AnswerInput({ onSubmit, isSubmitting = false }: AnswerInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    onSubmit(text.trim());
    setText("");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900 block">
              Your Answer
            </label>
            <span className="text-xs text-gray-400 font-mono">
              {text.length} characters
            </span>
          </div>

          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your response clearly. Be specific about your actions, metrics, and outcomes..."
            className="w-full p-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y placeholder:text-gray-400 font-sans"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Tip: Use the STAR method (Situation, Task, Action, Result).</span>
            </div>

            <Button
              type="submit"
              size="md"
              disabled={!text.trim() || isSubmitting}
              isLoading={isSubmitting}
              className="w-full sm:w-auto px-6 gap-2"
            >
              <span>Submit Answer</span>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
