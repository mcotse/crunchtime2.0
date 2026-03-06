import { Member, Challenge, Transaction } from '../../data/mockData';
import { GroupEvent } from '../../data/eventsData';
import { CalendarAvailability } from '../../data/calendarData';
import { Poll } from '../../data/pollsData';

export type CalendarMode = 'upcoming' | 'availability' | 'polls' | 'challenges';

export interface AvailabilityCellProps {
  dateKey: string;
  day: number;
  idx: number;
  past: boolean;
  isToday: boolean;
  count: number;
  isConfirmed: boolean;
  hasAvailability: boolean;
  cellBackground: string;
  cellBorder: string;
  textColor: string;
  fontWeight: number;
  todayCircleBg: string;
  todayCircleText: string;
  onToggle: (dateStr: string) => void;
  onLongPress: (dateStr: string) => void;
}

export interface EventsTabProps {
  availability: CalendarAvailability;
  members: Member[];
  currentUserId: string;
  onDayTap: (dateStr: string) => void;
  onToggleAvailability: (dateStr: string) => void;
  events: GroupEvent[];
  transactions: Transaction[];
  onCreateEvent: () => void;
  onOpenEvent: (event: GroupEvent) => void;
  onArchiveEvent: (eventId: string) => void;
  onUnarchiveEvent: (eventId: string) => void;
  onOpenNotifications?: () => void;
  hasUnread?: boolean;
  challenges?: Challenge[];
  onOpenChallenge?: (challenge: Challenge) => void;
  onProposeChallenge?: () => void;
  polls?: Poll[];
  onOpenPoll?: (poll: Poll) => void;
  onVote?: (pollId: string, optionIds: string[]) => void;
  onRsvp?: (
  eventId: string,
  rsvp: {
    status: 'going' | 'maybe' | 'not_going';
  })
  => void;
}