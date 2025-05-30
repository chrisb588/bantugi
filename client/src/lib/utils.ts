import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import Area from "@/interfaces/area";

// merges tailwind classes and manage conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formats area object into a string
export function formatArea(area: Area) {
  if (!area || !area.barangay || !area.city || !area.province) {
    return "Unknown Location";
  }
  return `${area.barangay}, ${area.city}, ${area.province}`;
}