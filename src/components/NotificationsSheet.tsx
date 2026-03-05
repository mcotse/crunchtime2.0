import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, BellIcon, FlameIcon, CheckCircleIcon, CalendarIcon, MapPinIcon } from 'lucide-react';
import { Transaction, Member, Challenge } from '../data/mockData';
import { GroupEvent } from '../data/eventsData';
import { tintBg } from './tintHelper';
interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  members: Member[];
  challenges: Challenge[];
  events: GroupEvent[];
  currentUserId: string;
  isAdmin?: boolean;
  onMarkFinePaid?: (txId: string) => void;
}
const EQX_TRANSITION = {
  duration: 0.32,
  ease: [0.2, 0.0, 0.0, 1.0] as const
};
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
function formatEventDate(dateStr: string, time?: string): string {
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
export function NotificationsSheet({
  isOpen,
  onClose,
  transactions,
  members,
  challenges,
  events,
  currentUserId,
  isAdmin = false,
  onMarkFinePaid
}: NotificationsSheetProps) {
  const todayKey = new Date().toISOString().split('T')[0];
  // Pending fines
  const pendingFines = transactions.filter((t) => t.type === 'fine' && t.fineStatus === 'pending').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // Upcoming events — next 3, non-archived, future dates
  const upcomingEvents = events.filter((ev) => !ev.isArchived && ev.dateStr && ev.dateStr >= todayKey).sort((a, b) => (a.dateStr ?? '').localeCompare(b.dateStr ?? '')).slice(0, 3);
  const getMember = (id: string) => members.find((m) => m.id === id);
  const getChallenge = (id?: string) => challenges.find((c) => c.id === id);
  const sectionLabel = (text: string) => <p className="text-[11px] font-semibold uppercase tracking-[0.12em] px-1 mb-2" style={{
    color: 'var(--eqx-tertiary)'
  }}>
      {text}
    </p>;
  return <AnimatePresence>
      {isOpen && <>
          {/* Scrim */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 0.5
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASING
      }} onClick={onClose} className="fixed inset-0 z-[58]" style={{
        backgroundColor: '#000000'
      }} />

          {/* Sheet */}
          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={EQX_TRANSITION} className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col max-w-md mx-auto" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderRadius: '32px 32px 0 0',
        maxHeight: '80vh'
      }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-hairline)'
          }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b flex-shrink-0" style={{
          borderColor: 'var(--eqx-hairline)'
        }}>
              <div className="flex items-center gap-2.5">
                <BellIcon size={18} strokeWidth={1.75} style={{
              color: 'var(--eqx-primary)'
            }} />
                <h2 className="font-semibold" style={{
              fontSize: '20px',
              lineHeight: '26px',
              color: 'var(--eqx-primary)'
            }}>
                  Notifications
                </h2>
                {pendingFines.length > 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{
              backgroundColor: tintBg('var(--eqx-coral)', 15, 28),
              color: 'var(--eqx-coral)'
            }}>
                    {pendingFines.length}
                  </span>}
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Close">
                <XIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* ── Pending Fines ── */}
              <div>
                {sectionLabel('Pending Fines')}
                {pendingFines.length === 0 ? <div className="rounded-[20px] border px-4 py-5 flex items-center gap-3" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                    <CheckCircleIcon size={18} strokeWidth={1.75} style={{
                color: 'var(--eqx-mint)'
              }} />
                    <p className="text-[14px] font-medium" style={{
                color: 'var(--eqx-secondary)'
              }}>
                      No outstanding fines
                    </p>
                  </div> : <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                    {pendingFines.map((fine, idx) => {
                const member = getMember(fine.memberId);
                const challenge = getChallenge(fine.challengeId);
                const isLast = idx === pendingFines.length - 1;
                return <motion.div key={fine.id} initial={{
                  opacity: 0,
                  x: -6
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  duration: 0.18,
                  delay: idx * 0.04,
                  ease: EQX_EASING
                }} className="flex items-center gap-3 px-4 py-3.5" style={{
                  borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)'
                }}>
                          {/* Flame icon bg */}
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{
                    backgroundColor: tintBg('var(--eqx-coral)', 15, 28, 'var(--eqx-surface)')
                  }}>
                            <FlameIcon size={16} strokeWidth={2} style={{
                      color: 'var(--eqx-coral)'
                    }} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {/* Member avatar */}
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0" style={{
                        backgroundColor: member?.color ?? 'var(--eqx-raised)'
                      }}>
                                {member?.initials?.charAt(0)}
                              </div>
                              <span className="text-[14px] font-semibold truncate" style={{
                        color: 'var(--eqx-primary)'
                      }}>
                                {member?.name.split(' ')[0] ?? 'Unknown'}
                              </span>
                              <span className="text-[13px] font-bold tabular-nums flex-shrink-0" style={{
                        color: 'var(--eqx-coral)'
                      }}>
                                ${fine.amount.toFixed(0)}
                              </span>
                            </div>
                            {challenge && <p className="text-[11px] mt-0.5 truncate" style={{
                      color: 'var(--eqx-tertiary)'
                    }}>
                                {challenge.emoji} {challenge.name}
                              </p>}
                          </div>

                          {/* Mark as Paid (admin only) */}
                          {isAdmin && onMarkFinePaid && <button onClick={() => onMarkFinePaid(fine.id)} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full active:opacity-[0.7]" style={{
                    backgroundColor: tintBg('var(--eqx-mint)', 15, 28, 'var(--eqx-surface)'),
                    border: `1px solid ${tintBg('var(--eqx-mint)', 35, 50, 'transparent')}`
                  }}>
                              <CheckCircleIcon size={12} strokeWidth={2.5} style={{
                      color: 'var(--eqx-mint)'
                    }} />
                              <span className="text-[11px] font-semibold" style={{
                      color: 'var(--eqx-mint)'
                    }}>
                                Paid
                              </span>
                            </button>}
                        </motion.div>;
              })}
                  </div>}
              </div>

              {/* ── Upcoming Events ── */}
              <div>
                {sectionLabel('Upcoming Events')}
                {upcomingEvents.length === 0 ? <div className="rounded-[20px] border px-4 py-5 flex items-center gap-3" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                    <CalendarIcon size={18} strokeWidth={1.75} style={{
                color: 'var(--eqx-tertiary)'
              }} />
                    <p className="text-[14px] font-medium" style={{
                color: 'var(--eqx-secondary)'
              }}>
                      No upcoming events
                    </p>
                  </div> : <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                    {upcomingEvents.map((ev, idx) => {
                const myRsvp = ev.rsvps.find((r) => r.memberId === currentUserId);
                const rsvpStatus = myRsvp?.status;
                const rsvpColor = rsvpStatus === 'going' ? 'var(--eqx-mint)' : rsvpStatus === 'maybe' ? 'var(--eqx-orange)' : rsvpStatus === 'not_going' ? 'var(--eqx-coral)' : 'var(--eqx-tertiary)';
                const rsvpLabel = rsvpStatus === 'going' ? 'Going' : rsvpStatus === 'maybe' ? 'Maybe' : rsvpStatus === 'not_going' ? "Can't go" : 'No RSVP';
                const isLast = idx === upcomingEvents.length - 1;
                return <motion.div key={ev.id} initial={{
                  opacity: 0,
                  x: -6
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  duration: 0.18,
                  delay: 0.1 + idx * 0.04,
                  ease: EQX_EASING
                }} className="flex items-center gap-3 px-4 py-3.5" style={{
                  borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)'
                }}>
                          {/* Emoji */}
                          <span className="text-[22px] leading-none flex-shrink-0">
                            {ev.coverEmoji}
                          </span>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold truncate" style={{
                      color: 'var(--eqx-primary)'
                    }}>
                              {ev.title}
                            </p>
                            {ev.dateStr && <p className="text-[11px] mt-0.5" style={{
                      color: 'var(--eqx-tertiary)'
                    }}>
                                {formatEventDate(ev.dateStr, ev.time)}
                              </p>}
                            {ev.location && <p className="text-[11px] mt-0.5 flex items-center gap-1 truncate" style={{
                      color: 'var(--eqx-tertiary)'
                    }}>
                                <MapPinIcon size={9} strokeWidth={1.5} />
                                {ev.location}
                              </p>}
                          </div>

                          {/* RSVP badge */}
                          <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{
                    color: rsvpColor,
                    backgroundColor: tintBg(rsvpColor, 12, 24, 'var(--eqx-surface)'),
                    border: `1px solid ${tintBg(rsvpColor, 30, 45, 'transparent')}`
                  }}>
                            {rsvpLabel}
                          </span>
                        </motion.div>;
              })}
                  </div>}
              </div>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}