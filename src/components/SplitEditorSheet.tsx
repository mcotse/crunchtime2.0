import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckIcon, UsersIcon } from 'lucide-react';
import { Transaction, TransactionSplit, Member } from '../data/mockData';
import { GroupEvent } from '../data/eventsData';
import { Button } from './ui/Button';
interface SplitEditorSheetProps {
  transaction: Transaction | null;
  event: GroupEvent | null;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSave: (txId: string, splits: TransactionSplit[]) => void;
}
const EQX_TRANSITION = {
  duration: 0.32,
  ease: [0.2, 0.0, 0.0, 1.0] as const
};
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
function roundTo2(n: number) {
  return Math.round(n * 100) / 100;
}
export function SplitEditorSheet({
  transaction,
  event,
  isOpen,
  onClose,
  members,
  onSave
}: SplitEditorSheetProps) {
  const [mode, setMode] = useState<'equal' | 'custom'>('equal');
  // Map of memberId → included in split
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  // Map of memberId → custom share amount (string for input)
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const total = transaction ? Math.abs(transaction.amount) : 0;
  const payerId = transaction?.memberId ?? '';
  // Initialize state when sheet opens
  useEffect(() => {
    if (!isOpen || !transaction) return;
    const initIncluded: Record<string, boolean> = {};
    const initAmounts: Record<string, string> = {};
    if (transaction.splits && transaction.splits.length > 0) {
      // Use existing splits
      for (const split of transaction.splits) {
        initIncluded[split.memberId] = true;
        initAmounts[split.memberId] = split.share.toFixed(2);
      }
      // Payer always included
      initIncluded[payerId] = true;
    } else if (event) {
      // Auto-generate from going RSVPs
      const goingIds = new Set<string>();
      goingIds.add(payerId); // payer always included
      for (const rsvp of event.rsvps) {
        if (rsvp.status === 'going') {
          goingIds.add(rsvp.memberId);
          for (const proxyId of rsvp.proxyFor ?? []) goingIds.add(proxyId);
        }
      }
      for (const m of members) {
        initIncluded[m.id] = goingIds.has(m.id);
      }
      // Equal amounts
      const count = Array.from(goingIds).length;
      const share = roundTo2(total / count);
      for (const id of goingIds) initAmounts[id] = share.toFixed(2);
    } else {
      // Just payer
      initIncluded[payerId] = true;
      initAmounts[payerId] = total.toFixed(2);
      for (const m of members) {
        if (m.id !== payerId) initIncluded[m.id] = false;
      }
    }
    setIncluded(initIncluded);
    setCustomAmounts(initAmounts);
    setMode('equal');
  }, [isOpen, transaction?.id]);
  if (!transaction) return null;
  const includedIds = members.filter((m) => included[m.id]).map((m) => m.id);
  const includedCount = includedIds.length;
  // Recompute equal shares when included set changes in equal mode
  const equalShare = includedCount > 0 ? roundTo2(total / includedCount) : 0;
  const getShare = (memberId: string): number => {
    if (mode === 'equal') return included[memberId] ? equalShare : 0;
    return parseFloat(customAmounts[memberId] ?? '0') || 0;
  };
  const currentTotal = includedIds.reduce((sum, id) => sum + getShare(id), 0);
  const diff = roundTo2(Math.abs(currentTotal - total));
  const isBalanced = diff < 0.02;
  const handleToggle = (memberId: string) => {
    if (memberId === payerId) return; // payer can't be removed
    const next = !included[memberId];
    setIncluded((prev) => ({
      ...prev,
      [memberId]: next
    }));
    if (next && mode === 'equal') {

      // amounts recalculate automatically
    }};
  const handleAmountChange = (memberId: string, val: string) => {
    setCustomAmounts((prev) => ({
      ...prev,
      [memberId]: val
    }));
  };
  const handleSave = () => {
    const splits: TransactionSplit[] = includedIds.map((id) => ({
      memberId: id,
      share: roundTo2(getShare(id)),
      isPayer: id === payerId
    }));
    onSave(transaction.id, splits);
    onClose();
  };
  const payer = members.find((m) => m.id === payerId);
  // Sort: payer first, then going members, then rest
  const goingIds = new Set(event?.rsvps.filter((r) => r.status === 'going').map((r) => r.memberId) ?? []);
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === payerId) return -1;
    if (b.id === payerId) return 1;
    const aGoing = goingIds.has(a.id);
    const bGoing = goingIds.has(b.id);
    if (aGoing && !bGoing) return -1;
    if (!aGoing && bGoing) return 1;
    return 0;
  });
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 0.55
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASING
      }} onClick={onClose} className="fixed inset-0 z-[78]" style={{
        backgroundColor: '#000000'
      }} />

          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={EQX_TRANSITION} className="fixed bottom-0 left-0 right-0 z-[80] flex flex-col max-w-md mx-auto" style={{
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
            <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b flex-shrink-0" style={{
          borderColor: 'var(--eqx-hairline)'
        }}>
              <div>
                <h2 className="font-semibold" style={{
              fontSize: '20px',
              color: 'var(--eqx-primary)'
            }}>
                  Split ${total.toFixed(2)}
                </h2>
                {payer && <p className="text-[12px] mt-0.5" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                    Paid by {payer.name}
                  </p>}
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                <XIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="px-5 pt-4 pb-3 flex-shrink-0">
              <div className="flex p-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-raised)'
          }}>
                <button onClick={() => setMode('equal')} className="flex-1 py-2 rounded-full text-[13px] font-semibold active:opacity-[0.92]" style={{
              backgroundColor: mode === 'equal' ? 'var(--eqx-primary)' : 'transparent',
              color: mode === 'equal' ? 'var(--eqx-base)' : 'var(--eqx-tertiary)'
            }}>
                  Equal
                </button>
                <button onClick={() => setMode('custom')} className="flex-1 py-2 rounded-full text-[13px] font-semibold active:opacity-[0.92]" style={{
              backgroundColor: mode === 'custom' ? 'var(--eqx-primary)' : 'transparent',
              color: mode === 'custom' ? 'var(--eqx-base)' : 'var(--eqx-tertiary)'
            }}>
                  Custom
                </button>
              </div>
            </div>

            {/* Member list */}
            <div className="flex-1 overflow-y-auto px-5 pb-32">
              <div className="rounded-[24px] border overflow-hidden" style={{
            backgroundColor: 'var(--eqx-raised)',
            borderColor: 'var(--eqx-hairline)'
          }}>
                {sortedMembers.map((member, idx) => {
              const isIncluded = !!included[member.id];
              const isPayer = member.id === payerId;
              const isLast = idx === sortedMembers.length - 1;
              const share = getShare(member.id);
              return <div key={member.id} className="flex items-center gap-3 px-4 py-3.5" style={{
                borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)',
                backgroundColor: isPayer ? 'color-mix(in srgb, var(--eqx-mint) 4%, transparent)' : 'transparent'
              }}>
                      {/* Toggle checkbox */}
                      <button type="button" onClick={() => handleToggle(member.id)} className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center active:opacity-[0.7]" style={{
                  backgroundColor: isIncluded ? 'var(--eqx-primary)' : 'transparent',
                  border: `1.5px solid ${isIncluded ? 'var(--eqx-primary)' : 'var(--eqx-hairline)'}`,
                  opacity: isPayer ? 0.5 : 1,
                  cursor: isPayer ? 'default' : 'pointer'
                }} disabled={isPayer} aria-pressed={isIncluded}>
                        {isIncluded && <CheckIcon size={12} strokeWidth={2.5} style={{
                    color: 'var(--eqx-base)'
                  }} />}
                      </button>

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0" style={{
                  backgroundColor: member.color,
                  opacity: isIncluded ? 1 : 0.35
                }}>
                        {member.initials}
                      </div>

                      {/* Name + payer badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[15px] font-medium truncate" style={{
                      color: isIncluded ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
                    }}>
                            {member.name.split(' ')[0]}
                          </span>
                          {isPayer && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{
                      backgroundColor: 'color-mix(in srgb, var(--eqx-mint) 15%, transparent)',
                      color: 'var(--eqx-mint)'
                    }}>
                              paid
                            </span>}
                        </div>
                      </div>

                      {/* Share amount */}
                      {isIncluded && (mode === 'custom' ? <div className="flex items-center gap-0.5">
                            <span className="text-[14px]" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                              $
                            </span>
                            <input type="number" value={customAmounts[member.id] ?? ''} onChange={(e) => handleAmountChange(member.id, e.target.value)} className="w-16 text-[16px] font-semibold text-right bg-transparent outline-none border-b" style={{
                    color: 'var(--eqx-primary)',
                    borderColor: 'var(--eqx-hairline)',
                    caretColor: 'var(--eqx-primary)'
                  }} inputMode="decimal" />
                          </div> : <span className="text-[15px] font-semibold tabular-nums flex-shrink-0" style={{
                  color: 'var(--eqx-primary)'
                }}>
                            ${share.toFixed(2)}
                          </span>)}
                    </div>;
            })}
              </div>

              {/* Balance indicator */}
              <div className="mt-4 px-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                    Split total
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums" style={{
                color: isBalanced ? 'var(--eqx-mint)' : 'var(--eqx-coral)'
              }}>
                    ${currentTotal.toFixed(2)} / ${total.toFixed(2)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)'
            }}>
                  <div className="h-full rounded-full transition-all duration-200" style={{
                width: `${Math.min(currentTotal / total * 100, 100)}%`,
                backgroundColor: isBalanced ? 'var(--eqx-mint)' : currentTotal > total ? 'var(--eqx-coral)' : 'var(--eqx-orange)'
              }} />
                </div>
                {!isBalanced && <p className="text-[11px] mt-1.5" style={{
              color: 'var(--eqx-coral)'
            }}>
                    {currentTotal > total ? `$${(currentTotal - total).toFixed(2)} over` : `$${(total - currentTotal).toFixed(2)} remaining`}
                  </p>}
              </div>
            </div>

            {/* Pinned save button */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pt-5 border-t" style={{
          backgroundColor: 'var(--eqx-surface)',
          borderColor: 'var(--eqx-hairline)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
        }}>
              <Button onClick={handleSave} disabled={!isBalanced || includedCount === 0} className="w-full h-11 text-[15px] font-semibold disabled:opacity-40">
                Save Split
              </Button>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}