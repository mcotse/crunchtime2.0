import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { EQX_EASING } from './events/eventsConstants';
export interface AvailabilityCellProps {
  dateKey: string;
  day: number;
  idx: number;
  past: boolean;
  isToday: boolean;
  count: number;
  isConfirmed: boolean;
  hasAvailability: boolean;
  cellBackground: string;
  cellBorder: string;
  textColor: string;
  fontWeight: number;
  todayCircleBg: string;
  todayCircleText: string;
  onToggle: (dateStr: string) => void;
  onLongPress: (dateStr: string) => void;
}
export function AvailabilityCell({
  dateKey,
  day,
  idx,
  past,
  isToday,
  count,
  isConfirmed,
  hasAvailability,
  cellBackground,
  cellBorder,
  textColor,
  fontWeight,
  todayCircleBg,
  todayCircleText,
  onToggle,
  onLongPress
}: AvailabilityCellProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const cancelTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  const handlePointerDown = () => {
    if (past) return;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress(dateKey);
    }, 500);
  };
  const handlePointerUp = () => {
    if (past) return;
    cancelTimer();
    if (!didLongPress.current) {
      onToggle(dateKey);
    }
  };
  const handlePointerLeave = () => {
    cancelTimer();
  };
  const handlePointerCancel = () => {
    cancelTimer();
  };
  return <motion.div initial={{
    opacity: 0,
    scale: 0.85
  }} animate={{
    opacity: past ? 0.3 : 1,
    scale: 1
  }} transition={{
    duration: 0.2,
    delay: idx * 0.006,
    ease: EQX_EASING
  }} className="relative flex flex-col items-center justify-center select-none" style={{
    height: 44,
    borderRadius: 14,
    background: 'transparent',
    border: 'none',
    cursor: past ? 'default' : 'pointer',
    WebkitUserSelect: 'none',
    userSelect: 'none'
  }} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerLeave} onPointerCancel={handlePointerCancel}>
      {isToday ? <div className="flex items-center justify-center rounded-full" style={{
      width: 28,
      height: 28,
      backgroundColor: todayCircleBg
    }}>
          <span style={{
        fontSize: '14px',
        fontWeight: 700,
        color: todayCircleText,
        lineHeight: 1
      }}>
            {day}
          </span>
        </div> : <span style={{
      fontSize: '14px',
      fontWeight,
      color: past ? 'var(--eqx-tertiary)' : textColor,
      lineHeight: 1,
      transition: 'color 200ms cubic-bezier(0.2,0.0,0.0,1.0)'
    }}>
          {day}
        </span>}

      {/* Single dot indicator for availability */}
      {!past && hasAvailability && !isToday && <div style={{
      position: 'absolute',
      bottom: 5,
      width: 4,
      height: 4,
      borderRadius: '50%',
      backgroundColor: isConfirmed ? 'var(--eqx-mint)' : 'var(--eqx-orange)',
      transition: 'background-color 200ms cubic-bezier(0.2,0.0,0.0,1.0)'
    }} />}
    </motion.div>;
}