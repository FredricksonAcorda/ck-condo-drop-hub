"use client";

import React, { ChangeEvent } from "react";
import { formatPhilippinePhone, isValidPhilippinePhone } from "@/lib/utils/phone-email";

export interface PhilippinePhoneInputProps {
  value: string;
  onChange: (formatted: string, isValid: boolean) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  theme?: "dark" | "light";
  error?: string | null;
  className?: string;
  autoComplete?: string;
}

export function PhilippinePhoneInput({
  value,
  onChange,
  id,
  name = "phone",
  placeholder = "+63 9XX XXX XXXX",
  required = false,
  disabled = false,
  theme = "light",
  error,
  className = "",
  autoComplete = "tel",
}: PhilippinePhoneInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhilippinePhone(raw);
    const valid = isValidPhilippinePhone(formatted);
    onChange(formatted, valid);
  };

  const isDark = theme === "dark";

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <input
          type="tel"
          id={id}
          name={name}
          inputMode="numeric"
          autoComplete={autoComplete}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={16}
          className={`w-full font-mono transition-colors focus:outline-none ${
            isDark
              ? "bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 placeholder:opacity-50 focus:border-brand-red focus:ring-1 focus:ring-brand-red/40"
              : "input text-sm border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 placeholder:opacity-50 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
          } ${error ? (isDark ? "border-red-500" : "!border-red-500") : ""} ${className}`}
        />
      </div>
      {error && (
        <p className={`mt-1 text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
