"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
  minLabel?: string;
  maxLabel?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className = "",
      label,
      showValue = true,
      minLabel,
      maxLabel,
      value,
      min = 0,
      max = 100,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {showValue && (
              <span className="text-sm text-gray-500">{value}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-blue-600
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:bg-blue-700
            ${className}
          `}
          {...props}
        />
        {(minLabel || maxLabel) && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">{minLabel}</span>
            <span className="text-xs text-gray-500">{maxLabel}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";
