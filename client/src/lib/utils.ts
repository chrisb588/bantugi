import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import Area from "@/interfaces/area";

// merges tailwind classes and manage conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formats area object into a string
export function formatArea(area: Area | undefined | null): string {
  if (!area) {
    return "Unknown Location";
  }

  const parts: string[] = [];
  if (area.barangay) {
    parts.push(area.barangay);
  }
  if (area.city) {
    parts.push(area.city);
  }
  if (area.province) {
    parts.push(area.province);
  }

  if (parts.length === 0) {
    return "Unknown Location";
  }
  
  return parts.join(", ");
}