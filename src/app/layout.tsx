import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CK Condo Drop Hub — Quick Drops, Easy Pick Ups",
    template: "%s | CK Condo Drop Hub",
  },
  description:
    "Your trusted parcel hub inside the condominium. We make receiving and sending parcels easy, secure, and hassle-free for everyone in the condo.",
  keywords: [
    "parcel hub",
    "condo parcel",
    "package delivery",
    "CK Condo Drop Hub",
    "Valenzuela City",
    "parcel receiving",
    "parcel pickup",
  ],
  openGraph: {
    title: "CK Condo Drop Hub — Quick Drops, Easy Pick Ups",
    description:
      "Your trusted parcel hub inside the condominium. Easy, secure, and hassle-free.",
    type: "website",
    locale: "en_PH",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
