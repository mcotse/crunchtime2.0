import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, InboxIcon, ChevronDownIcon, ChevronUpIcon, BellIcon } from 'lucide-react';
import { Poll } from '../data/pollsData';
import { Member } from '../data/mockData';
import { PollCard } from './PollCard';
import { Button } from './ui/Button';
interface PollsTabProps {
  polls: Poll[];
  members: Member[];
  currentUserId: string;
  onCreatePoll: () => void;
  onOpenPoll: (poll: Poll) => void;
  onVote: (pollId: string, optionIds: string[]) => void;
  onOpenNotifications?: () => void;
  hasUnread?: boolean;
}
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
export function PollsTab({
  polls,
  members,
  currentUserId,
  onCreatePoll,
  onOpenPoll,
  onVote,
  onOpenNotifications,
  hasUnread = false
}: PollsTabProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const now = new Date();
  const activePolls = polls.filter((p) => !p.isArchived && (!p.expiresAt || new Date(p.expiresAt) > now));
  const closedPolls = polls.filter((p) => !p.isArchived && p.expiresAt && new Date(p.expiresAt) <= now);
  const archivedPolls = polls.filter((p) => p.isArchived);
  const sortedActive = [...activePolls].sort((a, b) => {
    if (a.expiresAt && b.expiresAt) return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    if (a.expiresAt) return -1;
    if (b.expiresAt) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const sortedClosed = [...closedPolls].sort((a, b) => new Date(b.expiresAt!).getTime() - new Date(a.expiresAt!).getTime());
  const sortedArchived = [...archivedPolls].sort((a, b) => {
    const aTime = new Date(a.archivedAt ?? a.createdAt).getTime();
    const bTime = new Date(b.archivedAt ?? b.createdAt).getTime();
    return bTime - aTime;
  });
  const historyCount = closedPolls.length + archivedPolls.length;
  return <div className="flex flex-col pb-32 min-h-screen" style={{
    backgroundColor: 'var(--eqx-base)'
  }}>
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-5 flex items-center justify-between">
        <h2 className="font-semibold" style={{
        fontSize: '24px',
        lineHeight: '28px',
        color: 'var(--eqx-primary)'
      }}>
          Polls
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={onOpenNotifications} className="relative w-10 h-10 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
          color: 'var(--eqx-secondary)'
        }} aria-label="Notifications">
            <BellIcon size={20} strokeWidth={1.5} />
            {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{
            backgroundColor: 'var(--eqx-coral)'
          }} />}
          </button>
          <Button onClick={onCreatePoll} size="sm" className="h-9 px-4 text-[13px]">
            <PlusIcon size={13} className="mr-1.5" strokeWidth={2.5} />
            New Poll
          </Button>
        </div>
      </div>

      {/* ── Active polls list ── */}
      <div className="flex-1 px-4">
        {sortedActive.length === 0 ? <motion.div initial={{
        opacity: 0,
        y: 4
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASING
      }} className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-12 h-12 rounded-[24px] flex items-center justify-center" style={{
          backgroundColor: 'var(--eqx-raised)'
        }}>
              <InboxIcon size={22} style={{
            color: 'var(--eqx-tertiary)'
          }} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[15px] font-medium" style={{
            color: 'var(--eqx-secondary)'
          }}>
                No active polls
              </p>
              <p className="text-[13px]" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                Create one to get the group's input
              </p>
            </div>
          </motion.div> : <motion.div initial={{
        opacity: 0,
        y: 4
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASING
      }} className="space-y-3">
            {sortedActive.map((poll, i) => <PollCard key={poll.id} poll={poll} members={members} currentUserId={currentUserId} onTap={onOpenPoll} onVote={onVote} index={i} />)}
          </motion.div>}

        {/* ── History accordion ── */}
        {historyCount > 0 && <div className="mt-6">
            {/* Accordion trigger */}
            <button onClick={() => setHistoryOpen((v) => !v)} className="w-full flex items-center justify-between py-3 active:opacity-[0.92]" aria-expanded={historyOpen}>
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
                  {historyCount}
                </span>
              </div>
              {historyOpen ? <ChevronDownIcon size={15} style={{
            color: 'var(--eqx-tertiary)'
          }} /> : <ChevronUpIcon size={15} style={{
            color: 'var(--eqx-tertiary)'
          }} />}
            </button>

            {/* Accordion content */}
            <AnimatePresence>
              {historyOpen && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.28,
            ease: EQX_EASING
          }} style={{
            overflow: 'hidden'
          }}>
                  <div className="space-y-5 pb-4">
                    {/* Closed section */}
                    {sortedClosed.length > 0 && <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                          Closed
                        </p>
                        {sortedClosed.map((poll, i) => <PollCard key={poll.id} poll={poll} members={members} currentUserId={currentUserId} onTap={onOpenPoll} onVote={onVote} index={i} isHistory />)}
                      </div>}

                    {/* Archived section */}
                    {sortedArchived.length > 0 && <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                          Archived
                        </p>
                        {sortedArchived.map((poll, i) => <PollCard key={poll.id} poll={poll} members={members} currentUserId={currentUserId} onTap={onOpenPoll} onVote={onVote} index={i} isHistory />)}
                      </div>}
                  </div>
                </motion.div>}
            </AnimatePresence>

            {/* Hairline separator above accordion */}
            {!historyOpen && <div className="border-t" style={{
          borderColor: 'var(--eqx-hairline)'
        }} />}
          </div>}
      </div>
    </div>;
}