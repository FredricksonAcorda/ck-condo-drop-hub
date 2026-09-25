"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser, LoginCredentials, RegisterData, ResidentProfile, UserRole } from "@/types";
import { authService } from "@/lib/auth/auth-service";
import { db } from "@/lib/db/local-store";

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<ResidentProfile>) => Promise<AuthUser>;
  switchDemoUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = useCallback(() => {
    const session = authService.getCurrentSession();
    setUser(session);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();

    const handleAuthChange = () => {
      refreshSession();
    };

    window.addEventListener("ck_auth_updated", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("ck_auth_updated", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshSession]);

  const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
    const { user } = await authService.login(credentials);
    setUser(user);
    return user;
  };

  const register = async (data: RegisterData): Promise<AuthUser> => {
    const { user } = await authService.register(data);
    setUser(user);
    return user;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<ResidentProfile>): Promise<AuthUser> => {
    if (!user) throw new Error("Not authenticated");
    const updated = await authService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const switchDemoUser = async (userId: string): Promise<void> => {
    if (userId === "admin") {
      const adminUser: AuthUser = {
        id: "usr-admin-1",
        email: "admin@ckcondohub.com",
        name: "Station 1 Front Desk Staff",
        phone: "0917 999 8888",
        role: "admin",
        createdAt: "2026-07-01T08:00:00Z",
      };
      await authService.login({ emailOrPhone: adminUser.email, password: "demo", role: "admin" });
      setUser(adminUser);
      return;
    }

    const resident = await db.getResidentById(userId);
    if (resident) {
      const authUser: AuthUser = {
        id: resident.id,
        email: resident.email,
        name: resident.name,
        phone: resident.phone,
        role: "resident",
        unit: resident.unit,
        tower: resident.tower,
        plan: resident.plan,
        planStatus: resident.planStatus || "ACTIVE",
        paymentMethod: resident.paymentMethod || "GCASH",
        paymentReference: resident.paymentReference,
        residentCode: resident.residentCode,
        deliveryCreditsLeft: resident.deliveryCreditsLeft,
        subscriptionExpiry: resident.subscriptionExpiry,
        createdAt: resident.createdAt,
      };
      await authService.login({ emailOrPhone: resident.email, password: "demo", role: "resident" });
      setUser(authUser);
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    switchDemoUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
