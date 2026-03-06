import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, PlusIcon, FlameIcon, DollarSignIcon } from 'lucide-react';
import { TransactionDetailSheet } from './TransactionDetailSheet';
import { AddTransactionSheet } from './AddTransactionSheet';
import type { Transaction, Member } from '../data/mockData';
import { useMembers } from '../hooks/useMembers';
import { useTransactions, useAddTransaction } from '../hooks/useTransactions';
import { useChallenges } from '../hooks/useChallenges';
import { tintBg } from './tintHelper';
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
type SubTab = 'transactions' | 'balances';
// ── Types ─────────────────────────────────────────────────────────────────────
interface SplitTransaction {
  id: string;
  description: string;
  memberName: string;
  amount: number;
  type: 'expense' | 'payment';
  avatarColor: string;
  initial: string;
  dateGroup: string;
  dateOrder: number;
}
interface FundActivityItem {
  id: string;
  emoji: string;
  description: string;
  amount: number;
  type: 'incoming' | 'outgoing';
}
// ── Helpers to derive display data from real data ────────────────────────────

function getDateGroup(dateStr: string): { label: string; order: number } {
  const txDate = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

  if (txDay.getTime() === today.getTime()) return { label: 'Today', order: 0 };
  if (txDay.getTime() === yesterday.getTime()) return { label: 'Yesterday', order: 1 };

  const label = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysDiff = Math.floor((today.getTime() - txDay.getTime()) / (1000 * 60 * 60 * 24));
  return { label, order: daysDiff };
}

function deriveSplitTransactions(
  transactions: Transaction[],
  members: Member[]
): SplitTransaction[] {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  return transactions
    .filter((t) => t.type === 'expense')
    .map((t) => {
      const member = memberMap.get(t.memberId);
      const { label, order } = getDateGroup(t.date);
      return {
        id: t.id,
        description: t.description,
        memberName: member?.name ?? 'Unknown',
        amount: t.amount,
        type: 'expense' as const,
        avatarColor: member?.color ?? '#888888',
        initial: member?.initials?.charAt(0) ?? '?',
        dateGroup: label,
        dateOrder: order,
      };
    });
}

function deriveFundActivity(
  transactions: Transaction[],
  members: Member[]
): FundActivityItem[] {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const fines = transactions
    .filter((t) => t.type === 'fine')
    .map((t) => {
      const member = memberMap.get(t.memberId);
      return {
        id: t.id,
        emoji: '⚡',
        description: `${t.description} — ${member?.name ?? 'Unknown'}`,
        amount: t.amount,
        type: 'incoming' as const,
      };
    });
  const fundExpenses = transactions
    .filter((t) => t.type === 'expense' && t.fundingSource === 'challenge')
    .map((t) => ({
      id: t.id,
      emoji: '🍕',
      description: t.description,
      amount: t.amount,
      type: 'outgoing' as const,
    }));
  return [...fines, ...fundExpenses];
}

// ── Main component ────────────────────────────────────────────────────────────
export function SplitsTab() {
  const { data: members = [], error: membersError } = useMembers();
  const { data: transactions = [], error: transactionsError } = useTransactions();
  const { data: challenges = [], error: challengesError } = useChallenges();
  const addTransaction = useAddTransaction();

  const error = membersError || transactionsError || challengesError;

  const splitTransactions = useMemo(() => deriveSplitTransactions(transactions, members), [transactions, members]);
  const dateGroups = useMemo(() => {
    const seen = new Map<string, number>();
    for (const tx of splitTransactions) {
      if (!seen.has(tx.dateGroup)) seen.set(tx.dateGroup, tx.dateOrder);
    }
    return [...seen.entries()].sort((a, b) => a[1] - b[1]).map(([label]) => label);
  }, [splitTransactions]);
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);
  const fundActivity = useMemo(() => deriveFundActivity(transactions, members), [transactions, members]);
  const groupFundTotal = useMemo(() => {
    const finesIn = transactions.filter((t) => t.type === 'fine' && t.fineStatus === 'paid').reduce((s, t) => s + t.amount, 0);
    const fundOut = transactions.filter((t) => t.type === 'expense' && t.fundingSource === 'challenge').reduce((s, t) => s + t.amount, 0);
    return finesIn - fundOut;
  }, [transactions]);

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('transactions');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const handleAddTransaction = (transaction: Transaction) => {
    addTransaction.mutate({ transaction });
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: 'var(--eqx-base)' }}>
        <div className="text-center space-y-3">
          <div className="text-3xl">⚠️</div>
          <p className="text-sm" style={{ color: 'var(--eqx-secondary)' }}>
            {error instanceof Error ? error.message : 'Failed to load data'}
          </p>
        </div>
      </div>
    );
  }

  return <div className="flex-1 flex flex-col min-h-screen pb-24" style={{
    backgroundColor: 'var(--eqx-base)'
  }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <h2 className="font-semibold" style={{
        fontSize: '24px',
        lineHeight: '28px',
        color: 'var(--eqx-primary)'
      }}>
          Splits
        </h2>
        <button onClick={() => setIsAddSheetOpen(true)} className="flex items-center gap-1.5 rounded-full font-semibold active:opacity-[0.92]" style={{
        height: '36px',
        fontSize: '13px',
        backgroundColor: 'transparent',
        border: '1px solid var(--eqx-hairline)',
        color: 'var(--eqx-primary)',
        paddingLeft: '12px',
        paddingRight: '16px',
        cursor: 'pointer'
      }} aria-label="Add expense">
          <PlusIcon size={13} strokeWidth={2.5} />
          Add Expense
        </button>
      </div>

      {/* ── Segmented control — full-width, matches Calendar sub-tab switcher ── */}
      <div className="px-4 mb-5">
        <div className="flex gap-1 rounded-full p-1" style={{
        backgroundColor: 'var(--eqx-raised)'
      }} role="tablist" aria-label="Splits view">
          <SegmentButton label="Transactions" isActive={activeSubTab === 'transactions'} onClick={() => setActiveSubTab('transactions')} />
          <SegmentButton label="Balances" isActive={activeSubTab === 'balances'} onClick={() => setActiveSubTab('balances')} />
        </div>
      </div>

      {/* ── Sub-tab content ── */}
      <div className="px-4 flex-1">
        <AnimatePresence mode="popLayout">
          {activeSubTab === 'transactions' ? <motion.div key="transactions" initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -4
        }} transition={{
          duration: 0.22,
          ease: EQX_EASING
        }}>
              <TransactionsView splitTransactions={splitTransactions} dateGroups={dateGroups} totalThisMonth={totalThisMonth} members={members} transactions={transactions} />
            </motion.div> : <motion.div key="balances" initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -4
        }} transition={{
          duration: 0.22,
          ease: EQX_EASING
        }}>
              <BalancesView fundActivity={fundActivity} groupFundTotal={groupFundTotal} transactions={transactions} members={members} />
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* ── Add Transaction Sheet ── */}
      <AddTransactionSheet isOpen={isAddSheetOpen} onClose={() => setIsAddSheetOpen(false)} members={members} challenges={challenges} transactions={transactions} onAdd={handleAddTransaction} />
    </div>;
}
// ── Segment button — full-width style matching Calendar ───────────────────────
function SegmentButton({
  label,
  isActive,
  onClick




}: {label: string;isActive: boolean;onClick: () => void;}) {
  return <button role="tab" aria-selected={isActive} onClick={onClick} className="flex-1 py-2 rounded-full font-semibold transition-colors active:opacity-[0.92]" style={{
    fontSize: '13px',
    backgroundColor: isActive ? 'var(--eqx-primary)' : 'transparent',
    color: isActive ? 'var(--eqx-base)' : 'var(--eqx-tertiary)',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none'
  }}>
      {label}
    </button>;
}
// ── Transactions view ─────────────────────────────────────────────────────────
function TransactionsView({ splitTransactions, dateGroups, totalThisMonth, members, transactions }: {
  splitTransactions: SplitTransaction[];
  dateGroups: string[];
  totalThisMonth: number;
  members: Member[];
  transactions: Transaction[];
}) {
  const transactionCount = splitTransactions.length;
  const [selectedTx, setSelectedTx] = useState<SplitTransaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const handleTxTap = (tx: SplitTransaction) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTx(null), 320);
  };
  // Find the real transaction for the detail sheet
  const realTransaction: Transaction | null = selectedTx
    ? transactions.find((t) => t.id === selectedTx.id) ?? null
    : null;
  return <div>
      {/* ── 2-col stat header ── */}
      <div className="flex gap-6 mt-5 mb-5 rounded-[24px]" style={{
      backgroundColor: 'var(--eqx-surface)',
      border: '1px solid var(--eqx-hairline)',
      padding: '0 16px',
      paddingTop: '20px',
      paddingBottom: '20px'
    }}>
        <div className="flex-1 text-center">
          <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--eqx-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          display: 'block',
          marginBottom: '4px'
        }}>
            Total Spent
          </span>
          <span className="font-bold" style={{
          fontSize: '28px',
          color: 'var(--eqx-primary)',
          lineHeight: 1.1,
          fontWeight: 700
        }}>
            ${totalThisMonth.toFixed(2)}
          </span>
        </div>

        <div style={{
        width: '1px',
        backgroundColor: 'var(--eqx-hairline)',
        alignSelf: 'stretch',
        margin: '2px 0'
      }} />

        <div className="flex-1 text-center">
          <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--eqx-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          display: 'block',
          marginBottom: '4px'
        }}>
            Transactions
          </span>
          <span className="font-bold" style={{
          fontSize: '28px',
          color: 'var(--eqx-primary)',
          lineHeight: 1.1,
          fontWeight: 700
        }}>
            {transactionCount}
          </span>
        </div>
      </div>

      {/* Transaction list card */}
      <div className="rounded-[24px] overflow-hidden" style={{
      backgroundColor: 'var(--eqx-surface)',
      border: '1px solid var(--eqx-hairline)'
    }}>
        {dateGroups.map((group, groupIndex) => {
        const rows = splitTransactions.filter((t) => t.dateGroup === group);
        const isLastGroup = groupIndex === dateGroups.length - 1;
        return <div key={group}>
              {/* Date header */}
              <div className="px-4 flex items-center" style={{
            paddingTop: groupIndex === 0 ? '12px' : '14px',
            paddingBottom: '4px'
          }}>
                <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--eqx-tertiary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              paddingLeft: '2px'
            }}>
                  {group}
                </span>
              </div>

              {/* Transaction rows */}
              {rows.map((tx, rowIndex) => {
            const isLastInGroup = rowIndex === rows.length - 1;
            const isAbsoluteLast = isLastGroup && isLastInGroup;
            return <motion.button key={tx.id} onClick={() => handleTxTap(tx)} initial={{
              opacity: 0,
              y: 4
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.18,
              delay: Math.min(groupIndex * 0.05 + rowIndex * 0.03, 0.25),
              ease: EQX_EASING
            }} className="w-full flex items-center px-4 active:opacity-[0.92]" style={{
              height: '56px',
              background: 'none',
              borderBottom: isAbsoluteLast ? 'none' : '1px solid var(--eqx-hairline)',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              textAlign: 'left' as const
            }}>
                    {/* Avatar circle */}
                    <div className="flex items-center justify-center flex-shrink-0 mr-3" style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: `color-mix(in srgb, ${tx.avatarColor} 18%, var(--eqx-raised))`,
                flexShrink: 0
              }} aria-hidden="true">
                      <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: tx.avatarColor,
                  lineHeight: 1
                }}>
                        {tx.initial}
                      </span>
                    </div>

                    {/* Two-line description */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'var(--eqx-primary)',
                  lineHeight: 1.3
                }}>
                        {tx.description}
                      </p>
                      <p className="truncate font-semibold" style={{
                  fontSize: '11px',
                  color: 'var(--eqx-tertiary)',
                  lineHeight: 1.3
                }}>
                        {tx.memberName}
                      </p>
                    </div>

                    {/* Amount */}
                    <span className="font-semibold flex-shrink-0 ml-3" style={{
                fontSize: '15px',
                color: tx.type === 'payment' ? 'var(--eqx-mint)' : 'var(--eqx-coral)'
              }}>
                      {tx.type === 'payment' ? '+' : ''}${tx.amount.toFixed(2)}
                    </span>
                  </motion.button>;
          })}
            </div>;
      })}
      </div>

      {/* ── Transaction Detail Sheet ── */}
      <TransactionDetailSheet transaction={realTransaction} isOpen={isDetailOpen} onClose={handleCloseDetail} members={members} events={[]} />
    </div>;
}
// ── Balances view ─────────────────────────────────────────────────────────────
function BalancesView({ fundActivity, groupFundTotal, transactions, members }: {
  fundActivity: FundActivityItem[];
  groupFundTotal: number;
  transactions: Transaction[];
  members: Member[];
}) {
  const [selectedActivity, setSelectedActivity] = useState<FundActivityItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const handleActivityTap = (item: FundActivityItem) => {
    setSelectedActivity(item);
    setIsDetailOpen(true);
  };
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedActivity(null), 320);
  };
  // Find the real transaction for the detail sheet
  const realTransaction: Transaction | null = selectedActivity
    ? transactions.find((t) => t.id === selectedActivity.id) ?? null
    : null;
  return <div>
      {/* ── 2-col stat header ── */}
      <div className="flex gap-6 mt-5 mb-5 rounded-[24px]" style={{
      backgroundColor: 'var(--eqx-surface)',
      border: '1px solid var(--eqx-hairline)',
      padding: '0 16px',
      paddingTop: '20px',
      paddingBottom: '20px'
    }}>
        <div className="flex-1 text-center">
          <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--eqx-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          display: 'block',
          marginBottom: '4px'
        }}>
            Crunch Fund
          </span>
          <span className="font-bold" style={{
          fontSize: '28px',
          color: 'var(--eqx-primary)',
          lineHeight: 1.1,
          fontWeight: 700
        }}>
            ${groupFundTotal.toFixed(2)}
          </span>
        </div>

        <div style={{
        width: '1px',
        backgroundColor: 'var(--eqx-hairline)',
        alignSelf: 'stretch',
        margin: '2px 0'
      }} />

        <div className="flex-1 text-center">
          <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--eqx-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          display: 'block',
          marginBottom: '4px'
        }}>
            Contributions
          </span>
          <span className="font-bold" style={{
          fontSize: '28px',
          color: 'var(--eqx-primary)',
          lineHeight: 1.1,
          fontWeight: 700
        }}>
            {fundActivity.length}
          </span>
        </div>
      </div>

      {/* ── Fund Activity ── */}
      <div className="mb-1">
        <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--eqx-tertiary)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        display: 'block',
        marginBottom: '8px',
        paddingLeft: '2px'
      }}>
          Fund Activity
        </span>
        <div className="rounded-[24px] overflow-hidden" style={{
        backgroundColor: 'var(--eqx-surface)',
        border: '1px solid var(--eqx-hairline)'
      }}>
          {fundActivity.map((item, index) => {
          const isLast = index === fundActivity.length - 1;
          return <motion.button key={item.id} onClick={() => handleActivityTap(item)} initial={{
            opacity: 0,
            y: 4
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.18,
            delay: Math.min(index * 0.04, 0.2),
            ease: EQX_EASING
          }} className="w-full flex items-center px-4 active:opacity-[0.92]" style={{
            height: '56px',
            background: 'none',
            borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            textAlign: 'left' as const
          }}>
                {/* Icon chip */}
                <div className="flex items-center justify-center flex-shrink-0 mr-3" style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: item.type === 'incoming' ? tintBg('var(--eqx-coral)', 15, 28) : tintBg('var(--eqx-mint)', 15, 28)
            }} aria-hidden="true">
                  {item.type === 'incoming' ? <FlameIcon size={16} strokeWidth={2} style={{
                color: 'var(--eqx-coral)'
              }} /> : <DollarSignIcon size={16} strokeWidth={2} style={{
                color: 'var(--eqx-mint)'
              }} />}
                </div>

                {/* Two-line description */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{
                fontSize: '15px',
                color: 'var(--eqx-primary)',
                lineHeight: 1.3
              }}>
                    {item.description.includes(' — ') ? item.description.split(' — ')[0] : item.description}
                  </p>
                  {item.description.includes(' — ') && <p className="truncate" style={{
                fontSize: '13px',
                color: 'var(--eqx-tertiary)',
                lineHeight: 1.3
              }}>
                      {item.description.split(' — ')[1]}
                    </p>}
                </div>

                {/* Amount */}
                <span className="font-semibold flex-shrink-0 mx-3" style={{
              fontSize: '15px',
              color: item.type === 'incoming' ? 'var(--eqx-mint)' : 'var(--eqx-coral)'
            }}>
                  {item.type === 'incoming' ? '+' : '-'}$
                  {item.amount.toFixed(2)}
                </span>

                {/* Chevron */}
                <ChevronRightIcon size={14} style={{
              color: 'var(--eqx-tertiary)',
              flexShrink: 0
            }} aria-hidden="true" />
              </motion.button>;
        })}
        </div>
      </div>

      {/* ── Transaction Detail Sheet ── */}
      <TransactionDetailSheet transaction={realTransaction} isOpen={isDetailOpen} onClose={handleCloseDetail} members={members} events={[]} />
    </div>;
}