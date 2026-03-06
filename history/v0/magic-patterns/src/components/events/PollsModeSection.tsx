import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InboxIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { Member } from '../../data/mockData';
import { Poll } from '../../data/pollsData';
import { EQX_EASING } from './eventsConstants';
import { PollCard } from '../PollCard';
interface PollsModeSectionProps {
  polls: Poll[];
  members: Member[];
  currentUserId: string;
  onOpenPoll?: (poll: Poll) => void;
  onVote?: (pollId: string, optionIds: string[]) => void;
}
export function PollsModeSection({
  polls,
  members,
  currentUserId,
  onOpenPoll,
  onVote
}: PollsModeSectionProps) {
  const [pollsHistoryOpen, setPollsHistoryOpen] = useState(false);
  const nowDate = new Date();
  const activePolls = polls.filter((p) => !p.isArchived && (!p.expiresAt || new Date(p.expiresAt) > nowDate));
  const closedPolls = polls.filter((p) => !p.isArchived && p.expiresAt && new Date(p.expiresAt) <= nowDate);
  const archivedPolls = polls.filter((p) => p.isArchived);
  const sortedActivePolls = [...activePolls].sort((a, b) => {
    if (a.expiresAt && b.expiresAt) return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    if (a.expiresAt) return -1;
    if (b.expiresAt) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const sortedClosedPolls = [...closedPolls].sort((a, b) => new Date(b.expiresAt!).getTime() - new Date(a.expiresAt!).getTime());
  const sortedArchivedPolls = [...archivedPolls].sort((a, b) => {
    return new Date(b.archivedAt ?? b.createdAt).getTime() - new Date(a.archivedAt ?? a.createdAt).getTime();
  });
  const pollsHistoryCount = closedPolls.length + archivedPolls.length;
  return <motion.div key="polls" initial={{
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
  }} className="flex-1 flex flex-col">
      <div className="flex-1 px-4">
        {sortedActivePolls.length === 0 ? <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-[24px] flex items-center justify-center" style={{
          backgroundColor: 'var(--eqx-raised)'
        }}>
              <InboxIcon size={20} style={{
            color: 'var(--eqx-tertiary)'
          }} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[15px] font-medium" style={{
            color: 'var(--eqx-secondary)'
          }}>
                No open polls
              </p>
              <p className="text-[13px]" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                Start a poll
              </p>
            </div>
          </div> : <div className="space-y-3">
            {sortedActivePolls.map((poll, i) => <PollCard key={poll.id} poll={poll} members={members} currentUserId={currentUserId} onTap={onOpenPoll ?? (() => {})} onVote={onVote ?? (() => {})} index={i} />)}
          </div>}

        {pollsHistoryCount > 0 && <div className="mt-6">
            <button onClick={() => setPollsHistoryOpen((v) => !v)} className="w-full flex items-center justify-between py-3 active:opacity-[0.92]" aria-expanded={pollsHistoryOpen}>
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
                  {pollsHistoryCount}
                </span>
              </div>
              {pollsHistoryOpen ? <ChevronUpIcon size={15} style={{
            color: 'var(--eqx-tertiary)'
          }} /> : <ChevronDownIcon size={15} style={{
            color: 'var(--eqx-tertiary)'
          }} />}
            </button>

            <AnimatePresence>
              {pollsHistoryOpen && <motion.div initial={{
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
                    {sortedClosedPolls.length > 0 && <div className="space-y-3">
                        
                        {sortedClosedPolls.map((poll, i) => <PollCard key={poll.id} poll={poll} members={members} currentUserId={currentUserId} onTap={onOpenPoll ?? (() => {})} onVote={onVote ?? (() => {})} index={i} isHistory />)}
                      </div>}
                    {sortedArchivedPolls.length > 0 && <div className="space-y-3">
                        
                        {sortedArchivedPolls.map((poll, i) => <PollCard key={poll.id} poll={poll} members={members} currentUserId={currentUserId} onTap={onOpenPoll ?? (() => {})} onVote={onVote ?? (() => {})} index={i} isHistory />)}
                      </div>}
                  </div>
                </motion.div>}
            </AnimatePresence>

            {!pollsHistoryOpen && <div className="border-t" style={{
          borderColor: 'var(--eqx-hairline)'
        }} />}
          </div>}
      </div>
    </motion.div>;
}