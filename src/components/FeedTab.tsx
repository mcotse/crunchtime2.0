import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlameIcon, TrophyIcon, DollarSignIcon, CalendarIcon, SearchIcon, CheckCircleIcon } from 'lucide-react';
import { Transaction, Member, Challenge } from '../data/mockData';
import { GroupEvent } from '../data/eventsData';
import { tintBg } from './tintHelper';
interface FeedTabProps {
  transactions: Transaction[];
  members: Member[];
  challenges?: Challenge[];
  events?: GroupEvent[];
  currentUserId?: string;
  isAdmin?: boolean;
  onOpenTransaction?: (tx: Transaction) => void;
  onOpenEvent?: (event: GroupEvent) => void;
  onOpenNotifications?: () => void;
  hasUnread?: boolean;
}
interface FeedEntry {
  id: string;
  type: 'fine' | 'expense' | 'challenge_expense' | 'rsvp_group';
  date: string;
  memberId?: string;
  title: string;
  transaction?: Transaction;
  event?: GroupEvent;
  rsvpMemberIds?: string[];
}
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
function relativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMs < 60000) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
function getDateBucket(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  if (now.toDateString() === then.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === then.toDateString()) return 'Yesterday';
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (diffDays < 7) return 'This Week';
  return 'Earlier';
}
const BUCKET_ORDER = ['Today', 'Yesterday', 'This Week', 'Earlier'];
const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--eqx-tertiary)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase'
};
export function FeedTab({
  transactions,
  members,
  challenges = [],
  events = [],
  currentUserId,
  isAdmin = false,
  onOpenTransaction,
  onOpenEvent,
  onOpenNotifications,
  hasUnread = false
}: FeedTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const getMember = (id: string) => members.find((m) => m.id === id);
  const getChallenge = (id?: string) => challenges.find((c) => c.id === id);
  // ── Build unified feed entries ─────────────────────────────────────────────
  const feedEntries = useMemo<FeedEntry[]>(() => {
    const entries: FeedEntry[] = [];
    for (const tx of transactions) {
      const member = getMember(tx.memberId);
      const firstName = member?.name.split(' ')[0] ?? 'Someone';
      if (tx.type === 'fine') {
        const isPending = tx.fineStatus === 'pending';
        entries.push({
          id: tx.id,
          type: 'fine',
          date: tx.date,
          memberId: tx.memberId,
          title: isPending ? `${firstName} · $${tx.amount} fine` : `${firstName} settled a $${tx.amount} fine`,
          transaction: tx
        });
      } else if (tx.type === 'expense') {
        const isChallengeExpense = tx.fundingSource === 'challenge';
        entries.push({
          id: tx.id,
          type: isChallengeExpense ? 'challenge_expense' : 'expense',
          date: tx.date,
          memberId: tx.memberId,
          title: isChallengeExpense ? `${firstName} logged ${tx.description} · $${tx.amount}` : `${firstName} split ${tx.description} · $${tx.amount}`,
          transaction: tx
        });
      }
    }
    for (const ev of events) {
      if (ev.rsvps.length === 0) continue;
      const rsvpMemberIds = ev.rsvps.map((r) => r.memberId);
      const count = rsvpMemberIds.length;
      let title = '';
      if (count === 1) {
        const m = getMember(rsvpMemberIds[0]);
        title = `${m?.name.split(' ')[0] ?? 'Someone'} RSVP'd to ${ev.title}`;
      } else if (count === 2) {
        const m1 = getMember(rsvpMemberIds[0]);
        const m2 = getMember(rsvpMemberIds[1]);
        title = `${m1?.name.split(' ')[0] ?? 'Someone'} and ${m2?.name.split(' ')[0] ?? 'someone'} RSVP'd to ${ev.title}`;
      } else {
        const m1 = getMember(rsvpMemberIds[0]);
        const m2 = getMember(rsvpMemberIds[1]);
        const rest = count - 2;
        title = `${m1?.name.split(' ')[0]}, ${m2?.name.split(' ')[0]} + ${rest} other${rest !== 1 ? 's' : ''} RSVP'd to ${ev.title}`;
      }
      entries.push({
        id: `rsvp-${ev.id}`,
        type: 'rsvp_group',
        date: ev.createdAt,
        rsvpMemberIds,
        title,
        event: ev
      });
    }
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, events, members, challenges]);
  // ── Needs Attention logic ─────────────────────────────────────────────────
  // Pending fines + events where current user hasn't RSVPed
  const needsAttentionEntries = useMemo(() => {
    return feedEntries.filter((entry) => {
      if (entry.type === 'fine' && entry.transaction?.fineStatus === 'pending') {
        return true;
      }
      if (entry.type === 'rsvp_group' && entry.event && currentUserId && !entry.event.rsvps.find((r) => r.memberId === currentUserId)) {
        return true;
      }
      return false;
    });
  }, [feedEntries, currentUserId]);
  const needsAttentionIds = useMemo(() => new Set(needsAttentionEntries.map((e) => e.id)), [needsAttentionEntries]);
  const recentEntries = useMemo(() => feedEntries.filter((e) => !needsAttentionIds.has(e.id)), [feedEntries, needsAttentionIds]);
  // ── Search — flat filtered list across all entries ────────────────────────
  const isSearching = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase();
    return feedEntries.filter((e) => e.title.toLowerCase().includes(q));
  }, [feedEntries, searchQuery, isSearching]);
  // ── Group recent entries by date bucket ───────────────────────────────────
  const recentGrouped = useMemo(() => {
    const map: Record<string, FeedEntry[]> = {};
    for (const entry of recentEntries) {
      const bucket = getDateBucket(entry.date);
      if (!map[bucket]) map[bucket] = [];
      map[bucket].push(entry);
    }
    return map;
  }, [recentEntries]);
  const activeBuckets = BUCKET_ORDER.filter((b) => recentGrouped[b]?.length > 0);
  // ── Search grouped by date bucket ─────────────────────────────────────────
  const searchGrouped = useMemo(() => {
    const map: Record<string, FeedEntry[]> = {};
    for (const entry of searchResults) {
      const bucket = getDateBucket(entry.date);
      if (!map[bucket]) map[bucket] = [];
      map[bucket].push(entry);
    }
    return map;
  }, [searchResults]);
  const searchBuckets = BUCKET_ORDER.filter((b) => searchGrouped[b]?.length > 0);
  return <div className="pb-24 min-h-screen" style={{
    backgroundColor: 'var(--eqx-base)'
  }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-6">
        <h2 className="font-semibold" style={{
        fontSize: '24px',
        lineHeight: '28px',
        color: 'var(--eqx-primary)'
      }}>
          Activity
        </h2>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-2.5 px-3.5 rounded-full" style={{
        backgroundColor: 'var(--eqx-raised)',
        height: 40
      }}>
          <SearchIcon size={16} strokeWidth={1.75} style={{
          color: 'var(--eqx-tertiary)',
          flexShrink: 0
        }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search activity" className="flex-1 bg-transparent outline-none" style={{
          fontSize: '16px',
          color: 'var(--eqx-primary)'
        }} />
          <AnimatePresence>
            {isSearching && <motion.button initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.8
          }} transition={{
            duration: 0.12,
            ease: EQX_EASING
          }} onClick={() => setSearchQuery('')} className="flex-shrink-0 text-[12px] active:opacity-[0.7]" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                Clear
              </motion.button>}
          </AnimatePresence>
        </div>
      </div>

      {/* Feed content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ── Search results ── */}
          {isSearching ? <motion.div key="search" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.15,
          ease: EQX_EASING
        }}>
              {searchResults.length === 0 ? <div className="py-12 text-center">
                  <p className="text-[14px]" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                    No results for "{searchQuery}"
                  </p>
                </div> : searchBuckets.map((bucket) => <div key={bucket}>
                    <div className="pt-4 pb-2">
                      <span style={SECTION_LABEL_STYLE}>{bucket}</span>
                    </div>
                    {searchGrouped[bucket].map((entry, index) => <FeedEntryRow key={entry.id} entry={entry} members={members} isLast={index === searchGrouped[bucket].length - 1} index={index} onOpenTransaction={onOpenTransaction} onOpenEvent={onOpenEvent} />)}
                  </div>)}
            </motion.div> /* ── Normal two-section view ── */ : <motion.div key="sections" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.15,
          ease: EQX_EASING
        }}>
              {/* ── Needs Attention ── */}
              <div className="pb-2">
                <span style={SECTION_LABEL_STYLE}>Needs Attention</span>
              </div>

              {needsAttentionEntries.length === 0 ? <motion.div initial={{
            opacity: 0,
            y: 4
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.2,
            ease: EQX_EASING
          }} className="flex items-center gap-2.5 py-4" style={{
            borderBottom: '1px solid var(--eqx-hairline)'
          }}>
                  <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{
              width: 40,
              height: 40,
              backgroundColor: tintBg('var(--eqx-mint)', 10, 20)
            }}>
                    <CheckCircleIcon size={16} strokeWidth={2} style={{
                color: 'var(--eqx-mint)'
              }} />
                  </div>
                  <p className="text-[14px] font-medium" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                    You're all caught up
                  </p>
                </motion.div> : needsAttentionEntries.map((entry, index) => <FeedEntryRow key={entry.id} entry={entry} members={members} isLast={index === needsAttentionEntries.length - 1} index={index} onOpenTransaction={onOpenTransaction} onOpenEvent={onOpenEvent} />)}

              {/* ── Recent ── */}
              {recentEntries.length > 0 && <div>
                  {activeBuckets.map((bucket) => <div key={bucket}>
                      <div className="pt-6 pb-2">
                        <span style={SECTION_LABEL_STYLE}>
                          {bucket === activeBuckets[0] ? `Recent · ${bucket}` : bucket}
                        </span>
                      </div>
                      {recentGrouped[bucket].map((entry, index) => <FeedEntryRow key={entry.id} entry={entry} members={members} isLast={index === recentGrouped[bucket].length - 1} index={index} onOpenTransaction={onOpenTransaction} onOpenEvent={onOpenEvent} />)}
                    </div>)}
                </div>}
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}
// ── FeedEntryRow ──────────────────────────────────────────────────────────────
function FeedEntryRow({
  entry,
  members,
  isLast,
  index,
  onOpenTransaction,
  onOpenEvent







}: {entry: FeedEntry;members: Member[];isLast: boolean;index: number;onOpenTransaction?: (tx: Transaction) => void;onOpenEvent?: (event: GroupEvent) => void;}) {
  const handlePress = () => {
    if (entry.transaction) onOpenTransaction?.(entry.transaction);else if (entry.event) onOpenEvent?.(entry.event);
  };
  return <motion.button initial={{
    opacity: 0,
    y: 6
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.2,
    delay: Math.min(index * 0.03, 0.25),
    ease: EQX_EASING
  }} onClick={handlePress} className="w-full flex items-center text-left active:opacity-[0.92]" style={{
    padding: '14px 0',
    borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)'
  }}>
      <div className="flex-shrink-0 mr-3">
        <TypeIconChip type={entry.type} />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <p className="font-medium leading-snug flex-1 min-w-0 truncate" style={{
        fontSize: '14px',
        color: 'var(--eqx-primary)'
      }}>
          {entry.title}
        </p>
        <span className="flex-shrink-0 text-[12px]" style={{
        color: 'var(--eqx-tertiary)'
      }}>
          {relativeTime(entry.date)}
        </span>
      </div>
    </motion.button>;
}
// ── TypeIconChip ──────────────────────────────────────────────────────────────
function TypeIconChip({
  type


}: {type: FeedEntry['type'];}) {
  const config: Record<FeedEntry['type'], {
    bg: string;
    icon: React.ReactNode;
  }> = {
    fine: {
      bg: tintBg('var(--eqx-coral)', 15, 28),
      icon: <FlameIcon size={16} strokeWidth={2} style={{
        color: 'var(--eqx-coral)'
      }} />
    },
    expense: {
      bg: tintBg('var(--eqx-mint)', 15, 28),
      icon: <DollarSignIcon size={16} strokeWidth={2} style={{
        color: 'var(--eqx-mint)'
      }} />
    },
    challenge_expense: {
      bg: tintBg('var(--eqx-orange)', 15, 28),
      icon: <TrophyIcon size={16} strokeWidth={2} style={{
        color: 'var(--eqx-orange)'
      }} />
    },
    rsvp_group: {
      bg: tintBg('var(--eqx-mint)', 12, 24),
      icon: <CalendarIcon size={16} strokeWidth={2} style={{
        color: 'var(--eqx-mint)'
      }} />
    }
  };
  const {
    bg,
    icon
  } = config[type] ?? config.expense;
  return <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{
    width: 40,
    height: 40,
    backgroundColor: bg
  }}>
      {icon}
    </div>;
}