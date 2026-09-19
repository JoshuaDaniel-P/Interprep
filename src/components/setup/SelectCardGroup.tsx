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
  columns?: 2 | 3 | 4;
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
                  ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/40 text-blue-950 font-bold shadow-md shadow-blue-500/10 backdrop-blur-md"
                  : "bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm backdrop-blur-sm",
                isDisabled && "opacity-50 cursor-not-allowed bg-slate-100/50 pointer-events-none"
              )}
            >
              <div className="flex-1 min-w-0">
                <span className={cn("block font-extrabold text-sm tracking-tight", isSelected ? "text-blue-900" : "text-slate-900")}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-xs text-slate-500 font-semibold mt-1 leading-snug">
                    {option.description}
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
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
