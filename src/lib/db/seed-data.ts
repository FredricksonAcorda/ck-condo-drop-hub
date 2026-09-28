import { Parcel, ResidentProfile, AuthUser, ActivityLogItem, SmsLogItem, HubSettings, DeskInquiry } from "@/types";

export const SEED_USERS: AuthUser[] = [
  {
    id: "usr-admin-1",
    email: "admin@ckcondohub.com",
    name: "Lobby Staff Admin",
    phone: "0917 999 8888",
    role: "admin",
    createdAt: "2026-07-01T08:00:00Z",
  },
];

export const SEED_RESIDENTS: ResidentProfile[] = [];

export const SEED_PARCELS: Parcel[] = [];

export const SEED_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: "act-1",
    type: "SETTINGS_UPDATED",
    title: "Lobby Drop Hub Operations Online",
    description: "Lobby Drop Hub intake and verification desk activated at Buildersville Ground Floor.",
    timestamp: "Today • 08:00 AM",
    actor: "Lobby Staff Admin",
    badgeColor: "bg-emerald-600",
  },
];

export const SEED_SMS_LOGS: SmsLogItem[] = [];

export const DEFAULT_HUB_SETTINGS: HubSettings = {
  hubName: "CK Condo Drop Hub",
  buildingName: "CK Buildersville Condominium",
  stationName: "Lobby Counter",
  freeDaysRegular: 3,
  freeDaysPremium: 7,
  overdueFeePerDay: 20,
  smsSenderId: "CKCONDO",
  autoPrintIntakeLabel: true,
  soundEnabled: true,
  maxShelfSlots: 60,
  lobbyAnnouncement: "Lobby Counter is operating normally. Please present your 4-digit claim code upon pickup.",
  pickupLocation: "Lobby Counter, Ground Floor, Tower A",
  operatingHours: "Monday – Sunday: 7:00 AM – 10:00 PM Daily",
  contactPhone: "0917 123 4567",
  contactEmail: "ckcondrohub@gmail.com",
  contactAddress: "C1 Buildersville Condominium, Marindal Rincon, Valenzuela City",
  homeFaqs: [
    {
      id: "faq-home-1",
      question: "How do I sign up and start receiving parcels at the Lobby?",
      answer: "Getting started is quick and easy! Click Sign Up, select your branch, enter your name, mobile number, building, floor, and unit number. Once registered, you will receive your unique resident drop code to use on your Shopee, Lazada, TikTok, and courier delivery addresses.",
    },
    {
      id: "faq-home-2",
      question: "How will I know when my parcel has arrived and is ready for pickup?",
      answer: "The moment our Lobby Staff Admin scans your parcel into the Lobby, you will receive an automatic SMS notification and an instant update in your resident customer portal with your package details and digital claim code.",
    },
    {
      id: "faq-home-3",
      question: "What are the Lobby operating hours for claiming packages?",
      answer: "Our physical storefront is open Monday to Sunday from 8:00 AM to 9:00 PM, including weekends and selected public holidays. You can pick up anytime during these hours by presenting your claim QR code or 4-digit verification pin.",
    },
    {
      id: "faq-home-4",
      question: "How does the free holding period work?",
      answer: "Every parcel receives 3 days of free holding on both Per Parcel and Regular plans (with Regular enjoying 15 days of unlimited parcels), and 7 days of free holding with 30 days unlimited parcels on the Premium VIP Plan. Parcels held past the free window incur a minimal holding fee of only ₱5 per day.",
    },
    {
      id: "faq-home-5",
      question: "How does the door-to-door delivery service work?",
      answer: "Premium VIP members receive 1 free door-to-door delivery every month. You can request direct doorstep delivery to your unit with a single tap from your online customer portal during operating hours. (Note: Door delivery is exclusive to Premium VIP members and is not available on Regular or Per Parcel plans).",
    },
    {
      id: "faq-home-6",
      question: "Which courier services are accepted at CK Condo Drop Hub?",
      answer: "We accept parcels from our official partner couriers: SPX Express, Flash Express, J&T Express, YTO Express, LBC Express, and STO Express, as well as other couriers for appliances and retail items from SM and other brands.",
    },
  ],
  residentFaqs: [
    {
      id: "faq-res-1",
      question: "How do I claim my package at the Lobby?",
      answer: "Proceed to the Lobby in the Ground Floor Main Lobby during operating hours (8:00 AM – 9:00 PM). Present your 4-digit parcel passcode (e.g. CK-8921) or show the QR code from your My Parcels tab. Our Staff Admin will verify the code and hand you your parcel immediately.",
    },
    {
      id: "faq-res-2",
      question: "Can my spouse, family member, or helper claim my parcels on my behalf?",
      answer: "Yes! Go to My Account > Authorized Claimants and register their full name and mobile number. Residents can add up to two more authorized claimants! They can claim your packages by showing their valid government ID or condominium resident badge at the Lobby.",
    },
    {
      id: "faq-res-3",
      question: "What happens if I cannot claim my package within the free holding period?",
      answer: "Parcels under Per-Parcel and Regular plans have 3 free calendar days (with Regular members enjoying 15 days of unlimited parcels), and Premium VIP members enjoy 7 free calendar days (with 30 days of unlimited parcels). If a parcel remains unclaimed after the free holding period, a storage holding fee of ₱10.00 per day applies upon pickup.",
    },
    {
      id: "faq-res-4",
      question: "How does Door-to-Door Unit Delivery work?",
      answer: "If you don't want to carry heavy boxes or are away from home, Premium subscribers can schedule a unit delivery from My Account. A Staff Admin will bring your package directly to your condo door during your chosen delivery window (Morning, Afternoon, or Evening). Premium members receive 1 complimentary door delivery each month!",
    },
    {
      id: "faq-res-5",
      question: "What payment methods are accepted at the Lobby?",
      answer: "We accept GCash QR (instant scanning), Maya QR, and Cash at the Lobby counter. You can pay holding fees, subscription renewals, or per-parcel drops on the spot.",
    },
    {
      id: "faq-res-6",
      question: "Which delivery couriers are supported by CK Condo Drop Hub?",
      answer: "Our official partner couriers deliver to our lobby daily: SPX Express, Flash Express, J&T Express, YTO Express, LBC Express, and STO Express. We also accept other couriers delivering appliances, groceries, and parcels from SM, IKEA, and other brands.",
    },
  ],
  communityAnnouncements: [
    {
      id: "ann-1",
      title: "Store Hours",
      highlight: "8:00 AM – 9:00 PM",
      desc: "Monday – Sunday • Open daily including weekends and holidays for easy parcel pickup.",
    },
    {
      id: "ann-2",
      title: "Important Notice",
      highlight: "Free holding period (3 to 7 days)",
      desc: "Please claim your parcels within your plan's free holding period to prevent extra storage charges. Prompt pickup keeps our Lobby organized and prevents penalty fees.",
    },
    {
      id: "ann-3",
      title: "Promos & Updates",
      highlight: "Resident Community Bulletin",
      desc: "Stay tuned with our community bulletin for the latest resident discounts, raffle promos, and community schedules.",
    },
  ],
};

export const SEED_INQUIRIES: DeskInquiry[] = [];
