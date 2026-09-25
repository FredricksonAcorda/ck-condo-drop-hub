"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Parcel, CreateParcelInput, ActivityLogItem, SmsLogItem, HubSettings, DeskInquiry, InquiryStatus } from "@/types";
import { db } from "@/lib/db/local-store";
import { DEFAULT_HUB_SETTINGS } from "@/lib/db/seed-data";
import { scannerAudio } from "@/lib/scanner/audio-feedback";

interface ParcelContextType {
  parcels: Parcel[];
  activityLogs: ActivityLogItem[];
  smsLogs: SmsLogItem[];
  inquiries: DeskInquiry[];
  hubSettings: HubSettings;
  loading: boolean;
  error: string | null;
  logParcel: (input: CreateParcelInput) => Promise<Parcel>;
  releaseParcel: (parcelId: string, claimedBy: string) => Promise<Parcel>;
  updateParcel: (parcelId: string, updates: Partial<Parcel>) => Promise<Parcel>;
  deleteParcel: (parcelId: string) => Promise<boolean>;
  verifyClaimCode: (code: string) => Promise<Parcel | null>;
  getParcelByTracking: (tracking: string) => Promise<Parcel | null>;
  getResidentParcels: (residentId: string) => Parcel[];
  sendTestSms: (phone: string, name: string, message: string) => Promise<SmsLogItem>;
  sendInquiry: (input: Omit<DeskInquiry, "id" | "createdAt" | "status">) => Promise<DeskInquiry>;
  updateInquiryStatus: (id: string, status: InquiryStatus, adminReply?: string) => Promise<DeskInquiry>;
  updateHubSettings: (settings: Partial<HubSettings>) => Promise<HubSettings>;
  refresh: () => Promise<void>;
}

const ParcelContext = createContext<ParcelContextType | undefined>(undefined);

export function ParcelProvider({ children }: { children: React.ReactNode }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLogItem[]>([]);
  const [inquiries, setInquiries] = useState<DeskInquiry[]>([]);
  const [hubSettings, setHubSettings] = useState<HubSettings>({ ...DEFAULT_HUB_SETTINGS });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [allParcels, logs, sms, inqs, settings] = await Promise.all([
        db.getAllParcels(),
        db.getActivityLogs(),
        db.getSmsLogs(),
        db.getInquiries(),
        db.getHubSettings(),
      ]);
      setParcels(allParcels);
      setActivityLogs(logs);
      setSmsLogs(sms);
      setInquiries(inqs);
      setHubSettings(settings);
      scannerAudio.setSoundEnabled(settings.soundEnabled);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleDbUpdate = () => {
      refresh();
    };

    window.addEventListener("ck_db_updated", handleDbUpdate);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("ck_db_updated", handleDbUpdate);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const logParcel = async (input: CreateParcelInput): Promise<Parcel> => {
    const created = await db.createParcel(input);
    await refresh();
    return created;
  };

  const releaseParcel = async (parcelId: string, claimedBy: string): Promise<Parcel> => {
    const updated = await db.releaseParcel(parcelId, claimedBy);
    await refresh();
    return updated;
  };

  const updateParcel = async (parcelId: string, updates: Partial<Parcel>): Promise<Parcel> => {
    const updated = await db.updateParcel(parcelId, updates);
    await refresh();
    return updated;
  };

  const deleteParcel = async (parcelId: string): Promise<boolean> => {
    const result = await db.deleteParcel(parcelId);
    await refresh();
    return result;
  };

  const verifyClaimCode = async (code: string): Promise<Parcel | null> => {
    return db.verifyClaimCode(code);
  };

  const getParcelByTracking = async (tracking: string): Promise<Parcel | null> => {
    return db.getParcelByTracking(tracking);
  };

  const getResidentParcels = (residentId: string): Parcel[] => {
    return parcels.filter((p) => p.residentId === residentId);
  };

  const sendTestSms = async (phone: string, name: string, message: string): Promise<SmsLogItem> => {
    const item = await db.sendTestSms(phone, name, message);
    await refresh();
    return item;
  };

  const sendInquiry = async (input: Omit<DeskInquiry, "id" | "createdAt" | "status">): Promise<DeskInquiry> => {
    const item = await db.createInquiry(input);
    await refresh();
    return item;
  };

  const updateInquiryStatus = async (id: string, status: InquiryStatus, adminReply?: string): Promise<DeskInquiry> => {
    const item = await db.updateInquiryStatus(id, status, adminReply);
    await refresh();
    return item;
  };

  const updateHubSettings = async (settingsUpdates: Partial<HubSettings>): Promise<HubSettings> => {
    const updated = await db.updateHubSettings(settingsUpdates);
    setHubSettings(updated);
    scannerAudio.setSoundEnabled(updated.soundEnabled);
    await refresh();
    return updated;
  };

  const value: ParcelContextType = {
    parcels,
    activityLogs,
    smsLogs,
    inquiries,
    hubSettings,
    loading,
    error,
    logParcel,
    releaseParcel,
    updateParcel,
    deleteParcel,
    verifyClaimCode,
    getParcelByTracking,
    getResidentParcels,
    sendTestSms,
    sendInquiry,
    updateInquiryStatus,
    updateHubSettings,
    refresh,
  };

  return <ParcelContext.Provider value={value}>{children}</ParcelContext.Provider>;
}

export function useParcels(): ParcelContextType {
  const context = useContext(ParcelContext);
  if (!context) {
    throw new Error("useParcels must be used within a ParcelProvider");
  }
  return context;
}
