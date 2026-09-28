"use client";

import React, { useState, useId } from "react";

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordCriteria(password: string): PasswordCriteria {
  return {
    hasMinLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  };
}

export function isPasswordStrongEnough(password: string): boolean {
  const c = evaluatePasswordCriteria(password);
  return c.hasMinLength && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial;
}

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  autoComplete?: string;
}

export function SecurePasswordInput({
  value,
  onChange,
  placeholder = "Create a secure password",
  name = "password",
  required = true,
  disabled = false,
  id,
  className = "",
  autoComplete = "new-password",
}: SecurePasswordInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const criteria = evaluatePasswordCriteria(value);
  const criteriaCount = [
    criteria.hasMinLength,
    criteria.hasUpper,
    criteria.hasLower,
    criteria.hasNumber,
    criteria.hasSpecial,
  ].filter(Boolean).length;

  const isValid = criteriaCount === 5;

  // Strength score
  let strengthLabel = "Weak";
  let barWidth = "0%";
  let barColor = "bg-zinc-700";
  let labelColor = "text-zinc-500";
  let suggestion = "";

  if (value.length > 0) {
    if (criteriaCount <= 2) {
      strengthLabel = "Weak";
      barWidth = "33%";
      barColor = "bg-red-500 shadow-sm shadow-red-500/50";
      labelColor = "text-red-400";
    } else if (criteriaCount <= 4) {
      strengthLabel = "Moderate";
      barWidth = "66%";
      barColor = "bg-amber-500 shadow-sm shadow-amber-500/50";
      labelColor = "text-amber-400";
    } else {
      strengthLabel = "Strong";
      barWidth = "100%";
      barColor = "bg-emerald-500 shadow-sm shadow-emerald-500/50";
      labelColor = "text-emerald-400";
    }

    // Helper smart suggestions
    if (!criteria.hasMinLength) {
      suggestion = "Add more characters (minimum 8 required).";
    } else if (!criteria.hasUpper) {
      suggestion = "Add at least one uppercase letter (A-Z).";
    } else if (!criteria.hasLower) {
      suggestion = "Add at least one lowercase letter (a-z).";
    } else if (!criteria.hasNumber) {
      suggestion = "Add numbers (0-9) to strengthen your password.";
    } else if (!criteria.hasSpecial) {
      suggestion = "Include special characters like !, @, #, $, or %.";
    } else {
      suggestion = "Excellent! Your password meets all security standards.";
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const c = evaluatePasswordCriteria(val);
    const valid = c.hasMinLength && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial;
    onChange(val, valid);
  };

  const checklist = [
    { label: "Minimum 8 characters", met: criteria.hasMinLength },
    { label: "At least one uppercase letter (A-Z)", met: criteria.hasUpper },
    { label: "At least one lowercase letter (a-z)", met: criteria.hasLower },
    { label: "At least one number (0-9)", met: criteria.hasNumber },
    { label: "At least one special character (!, @, #, $, %)", met: criteria.hasSpecial },
  ];

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Password Input with Show/Hide Toggle */}
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
          aria-describedby={`${inputId}-requirements`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* Visual Strength Indicator & Checklist (visible when user has typed or focused) */}
      {(value.length > 0 || isFocused) && (
        <div id={`${inputId}-requirements`} className="space-y-2 pt-1 animate-in fade-in duration-200">
          {/* Progress Bar & Status Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Password Strength:</span>
              <span className={`font-semibold ${labelColor}`}>
                {value.length === 0 ? "Enter password" : strengthLabel}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${barColor}`}
                style={{ width: barWidth }}
              />
            </div>
          </div>

          {/* Smart Suggestion Banner */}
          {suggestion && (
            <p className={`text-[11px] leading-relaxed transition-colors ${
              isValid ? "text-emerald-400 font-medium" : "text-amber-300/90"
            }`}>
              💡 {suggestion}
            </p>
          )}

          {/* Dynamic Checklist */}
          <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-3 space-y-1.5 mt-2">
            <p className="text-[10.5px] uppercase tracking-wider font-bold text-zinc-400 mb-1">
              Complexity Requirements
            </p>
            <ul className="space-y-1">
              {checklist.map((item, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                    item.met ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {item.met ? (
                    <svg
                      className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 text-zinc-600 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <circle cx="10" cy="10" r="4" />
                    </svg>
                  )}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
