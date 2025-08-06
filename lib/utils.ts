import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function abbreviateServiceName(serviceName: string, isMobile: boolean): string {
  if (!isMobile) {
    return serviceName
  }

  const words = serviceName.split(' ')
  
  if (words.length > 1) {
    // Multiple words: use first character of each word
    return words.map(word => word.charAt(0).toUpperCase()).join('')
  } else {
    // Single word
    const singleWord = words[0]
    if (singleWord.length > 6) {
      // Long single word: use first 4 characters
      return singleWord.substring(0, 4)
    } else {
      // Short single word: keep as-is
      return singleWord
    }
  }
}
