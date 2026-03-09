import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FlameIcon, DollarSignIcon, TrophyIcon } from 'lucide-react';
import { Member, Transaction, Challenge } from '../data/mockData';
import { tintBg } from './tintHelper';
interface HomeTabProps {
  members: Member[];
  transactions: Transaction[];
  challenges: Challenge[];
  crunchFundBalance: number;
  totalFinesCollected: number;
  totalChallengeSpend: number;
  pendingFinesCount: number;
  onAddTransaction: () => void;
  groupName: string;
  onSeeAll: () => void;
  onOpenNotifications: () => void;
  hasUnread: boolean;
  onOpenChallenge: (challenge: Challenge) => void;
  onSwitchToPolls: () => void;
  onOpenTransaction?: (tx: Transaction) => void;
}
const EQX_EASE = [0.2, 0.0, 0.0, 1.0] as const;
function formatCurrencyWhole(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n);
}
function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n);
}
function CountingBalance({
  target


}: {target: number;}) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState('$0');
  useEffect(() => {
    const controls = animate(count, target, {
      duration: 1.2,
      ease: [0.2, 0.0, 0.0, 1.0]
    });
    const unsubscribe = count.on('change', (v) => {
      setDisplay(formatCurrencyWhole(v));
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [target]);
  return <span className="tabular-nums" style={{
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1,
    color: 'var(--eqx-primary)',
    letterSpacing: '-0.02em'
  }}>
      {display}
    </span>;
}
export function HomeTab({
  members,
  transactions,
  challenges,
  crunchFundBalance,
  totalFinesCollected,
  totalChallengeSpend,
  pendingFinesCount,
  onAddTransaction,
  groupName,
  onSeeAll,
  onOpenNotifications,
  hasUnread,
  onOpenChallenge,
  onSwitchToPolls,
  onOpenTransaction
}: HomeTabProps) {
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const getMember = (id: string) => members.find((m) => m.id === id);
  const getAmountColor = (tx: Transaction): string => {
    if (tx.type === 'fine' && tx.fineStatus === 'paid') return 'var(--eqx-mint)';
    return 'var(--eqx-coral)';
  };
  const getAmountPrefix = (tx: Transaction): string => {
    if (tx.type === 'fine' && tx.fineStatus === 'paid') return '+';
    return '−';
  };
  return <div className="flex-1 w-full flex flex-col justify-center pb-28 relative" style={{
    backgroundColor: 'var(--eqx-base)'
  }}>
      {/* ── Full-bleed hero gradient — fixed to viewport top, bleeds to all edges ── */}
      <div aria-hidden="true" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '85vh',
      background: 'var(--eqx-hero-gradient)',
      pointerEvents: 'none',
      zIndex: 0
    }} />

      {/* ── Hero Section ── */}
      <div className="relative flex flex-col items-center justify-center px-6 text-center pt-24 pb-10" style={{
      zIndex: 1
    }}>
        {/* Group label */}
        <motion.p initial={{
        opacity: 0,
        y: 12
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        ease: EQX_EASE,
        delay: 0
      }} style={{
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--eqx-tertiary)',
        marginBottom: '12px'
      }}>
          {groupName.toUpperCase()}
        </motion.p>

        {/* Balance */}
        <motion.div initial={{
        opacity: 0,
        y: 12
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        ease: EQX_EASE,
        delay: 0
      }} style={{
        marginBottom: '28px'
      }}>
          <CountingBalance target={crunchFundBalance} />
        </motion.div>

        {/* CTA Button */}
        <motion.button initial={{
        opacity: 0,
        y: 12
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        ease: EQX_EASE,
        delay: 0.3
      }} onClick={onAddTransaction} className="rounded-full font-semibold active:opacity-[0.88]" style={{
        backgroundColor: 'var(--eqx-primary)',
        color: 'var(--eqx-base)',
        fontSize: '15px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingTop: '12px',
        paddingBottom: '12px'
      }}>
          Add Transaction
        </motion.button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="px-4 flex gap-3 relative" style={{
      marginTop: '20px',
      zIndex: 1
    }}>
        {/* Raised */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        ease: EQX_EASE,
        delay: 0.42
      }} className="flex-1 rounded-[24px] p-4 text-center" style={{
        backgroundColor: 'var(--eqx-surface)',
        border: '1px solid var(--eqx-hairline)'
      }}>
          <p style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--eqx-tertiary)',
          marginBottom: '4px',
          lineHeight: 1
        }}>
            Raised
          </p>
          <p className="tabular-nums font-bold" style={{
          fontSize: '22px',
          color: 'var(--eqx-mint)',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1
        }}>
            {formatCompact(totalFinesCollected)}
          </p>
        </motion.div>

        {/* Spent */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4,
        ease: EQX_EASE,
        delay: 0.48
      }} className="flex-1 rounded-[24px] p-4 text-center" style={{
        backgroundColor: 'var(--eqx-surface)',
        border: '1px solid var(--eqx-hairline)'
      }}>
          <p style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--eqx-tertiary)',
          marginBottom: '4px',
          lineHeight: 1
        }}>
            Spent
          </p>
          <p className="tabular-nums font-bold" style={{
          fontSize: '22px',
          color: 'var(--eqx-coral)',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1
        }}>
            {formatCompact(totalChallengeSpend)}
          </p>
        </motion.div>
      </div>

      {/* ── Recent Transactions Card ── */}
      {recentTransactions.length > 0 ? <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4,
      ease: EQX_EASE,
      delay: 0.56
    }} className="mx-4 rounded-[24px] overflow-hidden relative" style={{
      backgroundColor: 'var(--eqx-surface)',
      border: '1px solid var(--eqx-hairline)',
      marginTop: '20px',
      zIndex: 1
    }}>
          {recentTransactions.map((tx, i) => {
        const member = getMember(tx.memberId);
        const amountColor = getAmountColor(tx);
        const prefix = getAmountPrefix(tx);
        const isFirst = i === 0;
        return <button key={tx.id} onClick={() => onOpenTransaction ? onOpenTransaction(tx) : onSeeAll()} className="w-full flex items-center gap-3 px-5 active:opacity-[0.88] text-left" style={{
          paddingTop: isFirst ? '18px' : '14px',
          paddingBottom: i === recentTransactions.length - 1 ? '18px' : '14px',
          borderTop: isFirst ? 'none' : '1px solid var(--eqx-hairline)'
        }}>
                {/* Icon chip */}
                <TransactionIconChip tx={tx} />

                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--eqx-primary)',
              lineHeight: '1.3'
            }}>
                    {tx.description}
                  </p>
                  <p className="font-semibold" style={{
              fontSize: '11px',
              color: 'var(--eqx-tertiary)',
              marginTop: '1px'
            }}>
                    {member?.name.split(' ')[0] ?? 'Unknown'}
                    {tx.type === 'fine' && tx.fineStatus === 'pending' && <span style={{
                color: 'var(--eqx-coral)'
              }}>
                        {' '}
                        · unpaid
                      </span>}
                  </p>
                </div>

                <span className="flex-shrink-0 tabular-nums" style={{
            fontSize: '15px',
            fontWeight: 600,
            color: amountColor
          }}>
                  {prefix}${tx.amount.toFixed(2)}
                </span>
              </button>;
      })}
        </motion.div> : <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      ease: EQX_EASE,
      delay: 0.5
    }} className="flex flex-col items-center relative" style={{
      marginTop: '20px',
      zIndex: 1
    }}>
          <p style={{
        fontSize: '13px',
        color: 'var(--eqx-tertiary)'
      }}>
            No transactions yet
          </p>
        </motion.div>}

      {/* ── View all activity link ── */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.4,
      ease: EQX_EASE,
      delay: 0.64
    }} className="flex justify-center relative" style={{
      marginTop: '28px',
      zIndex: 1
    }}>
        <button onClick={onSeeAll} className="active:opacity-[0.7]" style={{
        fontSize: '13px',
        color: 'var(--eqx-tertiary)',
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }}>
          View all activity
        </button>
      </motion.div>
    </div>;
}
// ── Transaction Icon Chip ─────────────────────────────────────────────────────
function TransactionIconChip({
  tx


}: {tx: Transaction;}) {
  let bg: string;
  let icon: React.ReactNode;
  if (tx.type === 'fine') {
    bg = tintBg('var(--eqx-coral)', 15, 28);
    icon = <FlameIcon size={16} strokeWidth={2} style={{
      color: 'var(--eqx-coral)'
    }} />;
  } else if (tx.fundingSource === 'challenge') {
    bg = tintBg('var(--eqx-orange)', 15, 28);
    icon = <TrophyIcon size={16} strokeWidth={2} style={{
      color: 'var(--eqx-orange)'
    }} />;
  } else {
    bg = tintBg('var(--eqx-mint)', 15, 28);
    icon = <DollarSignIcon size={16} strokeWidth={2} style={{
      color: 'var(--eqx-mint)'
    }} />;
  }
  return <div className="flex items-center justify-center flex-shrink-0" style={{
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: bg
  }} aria-hidden="true">
      {icon}
    </div>;
}