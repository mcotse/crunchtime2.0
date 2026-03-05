import React from 'react';
import { motion } from 'framer-motion';
import { LockIcon, ClockIcon } from 'lucide-react';
import { Poll } from '../data/pollsData';
import { Member } from '../data/mockData';
import { tintRgba } from './tintHelper';
interface PollCardProps {
  poll: Poll;
  members: Member[];
  currentUserId: string;
  onTap: (poll: Poll) => void;
  onVote: (pollId: string, optionIds: string[]) => void;
  index?: number;
  isHistory?: boolean;
}
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
function getExpiryLabel(dateStr: string | undefined, isExpired: boolean): {
  text: string;
  urgent: boolean;
} {
  if (!dateStr) return {
    text: '',
    urgent: false
  };
  const expiry = new Date(dateStr);
  if (isExpired) {
    return {
      text: `Closed ${expiry.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}`,
      urgent: false
    };
  }
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return {
    text: 'Closes today',
    urgent: true
  };
  if (diffDays === 2) return {
    text: 'Closes tomorrow',
    urgent: true
  };
  if (diffDays <= 7) return {
    text: `Closes in ${diffDays} days`,
    urgent: true
  };
  return {
    text: `Closes ${expiry.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })}`,
    urgent: false
  };
}
export function PollCard({
  poll,
  members,
  currentUserId,
  onTap,
  onVote,
  index = 0,
  isHistory = false
}: PollCardProps) {
  const isExpired = !!(poll.expiresAt && new Date(poll.expiresAt) < new Date());
  const isOpen = !isExpired && !poll.isArchived;
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voterIds.length, 0);
  const uniqueVoters = new Set(poll.options.flatMap((o) => o.voterIds)).size;
  const myVotedOptionIds = poll.options.filter((o) => o.voterIds.includes(currentUserId)).map((o) => o.id);
  const hasVoted = myVotedOptionIds.length > 0;
  const {
    text: expiryText,
    urgent
  } = getExpiryLabel(poll.expiresAt, isExpired);
  // Top 3 options sorted by votes
  const sortedOptions = [...poll.options].sort((a, b) => b.voterIds.length - a.voterIds.length);
  const previewOptions = sortedOptions.slice(0, 3);
  const extraCount = Math.max(0, poll.options.length - 3);
  // Leading option vote count (for fill color logic)
  const maxVotes = sortedOptions[0]?.voterIds.length ?? 0;
  const handleOptionClick = (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation();
    if (!isOpen) return;
    if (poll.allowMultiSelect) {
      const next = myVotedOptionIds.includes(optionId) ? myVotedOptionIds.filter((id) => id !== optionId) : [...myVotedOptionIds, optionId];
      onVote(poll.id, next);
    } else {
      onVote(poll.id, myVotedOptionIds.includes(optionId) ? [] : [optionId]);
    }
  };
  return <motion.div initial={{
    opacity: 0,
    y: 6
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.2,
    delay: index * 0.05,
    ease: EQX_EASING
  }} className="w-full rounded-[24px] overflow-hidden" style={{
    backgroundColor: 'var(--eqx-surface)',
    border: '1px solid var(--eqx-hairline)',
    opacity: isHistory ? 0.7 : 1
  }}>
      {/* ── Header ── */}
      <button onClick={() => onTap(poll)} className="w-full text-left active:opacity-[0.92]" style={{
      padding: '20px 20px 16px'
    }}>
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold leading-snug flex-1" style={{
          fontSize: 16,
          color: 'var(--eqx-primary)'
        }}>
            {poll.title}
          </h3>

          {/* Status pill */}
          {isOpen ? <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{
          backgroundColor: tintRgba(132, 239, 182, 0.08, 0.18),
          border: '1px solid var(--eqx-mint)',
          color: 'var(--eqx-mint)'
        }}>
              <span className="rounded-full flex-shrink-0" style={{
            width: 5,
            height: 5,
            backgroundColor: 'var(--eqx-mint)'
          }} />
              Active
            </span> : <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{
          backgroundColor: 'var(--eqx-raised)',
          border: '1px solid var(--eqx-hairline)',
          color: 'var(--eqx-tertiary)'
        }}>
              <LockIcon size={9} strokeWidth={1.5} />
              Closed
            </span>}
        </div>

        {/* Metadata row: expiry + vote count */}
        <div className="flex items-center gap-4">
          {expiryText && <span className="inline-flex items-center gap-1 text-[12px]" style={{
          color: 'var(--eqx-tertiary)'
        }}>
              <ClockIcon size={10} strokeWidth={1.5} />
              {expiryText}
            </span>}
          {expiryText && <span style={{
          color: 'var(--eqx-tertiary)',
          fontSize: '12px'
        }}>
              ·
            </span>}
          <span className="text-[12px] tabular-nums" style={{
          color: 'var(--eqx-tertiary)'
        }}>
            {uniqueVoters}/{members.length} voted
          </span>
        </div>
      </button>

      {/* ── Options ── */}
      <div style={{
      borderTop: '1px solid var(--eqx-hairline)',
      padding: '4px 0'
    }}>
        {previewOptions.map((option, i) => {
        const pct = totalVotes > 0 ? Math.round(option.voterIds.length / totalVotes * 100) : 0;
        const isVoted = myVotedOptionIds.includes(option.id);
        const isLeading = option.voterIds.length === maxVotes && maxVotes > 0;
        const fillColor = isLeading ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)';
        return <button key={option.id} onClick={(e) => handleOptionClick(e, option.id)} disabled={!isOpen} className="w-full text-left active:opacity-[0.88]" style={{
          padding: '12px 20px',
          cursor: isOpen ? 'pointer' : 'default'
        }}>
              {/* Option text row */}
              <div className="flex items-center gap-2.5 mb-1.5">
                {/* Circle selector */}
                <div className="flex-shrink-0 rounded-full" style={{
              width: 14,
              height: 14,
              border: isVoted ? 'none' : '1.5px solid var(--eqx-hairline)',
              backgroundColor: isVoted ? 'var(--eqx-primary)' : 'transparent'
            }} />
                <span className="flex-1 truncate" style={{
              fontSize: 14,
              color: 'var(--eqx-primary)'
            }}>
                  {option.text}
                </span>
                <span className="flex-shrink-0 tabular-nums" style={{
              fontSize: 12,
              color: 'var(--eqx-tertiary)'
            }}>
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="rounded-full overflow-hidden" style={{
            height: 3,
            backgroundColor: 'var(--eqx-hairline)',
            marginLeft: 14 + 10 // circle width + gap
          }}>
                <motion.div className="h-full rounded-full" initial={{
              width: 0
            }} animate={{
              width: `${pct}%`
            }} transition={{
              duration: 0.5,
              delay: index * 0.05 + 0.1,
              ease: EQX_EASING
            }} style={{
              backgroundColor: fillColor
            }} />
              </div>
            </button>;
      })}

        {extraCount > 0 && <p className="text-[12px] px-5 pb-3" style={{
        color: 'var(--eqx-tertiary)'
      }}>
            +{extraCount} more option{extraCount > 1 ? 's' : ''}
          </p>}
      </div>

      {/* ── Footer ── */}
      <div style={{
      borderTop: '1px solid var(--eqx-hairline)'
    }}>
        {hasVoted ? <div className="px-5 py-3 text-center text-[13px] font-semibold" style={{
        color: 'var(--eqx-mint)'
      }}>
            You voted
          </div> : isOpen ? <button onClick={(e) => {
        e.stopPropagation();
        onTap(poll);
      }} className="w-full active:opacity-[0.88]" style={{
        padding: '10px 20px'
      }}>
            <div className="w-full rounded-full py-2.5 text-[13px] font-semibold text-center" style={{
          backgroundColor: 'var(--eqx-primary)',
          color: 'var(--eqx-base)'
        }}>
              Vote
            </div>
          </button> : <div className="px-5 py-3 text-center text-[13px]" style={{
        color: 'var(--eqx-tertiary)'
      }}>
            View results
          </div>}
      </div>
    </motion.div>;
}