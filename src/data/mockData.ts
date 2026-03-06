// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Member {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  color: string;
  /** Overage debt from group meals that exceeded the challenge pool */
  balance: number;
}

export interface Challenge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  participantIds: string[];
  startDate: string;
  endDate: string;
  fineAmount: number;
  status: 'active' | 'completed' | 'upcoming';
  createdFromPollId?: string;
  /** Poll that this challenge was born from */
  linkedPollId?: string;
}

export interface TransactionSplit {
  memberId: string;
  /** Their portion of the total expense */
  share: number;
  /** True for the person who paid upfront */
  isPayer?: boolean;
  /** Number of anonymous guest shares bundled with this member */
  guestShares?: number;
}

export interface Transaction {
  id: string;
  description: string;
  /** Always a positive number */
  amount: number;
  /** For fines: who paid/owes. For expenses: who fronted the cash */
  memberId: string;
  date: string; // ISO string

  // ── New fields ──────────────────────────────────────────────────────────
  type: 'fine' | 'expense';
  /** Expenses only: whether drawn from a challenge pool or split directly */
  fundingSource?: 'challenge' | 'direct';
  /** Which challenge this fine/expense belongs to */
  challengeId?: string;
  /** Fines only: whether the fine has been collected by the admin */
  fineStatus?: 'paid' | 'pending';
  /** Expenses only: memberIds who attended (drives overage split) */
  attendees?: string[];

  // ── Kept for backward compat with SplitEditorSheet / TransactionDetailSheet
  category?: string;
  editHistory?: Array<{
    editedBy: string;
    editedAt: string;
    change: string;
  }>;
  splits?: TransactionSplit[];
  splitLocked?: boolean;
}

// ─── Computed helpers ─────────────────────────────────────────────────────────

/**
 * Total fines collected (paid) minus challenge-funded expenses for a given
 * challenge. Pass undefined to get the aggregate across all challenges.
 */
export function getCrunchFundBalance(
transactions: Transaction[],
challengeId?: string)
: number {
  const finesIn = transactions.
  filter(
    (t) =>
    t.type === 'fine' &&
    t.fineStatus === 'paid' && (
    challengeId === undefined || t.challengeId === challengeId)
  ).
  reduce((sum, t) => sum + t.amount, 0);

  const spentOut = transactions.
  filter(
    (t) =>
    t.type === 'expense' &&
    t.fundingSource === 'challenge' && (
    challengeId === undefined || t.challengeId === challengeId)
  ).
  reduce((sum, t) => sum + t.amount, 0);

  return finesIn - spentOut;
}

/** All pending (uncollected) fines, optionally filtered by challenge */
export function getPendingFines(
transactions: Transaction[],
challengeId?: string)
: Transaction[] {
  return transactions.filter(
    (t) =>
    t.type === 'fine' &&
    t.fineStatus === 'pending' && (
    challengeId === undefined || t.challengeId === challengeId)
  );
}

/**
 * For a challenge-funded expense that exceeded the pool, returns how much
 * each attendee owes. Returns 0 if the pool fully covered the expense.
 */
export function getOveragePerAttendee(
expense: Transaction,
poolBalanceBeforeExpense: number)
: number {
  if (expense.type !== 'expense' || expense.fundingSource !== 'challenge')
  return 0;
  const overage = expense.amount - poolBalanceBeforeExpense;
  if (overage <= 0) return 0;
  const attendeeCount = expense.attendees?.length ?? 1;
  return overage / attendeeCount;
}

/** Total fines collected across all challenges */
export function getTotalFinesCollected(transactions: Transaction[]): number {
  return transactions.
  filter((t) => t.type === 'fine' && t.fineStatus === 'paid').
  reduce((sum, t) => sum + t.amount, 0);
}

/** Total spent from challenge pools */
export function getTotalChallengeSpend(transactions: Transaction[]): number {
  return transactions.
  filter((t) => t.type === 'expense' && t.fundingSource === 'challenge').
  reduce((sum, t) => sum + t.amount, 0);
}

// ─── Members ─────────────────────────────────────────────────────────────────

export const MEMBERS: Member[] = [
{
  id: 'm1',
  name: 'Alex Rivera',
  initials: 'AR',
  phone: '555-0101',
  email: 'alex@example.com',
  color: '#E85D4A',
  balance: 0
},
{
  id: 'm2',
  name: 'Sarah Chen',
  initials: 'SC',
  phone: '555-0102',
  email: 'sarah@example.com',
  color: '#4A90D9',
  balance: 0
},
{
  id: 'm3',
  name: 'Mike Johnson',
  initials: 'MJ',
  phone: '555-0103',
  email: 'mike@example.com',
  color: '#2ECC71',
  balance: 0
},
{
  id: 'm4',
  name: 'Emily Davis',
  initials: 'ED',
  phone: '555-0104',
  email: 'emily@example.com',
  color: '#9B59B6',
  balance: 0
},
{
  id: 'm5',
  name: 'David Kim',
  initials: 'DK',
  phone: '555-0105',
  email: 'david@example.com',
  color: '#F39C12',
  balance: 0
},
{
  id: 'm6',
  name: 'Jessica Wu',
  initials: 'JW',
  phone: '555-0106',
  email: 'jessica@example.com',
  color: '#1ABC9C',
  balance: 0
},
{
  id: 'm7',
  name: 'Tom Wilson',
  initials: 'TW',
  phone: '555-0107',
  email: 'tom@example.com',
  color: '#E74C3C',
  balance: 0
},
{
  id: 'm8',
  name: 'Lisa Brown',
  initials: 'LB',
  phone: '555-0108',
  email: 'lisa@example.com',
  color: '#3498DB',
  balance: 0
},
{
  id: 'm9',
  name: 'Chris Lee',
  initials: 'CL',
  phone: '555-0109',
  email: 'chris@example.com',
  color: '#27AE60',
  balance: 0
},
{
  id: 'm10',
  name: 'Anna White',
  initials: 'AW',
  phone: '555-0110',
  email: 'anna@example.com',
  color: '#8E44AD',
  balance: 0
},
{
  id: 'm11',
  name: 'James Green',
  initials: 'JG',
  phone: '555-0111',
  email: 'james@example.com',
  color: '#E67E22',
  balance: 0
},
{
  id: 'm12',
  name: 'Maria Garcia',
  initials: 'MG',
  phone: '555-0112',
  email: 'maria@example.com',
  color: '#16A085',
  balance: 0
}];


// ─── Challenges ───────────────────────────────────────────────────────────────

export const CHALLENGES: Challenge[] = [
{
  id: 'c1',
  name: 'Six-Pack Challenge',
  emoji: 'dumbbell',
  description:
  'No alcohol for 30 days. Miss a day, pay $40 into the Crunch Fund.',
  participantIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
  startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
  fineAmount: 40,
  status: 'active',
  createdFromPollId: 'p1',
  linkedPollId: 'p1'
},
{
  id: 'c2',
  name: 'Early Bird Challenge',
  emoji: 'sunrise',
  description: 'Wake up before 7am every day. Sleep in? $25 fine.',
  participantIds: ['m1', 'm3', 'm7', 'm9'],
  startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(),
  fineAmount: 25,
  status: 'upcoming'
},
{
  id: 'c3',
  name: 'No-Spend November',
  emoji: 'ban',
  description: 'No unnecessary purchases for 30 days. Each slip costs $30.',
  participantIds: ['m1', 'm2', 'm4', 'm5', 'm7', 'm8', 'm10', 'm11'],
  startDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  fineAmount: 30,
  status: 'completed',
  linkedPollId: 'p6'
}];


export const challenges = [
{
  id: 1,
  name: 'No Coffee Month',
  category: 'Food & Drink',
  daysLeft: 12,
  amount: 50,
  participants: [
  { name: 'Alex K.', hasFine: false },
  { name: 'Sam R.', hasFine: true, fineAmount: 15 },
  { name: 'Jordan M.', hasFine: false },
  { name: 'Taylor S.', hasFine: true, fineAmount: 30 },
  { name: 'Casey B.', hasFine: false },
  { name: 'Morgan L.', hasFine: true, fineAmount: 10 },
  { name: 'Riley P.', hasFine: false }],

  userStatus: { clean: true },
  status: 'active'
},
{
  id: 2,
  name: 'No Takeout Week',
  category: 'Food & Drink',
  daysLeft: 3,
  amount: 25,
  participants: [
  { name: 'Alex K.', hasFine: false },
  { name: 'Sam R.', hasFine: false },
  { name: 'Jordan M.', hasFine: true, fineAmount: 15 },
  { name: 'Taylor S.', hasFine: false }],

  userStatus: { clean: false, fines: 1, amount: 15 },
  status: 'active'
},
{
  id: 3,
  name: 'Gym 5x Week',
  category: 'Health',
  daysLeft: 20,
  amount: 100,
  participants: [
  { name: 'Alex K.', hasFine: false },
  { name: 'Sam R.', hasFine: false },
  { name: 'Casey B.', hasFine: false }],

  userStatus: { clean: true },
  status: 'active'
}];


// ─── Transactions ─────────────────────────────────────────────────────────────
//
// Pool math for c1 (Six-Pack Challenge):
//   Paid fines:  Sarah $40 + Emily $40 + Jessica $80 + Alex $40 = $200
//   Expenses:    Team Dinner $180 (challenge-funded)
//   Pool balance after dinner: $200 − $180 = $20
//   Dinner overage: $180 − $200 = −$20 → pool fully covered, no overage
//
// Pending fines: Mike $40 (not yet paid)

export const TRANSACTIONS: Transaction[] = [
// ── Challenge fines (c1: Six-Pack) ────────────────────────────────────────

{
  id: 'f1',
  type: 'fine',
  challengeId: 'c1',
  fineStatus: 'paid',
  description: 'Missed day 3 — had a beer',
  amount: 40,
  memberId: 'm2',
  date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f2',
  type: 'fine',
  challengeId: 'c1',
  fineStatus: 'paid',
  description: 'Slipped up at the work event',
  amount: 40,
  memberId: 'm4',
  date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f3',
  type: 'fine',
  challengeId: 'c1',
  fineStatus: 'paid',
  description: 'Birthday drinks — twice',
  amount: 80,
  memberId: 'm6',
  date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f4',
  type: 'fine',
  challengeId: 'c1',
  fineStatus: 'paid',
  description: 'Super Bowl Sunday',
  amount: 40,
  memberId: 'm1',
  date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f5',
  type: 'fine',
  challengeId: 'c1',
  fineStatus: 'pending',
  description: 'Missed day 8 — owes $40',
  amount: 40,
  memberId: 'm3',
  date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},

// ── Past challenge fines (c3: No-Spend November) ──────────────────────────

{
  id: 'f6',
  type: 'fine',
  challengeId: 'c3',
  fineStatus: 'paid',
  description: 'Bought new shoes',
  amount: 30,
  memberId: 'm2',
  date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f7',
  type: 'fine',
  challengeId: 'c3',
  fineStatus: 'paid',
  description: 'Amazon impulse buy',
  amount: 30,
  memberId: 'm5',
  date: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f8',
  type: 'fine',
  challengeId: 'c3',
  fineStatus: 'paid',
  description: 'Coffee shop habit',
  amount: 60,
  memberId: 'm1',
  date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f9',
  type: 'fine',
  challengeId: 'c3',
  fineStatus: 'paid',
  description: 'Takeout x2',
  amount: 60,
  memberId: 'm4',
  date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f10',
  type: 'fine',
  challengeId: 'c3',
  fineStatus: 'paid',
  description: 'Steam sale',
  amount: 30,
  memberId: 'm7',
  date: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f11',
  type: 'fine',
  challengeId: 'c3',
  fineStatus: 'paid',
  description: 'Gym gear purchase',
  amount: 30,
  memberId: 'm8',
  date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},
{
  id: 'f12',
  type: 'fine',
  challengeId: 'c3',
  fineStatus: 'paid',
  description: 'Subscriptions renewed',
  amount: 30,
  memberId: 'm10',
  date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Fine',
  editHistory: []
},

// ── Challenge-funded expense (c1: Six-Pack) ────────────────────────────────

{
  id: 'e1',
  type: 'expense',
  fundingSource: 'challenge',
  challengeId: 'c1',
  description: "Team Dinner at Mario's",
  amount: 180,
  memberId: 'm1',
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Food',
  attendees: ['m1', 'm2', 'm3', 'm4', 'm5'],
  splits: [
  { memberId: 'm1', share: 36, isPayer: true },
  { memberId: 'm2', share: 36 },
  { memberId: 'm3', share: 36 },
  { memberId: 'm4', share: 36 },
  { memberId: 'm5', share: 36 }],

  editHistory: []
},

// ── Direct expense (no challenge pool) ────────────────────────────────────

{
  id: 'e2',
  type: 'expense',
  fundingSource: 'direct',
  description: 'Bowling Night',
  amount: 90,
  memberId: 'm5',
  date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  category: 'Entertainment',
  attendees: ['m5', 'm7', 'm8', 'm9'],
  splits: [
  { memberId: 'm5', share: 22.5, isPayer: true },
  { memberId: 'm7', share: 22.5 },
  { memberId: 'm8', share: 22.5 },
  { memberId: 'm9', share: 22.5 }],

  editHistory: []
},
{
  id: 'e3',
  type: 'expense',
  fundingSource: 'direct',
  description: 'Coffee & Catch-up',
  amount: 34,
  memberId: 'm9',
  date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  category: 'Food',
  attendees: ['m9', 'm10', 'm11'],
  splits: [
  { memberId: 'm9', share: 11.33, isPayer: true },
  { memberId: 'm10', share: 11.33 },
  { memberId: 'm11', share: 11.34 }],

  editHistory: []
}];