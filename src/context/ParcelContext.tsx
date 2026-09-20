"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Parcel, CreateParcelInput } from "@/types";
import { db } from "@/lib/db/local-store";

interface ParcelContextType {
  parcels: Parcel[];
  loading: boolean;
  error: string | null;
  logParcel: (input: CreateParcelInput) => Promise<Parcel>;
  releaseParcel: (parcelId: string, claimedBy: string) => Promise<Parcel>;
  verifyClaimCode: (code: string) => Promise<Parcel | null>;
  getParcelByTracking: (tracking: string) => Promise<Parcel | null>;
  getResidentParcels: (residentId: string) => Parcel[];
  refresh: () => Promise<void>;
}

const ParcelContext = createContext<ParcelContextType | undefined>(undefined);

export function ParcelProvider({ children }: { children: React.ReactNode }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const all = await db.getAllParcels();
      setParcels(all);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleDbUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key?: string }>;
      if (!customEvent.detail?.key || customEvent.detail.key === "ck_hub_parcels_v1") {
        refresh();
      }
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

  const verifyClaimCode = async (code: string): Promise<Parcel | null> => {
    return db.verifyClaimCode(code);
  };

  const getParcelByTracking = async (tracking: string): Promise<Parcel | null> => {
    return db.getParcelByTracking(tracking);
  };

  const getResidentParcels = (residentId: string): Parcel[] => {
    return parcels.filter((p) => p.residentId === residentId);
  };

  const value: ParcelContextType = {
    parcels,
    loading,
    error,
    logParcel,
    releaseParcel,
    verifyClaimCode,
    getParcelByTracking,
    getResidentParcels,
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
