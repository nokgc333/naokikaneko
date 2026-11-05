export const workCategories = ["Tool", "HDA", "HP", "Others"] as const;
export type WorkCategory = (typeof workCategories)[number];
