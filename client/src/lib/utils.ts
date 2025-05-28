import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import Area from "@/interfaces/area"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatArea(area: Area) {
  return `${area.barangay}, ${area.municipality || area.city}, ${area.province}`;
}
