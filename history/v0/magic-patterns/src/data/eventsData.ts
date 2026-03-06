import { dateKey, today } from './calendarData';

export interface EventRSVP {
  memberId: string;
  status: 'going' | 'maybe' | 'not_going';
  /** Anonymous +1s this member is bringing */
  guestCount?: number;
  /** memberIds of group members they are RSVPing for */
  proxyFor?: string[];
}

export interface GroupEvent {
  id: string;
  title: string;
  description?: string;
  dateStr?: string; // 'YYYY-MM-DD'
  time?: string; // '14:00' 24h
  location?: string;
  /** When set, location renders as a tappable maps link using this as the search query */
  locationMapsQuery?: string;
  creatorId: string;
  createdAt: string;
  linkedTransactionId?: string;
  rsvps: EventRSVP[];
  coverEmoji: string;
  isArchived?: boolean;
  /** Expenses linked to this event — only shown for past events */
  expenses?: {id: string;description: string;amount: number;}[];
}

function offsetDate(days: number): string {
  const d = today();
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

const NOW = new Date().toISOString();

export const INITIAL_EVENTS: GroupEvent[] = [
{
  id: 'ev1',
  title: 'Team Dinner',
  description: "Let's celebrate a great month together! Reservations at 7.",
  dateStr: offsetDate(5),
  time: '19:00',
  location: 'Bella Napoli, 42 W 4th St',
  locationMapsQuery: 'Bella Napoli 42 W 4th St New York',
  creatorId: 'm1',
  createdAt: NOW,
  linkedTransactionId: 't6',
  coverEmoji: '🍽️',
  rsvps: [
  { memberId: 'm1', status: 'going' },
  { memberId: 'm2', status: 'going' },
  { memberId: 'm3', status: 'going' },
  { memberId: 'm4', status: 'maybe' },
  { memberId: 'm5', status: 'going' },
  { memberId: 'm6', status: 'not_going' },
  { memberId: 'm7', status: 'maybe' }]

},
{
  id: 'ev2',
  title: 'Movie Night',
  description: 'Voting on the movie — check the poll!',
  dateStr: offsetDate(12),
  time: '20:00',
  location: "Alex's place",
  creatorId: 'm2',
  createdAt: NOW,
  linkedTransactionId: 't4',
  coverEmoji: '🎬',
  rsvps: [
  { memberId: 'm1', status: 'going' },
  { memberId: 'm2', status: 'going' },
  { memberId: 'm3', status: 'maybe' },
  { memberId: 'm8', status: 'going' },
  { memberId: 'm9', status: 'going' }]

},
{
  id: 'ev3',
  title: 'Grocery Run',
  description: 'Costco haul — bring the car if you can.',
  dateStr: offsetDate(2),
  time: '10:00',
  location: 'Costco, 1250 Industrial Blvd',
  locationMapsQuery: 'Costco 1250 Industrial Blvd',
  creatorId: 'm3',
  createdAt: NOW,
  linkedTransactionId: 't1',
  coverEmoji: '🛒',
  rsvps: [
  { memberId: 'm1', status: 'maybe' },
  { memberId: 'm3', status: 'going' },
  { memberId: 'm5', status: 'going' },
  { memberId: 'm10', status: 'not_going' }]

},
{
  id: 'ev4',
  title: 'House Party',
  description: 'End of month celebration. Bring snacks!',
  dateStr: offsetDate(20),
  time: '21:00',
  location: "Sarah's place",
  creatorId: 'm2',
  createdAt: NOW,
  coverEmoji: '🎉',
  rsvps: [
  { memberId: 'm1', status: 'going' },
  { memberId: 'm2', status: 'going' },
  { memberId: 'm4', status: 'going' },
  { memberId: 'm6', status: 'going' },
  { memberId: 'm7', status: 'going' },
  { memberId: 'm9', status: 'maybe' },
  { memberId: 'm11', status: 'going' },
  { memberId: 'm12', status: 'maybe' }]

},
{
  id: 'ev5',
  title: 'Monthly Check-in',
  description: 'Review finances, settle up, and plan ahead.',
  dateStr: offsetDate(30),
  time: '18:00',
  location: 'Video call',
  creatorId: 'm1',
  createdAt: NOW,
  coverEmoji: '📊',
  rsvps: [
  { memberId: 'm1', status: 'going' },
  { memberId: 'm2', status: 'going' },
  { memberId: 'm3', status: 'going' },
  { memberId: 'm5', status: 'going' },
  { memberId: 'm8', status: 'maybe' }]

},
{
  id: 'ev_past1',
  title: 'Rooftop Hangout',
  description: 'Summer vibes on the roof.',
  dateStr: offsetDate(-14),
  time: '18:00',
  location: 'The Rooftop, 88 Spring St',
  locationMapsQuery: 'The Rooftop 88 Spring St',
  creatorId: 'm2',
  createdAt: NOW,
  coverEmoji: '🌇',
  rsvps: [
  { memberId: 'm1', status: 'going' },
  { memberId: 'm2', status: 'going' },
  { memberId: 'm3', status: 'going' },
  { memberId: 'm4', status: 'going' },
  { memberId: 'm5', status: 'going' },
  { memberId: 'm6', status: 'not_going' }]

},
{
  id: 'ev_past2',
  title: 'Bowling Night',
  description: 'Lanes booked for 10, loser buys drinks.',
  dateStr: offsetDate(-7),
  time: '20:00',
  location: 'Lucky Strike Lanes',
  locationMapsQuery: 'Lucky Strike Lanes New York',
  creatorId: 'm3',
  createdAt: NOW,
  coverEmoji: '🎳',
  rsvps: [
  { memberId: 'm1', status: 'going' },
  { memberId: 'm2', status: 'going' },
  { memberId: 'm3', status: 'going' },
  { memberId: 'm5', status: 'going' },
  { memberId: 'm7', status: 'maybe' },
  { memberId: 'm8', status: 'not_going' }]

},
{
  id: 'ev_past3',
  title: 'Park Picnic',
  description: 'Blankets, snacks, and good vibes.',
  dateStr: offsetDate(-21),
  time: '13:00',
  location: 'Prospect Park',
  locationMapsQuery: 'Prospect Park Brooklyn',
  creatorId: 'm1',
  createdAt: NOW,
  coverEmoji: '🧺',
  rsvps: [
  { memberId: 'm1', status: 'going' },
  { memberId: 'm2', status: 'going' },
  { memberId: 'm3', status: 'going' },
  { memberId: 'm4', status: 'going' },
  { memberId: 'm5', status: 'going' },
  { memberId: 'm6', status: 'going' },
  { memberId: 'm9', status: 'going' },
  { memberId: 'm10', status: 'not_going' }],

  expenses: [
  { id: 'exp1', description: 'Cheese & charcuterie board', amount: 38.5 },
  { id: 'exp2', description: 'Drinks & seltzers', amount: 24.0 },
  { id: 'exp3', description: 'Sunscreen & supplies', amount: 14.75 }]

}];