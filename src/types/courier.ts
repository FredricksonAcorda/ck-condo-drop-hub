import React from "react";

export interface CourierInfo {
  id: string;
  name: string;
  shortName: string;
  brandColor: string;
}

export interface LogoItem {
  node: React.ReactNode;
  title: string;
  ariaLabel?: string;
}
