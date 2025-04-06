import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 用於組合 Tailwind CSS 類名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}