import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, PlusIcon, FlameIcon, DollarSignIcon } from 'lucide-react';
import { TransactionDetailSheet } from './TransactionDetailSheet';
import { AddTransactionSheet } from './AddTransactionSheet';
import type { Transaction, Member } from '../data/mockData';
import { MEMBERS, CHALLENGES, TRANSACTIONS } from '../data/mockData';
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
interface BalanceMember {
  id: string;
  name: string;
  avatarColor: string;
  initial: string;
  status: 'owes_you' | 'you_owe' | 'settled';
  amount: number;
}
// ── Data ──────────────────────────────────────────────────────────────────────
const SPLIT_TRANSACTIONS: SplitTransaction[] = [{
  id: 't1',
  description: 'Whole Foods',
  memberName: 'Alex',
  amount: 47.3,
  type: 'expense',
  avatarColor: '#7F8DE0',
  initial: 'A',
  dateGroup: 'Today',
  dateOrder: 0
}, {
  id: 't2',
  description: 'Dinner at Nobu',
  memberName: 'Jordan',
  amount: 124.0,
  type: 'expense',
  avatarColor: '#44C2DD',
  initial: 'J',
  dateGroup: 'Today',
  dateOrder: 0
}, {
  id: 't3',
  description: 'Electricity bill',
  memberName: 'Sam',
  amount: 89.5,
  type: 'expense',
  avatarColor: '#FE9E6D',
  initial: 'S',
  dateGroup: 'Yesterday',
  dateOrder: 1
}, {
  id: 't4',
  description: 'Alex paid back',
  memberName: 'Alex',
  amount: 45.0,
  type: 'payment',
  avatarColor: '#7F8DE0',
  initial: 'A',
  dateGroup: 'Yesterday',
  dateOrder: 1
}, {
  id: 't5',
  description: 'Uber Eats',
  memberName: 'Maya',
  amount: 32.8,
  type: 'expense',
  avatarColor: '#84EFB6',
  initial: 'M',
  dateGroup: 'Mar 1',
  dateOrder: 2
}, {
  id: 't6',
  description: 'Sarah reimbursed',
  memberName: 'Sarah',
  amount: 67.2,
  type: 'payment',
  avatarColor: '#FE9E6D',
  initial: 'S',
  dateGroup: 'Mar 1',
  dateOrder: 2
}];
const DATE_GROUPS = ['Today', 'Yesterday', 'Mar 1'];
const TOTAL_THIS_MONTH = 293.8;
const FUND_ACTIVITY: FundActivityItem[] = [{
  id: 'f1',
  emoji: '⚡',
  description: 'Late challenge fine — Alex',
  amount: 25.0,
  type: 'incoming'
}, {
  id: 'f2',
  emoji: '⚡',
  description: 'Late challenge fine — Jordan',
  amount: 25.0,
  type: 'incoming'
}, {
  id: 'f3',
  emoji: '⚡',
  description: 'Missed workout — Sam',
  amount: 10.0,
  type: 'incoming'
}, {
  id: 'f4',
  emoji: '🍕',
  description: 'Group dinner — Nobu',
  amount: 124.0,
  type: 'outgoing'
}];
const BALANCE_MEMBERS: BalanceMember[] = [{
  id: 'b1',
  name: 'Alex',
  avatarColor: '#7F8DE0',
  initial: 'A',
  status: 'owes_you',
  amount: 82.5
}, {
  id: 'b2',
  name: 'Jordan',
  avatarColor: '#44C2DD',
  initial: 'J',
  status: 'owes_you',
  amount: 34.0
}, {
  id: 'b3',
  name: 'Sam',
  avatarColor: '#FE9E6D',
  initial: 'S',
  status: 'you_owe',
  amount: 55.0
}, {
  id: 'b4',
  name: 'Maya',
  avatarColor: '#84EFB6',
  initial: 'M',
  status: 'settled',
  amount: 0
}];
const GROUP_FUND_TOTAL = 847.5;
// ── Helpers for Fund Activity → TransactionDetailSheet ────────────────────────
function fundActivityToTransaction(item: FundActivityItem): Transaction {
  // Extract member name from description (after " — ")
  const parts = item.description.split(' — ');
  const memberName = parts.length > 1 ? parts[1] : 'Unknown';
  const balanceMember = BALANCE_MEMBERS.find((m) => m.name.toLowerCase() === memberName.toLowerCase());
  return {
    id: item.id,
    description: parts[0],
    amount: item.amount,
    memberId: balanceMember?.id ?? 'unknown',
    date: new Date().toISOString(),
    type: item.type === 'incoming' ? 'fine' : 'expense',
    fineStatus: item.type === 'incoming' ? 'paid' : undefined,
    fundingSource: item.type === 'outgoing' ? 'challenge' : undefined,
    category: item.type === 'incoming' ? 'Fine' : 'Food',
    editHistory: []
  };
}
function balanceMembersToMembers(): Member[] {
  return BALANCE_MEMBERS.map((bm) => ({
    id: bm.id,
    name: bm.name,
    initials: bm.initial,
    phone: '',
    email: '',
    color: bm.avatarColor,
    balance: bm.amount
  }));
}
// ── Main component ────────────────────────────────────────────────────────────
export function SplitsTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('transactions');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const handleAddTransaction = (transaction: Transaction) => {
    // Handle the new transaction (currently a no-op for mock data)
    console.log('Added transaction:', transaction);
  };
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
        <AnimatePresence mode="wait">
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
              <TransactionsView />
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
              <BalancesView />
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* ── Add Transaction Sheet ── */}
      <AddTransactionSheet isOpen={isAddSheetOpen} onClose={() => setIsAddSheetOpen(false)} members={MEMBERS} challenges={CHALLENGES} transactions={TRANSACTIONS} onAdd={handleAddTransaction} />
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
function TransactionsView() {
  const transactionCount = SPLIT_TRANSACTIONS.length;
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
  // Map SplitTransaction → Transaction for the detail sheet
  const syntheticTransaction: Transaction | null = selectedTx ? {
    id: selectedTx.id,
    description: selectedTx.description,
    amount: selectedTx.amount,
    memberId: selectedTx.id + '-member',
    date: new Date().toISOString(),
    type: 'expense',
    fundingSource: 'direct',
    category: selectedTx.type === 'payment' ? 'Income' : 'Food',
    editHistory: []
  } : null;
  // Build unique synthetic members from split transactions
  const syntheticMembers: Member[] = (() => {
    const seen = new Set<string>();
    return SPLIT_TRANSACTIONS.filter((tx) => {
      if (seen.has(tx.memberName)) return false;
      seen.add(tx.memberName);
      return true;
    }).map((tx) => ({
      id: tx.id + '-member',
      name: tx.memberName,
      initials: tx.initial,
      phone: '',
      email: '',
      color: tx.avatarColor,
      balance: 0
    }));
  })();
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
            ${TOTAL_THIS_MONTH.toFixed(2)}
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
        {DATE_GROUPS.map((group, groupIndex) => {
        const rows = SPLIT_TRANSACTIONS.filter((t) => t.dateGroup === group);
        const isLastGroup = groupIndex === DATE_GROUPS.length - 1;
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
      <TransactionDetailSheet transaction={syntheticTransaction} isOpen={isDetailOpen} onClose={handleCloseDetail} members={syntheticMembers} events={[]} />
    </div>;
}
// ── Balances view ─────────────────────────────────────────────────────────────
function BalancesView() {
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
  const syntheticTransaction = selectedActivity ? fundActivityToTransaction(selectedActivity) : null;
  const syntheticMembers = balanceMembersToMembers();
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
            ${GROUP_FUND_TOTAL.toFixed(2)}
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
            {FUND_ACTIVITY.length}
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
          {FUND_ACTIVITY.map((item, index) => {
          const isLast = index === FUND_ACTIVITY.length - 1;
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
      <TransactionDetailSheet transaction={syntheticTransaction} isOpen={isDetailOpen} onClose={handleCloseDetail} members={syntheticMembers} events={[]} />
    </div>;
}