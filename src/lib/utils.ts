import { formatDistanceToNow, format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function relativeTime(date?: string | Date | null): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

export function exactDate(date?: string | Date | null): string {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM d, yyyy · HH:mm');
  } catch {
    return '';
  }
}

export function severityClass(severity?: Severity): string {
  switch (severity) {
    case 'critical':
      return 'bg-critical/15 text-critical border-critical/30';
    case 'high':
      return 'bg-high/15 text-high border-high/30';
    case 'medium':
      return 'bg-medium/15 text-medium border-medium/30';
    case 'low':
      return 'bg-low/15 text-low border-low/30';
    default:
      return 'bg-info/15 text-info border-info/30';
  }
}
