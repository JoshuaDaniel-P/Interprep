import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface OptionItem<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectCardGroupProps<T extends string | number = string> {
  label: string;
  description?: string;
  options: OptionItem<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
}

export function SelectCardGroup<T extends string | number = string>({
  label,
  description,
  options,
  selectedValue,
  onChange,
  columns = 3,
}: SelectCardGroupProps<T>) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-semibold text-gray-900 block">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>

      <div className={cn("grid gap-3", gridCols[columns])}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const isDisabled = option.disabled;

          return (
            <button
              key={option.value}
              type="button"
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  onChange(option.value);
                }
              }}
              className={cn(
                "relative text-left p-4 rounded-2xl border text-sm transition-all duration-200 cursor-pointer pointer-events-auto select-none flex items-start justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                isSelected
                  ? "bg-blue-50/80 border-blue-500/80 ring-2 ring-blue-500/30 text-blue-950 font-bold shadow-[0_8px_20px_rgba(37,99,235,0.12)] backdrop-blur-md"
                  : "bg-white/70 border-white/90 text-slate-700 hover:bg-white/95 hover:border-white hover:shadow-[0_6px_18px_rgba(15,23,42,0.05)] shadow-xs backdrop-blur-sm",
                isDisabled && "opacity-50 cursor-not-allowed bg-slate-100/50 pointer-events-none"
              )}
              style={
                isSelected
                  ? { boxShadow: "0 8px 20px -4px rgba(37, 99, 235, 0.15), inset 0 2px 2px 0 rgba(255, 255, 255, 1)" }
                  : { boxShadow: "0 4px 14px -3px rgba(15, 23, 42, 0.04), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 1)" }
              }
            >
              <div className="flex-1 min-w-0">
                <span className={cn("block font-extrabold text-sm tracking-tight", isSelected ? "text-blue-950" : "text-slate-900")}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-xs text-slate-500 font-semibold mt-1 leading-snug">
                    {option.description}
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
