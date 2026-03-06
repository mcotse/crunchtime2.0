// ─── Constants ────────────────────────────────────────────────────────────────
export const EQX_TRANSITION = {
  duration: 0.32,
  ease: [0.2, 0.0, 0.0, 1.0] as const
};

export const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;

export const EMOJI_OPTIONS = ['🍽️', '🎉', '🏋️', '🎬', '☕', '🏠', '✈️'];

export const MONTH_NAMES = [
'January',
'February',
'March',
'April',
'May',
'June',
'July',
'August',
'September',
'October',
'November',
'December'];


export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ─── Utility functions ────────────────────────────────────────────────────────
export function autoEmoji(name: string): string {
  const n = name.toLowerCase();
  if (/dinner|food|eat|meal|restaurant|lunch/.test(n)) return '🍽️';
  if (/party|celebrat|birthday/.test(n)) return '🎉';
  if (/gym|workout|fitness|sport|run|yoga/.test(n)) return '🏋️';
  if (/movie|film|cinema|watch|netflix/.test(n)) return '🎬';
  if (/coffee|cafe|brunch|breakfast/.test(n)) return '☕';
  if (/home|house|apartment|place/.test(n)) return '🏠';
  if (/travel|trip|flight|vacation/.test(n)) return '✈️';
  return '📅';
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// ─── Time parsing ─────────────────────────────────────────────────────────────
export function parseTimeInput(raw: string): {
  h: number;
  m: number;
  ampm: 'AM' | 'PM';
} | null {
  const s = raw.trim().toLowerCase().replace(/\s/g, '');
  if (!s) return null;
  let ampm: 'AM' | 'PM' | null = null;
  let rest = s;
  if (s.endsWith('am')) {
    ampm = 'AM';
    rest = s.slice(0, -2);
  } else if (s.endsWith('pm')) {
    ampm = 'PM';
    rest = s.slice(0, -2);
  } else if (s.endsWith('a')) {
    ampm = 'AM';
    rest = s.slice(0, -1);
  } else if (s.endsWith('p')) {
    ampm = 'PM';
    rest = s.slice(0, -1);
  }
  let h: number,
    m = 0;
  if (rest.includes(':')) {
    const parts = rest.split(':');
    h = parseInt(parts[0]);
    m = parseInt(parts[1]) || 0;
  } else if (rest.length <= 2) {
    h = parseInt(rest);
  } else if (rest.length === 3) {
    h = parseInt(rest[0]);
    m = parseInt(rest.slice(1));
  } else if (rest.length === 4) {
    h = parseInt(rest.slice(0, 2));
    m = parseInt(rest.slice(2));
  } else return null;
  if (isNaN(h) || isNaN(m) || m > 59) return null;
  // Handle 24hr
  if (h >= 13 && h <= 23) {
    ampm = 'PM';
    h = h - 12;
  } else if (h === 0) {
    h = 12;
    ampm = ampm ?? 'AM';
  } else if (h === 12) {
    ampm = ampm ?? 'PM';
  } else if (h > 23) return null;else
  {
    ampm = ampm ?? 'AM';
  }
  return {
    h,
    m,
    ampm: ampm as 'AM' | 'PM'
  };
}

export function to24hr(h: number, m: number, ampm: 'AM' | 'PM'): string {
  let hh = h % 12;
  if (ampm === 'PM') hh += 12;
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')}`;
}

export function getAmpm(timeStr: string): 'AM' | 'PM' {
  if (!timeStr) return 'AM';
  const h = parseInt(timeStr.split(':')[0]);
  return h >= 12 ? 'PM' : 'AM';
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────
export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}