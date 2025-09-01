import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export commonly used utilities
export * from "./league-utils"
export * from "./stats-utils"
export * from "./types"

