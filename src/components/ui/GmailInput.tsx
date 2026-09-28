"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import {
  extractGmailUsername,
  buildGmailAddress,
  isValidGmailUsername,
} from "@/lib/utils/phone-email";

export interface GmailInputProps {
  value: string;
  onChange: (fullEmail: string, username: string, isValid: boolean) => void;
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

export function GmailInput({
  value,
  onChange,
  id,
  name = "email",
  placeholder = "username",
  required = false,
  disabled = false,
  theme = "light",
  error,
  className = "",
  autoComplete = "username",
}: GmailInputProps) {
  // Extract only username part for the input field
  const [username, setUsername] = useState(extractGmailUsername(value));

  useEffect(() => {
    setUsername(extractGmailUsername(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Strip '@' and domain if user pasted full email
    let clean = e.target.value.replace(/@.*$/, "").replace(/\s+/g, "").toLowerCase();
    setUsername(clean);

    const fullEmail = clean ? buildGmailAddress(clean) : "";
    const valid = isValidGmailUsername(clean);
    onChange(fullEmail, clean, valid);
  };

  const isDark = theme === "dark";

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          id={id}
          name={name}
          autoComplete={autoComplete}
          value={username}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full pr-28 transition-colors focus:outline-none ${
            isDark
              ? "bg-[#1c1c21] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 placeholder:opacity-50 focus:border-brand-red focus:ring-1 focus:ring-brand-red/40"
              : "input text-sm border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 placeholder:opacity-50 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
          } ${error ? (isDark ? "border-red-500" : "!border-red-500") : ""} ${className}`}
        />
        {/* Pre-filled Suffix locked inside input */}
        <span
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs pointer-events-none select-none tracking-tight ${
            isDark ? "text-zinc-500" : "text-gray-400"
          }`}
        >
          @gmail.com
        </span>
      </div>
      {error && (
        <p className={`mt-1 text-xs ${isDark ? "text-red-400" : "text-red-600"}`}>
          {error}
        </p>
      )}
    </div>
  );
}
