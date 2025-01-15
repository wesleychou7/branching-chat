import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function translateLaTex(val: string | null): string {
  if (!val) return "";
  if (val.indexOf("\\") == -1) return val;

  return val
    .replaceAll("\\(", "$$") // inline math
    .replaceAll("\\)", "$$")
    .replaceAll("\\[", "$$$") // display math
    .replaceAll("\\]", "$$$");
}
