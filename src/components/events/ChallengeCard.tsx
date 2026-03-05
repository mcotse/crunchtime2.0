import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CalendarIcon } from 'lucide-react';
import { Member, Challenge, Transaction } from '../../data/mockData';
import { EQX_EASING } from './eventsConstants';
import { tintRgba } from '../tintHelper';
interface ChallengeCardProps {
  challenge: Challenge;
  members: Member[];
  transactions: Transaction[];
  currentUserId: string;
  index: number;
  onOpen?: (c: Challenge) => void;
  muted?: boolean;
}
export function ChallengeCard({
  challenge,
  members,
  transactions,
  currentUserId,
  index,
  onOpen,
  muted = false
}: ChallengeCardProps) {
  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';
  const endMs = new Date(challenge.endDate).getTime();
  const startMs = new Date(challenge.startDate).getTime();
  const nowMs = Date.now();
  const totalDuration = endMs - startMs;
  const elapsed = Math.max(0, nowMs - startMs);
  const progressPct = Math.min(100, Math.round(elapsed / totalDuration * 100));
  const msLeft = Math.max(0, endMs - nowMs);
  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const deadlineLabel = new Date(challenge.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const participantCount = challenge.participantIds.length;
  const shownIds = challenge.participantIds.slice(0, 7);
  const overflow = participantCount - 7;
  const finedIds = new Set(transactions.filter((t) => t.type === 'fine' && t.challengeId === challenge.id).map((t) => t.memberId));
  const passedCount = isCompleted ? challenge.participantIds.filter((pid) => !finedIds.has(pid)).length : 0;
  const totalCollected = isCompleted ? transactions.filter((t) => t.type === 'fine' && t.fineStatus === 'paid' && t.challengeId === challenge.id).reduce((s, t) => s + t.amount, 0) : 0;
  const fmt = (n: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);
  return <motion.button initial={{
    opacity: 0,
    y: 8
  }} animate={{
    opacity: muted ? 0.55 : 1,
    y: 0
  }} transition={{
    duration: 0.22,
    delay: index * 0.06,
    ease: EQX_EASING
  }} onClick={() => onOpen?.(challenge)} className="w-full text-left rounded-[24px] active:opacity-[0.88]" style={{
    backgroundColor: 'var(--eqx-surface)',
    border: '1px solid var(--eqx-hairline)',
    padding: 24
  }}>
      {/* Row 1: emoji + name + stake pill */}
      <div className="flex items-center gap-3">
        <span className="text-[22px] leading-none flex-shrink-0">
          {challenge.emoji}
        </span>
        <p className="flex-1 font-semibold leading-snug" style={{
        fontSize: '16px',
        color: 'var(--eqx-primary)'
      }}>
          {challenge.name}
        </p>
        <span className="flex-shrink-0 font-semibold rounded-full" style={{
        fontSize: '11px',
        color: 'var(--eqx-coral)',
        backgroundColor: tintRgba(237, 106, 103, 0.1, 0.2),
        border: `1px solid ${tintRgba(237, 106, 103, 0.25, 0.4)}`,
        padding: '2px 8px'
      }}>
          ${challenge.fineAmount} stake
        </span>
      </div>

      {/* Row 2: metadata line */}
      <div className="mt-2 flex items-center gap-1.5">
        <ClockIcon size={11} style={{
        color: 'var(--eqx-tertiary)',
        flexShrink: 0
      }} />
        <p style={{
        fontSize: '12px',
        color: 'var(--eqx-tertiary)'
      }}>
          {isActive ? `${daysLeft} days left · ${participantCount} participating` : `${passedCount}/${participantCount} passed · ${fmt(totalCollected)} collected`}
        </p>
      </div>

      {/* Row 3: description */}
      <p className="mt-3 leading-snug line-clamp-2" style={{
      fontSize: '13px',
      color: 'var(--eqx-secondary)'
    }}>
        {challenge.description}
      </p>

      {/* Row 4: progress bar */}
      {isActive && <div className="mt-5 mb-5 rounded-full overflow-hidden" style={{
      height: 6,
      backgroundColor: 'var(--eqx-hairline)'
    }}>
          <motion.div initial={{
        width: 0
      }} animate={{
        width: `${progressPct}%`
      }} transition={{
        duration: 0.8,
        delay: index * 0.06 + 0.2,
        ease: EQX_EASING
      }} style={{
        height: '100%',
        borderRadius: 999,
        backgroundColor: 'var(--eqx-orange)'
      }} />
        </div>}

      {/* Row 5: end date + avatars */}
      <div className="flex items-center justify-between" style={{
      marginTop: isActive ? 0 : 16
    }}>
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={11} style={{
          color: 'var(--eqx-tertiary)',
          flexShrink: 0
        }} />
          <p style={{
          fontSize: '12px',
          color: 'var(--eqx-tertiary)'
        }}>
            {isActive ? `Ends ${deadlineLabel}` : `Ended ${deadlineLabel}`}
          </p>
        </div>
        <div className="flex items-center">
          {shownIds.map((pid, i) => {
          const m = members.find((mb) => mb.id === pid);
          if (!m) return null;
          const hasFine = finedIds.has(pid);
          return <div key={pid} className="relative flex-shrink-0" style={{
            marginLeft: i === 0 ? 0 : -6,
            zIndex: shownIds.length - i
          }}>
                <div className="rounded-full flex items-center justify-center text-white font-bold border" style={{
              width: 24,
              height: 24,
              fontSize: '8px',
              backgroundColor: m.color,
              borderColor: 'var(--eqx-surface)'
            }}>
                  {m.initials.charAt(0)}
                </div>
                {hasFine && <div className="absolute rounded-full border" style={{
              width: 7,
              height: 7,
              backgroundColor: 'var(--eqx-coral)',
              borderColor: 'var(--eqx-surface)',
              bottom: -1,
              right: -1
            }} />}
              </div>;
        })}
          {overflow > 0 && <div className="rounded-full flex items-center justify-center font-bold border flex-shrink-0" style={{
          width: 24,
          height: 24,
          fontSize: '8px',
          backgroundColor: 'var(--eqx-hairline)',
          borderColor: 'var(--eqx-surface)',
          color: 'var(--eqx-tertiary)',
          marginLeft: -6,
          zIndex: 0
        }}>
              +{overflow}
            </div>}
        </div>
      </div>
    </motion.button>;
}