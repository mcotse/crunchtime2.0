import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { Member, Challenge, Transaction } from '../../data/mockData';
import { EQX_EASING } from './eventsConstants';
import { ChallengeCard } from './ChallengeCard';
interface ChallengesModeSectionProps {
  challenges: Challenge[];
  members: Member[];
  transactions: Transaction[];
  currentUserId: string;
  onOpenChallenge?: (challenge: Challenge) => void;
}
export function ChallengesModeSection({
  challenges,
  members,
  transactions,
  currentUserId,
  onOpenChallenge
}: ChallengesModeSectionProps) {
  const [completedOpen, setCompletedOpen] = useState(false);
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const completedChallenges = challenges.filter((c) => c.status === 'completed');
  const fmt = (n: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);
  return <motion.div key="challenges" initial={{
    opacity: 0,
    x: 8
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: 8
  }} transition={{
    duration: 0.2,
    ease: EQX_EASING
  }} className="flex-1 flex flex-col px-4">
      <div className="space-y-3 mt-1">
        {activeChallenges.length === 0 ? <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <p className="text-[15px] font-medium" style={{
          color: 'var(--eqx-secondary)'
        }}>
              No active challenges
            </p>
            <p className="text-[13px]" style={{
          color: 'var(--eqx-tertiary)'
        }}>
              Start one
            </p>
          </div> : activeChallenges.map((challenge, i) => <ChallengeCard key={challenge.id} challenge={challenge} members={members} transactions={transactions} currentUserId={currentUserId} index={i} onOpen={onOpenChallenge} />)}
      </div>

      {/* Past challenges — compact collapsible */}
      {completedChallenges.length > 0 && <div className="mt-6">
          <button onClick={() => setCompletedOpen((v) => !v)} className="w-full flex items-center justify-between py-3 active:opacity-[0.92]" aria-expanded={completedOpen}>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{
            color: 'var(--eqx-secondary)'
          }}>
                History
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{
            backgroundColor: 'var(--eqx-raised)',
            color: 'var(--eqx-tertiary)'
          }}>
                {completedChallenges.length}
              </span>
            </div>
            {completedOpen ? <ChevronUpIcon size={15} style={{
          color: 'var(--eqx-tertiary)'
        }} /> : <ChevronDownIcon size={15} style={{
          color: 'var(--eqx-tertiary)'
        }} />}
          </button>

          {!completedOpen && <div className="border-t" style={{
        borderColor: 'var(--eqx-hairline)'
      }} />}

          <AnimatePresence>
            {completedOpen && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: 0.24,
          ease: EQX_EASING
        }} style={{
          overflow: 'hidden'
        }}>
                <div className="mt-2 mb-4 rounded-[24px] overflow-hidden border" style={{
            borderColor: 'var(--eqx-hairline)',
            backgroundColor: 'var(--eqx-surface)',
            opacity: 0.65
          }}>
                  {completedChallenges.map((challenge, i) => {
              const finedIds = new Set(transactions.filter((t) => t.type === 'fine' && t.challengeId === challenge.id).map((t) => t.memberId));
              const passedCount = challenge.participantIds.filter((pid) => !finedIds.has(pid)).length;
              const totalCollected = transactions.filter((t) => t.type === 'fine' && t.fineStatus === 'paid' && t.challengeId === challenge.id).reduce((s, t) => s + t.amount, 0);
              const deadlineLabel = new Date(challenge.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              return <button key={challenge.id} onClick={() => onOpenChallenge?.(challenge)} className="w-full text-left flex items-center gap-3 px-5 py-4 active:opacity-[0.88]" style={{
                borderBottom: i < completedChallenges.length - 1 ? '1px solid var(--eqx-hairline)' : 'none'
              }}>
                        <span className="text-[18px] leading-none flex-shrink-0">
                          {challenge.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium truncate" style={{
                    color: 'var(--eqx-primary)'
                  }}>
                            {challenge.name}
                          </p>
                          <p className="text-[12px] mt-0.5" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                            {passedCount}/{challenge.participantIds.length}{' '}
                            passed
                            {totalCollected > 0 ? ` · ${fmt(totalCollected)} collected` : ''}
                            {' · '}Ended {deadlineLabel}
                          </p>
                        </div>
                        <ChevronRightIcon size={13} style={{
                  color: 'var(--eqx-tertiary)',
                  flexShrink: 0
                }} />
                      </button>;
            })}
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>}
    </motion.div>;
}