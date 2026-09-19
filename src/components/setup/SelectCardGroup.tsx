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
              onClick={() => !isDisabled && onChange(option.value)}
              className={cn(
                "relative text-left p-3.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 flex items-start justify-between gap-2",
                isSelected
                  ? "bg-brand-50/50 border-brand-500 ring-1 ring-brand-500 text-brand-950 font-medium"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50",
                isDisabled && "opacity-50 cursor-not-allowed bg-gray-50"
              )}
            >
              <div className="flex-1 min-w-0">
                <span className={cn("block font-medium", isSelected ? "text-brand-900 font-semibold" : "text-gray-900")}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                    {option.description}
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5">
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
