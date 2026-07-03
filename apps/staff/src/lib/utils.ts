import { clsx, twMerge } from "cnfast";
import type { ClassValue } from "cnfast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
