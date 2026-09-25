"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScannerStationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/parcels");
  }, [router]);

  return (
    <div className="p-8 text-center space-y-4">
      <p className="text-sm text-brand-text-secondary">
        Redirecting to the integrated <strong>Parcel Inventory & Scanner Station</strong>...
      </p>
      <Link href="/admin/parcels" className="btn btn-primary btn-sm">
        Go to Parcel Inventory & Scanner ➔
      </Link>
    </div>
  );
}
