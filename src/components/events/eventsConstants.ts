// Constants and utility functions for Events components

export const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function formatEventDate(dateStr: string, time?: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  if (!time) return label;
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${label} · ${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}