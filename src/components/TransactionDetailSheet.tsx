import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, Edit2Icon, CalendarIcon, PencilIcon, FlameIcon, CheckCircleIcon, ClockIcon, UtensilsIcon, HomeIcon, ZapIcon, ClapperboardIcon, BanknoteIcon, CarIcon, HeartPulseIcon, CreditCardIcon } from 'lucide-react';
import { Transaction, Member, Challenge, getCrunchFundBalance } from '../data/mockData';
import { GroupEvent } from '../data/eventsData';
import { CoverIcon } from './coverIcons';
interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  events: GroupEvent[];
  challenges?: Challenge[];
  transactions?: Transaction[];
  isAdmin?: boolean;
  onOpenEvent?: (event: GroupEvent) => void;
  canEditSplit?: boolean;
  onEditSplit?: () => void;
  onMarkFinePaid?: (transactionId: string) => void;
}
const EQX_TRANSITION = {
  duration: 0.32,
  ease: [0.2, 0.0, 0.0, 1.0] as const
};
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Food: <UtensilsIcon size={12} strokeWidth={2.5} />,
  Housing: <HomeIcon size={12} strokeWidth={2.5} />,
  Utilities: <ZapIcon size={12} strokeWidth={2.5} />,
  Entertainment: <ClapperboardIcon size={12} strokeWidth={2.5} />,
  Income: <BanknoteIcon size={12} strokeWidth={2.5} />,
  Transport: <CarIcon size={12} strokeWidth={2.5} />,
  Health: <HeartPulseIcon size={12} strokeWidth={2.5} />,
  Fine: <FlameIcon size={12} strokeWidth={2.5} />
};
/** Auto-generate splits from event going RSVPs */
function autoSplits(tx: Transaction, event: GroupEvent) {
  const goingIds = new Set<string>();
  goingIds.add(tx.memberId);
  for (const rsvp of event.rsvps) {
    if (rsvp.status === 'going') {
      goingIds.add(rsvp.memberId);
      for (const proxyId of rsvp.proxyFor ?? []) goingIds.add(proxyId);
    }
  }
  const total = tx.amount;
  const share = Math.round(total / goingIds.size * 100) / 100;
  return Array.from(goingIds).map((id) => ({
    memberId: id,
    share,
    isPayer: id === tx.memberId
  }));
}
export function TransactionDetailSheet({
  transaction,
  isOpen,
  onClose,
  members,
  events,
  challenges = [],
  transactions = [],
  isAdmin = false,
  onOpenEvent,
  canEditSplit = false,
  onEditSplit,
  onMarkFinePaid
}: TransactionDetailSheetProps) {
  if (!transaction) return null;
  const member = members.find((m) => m.id === transaction.memberId);
  const challenge = challenges.find((c) => c.id === transaction.challengeId);
  const isFine = transaction.type === 'fine';
  const isExpense = transaction.type === 'expense';
  const isPending = transaction.fineStatus === 'pending';
  const isChallengeFunded = transaction.fundingSource === 'challenge';
  // Amount display
  const amountColor = isFine ? isPending ? 'var(--eqx-tertiary)' : 'var(--eqx-mint)' : 'var(--eqx-primary)';
  const amountSign = isFine && !isPending ? '+' : '−';
  const categoryIcon = CATEGORY_ICON[transaction.category ?? ''] ?? <CreditCardIcon size={12} strokeWidth={2.5} />;
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = new Date(transaction.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  // Linked event
  const linkedEvent = events.find((ev) => ev.linkedTransactionId === transaction.id);
  // Pool coverage for challenge-funded expenses
  let poolCoverage = 0;
  let overage = 0;
  let overagePerAttendee = 0;
  if (isExpense && isChallengeFunded && transaction.challengeId) {
    // Pool balance before this expense (exclude this transaction)
    const otherTransactions = transactions.filter((t) => t.id !== transaction.id);
    const poolBefore = getCrunchFundBalance(otherTransactions, transaction.challengeId);
    poolCoverage = Math.min(poolBefore, transaction.amount);
    overage = Math.max(0, transaction.amount - poolBefore);
    const attendeeCount = transaction.attendees?.length ?? 1;
    overagePerAttendee = overage / attendeeCount;
  }
  // Effective splits
  const effectiveSplits = transaction.splits && transaction.splits.length > 0 ? transaction.splits : linkedEvent ? autoSplits(transaction, linkedEvent) : null;
  const total = transaction.amount;
  const detailRow = (label: string, content: React.ReactNode, hasBorder = true) => <div className="flex items-start gap-3 px-4 py-3.5" style={{
    borderBottom: hasBorder ? '1px solid var(--eqx-hairline)' : 'none'
  }}>
      <span className="text-[13px] font-medium w-20 flex-shrink-0 pt-0.5" style={{
      color: 'var(--eqx-tertiary)'
    }}>
        {label}
      </span>
      <div className="flex-1">{content}</div>
    </div>;
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 0.5
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASING
      }} onClick={onClose} className="fixed inset-0 z-[68]" style={{
        backgroundColor: '#000000'
      }} />

          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={EQX_TRANSITION} className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col max-w-md mx-auto" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderRadius: '32px 32px 0 0',
        maxHeight: '90vh'
      }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-hairline)'
          }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                {/* Type badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{
              backgroundColor: isFine ? 'color-mix(in srgb, var(--eqx-coral) 12%, var(--eqx-raised))' : 'var(--eqx-raised)',
              border: '1px solid var(--eqx-hairline)',
              color: isFine ? 'var(--eqx-coral)' : 'var(--eqx-tertiary)'
            }}>
                  {categoryIcon}{' '}
                  {isFine ? 'Fine' : isChallengeFunded ? 'Pool Expense' : 'Direct Split'}
                </span>

                {/* Fine status badge */}
                {isFine && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{
              backgroundColor: isPending ? 'color-mix(in srgb, var(--eqx-coral) 12%, var(--eqx-raised))' : 'color-mix(in srgb, var(--eqx-mint) 12%, var(--eqx-raised))',
              border: `1px solid ${isPending ? 'color-mix(in srgb, var(--eqx-coral) 30%, transparent)' : 'color-mix(in srgb, var(--eqx-mint) 30%, transparent)'}`,
              color: isPending ? 'var(--eqx-coral)' : 'var(--eqx-mint)'
            }}>
                    {isPending ? <ClockIcon size={11} strokeWidth={2.5} /> : <CheckCircleIcon size={11} strokeWidth={2.5} />}
                    {isPending ? 'Pending' : 'Paid'}
                  </span>}
              </div>

              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Close">
                <XIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-5">
              {/* Hero: amount + description */}
              <div className="flex flex-col items-center text-center pt-2 pb-2">
                <span className="font-bold tabular-nums leading-none mb-3" style={{
              fontSize: '48px',
              color: amountColor
            }}>
                  {amountSign}${transaction.amount.toFixed(2)}
                </span>
                <h2 className="font-semibold leading-snug" style={{
              fontSize: '20px',
              color: 'var(--eqx-primary)'
            }}>
                  {transaction.description}
                </h2>
                {challenge && <span className="mt-2 text-[13px] font-medium" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                    {challenge.emoji} {challenge.name}
                  </span>}
              </div>

              {/* Details card */}
              <div className="rounded-[24px] border overflow-hidden" style={{
            backgroundColor: 'var(--eqx-raised)',
            borderColor: 'var(--eqx-hairline)'
          }}>
                {/* Member row */}
                {detailRow(isFine ? 'Member' : 'Paid by', <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0" style={{
                backgroundColor: member?.color ?? 'var(--eqx-raised)'
              }}>
                      {member?.initials}
                    </div>
                    <span className="text-[15px] font-medium" style={{
                color: 'var(--eqx-primary)'
              }}>
                      {member?.name ?? 'Unknown'}
                    </span>
                  </div>)}

                {/* Date row */}
                {detailRow('Date', <div>
                    <p className="text-[15px] font-medium" style={{
                color: 'var(--eqx-primary)'
              }}>
                      {formattedDate}
                    </p>
                    <p className="text-[12px]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      {formattedTime}
                    </p>
                  </div>)}

                {/* Pool coverage row (challenge expenses only) */}
                {isExpense && isChallengeFunded && detailRow('Pool', <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px]" style={{
                  color: 'var(--eqx-secondary)'
                }}>
                          Covered by fund
                        </span>
                        <span className="text-[13px] font-semibold" style={{
                  color: 'var(--eqx-mint)'
                }}>
                          ${poolCoverage.toFixed(2)}
                        </span>
                      </div>
                      {overage > 0 && <div className="flex items-center justify-between">
                          <span className="text-[13px]" style={{
                  color: 'var(--eqx-secondary)'
                }}>
                            Overage ({transaction.attendees?.length ?? 1}{' '}
                            people)
                          </span>
                          <span className="text-[13px] font-semibold" style={{
                  color: 'var(--eqx-coral)'
                }}>
                            ${overagePerAttendee.toFixed(2)}/person
                          </span>
                        </div>}
                      {overage === 0 && <p className="text-[12px]" style={{
                color: 'var(--eqx-mint)'
              }}>
                          ✓ Fully covered
                        </p>}
                    </div>)}

                {/* Attendees row (expenses) */}
                {isExpense && transaction.attendees && transaction.attendees.length > 0 && detailRow('Attendees', <div className="flex flex-wrap gap-1.5">
                      {transaction.attendees.map((aid) => {
                const m = members.find((mem) => mem.id === aid);
                if (!m) return null;
                return <div key={aid} className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{
                  backgroundColor: 'var(--eqx-surface)',
                  border: '1px solid var(--eqx-hairline)'
                }}>
                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{
                    backgroundColor: m.color
                  }} />
                            <span className="text-[11px] font-medium" style={{
                    color: 'var(--eqx-primary)'
                  }}>
                              {m.name.split(' ')[0]}
                            </span>
                          </div>;
              })}
                    </div>, !!linkedEvent)}

                {/* Linked event row */}
                {linkedEvent && <button onClick={() => {
              onOpenEvent?.(linkedEvent);
              onClose();
            }} className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-[0.7]">
                    <span className="text-[13px] font-medium w-20 flex-shrink-0 text-left" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      Event
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="leading-none flex items-center justify-center">
                        <CoverIcon name={linkedEvent.coverEmoji} size={16} strokeWidth={1.5} style={{ color: 'var(--eqx-periwinkle)' }} />
                      </span>
                      <span className="text-[15px] font-medium truncate" style={{
                  color: 'var(--eqx-primary)'
                }}>
                        {linkedEvent.title}
                      </span>
                    </div>
                    <CalendarIcon size={14} strokeWidth={1.5} style={{
                color: 'var(--eqx-tertiary)',
                flexShrink: 0
              }} />
                  </button>}
              </div>

              {/* Admin: Mark as Paid action (pending fines only) */}
              {isAdmin && isFine && isPending && onMarkFinePaid && <motion.div initial={{
            opacity: 0,
            y: 6
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.2,
            ease: EQX_EASING
          }}>
                  <button onClick={() => {
              onMarkFinePaid(transaction.id);
              onClose();
            }} className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] active:opacity-[0.85]" style={{
              backgroundColor: 'color-mix(in srgb, var(--eqx-mint) 12%, var(--eqx-surface))',
              border: '1.5px solid color-mix(in srgb, var(--eqx-mint) 35%, transparent)'
            }}>
                    <CheckCircleIcon size={18} strokeWidth={2} style={{
                color: 'var(--eqx-mint)'
              }} />
                    <span className="text-[15px] font-semibold" style={{
                color: 'var(--eqx-mint)'
              }}>
                      Mark paid
                    </span>
                  </button>
                </motion.div>}

              {/* Split section (expenses) */}
              {isExpense && effectiveSplits && effectiveSplits.length > 0 && <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[13px] font-medium uppercase tracking-[0.1em]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      Split · {effectiveSplits.length}{' '}
                      {effectiveSplits.length === 1 ? 'person' : 'people'}
                    </h3>
                    {canEditSplit && <button onClick={onEditSplit} className="inline-flex items-center gap-1 text-[12px] font-semibold active:opacity-[0.7]" style={{
                color: 'var(--eqx-primary)'
              }}>
                        <PencilIcon size={11} strokeWidth={2} />
                        Edit
                      </button>}
                  </div>

                  <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                    {effectiveSplits.map((split, idx) => {
                const splitMember = members.find((m) => m.id === split.memberId);
                const isLast = idx === effectiveSplits.length - 1;
                return <div key={split.memberId} className="flex items-center gap-3 px-4 py-3" style={{
                  borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)',
                  backgroundColor: split.isPayer ? 'color-mix(in srgb, var(--eqx-mint) 4%, transparent)' : 'transparent'
                }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0" style={{
                    backgroundColor: splitMember?.color ?? 'var(--eqx-raised)'
                  }}>
                            {splitMember?.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[14px] font-medium truncate" style={{
                        color: 'var(--eqx-primary)'
                      }}>
                                {splitMember?.name.split(' ')[0] ?? 'Unknown'}
                              </span>
                              {split.isPayer && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{
                        backgroundColor: 'color-mix(in srgb, var(--eqx-mint) 15%, transparent)',
                        color: 'var(--eqx-mint)'
                      }}>
                                  paid
                                </span>}
                            </div>
                            <p className="text-[11px]" style={{
                      color: 'var(--eqx-tertiary)'
                    }}>
                              {split.isPayer ? `owed $${(total - split.share).toFixed(2)}` : `owes $${split.share.toFixed(2)}`}
                            </p>
                          </div>
                          <span className="text-[14px] font-semibold tabular-nums flex-shrink-0" style={{
                    color: split.isPayer ? 'var(--eqx-mint)' : 'var(--eqx-primary)'
                  }}>
                            ${split.share.toFixed(2)}
                          </span>
                        </div>;
              })}
                  </div>

                  {!transaction.splitLocked && linkedEvent && <p className="text-[11px] px-1" style={{
              color: 'var(--eqx-tertiary)',
              opacity: 0.6
            }}>
                      Split from RSVPs
                    </p>}
                </div>}

              {/* Edit history */}
              {transaction.editHistory && transaction.editHistory.length > 0 && <div className="space-y-2">
                    <h3 className="text-[13px] font-medium uppercase tracking-[0.1em] px-1" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                      Edit History
                    </h3>
                    <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                      {transaction.editHistory.map((entry, idx) => {
                const isLast = idx === transaction.editHistory!.length - 1;
                const editDate = new Date(entry.editedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
                return <div key={idx} className="flex items-start gap-3 px-4 py-3" style={{
                  borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)'
                }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                    backgroundColor: 'var(--eqx-surface)',
                    border: '1px solid var(--eqx-hairline)'
                  }}>
                              <Edit2Icon size={10} style={{
                      color: 'var(--eqx-tertiary)'
                    }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px]" style={{
                      color: 'var(--eqx-primary)'
                    }}>
                                {entry.change}
                              </p>
                              <p className="text-[11px] mt-0.5" style={{
                      color: 'var(--eqx-tertiary)'
                    }}>
                                {entry.editedBy} · {editDate}
                              </p>
                            </div>
                          </div>;
              })}
                    </div>
                  </div>}
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}