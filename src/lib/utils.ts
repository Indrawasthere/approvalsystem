import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateApprovalCode(): string {
  const randomNum = Math.floor(Math.random() * 100000);
  return `APP-${randomNum.toString().padStart(5, '0')}`;
}
