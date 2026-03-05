import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontalIcon, ArchiveIcon, ArchiveRestoreIcon } from 'lucide-react';
import { GroupEvent } from '../data/eventsData';
import { EQX_EASING } from './events/eventsConstants';
interface EventOverflowMenuProps {
  event: GroupEvent;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}
export function EventOverflowMenu({
  event,
  onArchive,
  onUnarchive
}: EventOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return <div className="relative" ref={ref}>
      <button onClick={(e) => {
      e.stopPropagation();
      setOpen((v) => !v);
    }} className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
      color: 'var(--eqx-tertiary)'
    }} aria-label="More options">
        <MoreHorizontalIcon size={16} />
      </button>
      <AnimatePresence>
        {open && <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: -4
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: -4
      }} transition={{
        duration: 0.12,
        ease: EQX_EASING
      }} className="absolute right-0 top-full mt-1 rounded-[16px] border overflow-hidden min-w-[148px] z-20" style={{
        backgroundColor: 'var(--eqx-raised)',
        borderColor: 'var(--eqx-hairline)'
      }}>
            <button onClick={(e) => {
          e.stopPropagation();
          event.isArchived ? onUnarchive(event.id) : onArchive(event.id);
          setOpen(false);
        }} className="flex items-center gap-2.5 w-full px-4 py-3 text-[14px] active:opacity-[0.92]" style={{
          color: 'var(--eqx-primary)'
        }}>
              {event.isArchived ? <>
                  <ArchiveRestoreIcon size={14} /> Unarchive
                </> : <>
                  <ArchiveIcon size={14} /> Archive
                </>}
            </button>
          </motion.div>}
      </AnimatePresence>
    </div>;
}