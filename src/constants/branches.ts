export const BRANCHES = [
  "Malinta Branch",
  "Marulas Branch",
  "Marilao Branch",
  "Makati Branch",
  "Taguig Branch",
  "Laguna Branch",
  "Quezon City Branch",
  "Caloocan Branch",
  "Manila Branch",
  "Pasig Branch",
  "BGC Branch",
  "Mandaluyong Branch",
] as const;

export type BranchName = typeof BRANCHES[number];
