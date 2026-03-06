import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ChevronRightIcon, SendIcon, LinkIcon } from 'lucide-react';
import { CoverIcon } from './coverIcons';
import { Challenge, Member, Transaction } from '../data/mockData';
import { Poll } from '../data/pollsData';
import { tintRgba } from './tintHelper';
interface ChallengeDetailSheetProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  transactions: Transaction[];
  polls: Poll[];
  onSwitchToPolls?: () => void;
  onOpenPoll?: (poll: Poll) => void;
  onJoinChallenge?: (challengeId: string) => void;
  currentUserId: string;
}
interface Comment {
  id: string;
  memberId: string;
  text: string;
  timestamp: string;
}
const EQX_TRANSITION = {
  duration: 0.32,
  ease: [0.2, 0.0, 0.0, 1.0] as const
};
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
function getDaysRemaining(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}
function getDaysElapsed(startDate: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
}
function getTotalDays(startDate: string, endDate: string): number {
  return Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
}
function formatCommentTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
// Seed mock comments per challenge
function getSeedComments(challenge: Challenge): Comment[] {
  const pid = challenge.participantIds;
  if (!pid.length) return [];
  const ago = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  if (challenge.status === 'active') {
    return [{
      id: 'c-seed-1',
      memberId: pid[1] ?? pid[0],
      text: 'Day 3 and already struggling, this is harder than I thought',
      timestamp: ago(48)
    }, {
      id: 'c-seed-2',
      memberId: pid[0],
      text: 'Stay strong! We got this',
      timestamp: ago(47)
    }, {
      id: 'c-seed-3',
      memberId: pid[2] ?? pid[0],
      text: 'Anyone else using an app to track? I found one that helps',
      timestamp: ago(24)
    }, {
      id: 'c-seed-4',
      memberId: pid[1] ?? pid[0],
      text: 'I slipped up yesterday... already paid my fine',
      timestamp: ago(8)
    }];
  }
  if (challenge.status === 'upcoming') {
    return [{
      id: 'c-seed-1',
      memberId: pid[0],
      text: 'Excited for this one! Who else is in?',
      timestamp: ago(72)
    }, {
      id: 'c-seed-2',
      memberId: pid[1] ?? pid[0],
      text: "I'm in! Setting my alarm now.",
      timestamp: ago(48)
    }];
  }
  if (challenge.status === 'completed') {
    return [{
      id: 'c-seed-1',
      memberId: pid[0],
      text: 'That was brutal but worth it. Who passed?',
      timestamp: ago(800)
    }, {
      id: 'c-seed-2',
      memberId: pid[1] ?? pid[0],
      text: 'I made it! Barely, but I made it',
      timestamp: ago(798)
    }, {
      id: 'c-seed-3',
      memberId: pid[2] ?? pid[0],
      text: 'Congrats everyone. The fund is looking healthy',
      timestamp: ago(790)
    }];
  }
  return [];
}
export function ChallengeDetailSheet({
  challenge,
  isOpen,
  onClose,
  members,
  transactions,
  polls,
  onSwitchToPolls,
  onOpenPoll,
  onJoinChallenge,
  currentUserId
}: ChallengeDetailSheetProps) {
  const [commentsByChallenge, setCommentsByChallenge] = useState<Record<string, Comment[]>>({});
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Seed comments when challenge changes
  useEffect(() => {
    if (!challenge) return;
    setCommentsByChallenge((prev) => {
      if (prev[challenge.id]) return prev;
      return {
        ...prev,
        [challenge.id]: getSeedComments(challenge)
      };
    });
  }, [challenge?.id]);
  const comments = challenge ? commentsByChallenge[challenge.id] ?? [] : [];
  const handleSend = () => {
    if (!challenge || !inputText.trim()) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      memberId: currentUserId,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };
    setCommentsByChallenge((prev) => ({
      ...prev,
      [challenge.id]: [...(prev[challenge.id] ?? []), newComment]
    }));
    setInputText('');
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, 60);
  };
  if (!challenge) return null;
  const isActive = challenge.status === 'active';
  const isUpcoming = challenge.status === 'upcoming';
  const isPast = challenge.status === 'completed';
  const linkedPoll = challenge.linkedPollId ? polls.find((p) => p.id === challenge.linkedPollId) : null;
  const daysRemaining = getDaysRemaining(challenge.endDate);
  const daysElapsed = getDaysElapsed(challenge.startDate);
  const totalDays = getTotalDays(challenge.startDate, challenge.endDate);
  const progressPct = Math.min(1, daysElapsed / totalDays);
  const isParticipant = challenge.participantIds.includes(currentUserId);
  // Compute completed stats
  const challengeFines = transactions.filter((t) => t.type === 'fine' && t.challengeId === challenge.id);
  const finedMemberIds = new Set(challengeFines.map((t) => t.memberId));
  const passedCount = challenge.participantIds.filter((id) => !finedMemberIds.has(id)).length;
  const finesCollected = challengeFines.filter((t) => t.fineStatus === 'paid').reduce((s, t) => s + t.amount, 0);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);
  // Participant names for the row label
  const participantMembers = challenge.participantIds.map((id) => members.find((m) => m.id === id)).filter(Boolean) as Member[];
  const shownAvatars = participantMembers.slice(0, 5);
  const overflow = participantMembers.length - 5;
  const firstNames = participantMembers.slice(0, 2).map((m) => m.name.split(' ')[0]);
  const participantLabel = participantMembers.length > 2 ? `${firstNames.join(', ')} +${participantMembers.length - 2} participating` : `${firstNames.join(', ')} participating`;
  // Status pill
  const statusColor = isActive ? 'var(--eqx-mint)' : isUpcoming ? 'var(--eqx-orange)' : 'var(--eqx-tertiary)';
  const statusLabel = isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed';
  const statusBg = isActive ? 'color-mix(in srgb, var(--eqx-mint) 8%, transparent)' : isUpcoming ? 'color-mix(in srgb, var(--eqx-orange) 8%, transparent)' : 'color-mix(in srgb, var(--eqx-tertiary) 12%, transparent)';
  const statusBorder = isActive ? 'color-mix(in srgb, var(--eqx-mint) 20%, transparent)' : isUpcoming ? 'color-mix(in srgb, var(--eqx-orange) 20%, transparent)' : 'color-mix(in srgb, var(--eqx-tertiary) 20%, transparent)';
  // Subtitle line
  const subtitleLine = isPast ? `Ended ${formatDateShort(challenge.endDate)} · ${passedCount}/${challenge.participantIds.length} passed` : isUpcoming ? `Starts ${formatDateShort(challenge.startDate)} · ${challenge.participantIds.length} joining` : `Active · Ends ${formatDateShort(challenge.endDate)} · ${daysRemaining} days left`;
  return <AnimatePresence>
      {isOpen && <>
          {/* Scrim */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 0.6
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
        backgroundColor: 'var(--eqx-base)',
        borderRadius: '28px 28px 0 0',
        maxHeight: '92vh'
      }}>
            {/* Handle + close */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0">
              <div className="w-9 h-9" /> {/* spacer */}
              <div className="w-10 h-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-hairline)'
          }} />
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.7]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Close">
                <XIcon size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{
          paddingBottom: 80
        }}>
              <div className="px-4 pt-1 pb-2 space-y-4">
                {/* ── SUMMARY CARD ── */}
                <motion.div initial={{
              opacity: 0,
              y: 6
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.24,
              ease: EQX_EASING
            }} className="rounded-[20px]" style={{
              backgroundColor: 'var(--eqx-raised)',
              border: '1px solid var(--eqx-hairline)',
              padding: '16px'
            }}>
                  {/* Top row: emoji + title + pill */}
                  <div className="flex items-start gap-3">
                    <span className="leading-none flex-shrink-0 mt-0.5">
                      <CoverIcon name={challenge.emoji} size={28} strokeWidth={1.5} style={{ color: 'var(--eqx-secondary)' }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold leading-snug flex-1 min-w-0" style={{
                      fontSize: 16,
                      color: 'var(--eqx-primary)'
                    }}>
                          {challenge.name}
                        </p>
                        {/* Status pill */}
                        <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{
                      backgroundColor: statusBg,
                      color: statusColor,
                      border: `1px solid ${statusBorder}`
                    }}>
                          {statusLabel}
                        </span>
                      </div>
                      {/* Subtitle */}
                      <p className="mt-1 leading-snug" style={{
                    fontSize: 12,
                    color: 'var(--eqx-tertiary)'
                  }}>
                        {subtitleLine}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 leading-relaxed" style={{
                fontSize: 13,
                color: 'var(--eqx-secondary)'
              }}>
                    {challenge.description}
                  </p>

                  {/* Progress bar (active + upcoming) */}
                  {!isPast && <div className="mt-3 rounded-full overflow-hidden" style={{
                height: 4,
                backgroundColor: 'var(--eqx-hairline)'
              }}>
                      <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${progressPct * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.15,
                  ease: EQX_EASING
                }} style={{
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: isActive ? 'var(--eqx-orange)' : 'var(--eqx-tertiary)'
                }} />
                    </div>}

                  {/* Stakes row (active + upcoming) */}
                  {!isPast && <div className="mt-3 flex items-center gap-1.5">
                      <span style={{
                  fontSize: 12,
                  color: 'var(--eqx-tertiary)'
                }}>
                        If you fail
                      </span>
                      <span style={{
                  fontSize: 12,
                  color: 'var(--eqx-tertiary)'
                }}>
                        →
                      </span>
                      <span className="font-semibold" style={{
                  fontSize: 12,
                  color: 'var(--eqx-coral)'
                }}>
                        {fmt(challenge.fineAmount)} to the Crunch Fund
                      </span>
                    </div>}

                  {/* Completed outcome row */}
                  {isPast && <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
                  backgroundColor: tintRgba(132, 239, 182, 0.08, 0.18),
                  border: `1px solid ${tintRgba(132, 239, 182, 0.2, 0.35)}`
                }}>
                        <span className="font-semibold" style={{
                    fontSize: 12,
                    color: 'var(--eqx-mint)'
                  }}>
                          {passedCount}/{challenge.participantIds.length} passed
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
                  backgroundColor: tintRgba(254, 158, 109, 0.08, 0.18),
                  border: `1px solid ${tintRgba(254, 158, 109, 0.2, 0.35)}`
                }}>
                        <span className="font-semibold" style={{
                    fontSize: 12,
                    color: 'var(--eqx-orange)'
                  }}>
                          {fmt(finesCollected)} collected
                        </span>
                      </div>
                    </div>}
                </motion.div>

                {/* ── PARTICIPANTS ROW ── */}
                <motion.div initial={{
              opacity: 0,
              y: 4
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.2,
              delay: 0.06,
              ease: EQX_EASING
            }} className="flex items-center gap-2.5 px-1">
                  {/* Avatar stack */}
                  <div className="flex items-center">
                    {shownAvatars.map((m, i) => <div key={m.id} className="rounded-full flex items-center justify-center text-white font-bold border-2 flex-shrink-0" style={{
                  width: 24,
                  height: 24,
                  fontSize: 9,
                  backgroundColor: m.color,
                  borderColor: 'var(--eqx-base)',
                  marginLeft: i === 0 ? 0 : -7,
                  zIndex: shownAvatars.length - i,
                  position: 'relative'
                }}>
                        {m.initials.charAt(0)}
                      </div>)}
                    {overflow > 0 && <div className="rounded-full flex items-center justify-center font-bold border-2 flex-shrink-0" style={{
                  width: 24,
                  height: 24,
                  fontSize: 9,
                  backgroundColor: 'var(--eqx-raised)',
                  borderColor: 'var(--eqx-base)',
                  color: 'var(--eqx-tertiary)',
                  marginLeft: -7,
                  position: 'relative',
                  zIndex: 0
                }}>
                        +{overflow}
                      </div>}
                  </div>
                  <span style={{
                fontSize: 12,
                color: 'var(--eqx-tertiary)'
              }}>
                    {participantLabel}
                  </span>
                </motion.div>

                {/* ── LINKED POLL ROW ── */}
                {linkedPoll && <motion.button initial={{
              opacity: 0,
              y: 4
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.2,
              delay: 0.1,
              ease: EQX_EASING
            }} onClick={() => {
              if (onOpenPoll && linkedPoll) {
                onOpenPoll(linkedPoll);
              } else {
                onSwitchToPolls?.();
                onClose();
              }
            }} className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] active:opacity-[0.88] text-left" style={{
              backgroundColor: 'var(--eqx-surface)',
              border: '1px solid var(--eqx-hairline)'
            }}>
                    <div className="w-7 h-7 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{
                backgroundColor: 'var(--eqx-raised)'
              }}>
                      <LinkIcon size={13} strokeWidth={1.75} style={{
                  color: 'var(--eqx-tertiary)'
                }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{
                  fontSize: 13,
                  color: 'var(--eqx-secondary)'
                }}>
                        {linkedPoll.title}
                      </p>
                    </div>
                    <ChevronRightIcon size={14} style={{
                color: 'var(--eqx-tertiary)',
                flexShrink: 0
              }} />
                  </motion.button>}

                {/* ── JOIN CTA (upcoming, not participant) ── */}
                {isUpcoming && !isParticipant && onJoinChallenge && <motion.button initial={{
              opacity: 0,
              y: 4
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.2,
              delay: 0.12,
              ease: EQX_EASING
            }} onClick={() => onJoinChallenge(challenge.id)} className="w-full py-3.5 rounded-[16px] font-semibold active:opacity-[0.85]" style={{
              backgroundColor: tintRgba(254, 158, 109, 0.1, 0.2),
              border: `1px solid ${tintRgba(254, 158, 109, 0.3, 0.45)}`,
              fontSize: 14,
              color: 'var(--eqx-orange)'
            }}>
                    + Join Challenge
                  </motion.button>}

                {/* ── THREAD SECTION ── */}
                <div className="pt-2">
                  {/* Section label */}
                  <p className="uppercase tracking-[0.1em] mb-4 px-1" style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--eqx-tertiary)'
              }}>
                    Comments
                  </p>

                  {/* Thread messages */}
                  <div className="space-y-5">
                    {comments.length === 0 ? <p className="px-1 text-center py-4" style={{
                  fontSize: 13,
                  color: 'var(--eqx-tertiary)'
                }}>
                        No comments yet. Start the thread.
                      </p> : comments.map((comment, i) => {
                  const m = members.find((mb) => mb.id === comment.memberId);
                  if (!m) return null;
                  const isMe = comment.memberId === currentUserId;
                  return <motion.div key={comment.id} initial={{
                    opacity: 0,
                    y: 6
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    duration: 0.18,
                    delay: i * 0.04,
                    ease: EQX_EASING
                  }} className="flex items-start gap-2.5">
                            {/* Avatar */}
                            <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5" style={{
                      width: 28,
                      height: 28,
                      fontSize: 10,
                      backgroundColor: m.color
                    }}>
                              {m.initials.charAt(0)}
                            </div>

                            {/* Bubble */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold" style={{
                          fontSize: 12,
                          color: 'var(--eqx-primary)'
                        }}>
                                  {m.name.split(' ')[0]}
                                  {isMe && <span style={{
                            color: 'var(--eqx-tertiary)',
                            fontWeight: 400
                          }}>
                                      {' '}
                                      · you
                                    </span>}
                                </span>
                                <span style={{
                          fontSize: 11,
                          color: 'var(--eqx-tertiary)'
                        }}>
                                  {formatCommentTime(comment.timestamp)}
                                </span>
                              </div>
                              <p className="leading-relaxed" style={{
                        fontSize: 14,
                        color: 'var(--eqx-secondary)'
                      }}>
                                {comment.text}
                              </p>
                            </div>
                          </motion.div>;
                })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── PINNED INPUT ── */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3" style={{
          backgroundColor: 'var(--eqx-base)',
          borderTop: '1px solid var(--eqx-raised)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
        }}>
              {/* Current user avatar */}
              {(() => {
            const me = members.find((m) => m.id === currentUserId);
            return me ? <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{
              width: 28,
              height: 28,
              fontSize: 10,
              backgroundColor: me.color
            }}>
                    {me.initials.charAt(0)}
                  </div> : null;
          })()}

              {/* Input */}
              <div className="flex-1 flex items-center rounded-full px-4" style={{
            backgroundColor: 'var(--eqx-raised)',
            border: '1px solid var(--eqx-hairline)',
            height: 40
          }}>
                <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }} placeholder="Add a comment…" className="flex-1 bg-transparent outline-none" style={{
              fontSize: 16,
              color: 'var(--eqx-primary)'
            }} />
              </div>

              {/* Send button */}
              <button onClick={handleSend} disabled={!inputText.trim()} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:opacity-[0.8] transition-opacity" style={{
            backgroundColor: inputText.trim() ? 'var(--eqx-orange)' : 'var(--eqx-raised)',
            border: inputText.trim() ? 'none' : '1px solid var(--eqx-hairline)'
          }} aria-label="Send comment">
                <SendIcon size={14} strokeWidth={2} style={{
              color: inputText.trim() ? 'var(--eqx-base)' : 'var(--eqx-tertiary)'
            }} />
              </button>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}