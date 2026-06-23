/** Human date formatting helpers used across task/project views. */

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const shortDateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return shortDateFmt.format(new Date(iso));
}

/** Relative time like "3 days ago" / "in 2 hours". */
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return 'just now';
}

export function isOverdue(iso: string | null, now = Date.now()): boolean {
  return iso !== null && new Date(iso).getTime() < now;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
