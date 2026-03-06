import React, { useEffect, useState, useRef, Fragment, Component, ComponentType } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Pencil, Copy, Trash2, Calendar, Clock, MapPin, ArrowUp, ChevronRight, Receipt, ChevronDown, ChevronUp, ArchiveIcon, ArchiveRestoreIcon, Check, HelpCircle } from 'lucide-react';
import { GroupEvent } from '../data/eventsData';
import { Member, Transaction } from '../data/mockData';
// ─── Props ────────────────────────────────────────────────────────────────────
interface EventDetailSheetProps {
  event: GroupEvent | null;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  transactions: Transaction[];
  currentUserId: string;
  isAdmin?: boolean;
  onRsvp: (eventId: string, rsvp: {
    status: 'going' | 'maybe' | 'not_going';
    guestCount?: number;
    proxyFor?: string[];
  }) => void;
  onDelete: (eventId: string) => void;
  onArchive: (eventId: string) => void;
  onUnarchive: (eventId: string) => void;
  onEdit: (event: GroupEvent) => void;
  onOpenTransaction?: (tx: Transaction) => void;
  onAddExpense?: () => void;
}
// ─── Constants ────────────────────────────────────────────────────────────────
const EQX_SPRING = {
  type: 'spring',
  damping: 32,
  stiffness: 320
} as const;
const statusDotColor: Record<string, string> = {
  going: 'var(--eqx-mint)',
  maybe: 'var(--eqx-orange)',
  not_going: 'var(--eqx-coral)'
};
const statusIndicatorConfig: Record<string, {
  color: string;
  bg: string;
  Icon: ComponentType<any>;
}> = {
  going: {
    color: 'var(--eqx-mint)',
    bg: 'color-mix(in srgb, var(--eqx-mint) 15%, var(--eqx-raised))',
    Icon: Check
  },
  maybe: {
    color: 'var(--eqx-orange)',
    bg: 'color-mix(in srgb, var(--eqx-orange) 15%, var(--eqx-raised))',
    Icon: HelpCircle
  },
  not_going: {
    color: 'var(--eqx-coral)',
    bg: 'color-mix(in srgb, var(--eqx-coral) 15%, var(--eqx-raised))',
    Icon: X
  }
};
function StatusIndicator({
  status


}: {status: string;}) {
  const config = statusIndicatorConfig[status];
  if (!config) return null;
  const {
    Icon,
    color,
    bg
  } = config;
  return <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{
    width: 16,
    height: 16,
    backgroundColor: bg
  }} aria-label={status === 'not_going' ? 'Not going' : status.charAt(0).toUpperCase() + status.slice(1)}>
      <Icon size={12} strokeWidth={2.5} style={{
      color
    }} />
    </div>;
}
const SAMPLE_COMMENTS = [{
  id: 'sc1',
  user: 'Alex M.',
  color: 'var(--eqx-coral)',
  time: '2h ago',
  message: "Can't wait for this! Should I bring anything?"
}, {
  id: 'sc2',
  user: 'Jordan K.',
  color: 'var(--eqx-periwinkle)',
  time: '45m ago',
  message: "I'll bring drinks 🍹"
}];
// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({
  children


}: {children: React.ReactNode;}) {
  return <p className="font-semibold uppercase" style={{
    fontSize: 11,
    letterSpacing: '0.08em',
    color: 'var(--eqx-tertiary)',
    marginBottom: 8
  }}>
      {children}
    </p>;
}
function Avatar({
  name,
  color,
  size = 24,
  initials





}: {name: string;color?: string;size?: number;initials?: string;}) {
  const letters = initials ?? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const bg = color ?? 'var(--eqx-periwinkle)';
  return <div className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0" style={{
    width: size,
    height: size,
    backgroundColor: bg,
    fontSize: size * 0.33,
    border: '2px solid var(--eqx-surface)'
  }}>
      {letters}
    </div>;
}
function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}
function formatTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
// ─── Main Component ───────────────────────────────────────────────────────────
export function EventDetailSheet({
  event,
  isOpen,
  onClose,
  members,
  transactions,
  currentUserId,
  isAdmin = false,
  onRsvp,
  onDelete,
  onArchive,
  onUnarchive,
  onEdit,
  onOpenTransaction,
  onAddExpense
}: EventDetailSheetProps) {
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'maybe' | 'not_going' | null>(null);
  const [localGuestCount, setLocalGuestCount] = useState(0);
  const [localProxyFor, setLocalProxyFor] = useState<string[]>([]);
  const [attendeesExpanded, setAttendeesExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(SAMPLE_COMMENTS);
  const [moreRsvpOpen, setMoreRsvpOpen] = useState(false);
  const dragControls = useDragControls();
  useEffect(() => {
    if (event) {
      const myRsvp = event.rsvps.find((r) => r.memberId === currentUserId);
      setRsvpStatus(myRsvp?.status ?? null);
      setLocalGuestCount(myRsvp?.guestCount ?? 0);
      setLocalProxyFor(myRsvp?.proxyFor ?? []);
    }
  }, [event?.id, isOpen]);
  useEffect(() => {
    if (!isOpen) {
      setAttendeesExpanded(false);
      setCommentText('');
      setMoreRsvpOpen(false);
    }
  }, [isOpen]);
  if (!event) return null;
  const isPast = event.dateStr ? new Date(event.dateStr + 'T23:59:59') < new Date() : false;
  const creator = members.find((m) => m.id === event.creatorId);
  const isCreator = event.creatorId === currentUserId;
  const canEdit = isCreator || isAdmin;
  const canDelete = isAdmin;
  const currentMember = members.find((m) => m.id === currentUserId);
  const handleRsvp = (status: 'going' | 'maybe' | 'not_going') => {
    setRsvpStatus(status);
    const guestCount = status === 'going' ? localGuestCount : 0;
    const proxyFor = status === 'going' ? localProxyFor : [];
    onRsvp(event.id, {
      status,
      guestCount,
      proxyFor
    });
  };
  const handleGuestCountChange = (delta: number) => {
    const next = Math.max(0, localGuestCount + delta);
    setLocalGuestCount(next);
    onRsvp(event.id, {
      status: 'going',
      guestCount: next,
      proxyFor: localProxyFor
    });
  };
  const handleToggleProxy = (memberId: string) => {
    const next = localProxyFor.includes(memberId) ? localProxyFor.filter((id) => id !== memberId) : [...localProxyFor, memberId];
    setLocalProxyFor(next);
    onRsvp(event.id, {
      status: 'going',
      guestCount: localGuestCount,
      proxyFor: next
    });
  };
  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setComments((prev) => [...prev, {
      id: `c-${Date.now()}`,
      user: currentMember?.name?.split(' ')[0] ?? 'Me',
      color: currentMember?.color ?? 'var(--eqx-periwinkle)',
      time: 'just now',
      message: text
    }]);
    setCommentText('');
  };
  const alreadyRsvpedIds = new Set(event.rsvps.map((r) => r.memberId));
  const proxyableMembers = members.filter((m) => m.id !== currentUserId && !alreadyRsvpedIds.has(m.id));
  const allRsvps = event.rsvps;
  const visibleRsvps = allRsvps.slice(0, 5);
  const extraCount = Math.max(0, allRsvps.length - 5);
  const totalAttendeeCount = allRsvps.reduce((sum, r) => {
    return sum + 1 + (r.guestCount ?? 0) + (r.proxyFor?.length ?? 0);
  }, 0);
  const rsvpOptions = [{
    status: 'going' as const,
    label: 'Going',
    color: 'var(--eqx-mint)'
  }, {
    status: 'maybe' as const,
    label: 'Maybe',
    color: 'var(--eqx-orange)'
  }, {
    status: 'not_going' as const,
    label: "Can't go",
    color: 'var(--eqx-coral)'
  }];
  const selectedPillStyle: Record<string, {
    bg: string;
    border: string;
    text: string;
    label: string;
  }> = {
    going: {
      bg: 'color-mix(in srgb, var(--eqx-mint) 15%, var(--eqx-raised))',
      border: 'color-mix(in srgb, var(--eqx-mint) 40%, transparent)',
      text: 'var(--eqx-mint)',
      label: 'Going'
    },
    maybe: {
      bg: 'color-mix(in srgb, var(--eqx-orange) 15%, var(--eqx-raised))',
      border: 'color-mix(in srgb, var(--eqx-orange) 40%, transparent)',
      text: 'var(--eqx-orange)',
      label: 'Maybe'
    },
    not_going: {
      bg: 'color-mix(in srgb, var(--eqx-coral) 15%, var(--eqx-raised))',
      border: 'color-mix(in srgb, var(--eqx-coral) 40%, transparent)',
      text: 'var(--eqx-coral)',
      label: "Can't go"
    }
  };
  return <AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <motion.div key="backdrop" initial={{
        opacity: 0
      }} animate={{
        opacity: 0.6
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="fixed inset-0 z-50" style={{
        backgroundColor: '#000000'
      }} onClick={onClose} />

          {/* Sheet */}
          <motion.div key="sheet" drag="y" dragControls={dragControls} dragListener={false} dragConstraints={{
        top: 0
      }} dragElastic={{
        top: 0,
        bottom: 0.35
      }} onDragEnd={(_, info) => {
        if (info.offset.y > 120 || info.velocity.y > 500) onClose();
      }} initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={EQX_SPRING} className="fixed bottom-0 left-0 right-0 z-[51] flex flex-col max-w-md mx-auto" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderRadius: '32px 32px 0 0',
        maxHeight: '92vh'
      }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing" onPointerDown={(e) => dragControls.start(e)}>
              <div className="w-10 h-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-hairline)'
          }} />
            </div>

            {/* Action icons — top right */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
              {canEdit && <button onClick={() => onEdit(event)} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Edit event">
                  <Pencil size={18} strokeWidth={1.5} />
                </button>}
              <button onClick={() => navigator.clipboard?.writeText(`${event.title} — ${formatDate(event.dateStr) ?? ''} ${formatTime(event.time) ?? ''}`)} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Copy event details">
                <Copy size={18} strokeWidth={1.5} />
              </button>
              {canEdit && <button onClick={() => onArchive(event.id)} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Archive event">
                  <ArchiveIcon size={18} strokeWidth={1.5} />
                </button>}
              {canDelete && <button onClick={() => {
            onDelete(event.id);
            onClose();
          }} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-coral)'
          }} aria-label="Delete event">
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>}
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Close">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {/* ── Header ── */}
              <div className="pb-4">
                <div className="flex items-center gap-2.5 pr-20">
                  <span className="flex-shrink-0 select-none" style={{
                fontSize: 28,
                lineHeight: 1
              }}>
                    {event.coverEmoji}
                  </span>
                  <h2 className="font-semibold leading-tight" style={{
                fontSize: 22,
                color: 'var(--eqx-primary)'
              }}>
                    {event.title}
                  </h2>
                </div>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                  {creator && <span className="text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      by {creator.name}
                    </span>}
                  {formatDate(event.dateStr) && <span className="flex items-center gap-1 text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      <Calendar size={11} color="var(--eqx-tertiary)" strokeWidth={1.5} />
                      {formatDate(event.dateStr)}
                    </span>}
                  {formatTime(event.time) && <span className="flex items-center gap-1 text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      <Clock size={11} color="var(--eqx-tertiary)" strokeWidth={1.5} />
                      {formatTime(event.time)}
                    </span>}
                  {event.location && <span className="flex items-center gap-1 text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      <MapPin size={11} color="var(--eqx-tertiary)" strokeWidth={1.5} />
                      {event.location}
                    </span>}
                </div>
              </div>

              <div style={{
            height: 1,
            backgroundColor: 'var(--eqx-hairline)'
          }} />

              {/* ── RSVP ── */}
              <div className="pt-4 pb-4">
                <SectionLabel>RSVP</SectionLabel>

                {isPast ? rsvpStatus && selectedPillStyle[rsvpStatus] ? <div className="inline-flex items-center rounded-full px-4 py-2" style={{
              backgroundColor: selectedPillStyle[rsvpStatus].bg,
              border: `1px solid ${selectedPillStyle[rsvpStatus].border}`
            }}>
                      <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: selectedPillStyle[rsvpStatus].text
              }}>
                        {selectedPillStyle[rsvpStatus].label}
                      </span>
                    </div> : <div className="inline-flex items-center rounded-full px-4 py-2" style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--eqx-hairline)'
            }}>
                      <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--eqx-tertiary)'
              }}>
                        No reply
                      </span>
                    </div> : <>
                    {/* 3 main pills — always visible */}
                    <div className="flex gap-2">
                      {rsvpOptions.map((opt) => {
                  const selected = rsvpStatus === opt.status;
                  const pill = selectedPillStyle[opt.status];
                  return <motion.button key={opt.status} whileTap={{
                    scale: 0.96
                  }} onClick={() => handleRsvp(opt.status)} className="flex-1 rounded-full py-2.5 font-medium transition-all duration-200" style={{
                    fontSize: 14,
                    backgroundColor: selected ? pill.bg : 'transparent',
                    color: selected ? pill.text : 'var(--eqx-tertiary)',
                    border: selected ? `1.5px solid ${pill.border}` : '1.5px solid var(--eqx-hairline)'
                  }}>
                            {opt.label}
                          </motion.button>;
                })}
                    </div>

                    {/* "More options" disclosure — guest +1 and proxy RSVP */}
                    <div className="mt-2">
                      <button onClick={() => setMoreRsvpOpen((v) => !v)} className="flex items-center gap-1 text-left text-[13px]" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                        {moreRsvpOpen ? <ChevronUp size={12} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />}
                        More options
                      </button>

                      <AnimatePresence>
                        {moreRsvpOpen && <motion.div initial={{
                    opacity: 0,
                    height: 0
                  }} animate={{
                    opacity: 1,
                    height: 'auto'
                  }} exit={{
                    opacity: 0,
                    height: 0
                  }} transition={{
                    duration: 0.22,
                    ease: [0.2, 0, 0, 1]
                  }} className="overflow-hidden">
                            <div className="rounded-2xl overflow-hidden mt-2" style={{
                      backgroundColor: 'var(--eqx-raised)'
                    }}>
                              {/* Anonymous guests row */}
                              <div className="flex items-center justify-between px-4 py-3" style={{
                        borderBottom: proxyableMembers.length > 0 ? '1px solid var(--eqx-hairline)' : 'none'
                      }}>
                                <div>
                                  <p className="font-semibold" style={{
                            fontSize: 14,
                            color: 'var(--eqx-primary)'
                          }}>
                                    Guests
                                  </p>
                                  <p className="text-[13px]" style={{
                            color: 'var(--eqx-tertiary)'
                          }}>
                                    Additional guests
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <motion.button whileTap={{
                            scale: 0.88
                          }} onClick={() => handleGuestCountChange(-1)} disabled={localGuestCount === 0} className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity" style={{
                            backgroundColor: 'var(--eqx-hairline)',
                            color: localGuestCount === 0 ? 'var(--eqx-hairline)' : 'var(--eqx-tertiary)'
                          }}>
                                    <span style={{
                              fontSize: 18,
                              lineHeight: 1,
                              marginTop: -1
                            }}>
                                      −
                                    </span>
                                  </motion.button>
                                  <span className="tabular-nums font-semibold" style={{
                            fontSize: 16,
                            color: 'var(--eqx-primary)',
                            minWidth: 16,
                            textAlign: 'center'
                          }}>
                                    {localGuestCount}
                                  </span>
                                  <motion.button whileTap={{
                            scale: 0.88
                          }} onClick={() => handleGuestCountChange(1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{
                            backgroundColor: 'var(--eqx-hairline)',
                            color: 'var(--eqx-tertiary)'
                          }}>
                                    <span style={{
                              fontSize: 18,
                              lineHeight: 1,
                              marginTop: -1
                            }}>
                                      +
                                    </span>
                                  </motion.button>
                                </div>
                              </div>

                              {/* Proxy RSVP row */}
                              {proxyableMembers.length > 0 && <div className="px-4 py-3">
                                  <p className="mb-2.5 text-[13px]" style={{
                          color: 'var(--eqx-tertiary)'
                        }}>
                                    On behalf of
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {proxyableMembers.map((m) => {
                            const isSelected = localProxyFor.includes(m.id);
                            return <motion.button key={m.id} whileTap={{
                              scale: 0.93
                            }} onClick={() => handleToggleProxy(m.id)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors" style={{
                              backgroundColor: 'var(--eqx-raised)',
                              border: '1px solid var(--eqx-hairline)'
                            }}>
                                          <Avatar name={m.name} color={m.color} initials={m.initials} size={20} />
                                          <span style={{
                                fontSize: 13,
                                color: isSelected ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)',
                                fontWeight: isSelected ? 600 : 400
                              }}>
                                            {m.name.split(' ')[0]}
                                          </span>
                                        </motion.button>;
                          })}
                                  </div>
                                </div>}
                            </div>
                          </motion.div>}
                      </AnimatePresence>
                    </div>
                  </>}
              </div>

              <div style={{
            height: 1,
            backgroundColor: 'var(--eqx-hairline)'
          }} />

              {/* ── Attendees ── */}
              <div className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <SectionLabel>Attendees</SectionLabel>
                  <span className="px-2 py-0.5 rounded-full font-medium text-[13px]" style={{
                backgroundColor: 'var(--eqx-raised)',
                color: 'var(--eqx-tertiary)',
                marginTop: -12
              }}>
                    {totalAttendeeCount}
                  </span>
                </div>

                <button onClick={() => setAttendeesExpanded((v) => !v)} className="flex items-center focus:outline-none" aria-label="Toggle attendees">
                  <div className="flex items-center">
                    {visibleRsvps.map((rsvp, idx) => {
                  const m = members.find((mb) => mb.id === rsvp.memberId);
                  return <div key={rsvp.memberId} style={{
                    marginLeft: idx === 0 ? 0 : -8,
                    zIndex: visibleRsvps.length - idx,
                    position: 'relative'
                  }}>
                          <Avatar name={m?.name ?? rsvp.memberId} color={m?.color} initials={m?.initials} size={36} />
                        </div>;
                })}
                    {extraCount > 0 && <div className="rounded-full flex items-center justify-center font-medium flex-shrink-0" style={{
                  width: 36,
                  height: 36,
                  marginLeft: -8,
                  backgroundColor: 'var(--eqx-hairline)',
                  color: 'var(--eqx-tertiary)',
                  fontSize: 11,
                  border: '2px solid var(--eqx-surface)',
                  position: 'relative',
                  zIndex: 0
                }}>
                        +{extraCount}
                      </div>}
                  </div>
                  <div className="ml-3 flex items-center gap-1 text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                    {attendeesExpanded ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
                  </div>
                </button>

                <AnimatePresence>
                  {attendeesExpanded && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: 'auto',
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} transition={{
                duration: 0.22,
                ease: [0.2, 0, 0, 1]
              }} className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {allRsvps.map((rsvp) => {
                    const m = members.find((mb) => mb.id === rsvp.memberId);
                    const proxyIds = rsvp.proxyFor ?? [];
                    const guestCount = rsvp.guestCount ?? 0;
                    return <Fragment key={rsvp.memberId}>
                              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{
                        backgroundColor: 'var(--eqx-raised)',
                        border: '1px solid var(--eqx-hairline)'
                      }}>
                                <Avatar name={m?.name ?? rsvp.memberId} color={m?.color} initials={m?.initials} size={28} />
                                <p className="flex-1 truncate font-medium" style={{
                          fontSize: 13,
                          color: 'var(--eqx-primary)'
                        }}>
                                  {(m?.name ?? rsvp.memberId).split(' ')[0]}
                                  {guestCount > 0 && <span className="text-[13px]" style={{
                            color: 'var(--eqx-tertiary)',
                            fontWeight: 400,
                            marginLeft: 4
                          }}>
                                      +{guestCount}
                                    </span>}
                                </p>
                                <StatusIndicator status={rsvp.status} />
                              </div>

                              {proxyIds.map((proxyId) => {
                        const pm = members.find((mb) => mb.id === proxyId);
                        return <div key={`proxy-${proxyId}`} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{
                          backgroundColor: 'var(--eqx-raised)',
                          border: '1px solid var(--eqx-hairline)',
                          opacity: 0.8
                        }}>
                                    <Avatar name={pm?.name ?? proxyId} color={pm?.color} initials={pm?.initials} size={28} />
                                    <p className="flex-1 truncate font-medium" style={{
                            fontSize: 13,
                            color: 'var(--eqx-primary)'
                          }}>
                                      {(pm?.name ?? proxyId).split(' ')[0]}
                                    </p>
                                    <StatusIndicator status="going" />
                                  </div>;
                      })}
                            </Fragment>;
                  })}
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </div>

              {/* ── Expenses (past events only) ── */}
              {isPast && <>
                  <div style={{
              height: 1,
              backgroundColor: 'var(--eqx-hairline)'
            }} />
                  <div className="pt-4 pb-4">
                    <SectionLabel>Expenses</SectionLabel>
                    <button onClick={() => onAddExpense?.()} className="w-full flex items-center gap-3 text-left" style={{
                backgroundColor: 'var(--eqx-raised)',
                border: '1px solid var(--eqx-hairline)',
                borderRadius: 16,
                padding: '14px 16px'
              }}>
                      <div className="flex items-center justify-center flex-shrink-0" style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'var(--eqx-raised)'
                }}>
                        <Receipt size={16} color="var(--eqx-tertiary)" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold" style={{
                    fontSize: 15,
                    color: 'var(--eqx-secondary)'
                  }}>
                          Expenses
                        </p>
                        <p style={{
                    fontSize: 13,
                    color: 'var(--eqx-tertiary)'
                  }}>
                          Split with attendees
                        </p>
                      </div>
                      <ChevronRight size={16} color="var(--eqx-tertiary)" strokeWidth={1.5} style={{
                  flexShrink: 0
                }} />
                    </button>
                  </div>
                </>}

              <div style={{
            height: 1,
            backgroundColor: 'var(--eqx-hairline)'
          }} />

              {/* ── Comments ── */}
              <div className="pt-4 pb-4">
                <SectionLabel>Comments</SectionLabel>
                <div className="space-y-4">
                  {comments.map((c) => <div key={c.id} className="flex gap-3">
                      <Avatar name={c.user} color={c.color} size={28} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-semibold" style={{
                      fontSize: 13,
                      color: 'var(--eqx-primary)'
                    }}>
                            {c.user}
                          </span>
                          <span style={{
                      fontSize: 11,
                      color: 'var(--eqx-tertiary)'
                    }}>
                            {c.time}
                          </span>
                        </div>
                        <p style={{
                    fontSize: 15,
                    color: 'var(--eqx-secondary)'
                  }}>
                          {c.message}
                        </p>
                      </div>
                    </div>)}
                </div>
              </div>
            </div>

            {/* ── Pinned comment input ── */}
            <div className="flex-shrink-0 px-5 pt-3" style={{
          borderTop: '1px solid var(--eqx-hairline)',
          backgroundColor: 'var(--eqx-surface)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
        }}>
              <div className="flex items-center gap-2">
                <Avatar name={currentMember?.name ?? 'Me'} color={currentMember?.color ?? 'var(--eqx-periwinkle)'} initials={currentMember?.initials} size={28} />
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendComment();
            }} placeholder="Add a comment…" className="flex-1 rounded-full px-4 py-2.5 outline-none" style={{
              fontSize: 15,
              backgroundColor: 'var(--eqx-raised)',
              color: 'var(--eqx-primary)',
              border: 'none'
            }} />
                <motion.button whileTap={{
              scale: 0.88
            }} disabled={!commentText.trim()} onClick={handleSendComment} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150" style={{
              backgroundColor: commentText.trim() ? 'var(--eqx-mint)' : 'var(--eqx-raised)'
            }} aria-label="Send comment">
                  <ArrowUp size={16} color={commentText.trim() ? 'var(--eqx-base)' : 'var(--eqx-tertiary)'} strokeWidth={2} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}