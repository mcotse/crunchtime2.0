export interface ChangelogEntry {
  version: string
  date: string
  note: string
}

export const CHANGELOG: ChangelogEntry[] = [
  { version: '1.1.0', date: 'Mar 5', note: 'Auto-versioning in settings page' },
  { version: '1.0.2', date: 'Oct 27', note: 'Light mode contrast improvements' },
  { version: '1.0.1', date: 'Oct 14', note: 'Calendar availability grid' },
  { version: '1.0.0', date: 'Sep 30', note: 'Initial release' },
]
