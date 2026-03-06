import React, { useEffect, useState, useRef, Fragment, Component } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, LockIcon, ArchiveIcon, ArchiveRestoreIcon, Trash2, CalendarIcon, ArrowUp, PlusIcon } from 'lucide-react';
import { Poll } from '../data/pollsData';
import { Member } from '../data/mockData';
import { GroupEvent } from '../data/eventsData';
import { tintRgba } from './tintHelper';
// ─── Props ────────────────────────────────────────────────────────────────────
interface PollDetailSheetProps {
  poll: Poll | null;
  members: Member[];
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onVote: (pollId: string, optionIds: string[]) => void;
  onAddOption: (pollId: string, text: string) => void;
  onArchive: (pollId: string) => void;
  onUnarchive: (pollId: string) => void;
  onAddComment: (pollId: string, text: string) => void;
  onDeleteComment: (pollId: string, commentId: string) => void;
  isAdmin?: boolean;
  onDelete?: (pollId: string) => void;
  onCreateEventFromPoll?: (prefill: {
    title: string;
  }) => void;
}
// ─── Constants ────────────────────────────────────────────────────────────────
const EQX_SPRING = {
  type: 'spring',
  damping: 32,
  stiffness: 320
} as const;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({
  children,
  right



}: {children: React.ReactNode;right?: React.ReactNode;}) {
  return <div className="flex items-center justify-between" style={{
    marginBottom: 8
  }}>
      <p className="text-[13px] font-medium uppercase tracking-widest" style={{
      color: 'var(--eqx-secondary)'
    }}>
        {children}
      </p>
      {right && <span className="text-[13px]" style={{
      color: 'var(--eqx-tertiary)'
    }}>
          {right}
        </span>}
    </div>;
}
function Avatar({
  name,
  color,
  size = 24,
  initials





}: {name: string;color?: string;size?: number;initials?: string;}) {
  const letters = initials ?? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return <div className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0" style={{
    width: size,
    height: size,
    backgroundColor: color ?? 'var(--eqx-periwinkle)',
    fontSize: size * 0.33,
    border: '2px solid var(--eqx-surface)'
  }}>
      {letters}
    </div>;
}
function formatExpiry(dateStr: string, isExpired: boolean): string {
  const d = new Date(dateStr);
  const label = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  return isExpired ? `Ended ${label}` : `Ends ${label}`;
}
function formatCommentTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
// ─── Main Component ───────────────────────────────────────────────────────────
export function PollDetailSheet({
  poll,
  members,
  currentUserId,
  isOpen,
  onClose,
  onVote,
  onAddOption,
  onArchive,
  onUnarchive,
  onAddComment,
  onDeleteComment,
  isAdmin = false,
  onDelete,
  onCreateEventFromPoll
}: PollDetailSheetProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');
  const addOptionInputRef = useRef<HTMLInputElement>(null);
  const dragControls = useDragControls();
  const overflowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) {
      setCommentText('');
      setShowAddOption(false);
      setNewOptionText('');
    }
  }, [isOpen]);
  useEffect(() => {
    if (showAddOption) {
      setTimeout(() => addOptionInputRef.current?.focus(), 50);
    }
  }, [showAddOption]);
  useEffect(() => {
    if (!showOverflow) return;
    const handler = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOverflow]);
  if (!poll) return null;
  const isExpired = !!(poll.expiresAt && new Date(poll.expiresAt) < new Date());
  const isPollOpen = !isExpired && !poll.isArchived;
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voterIds.length, 0);
  const uniqueVoters = new Set(poll.options.flatMap((o) => o.voterIds)).size;
  const myVotedOptionIds = poll.options.filter((o) => o.voterIds.includes(currentUserId)).map((o) => o.id);
  const maxVoteCount = Math.max(...poll.options.map((o) => o.voterIds.length), 0);
  const winners = poll.options.filter((o) => o.voterIds.length === maxVoteCount && maxVoteCount > 0);
  const isTie = winners.length > 1;
  const hasWinner = !isPollOpen && winners.length === 1 && maxVoteCount > 0;
  const creator = members.find((m) => m.id === poll.creatorId);
  const currentMember = members.find((m) => m.id === currentUserId);
  const isCreator = poll.creatorId === currentUserId;
  const canArchive = isCreator || isAdmin;
  const canDelete = isAdmin;
  const handleVote = (optionId: string) => {
    if (!isPollOpen) return;
    let next: string[];
    if (poll.allowMultiSelect) {
      next = myVotedOptionIds.includes(optionId) ? myVotedOptionIds.filter((id) => id !== optionId) : [...myVotedOptionIds, optionId];
    } else {
      next = myVotedOptionIds.includes(optionId) ? [] : [optionId];
    }
    onVote(poll.id, next);
  };
  const handleAddOption = () => {
    const text = newOptionText.trim();
    if (!text) return;
    onAddOption(poll.id, text);
    setNewOptionText('');
    setShowAddOption(false);
  };
  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(poll.id, text);
    setCommentText('');
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

            {/* Action buttons — top right */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
              {canArchive && <button onClick={() => poll.isArchived ? onUnarchive(poll.id) : onArchive(poll.id)} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label={poll.isArchived ? 'Unarchive poll' : 'Archive poll'}>
                  {poll.isArchived ? <ArchiveRestoreIcon size={18} strokeWidth={1.5} /> : <ArchiveIcon size={18} strokeWidth={1.5} />}
                </button>}
              {canDelete && <button onClick={() => {
            onDelete?.(poll.id);
            onClose();
          }} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-coral)'
          }} aria-label="Delete poll">
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
              {/* ── Hero ── */}
              <div className="pb-4">
                <div className="flex items-center gap-2.5 pr-20">
                  <span className="flex-shrink-0 select-none" style={{
                fontSize: 28,
                lineHeight: 1
              }}>
                    📊
                  </span>
                  <h2 className="font-semibold leading-tight" style={{
                fontSize: 18,
                color: 'var(--eqx-primary)'
              }}>
                    {poll.title}
                  </h2>
                </div>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                  {creator && <span className="text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      by {creator.name}
                    </span>}
                  {/* Status pill */}
                  {isPollOpen ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold" style={{
                backgroundColor: tintRgba(132, 239, 182, 0.08, 0.18),
                border: `1px solid ${tintRgba(132, 239, 182, 0.2, 0.35)}`,
                color: 'var(--eqx-mint)'
              }}>
                      <span className="rounded-full flex-shrink-0" style={{
                  width: 5,
                  height: 5,
                  backgroundColor: 'var(--eqx-mint)'
                }} />
                      Open
                    </span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold" style={{
                backgroundColor: 'var(--eqx-raised)',
                border: '1px solid var(--eqx-hairline)',
                color: 'var(--eqx-tertiary)'
              }}>
                      <LockIcon size={9} strokeWidth={1.5} />
                      Closed
                    </span>}
                  {poll.expiresAt && <span className="text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      {formatExpiry(poll.expiresAt, isExpired)}
                    </span>}
                  <span className="text-[13px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                    {uniqueVoters} voted
                  </span>
                </div>
              </div>

              <div style={{
            height: 1,
            backgroundColor: 'var(--eqx-raised)'
          }} />

              {/* ── Winner banner (closed, non-tie only) ── */}
              {hasWinner && <>
                  <div className="pt-4 pb-4">
                    <motion.div initial={{
                opacity: 0,
                y: -4
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.22,
                ease: [0.2, 0, 0, 1]
              }} className="flex items-center gap-2.5 rounded-[14px] px-4 py-3" style={{
                backgroundColor: 'var(--eqx-primary)'
              }}>
                      <span style={{
                  fontSize: 20,
                  lineHeight: 1,
                  flexShrink: 0
                }}>
                        🏆
                      </span>
                      <p className="font-bold flex-1 truncate" style={{
                  fontSize: 14,
                  color: 'var(--eqx-base)'
                }}>
                        {winners[0].text}
                      </p>
                      <button onClick={() => onCreateEventFromPoll?.({
                  title: winners[0].text
                })} className="flex items-center gap-1 flex-shrink-0 active:opacity-[0.7] text-[13px]" style={{
                  fontWeight: 500,
                  color: 'var(--eqx-base)',
                  opacity: 0.6
                }}>
                        <CalendarIcon size={12} strokeWidth={1.5} />
                        Create Event
                      </button>
                    </motion.div>
                  </div>
                  <div style={{
              height: 1,
              backgroundColor: 'var(--eqx-raised)'
            }} />
                </>}

              {/* ── Voting section ── */}
              <div className="pt-4 pb-4">
                <SectionLabel right={`${uniqueVoters} voted`}>
                  {poll.allowMultiSelect ? 'Select all that apply' : 'Choose one'}
                </SectionLabel>

                {/* Options container */}
                <div className="rounded-[16px] overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              border: '1px solid var(--eqx-hairline)'
            }}>
                  {poll.options.map((option, idx) => {
                const pct = totalVotes > 0 ? Math.round(option.voterIds.length / totalVotes * 100) : 0;
                const isVoted = myVotedOptionIds.includes(option.id);
                const isWinner = !isPollOpen && winners.some((w) => w.id === option.id) && !isTie;
                const highlight = isVoted || isWinner;
                return <Fragment key={option.id}>
                        {idx > 0 && <div style={{
                    height: 1,
                    backgroundColor: 'var(--eqx-hairline)'
                  }} />}
                        <button onClick={() => handleVote(option.id)} disabled={!isPollOpen} className="w-full text-left active:opacity-[0.88] transition-colors" style={{
                    padding: '12px 16px',
                    cursor: isPollOpen ? 'pointer' : 'default',
                    backgroundColor: highlight ? 'color-mix(in srgb, var(--eqx-primary) 3%, transparent)' : 'transparent'
                  }}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-shrink-0 rounded-full flex items-center justify-center" style={{
                        width: 20,
                        height: 20,
                        border: highlight ? 'none' : '1px solid var(--eqx-tertiary)',
                        backgroundColor: highlight ? 'var(--eqx-primary)' : 'transparent'
                      }} />
                            <span className="flex-1 truncate" style={{
                        fontSize: 15,
                        color: 'var(--eqx-primary)'
                      }}>
                              {option.text}
                            </span>
                            <span className="flex-shrink-0 tabular-nums" style={{
                        fontSize: 13,
                        color: highlight ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
                      }}>
                              {pct}%
                            </span>
                          </div>

                          {/* Progress bar — 2px */}
                          <div className="rounded-full overflow-hidden" style={{
                      height: 2,
                      backgroundColor: 'var(--eqx-hairline)',
                      marginLeft: 20 + 12
                    }}>
                            <motion.div className="h-full rounded-full" initial={{
                        width: 0
                      }} animate={{
                        width: `${pct}%`
                      }} transition={{
                        duration: 0.5,
                        delay: idx * 0.04 + 0.1,
                        ease: [0.2, 0, 0, 1]
                      }} style={{
                        backgroundColor: highlight ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
                      }} />
                          </div>
                        </button>
                      </Fragment>;
              })}
                </div>

                {/* "+ Add an option" */}
                {isPollOpen && poll.allowMembersToAddOptions && <div className="mt-3">
                    <AnimatePresence mode="wait">
                      {!showAddOption ? <motion.button key="add-trigger" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} onClick={() => setShowAddOption(true)} className="text-left active:opacity-[0.88]" style={{
                  fontSize: 13,
                  color: 'var(--eqx-tertiary)'
                }}>
                          + Add an option
                        </motion.button> : <motion.div key="add-input" initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: 'auto'
                }} exit={{
                  opacity: 0,
                  height: 0
                }} transition={{
                  duration: 0.2,
                  ease: [0.2, 0, 0, 1]
                }} className="overflow-hidden">
                          <div className="flex items-center gap-2 rounded-[12px] px-4 py-3" style={{
                    backgroundColor: 'var(--eqx-raised)',
                    border: '1px solid var(--eqx-hairline)'
                  }}>
                            <input ref={addOptionInputRef} value={newOptionText} onChange={(e) => setNewOptionText(e.target.value)} onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddOption();
                      if (e.key === 'Escape') {
                        setShowAddOption(false);
                        setNewOptionText('');
                      }
                    }} placeholder="Option text…" className="flex-1 bg-transparent outline-none" style={{
                      fontSize: 15,
                      color: 'var(--eqx-primary)'
                    }} />
                            <motion.button whileTap={{
                      scale: 0.88
                    }} onClick={handleAddOption} disabled={!newOptionText.trim()} className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150" style={{
                      backgroundColor: newOptionText.trim() ? 'var(--eqx-primary)' : 'var(--eqx-hairline)'
                    }}>
                              <PlusIcon size={12} color={newOptionText.trim() ? 'var(--eqx-base)' : 'var(--eqx-tertiary)'} strokeWidth={2.5} />
                            </motion.button>
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </div>}
              </div>

              <div style={{
            height: 1,
            backgroundColor: 'var(--eqx-raised)'
          }} />

              {/* ── Comments ── */}
              <div className="pt-4 pb-4">
                <SectionLabel>Comments</SectionLabel>

                {poll.comments.length === 0 ? <p className="text-[13px]" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                    No comments yet
                  </p> : <div className="space-y-4">
                    {poll.comments.map((comment) => {
                const commenter = members.find((m) => m.id === comment.memberId);
                const isMyComment = comment.memberId === currentUserId;
                return <motion.div key={comment.id} initial={{
                  opacity: 0,
                  y: 4
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="flex gap-3">
                          <Avatar name={commenter?.name ?? comment.memberId} color={commenter?.color} initials={commenter?.initials} size={28} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="font-semibold" style={{
                        fontSize: 13,
                        color: 'var(--eqx-primary)'
                      }}>
                                {commenter?.name ?? comment.memberId}
                              </span>
                              <span className="text-[13px]" style={{
                        color: 'var(--eqx-tertiary)'
                      }}>
                                {formatCommentTime(comment.createdAt)}
                              </span>
                            </div>
                            <p style={{
                      fontSize: 14,
                      color: 'var(--eqx-secondary)'
                    }}>
                              {comment.text}
                            </p>
                          </div>
                          {isMyComment && <button onClick={() => onDeleteComment(poll.id, comment.id)} className="flex-shrink-0 p-1.5 active:opacity-[0.92]" style={{
                    color: 'var(--eqx-tertiary)'
                  }} aria-label="Delete comment">
                              <X size={12} strokeWidth={2} />
                            </button>}
                        </motion.div>;
              })}
                  </div>}
              </div>
            </div>

            {/* ── Pinned comment input ── */}
            <div className="flex-shrink-0 px-5 pt-3" style={{
          borderTop: '1px solid var(--eqx-raised)',
          backgroundColor: 'var(--eqx-surface)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
        }}>
              <div className="flex items-center gap-2">
                <Avatar name={currentMember?.name ?? 'Me'} color={currentMember?.color ?? 'var(--eqx-periwinkle)'} initials={currentMember?.initials} size={28} />
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendComment();
            }} placeholder="Add a comment…" className="flex-1 rounded-full px-4 py-2.5 outline-none" style={{
              fontSize: 16,
              backgroundColor: 'var(--eqx-raised)',
              color: 'var(--eqx-primary)',
              border: '1px solid var(--eqx-hairline)'
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