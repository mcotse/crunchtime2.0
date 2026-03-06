export interface ChangelogEntry {
  version: string
  date: string
  note: string
}

export const CHANGELOG: ChangelogEntry[] = [
  { version: '1.2.1', date: 'Mar 6', note: 'Fix tab animations and count-up regression from iOS polish commit' },
  { version: '1.2.0', date: 'Mar 6', note: 'Add haptic feedback across the app via web-haptics' },
  { version: '1.1.2', date: 'Mar 5', note: 'Fix flash of not-a-member screen on sign-in, switch to password auth' },
  { version: '1.1.1', date: 'Mar 5', note: 'Wire sign-out button, fix auth config and page title' },
  { version: '1.1.0', date: 'Mar 5', note: 'Auto-versioning in settings page' },
  { version: '1.0.2', date: 'Oct 27', note: 'Light mode contrast improvements' },
  { version: '1.0.1', date: 'Oct 14', note: 'Calendar availability grid' },
  { version: '1.0.0', date: 'Sep 30', note: 'Initial release' },
]
