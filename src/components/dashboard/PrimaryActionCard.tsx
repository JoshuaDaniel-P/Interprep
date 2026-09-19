import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PlayCircle, ArrowRight } from "lucide-react";

export function PrimaryActionCard() {
  return (
    <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mb-2">
          Ready for your next session?
        </span>
        <h2 className="text-xl font-bold tracking-tight">Practice Adaptive Interview</h2>
        <p className="text-brand-100 text-sm mt-1 max-w-xl">
          Simulate a real-world interview tailored to your target role with real-time adaptive follow-ups.
        </p>
      </div>

      <Link href="/setup" className="shrink-0">
        <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 border-none font-semibold w-full sm:w-auto gap-2">
          <PlayCircle className="w-5 h-5" />
          Start New Interview
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
