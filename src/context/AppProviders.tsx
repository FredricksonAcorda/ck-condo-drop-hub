"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import { ParcelProvider } from "./ParcelContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ParcelProvider>{children}</ParcelProvider>
    </AuthProvider>
  );
}
