import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Member, Challenge, Transaction, getCrunchFundBalance } from '../data/mockData';
interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  challenges: Challenge[];
  transactions?: Transaction[];
  onAdd: (transaction: Transaction) => void;
}
const EQX_EASE = [0.2, 0.0, 0.0, 1.0] as const;
// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({
  children


}: {children: React.ReactNode;}) {
  return <p className="text-[13px] font-medium uppercase tracking-widest" style={{
    color: 'var(--eqx-secondary)',
    marginBottom: 8
  }}>
      {children}
    </p>;
}
// ── Hero amount input (underline only) ────────────────────────────────────────
function HeroAmountInput({
  value,
  onChange,
  autoFocus




}: {value: string;onChange: (v: string) => void;autoFocus?: boolean;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 80);
  }, [autoFocus]);
  return <div className="flex items-baseline gap-1 pb-2" style={{
    borderBottom: '1px solid var(--eqx-hairline)'
  }}>
      <span style={{
      fontSize: '24px',
      fontWeight: 700,
      color: 'var(--eqx-tertiary)',
      lineHeight: 1
    }}>
        $
      </span>
      <input ref={inputRef} type="text" inputMode="decimal" placeholder="0.00" value={value} onChange={(e) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '');
      if (raw.split('.').length > 2) return;
      onChange(raw);
    }} className="bg-transparent border-none outline-none flex-1 min-w-0 font-bold placeholder:text-[color:var(--eqx-tertiary)]" style={{
      fontSize: '32px',
      lineHeight: 1,
      color: 'var(--eqx-primary)',
      caretColor: 'var(--eqx-primary)'
    }} />
    </div>;
}
// ── Pill toggle ───────────────────────────────────────────────────────────────
function PillToggle<T extends string>({
  options,
  value,
  onChange,
  getActiveStyle








}: {options: {value: T;label: string;}[];value: T;onChange: (v: T) => void;getActiveStyle?: (v: T) => React.CSSProperties;}) {
  return <div className="flex rounded-full p-1" style={{
    background: 'var(--eqx-raised)'
  }}>
      {options.map((opt) => {
      const isActive = value === opt.value;
      const activeStyle = getActiveStyle?.(opt.value) ?? {};
      return <button key={opt.value} onClick={() => onChange(opt.value)} className="flex-1 text-center px-4 py-2 rounded-full text-[13px] font-semibold focus:outline-none active:opacity-[0.92]" style={isActive ? {
        background: 'var(--eqx-primary)',
        color: 'var(--eqx-base)',
        ...activeStyle
      } : {
        background: 'transparent',
        color: 'var(--eqx-tertiary)'
      }}>
            {opt.label}
          </button>;
    })}
    </div>;
}
// ── Member radio list (single-select, always visible) ─────────────────────────
function MemberRadioList({
  members,
  selected,
  onSelect,
  maxHeight = 200





}: {members: Member[];selected: string | null;onSelect: (id: string) => void;maxHeight?: number;}) {
  return <div className="rounded-[20px] overflow-hidden" style={{
    background: 'var(--eqx-raised)',
    border: '1px solid var(--eqx-hairline)',
    maxHeight,
    overflowY: 'auto'
  }}>
      {members.map((member, idx) => {
      const isSelected = selected === member.id;
      const isLast = idx === members.length - 1;
      return <button key={member.id} onClick={() => onSelect(member.id)} className="w-full flex items-center gap-3 px-4 py-2.5 focus:outline-none active:opacity-70" style={{
        borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)',
        background: 'transparent'
      }}>
            {/* Avatar */}
            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
          width: 24,
          height: 24,
          background: member.color
        }}>
              <span style={{
            fontSize: '9px',
            fontWeight: 600,
            color: '#fff'
          }}>
                {member.initials}
              </span>
            </div>
            {/* Name */}
            <span style={{
          fontSize: '14px',
          fontWeight: isSelected ? 500 : 400,
          color: isSelected ? 'var(--eqx-primary)' : 'var(--eqx-secondary)',
          flex: 1,
          textAlign: 'left'
        }}>
              {member.name}
            </span>
            {/* Radio indicator */}
            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
          width: 16,
          height: 16,
          border: isSelected ? 'none' : '2px solid var(--eqx-hairline)',
          background: isSelected ? 'var(--eqx-primary)' : 'transparent',
          transition: 'all 0.12s ease'
        }}>
              {isSelected && <CheckIcon size={9} color="#fff" strokeWidth={3} />}
            </div>
          </button>;
    })}
    </div>;
}
// ── Member checklist (multi-select, full names) ───────────────────────────────
function MemberChecklist({
  members,
  selected,
  onToggle,
  onToggleAll





}: {members: Member[];selected: string[];onToggle: (id: string) => void;onToggleAll: () => void;}) {
  const allSelected = selected.length === members.length;
  return <div className="rounded-[20px] overflow-hidden" style={{
    background: 'var(--eqx-raised)',
    border: '1px solid var(--eqx-hairline)',
    maxHeight: 240,
    overflowY: 'auto'
  }}>
      {/* Select all / Deselect all */}
      <button onClick={onToggleAll} className="w-full flex items-center justify-between px-4 py-2.5 focus:outline-none active:opacity-70" style={{
      borderBottom: '1px solid var(--eqx-hairline)'
    }}>
        <span style={{
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--eqx-tertiary)'
      }}>
          {allSelected ? 'Deselect all' : 'Select all'}
        </span>
        <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
        width: 16,
        height: 16,
        border: allSelected ? 'none' : '2px solid var(--eqx-hairline)',
        background: allSelected ? 'var(--eqx-primary)' : 'transparent',
        transition: 'all 0.12s ease'
      }}>
          {allSelected && <CheckIcon size={9} color="#fff" strokeWidth={3} />}
        </div>
      </button>

      {/* Member rows */}
      {members.map((member, idx) => {
      const isSelected = selected.includes(member.id);
      const isLast = idx === members.length - 1;
      return <button key={member.id} onClick={() => onToggle(member.id)} className="w-full flex items-center gap-3 px-4 py-2.5 focus:outline-none active:opacity-70" style={{
        borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)',
        background: 'transparent'
      }}>
            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
          width: 24,
          height: 24,
          background: member.color
        }}>
              <span style={{
            fontSize: '9px',
            fontWeight: 600,
            color: '#fff'
          }}>
                {member.initials}
              </span>
            </div>
            <span style={{
          fontSize: '14px',
          fontWeight: isSelected ? 500 : 400,
          color: isSelected ? 'var(--eqx-primary)' : 'var(--eqx-secondary)',
          flex: 1,
          textAlign: 'left'
        }}>
              {member.name}
            </span>
            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
          width: 16,
          height: 16,
          border: isSelected ? 'none' : '2px solid var(--eqx-hairline)',
          background: isSelected ? 'var(--eqx-primary)' : 'transparent',
          transition: 'all 0.12s ease'
        }}>
              {isSelected && <CheckIcon size={9} color="#fff" strokeWidth={3} />}
            </div>
          </button>;
    })}
    </div>;
}
// ── Compact single-line member selector (collapsed pill → inline list) ─────────
function CompactMemberSelector({
  members,
  selected,
  onSelect




}: {members: Member[];selected: string | null;onSelect: (id: string) => void;}) {
  const [open, setOpen] = useState(false);
  const selectedMember = members.find((m) => m.id === selected);
  return <div className="flex flex-col gap-1.5">
      {/* Collapsed pill */}
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 px-4 py-2.5 rounded-full focus:outline-none" style={{
      background: 'var(--eqx-raised)',
      border: '1px solid var(--eqx-hairline)'
    }}>
        {selectedMember ? <>
            <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
          width: 24,
          height: 24,
          background: selectedMember.color
        }}>
              <span style={{
            fontSize: '9px',
            fontWeight: 600,
            color: '#fff'
          }}>
                {selectedMember.initials}
              </span>
            </div>
            <span style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--eqx-primary)',
          flex: 1,
          textAlign: 'left'
        }}>
              {selectedMember.name}
            </span>
          </> : <span style={{
        fontSize: '14px',
        color: 'var(--eqx-tertiary)',
        flex: 1,
        textAlign: 'left'
      }}>
            Select member
          </span>}
        <ChevronDownIcon size={14} style={{
        color: 'var(--eqx-tertiary)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.18s ease',
        flexShrink: 0
      }} />
      </button>

      {/* Inline expanding list */}
      <AnimatePresence initial={false}>
        {open && <motion.div key="compact-selector-list" initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASE
      }} style={{
        overflow: 'hidden'
      }}>
            <div className="rounded-[20px] overflow-hidden" style={{
          background: 'var(--eqx-raised)',
          border: '1px solid var(--eqx-hairline)',
          maxHeight: 200,
          overflowY: 'auto'
        }}>
              {members.map((m, idx) => {
            const isSel = selected === m.id;
            const isLast = idx === members.length - 1;
            return <button key={m.id} onClick={() => {
              onSelect(m.id);
              setOpen(false);
            }} className="w-full flex items-center gap-3 px-4 py-2.5 focus:outline-none active:opacity-70" style={{
              borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)',
              background: 'transparent'
            }}>
                    <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
                width: 24,
                height: 24,
                background: m.color
              }}>
                      <span style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#fff'
                }}>
                        {m.initials}
                      </span>
                    </div>
                    <span style={{
                fontSize: '14px',
                fontWeight: isSel ? 500 : 400,
                color: isSel ? 'var(--eqx-primary)' : 'var(--eqx-secondary)',
                flex: 1,
                textAlign: 'left'
              }}>
                      {m.name}
                    </span>
                    <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
                width: 16,
                height: 16,
                border: isSel ? 'none' : '2px solid var(--eqx-hairline)',
                background: isSel ? 'var(--eqx-primary)' : 'transparent',
                transition: 'all 0.12s ease'
              }}>
                      {isSel && <CheckIcon size={9} color="#fff" strokeWidth={3} />}
                    </div>
                  </button>;
          })}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
// ── Expense Form ──────────────────────────────────────────────────────────────
function ExpenseForm({
  members,
  challenges,
  transactions




}: {members: Member[];challenges: Challenge[];transactions: Transaction[];}) {
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidById, setPaidById] = useState<string | null>(members[0]?.id ?? null);
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [fundingSource, setFundingSource] = useState<'direct' | 'fund'>('direct');
  const [expChallengeId, setExpChallengeId] = useState(activeChallenges[0]?.id ?? '');
  const challengePoolBalance = expChallengeId ? getCrunchFundBalance(transactions, expChallengeId) : 0;
  const amountNum = parseFloat(amount) || 0;
  const poolCovers = Math.min(amountNum, challengePoolBalance);
  const overage = Math.max(0, amountNum - challengePoolBalance);
  const eachOwes = splitAmong.length > 0 ? overage / splitAmong.length : 0;
  const showOveragePreview = fundingSource === 'fund' && expChallengeId && amountNum > 0 && splitAmong.length > 0;
  const handleToggleMember = (id: string) => setSplitAmong((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const handleToggleAll = () => setSplitAmong(splitAmong.length === members.length ? [] : members.map((m) => m.id));
  return <div className="space-y-5">
      {/* 1. Amount — no label */}
      <HeroAmountInput value={amount} onChange={setAmount} autoFocus />

      {/* 2. Description */}
      <div>
        <SectionLabel>Description</SectionLabel>
        <input type="text" placeholder="What's it for?" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-transparent outline-none text-[15px] pb-2 placeholder:text-[color:var(--eqx-tertiary)]" style={{
        borderBottom: '1px solid var(--eqx-hairline)',
        color: 'var(--eqx-primary)',
        caretColor: 'var(--eqx-primary)'
      }} />
      </div>

      {/* 3. Paid by — compact collapsible selector */}
      <div>
        <SectionLabel>Paid by</SectionLabel>
        <CompactMemberSelector members={members} selected={paidById} onSelect={setPaidById} />
      </div>

      {/* 4. Split among — full checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Split among</SectionLabel>
          <span className="text-[13px]" style={{
          color: 'var(--eqx-tertiary)'
        }}>
            {splitAmong.length} of {members.length}
          </span>
        </div>
        <MemberChecklist members={members} selected={splitAmong} onToggle={handleToggleMember} onToggleAll={handleToggleAll} />
      </div>

      {/* 5. Funding — only if active challenges exist */}
      {activeChallenges.length > 0 && <div>
          <SectionLabel>Funding</SectionLabel>
          <PillToggle options={[{
        value: 'direct' as const,
        label: 'Direct'
      }, {
        value: 'fund' as const,
        label: 'From fund'
      }]} value={fundingSource} onChange={setFundingSource} />

          <AnimatePresence>
            {fundingSource === 'fund' && <motion.div key="fund-section" initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: 0.18,
          ease: EQX_EASE
        }} style={{
          overflow: 'hidden'
        }}>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {activeChallenges.map((ch) => {
                const isActive = expChallengeId === ch.id;
                return <button key={ch.id} onClick={() => setExpChallengeId(isActive ? '' : ch.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold focus:outline-none" style={{
                  background: isActive ? 'var(--eqx-primary)' : 'var(--eqx-raised)',
                  color: isActive ? 'var(--eqx-base)' : 'var(--eqx-secondary)',
                  border: `1px solid ${isActive ? 'transparent' : 'var(--eqx-hairline)'}`
                }}>
                          <span>{ch.emoji}</span>
                          <span>{ch.name}</span>
                        </button>;
              })}
                  </div>

                  <AnimatePresence>
                    {expChallengeId && <motion.div key="pool-balance" initial={{
                opacity: 0,
                y: 4
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: 4
              }} transition={{
                duration: 0.15,
                ease: EQX_EASE
              }} className="flex items-center justify-between px-4 py-2.5 rounded-[14px]" style={{
                background: 'var(--eqx-raised)',
                border: '1px solid var(--eqx-hairline)'
              }}>
                        <span className="text-[13px]" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                          Pool available
                        </span>
                        <span className="tabular-nums" style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: challengePoolBalance > 0 ? 'var(--eqx-mint)' : 'var(--eqx-coral)'
                }}>
                          ${challengePoolBalance.toFixed(2)}
                        </span>
                      </motion.div>}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showOveragePreview && overage > 0 && <motion.div key="overage" initial={{
                opacity: 0,
                y: 4
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: 4
              }} transition={{
                duration: 0.15,
                ease: EQX_EASE
              }} className="rounded-[14px] px-4 py-2.5 space-y-1" style={{
                background: 'var(--eqx-raised)',
                border: '1px solid var(--eqx-hairline)'
              }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px]" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                            Pool covers
                          </span>
                          <span className="tabular-nums" style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--eqx-mint)'
                  }}>
                            ${poolCovers.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px]" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                            Each person owes
                          </span>
                          <span className="tabular-nums" style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--eqx-coral)'
                  }}>
                            ${eachOwes.toFixed(2)}
                          </span>
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>}
    </div>;
}
// ── Fine Form ─────────────────────────────────────────────────────────────────
function FineForm({
  members,
  challenges



}: {members: Member[];challenges: Challenge[];}) {
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const displayChallenges = activeChallenges.length > 0 ? activeChallenges : challenges;
  const defaultChallenge = displayChallenges[0] ?? null;
  const defaultEligible = defaultChallenge ? members.filter((m) => defaultChallenge.participantIds.includes(m.id)) : members;
  const [selectedChallengeId, setSelectedChallengeId] = useState(defaultChallenge?.id ?? '');
  const [fineMemberId, setFineMemberId] = useState<string | null>(defaultEligible[0]?.id ?? null);
  const [amount, setAmount] = useState(defaultChallenge ? String(defaultChallenge.fineAmount) : '');
  const [fineStatus, setFineStatus] = useState<'unpaid' | 'paid'>('unpaid');
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [note, setNote] = useState('');
  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId);
  const eligibleMembers = selectedChallenge ? members.filter((m) => selectedChallenge.participantIds.includes(m.id)) : members;
  useEffect(() => {
    if (selectedChallenge) {
      setAmount(String(selectedChallenge.fineAmount));
      const newEligible = members.filter((m) => selectedChallenge.participantIds.includes(m.id));
      setFineMemberId(newEligible[0]?.id ?? null);
    } else {
      setAmount('');
      setFineMemberId(members[0]?.id ?? null);
    }
  }, [selectedChallengeId]);
  return <div className="space-y-5">
      {/* 1. Challenge */}
      <div>
        <SectionLabel>Challenge</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {displayChallenges.map((ch) => {
          const isActive = selectedChallengeId === ch.id;
          return <button key={ch.id} onClick={() => setSelectedChallengeId(isActive ? '' : ch.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold focus:outline-none" style={{
            background: isActive ? 'var(--eqx-primary)' : 'var(--eqx-raised)',
            color: isActive ? 'var(--eqx-base)' : 'var(--eqx-secondary)',
            border: `1px solid ${isActive ? 'transparent' : 'var(--eqx-hairline)'}`
          }}>
                <span>{ch.emoji}</span>
                <span>{ch.name}</span>
              </button>;
        })}
        </div>
      </div>

      {/* 2. Fined member */}
      <div>
        <SectionLabel>Fined member</SectionLabel>
        <MemberRadioList members={eligibleMembers} selected={fineMemberId} onSelect={setFineMemberId} maxHeight={200} />
      </div>

      {/* 3. Amount */}
      <div>
        <SectionLabel>Amount</SectionLabel>
        <HeroAmountInput value={amount} onChange={setAmount} />
      </div>

      {/* 4. Status */}
      <div>
        <SectionLabel>Status</SectionLabel>
        <div className="flex rounded-full p-1" style={{
        background: 'var(--eqx-raised)'
      }}>
          {(['unpaid', 'paid'] as const).map((status) => {
          const isActive = fineStatus === status;
          const activeBg = status === 'unpaid' ? 'rgba(237,106,103,0.12)' : 'rgba(132,239,182,0.12)';
          const activeColor = status === 'unpaid' ? 'var(--eqx-coral)' : 'var(--eqx-mint)';
          return <button key={status} onClick={() => setFineStatus(status)} className="flex-1 text-center px-4 py-1.5 rounded-full text-[13px] font-semibold capitalize focus:outline-none" style={{
            background: isActive ? activeBg : 'transparent',
            color: isActive ? activeColor : 'var(--eqx-tertiary)',
            transition: 'all 0.12s ease'
          }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>;
        })}
        </div>
      </div>

      {/* 5. Note — no label, expandable */}
      <div>
        <AnimatePresence mode="wait">
          {!noteExpanded ? <motion.button key="note-link" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setNoteExpanded(true)} className="text-[13px] font-medium focus:outline-none" style={{
          color: 'var(--eqx-tertiary)'
        }}>
              + Add a note
            </motion.button> : <motion.div key="note-field" initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: 0.15,
          ease: EQX_EASE
        }} style={{
          overflow: 'hidden'
        }}>
              <input type="text" placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} autoFocus className="w-full bg-transparent outline-none text-[15px] pb-2 placeholder:text-[color:var(--eqx-tertiary)]" style={{
            borderBottom: '1px solid var(--eqx-hairline)',
            color: 'var(--eqx-primary)',
            caretColor: 'var(--eqx-primary)'
          }} />
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
}
// ── Main sheet ────────────────────────────────────────────────────────────────
export function AddTransactionSheet({
  isOpen,
  onClose,
  members,
  challenges,
  transactions = [],
  onAdd
}: AddTransactionSheetProps) {
  const [activeTab, setActiveTab] = useState<'expense' | 'fine'>('expense');
  useEffect(() => {
    if (!isOpen) setActiveTab('expense');
  }, [isOpen]);
  const handleAdd = () => {
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      type: activeTab,
      description: '',
      amount: 0,
      memberId: members[0]?.id ?? '',
      date: new Date().toISOString(),
      editHistory: []
    });
    onClose();
  };
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
        ease: EQX_EASE
      }} onClick={onClose} className="fixed inset-0 z-50" style={{
        backgroundColor: '#000000'
      }} />

          {/* Sheet */}
          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        duration: 0.32,
        ease: EQX_EASE
      }} className="fixed bottom-0 left-0 right-0 z-[51] h-[90vh] flex flex-col max-w-md mx-auto" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderRadius: '32px 32px 0 0'
      }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-hairline)'
          }} />
            </div>

            {/* Header — static title */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 flex-shrink-0">
              <h2 className="font-semibold" style={{
            fontSize: '20px',
            lineHeight: '24px',
            color: 'var(--eqx-primary)'
          }}>
                New Transaction
              </h2>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92] focus:outline-none" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                <XIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Tab toggle */}
            <div className="px-5 pt-3 pb-2 flex-shrink-0">
              <PillToggle options={[{
            value: 'expense' as const,
            label: 'Expense'
          }, {
            value: 'fine' as const,
            label: 'Fine'
          }]} value={activeTab} onChange={setActiveTab} />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'expense' ? <motion.div key="expense" initial={{
              opacity: 0,
              x: -10
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: 10
            }} transition={{
              duration: 0.18,
              ease: EQX_EASE
            }}>
                    <ExpenseForm members={members} challenges={challenges} transactions={transactions} />
                  </motion.div> : <motion.div key="fine" initial={{
              opacity: 0,
              x: 10
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -10
            }} transition={{
              duration: 0.18,
              ease: EQX_EASE
            }}>
                    <FineForm members={members} challenges={challenges} />
                  </motion.div>}
              </AnimatePresence>
            </div>

            {/* Pinned CTA */}
            <div className="px-5 py-4 border-t flex-shrink-0" style={{
          backgroundColor: 'var(--eqx-surface)',
          borderColor: 'var(--eqx-hairline)'
        }}>
              <button onClick={handleAdd} className="w-full h-11 rounded-full text-[15px] font-semibold active:opacity-[0.88] focus:outline-none" style={{
            backgroundColor: 'var(--eqx-primary)',
            color: 'var(--eqx-base)'
          }}>
                {activeTab === 'expense' ? 'Add Expense' : 'Add Fine'}
              </button>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}