import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronRightIcon as ChevronRightSmallIcon, CalendarIcon, PlusIcon } from 'lucide-react';
import { Member } from '../../data/mockData';
import { CalendarAvailability, dateKey, today, isPast } from '../../data/calendarData';
import { EQX_EASING, DAYS_OF_WEEK, getDaysInMonth, getFirstDayOfWeek } from './eventsConstants';
import { AvailabilityCell } from './AvailabilityCell';
interface AvailabilityModeSectionProps {
  availability: CalendarAvailability;
  members: Member[];
  currentUserId: string;
  viewYear: number;
  viewMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleAvailability: (dateStr: string) => void;
  onDayTap: (dateStr: string) => void;
  onCreateEvent: () => void;
}
export function AvailabilityModeSection({
  availability,
  members,
  currentUserId,
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
  onToggleAvailability,
  onDayTap,
  onCreateEvent
}: AvailabilityModeSectionProps) {
  const [seeAllExpanded, setSeeAllExpanded] = useState(false);
  const [expandedDateStr, setExpandedDateStr] = useState<string | null>(null);
  const now = today();
  const todayKey = dateKey(now);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({
    length: daysInMonth
  }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return <motion.div key="availability" initial={{
    opacity: 0,
    x: -8
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: -8
  }} transition={{
    duration: 0.2,
    ease: EQX_EASING
  }} className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 pb-3">
        <button onClick={onPrevMonth} className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
        color: 'var(--eqx-secondary)'
      }} aria-label="Previous month">
          <ChevronLeftIcon size={20} strokeWidth={1.5} />
        </button>
        <motion.h2 key={`${viewYear}-${viewMonth}`} initial={{
        opacity: 0,
        y: -4
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.2,
        ease: EQX_EASING
      }} className="font-semibold" style={{
        fontSize: '16px',
        color: 'var(--eqx-primary)'
      }}>
          {monthLabel}
        </motion.h2>
        <button onClick={onNextMonth} className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
        color: 'var(--eqx-secondary)'
      }} aria-label="Next month">
          <ChevronRightIcon size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 px-4 mb-1">
        {DAYS_OF_WEEK.map((d, i) => <div key={i} className="text-center py-1" style={{
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--eqx-tertiary)'
      }}>
            {d}
          </div>)}
      </div>

      <motion.div key={`${viewYear}-${viewMonth}`} initial={{
      opacity: 0,
      x: 8
    }} animate={{
      opacity: 1,
      x: 0
    }} transition={{
      duration: 0.2,
      ease: EQX_EASING
    }} className="grid grid-cols-7 gap-[3px] px-4">
        {cells.map((day, idx) => {
        if (day === null) return <div key={`blank-${idx}`} style={{
          height: 44
        }} />;
        const d = new Date(viewYear, viewMonth, day);
        const key = dateKey(d);
        const past = isPast(key);
        const isToday = key === todayKey;
        const count = availability[key]?.memberIds.length ?? 0;
        const isConfirmed = availability[key]?.memberIds.includes(currentUserId) ?? false;
        const hasAvailability = !past && count > 0;
        const cellBackground = 'transparent';
        const cellBorder = 'none';
        const textColor = past ? 'var(--eqx-tertiary)' : isConfirmed ? 'var(--eqx-mint)' : 'var(--eqx-primary)';
        const fontWeight = isToday ? 700 : 500;
        const todayCircleBg = isConfirmed ? 'var(--eqx-mint)' : 'var(--eqx-primary)';
        const todayCircleText = 'var(--eqx-base)';
        return <AvailabilityCell key={key} dateKey={key} day={day} idx={idx} past={past} isToday={isToday} count={count} isConfirmed={isConfirmed} hasAvailability={hasAvailability} cellBackground={cellBackground} cellBorder={cellBorder} textColor={textColor} fontWeight={fontWeight} todayCircleBg={todayCircleBg} todayCircleText={todayCircleText} onToggle={onToggleAvailability} onLongPress={onDayTap} />;
      })}
      </motion.div>

      {/* Best Dates section */}
      <div className="px-4 mt-5 pb-6">
        <p style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--eqx-tertiary)',
        marginBottom: 10,
        paddingLeft: 2,
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }}>
          Best dates this month
        </p>
        {(() => {
        const allEntries = Object.entries(availability).map(([dateStr, val]) => ({
          dateStr,
          count: val.memberIds.length,
          memberIds: val.memberIds
        })).filter(({
          dateStr,
          count
        }) => {
          if (count === 0) return false;
          const d = new Date(dateStr + 'T00:00:00');
          return d.getFullYear() === viewYear && d.getMonth() === viewMonth && !isPast(dateStr);
        }).sort((a, b) => b.count - a.count);
        const bestEntries = seeAllExpanded ? allEntries.slice(0, 10) : allEntries.slice(0, 3);
        if (allEntries.length === 0) {
          return <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-[24px] flex items-center justify-center" style={{
              backgroundColor: 'var(--eqx-raised)'
            }}>
                  <CalendarIcon size={20} style={{
                color: 'var(--eqx-tertiary)'
              }} />
                </div>
                <div className="text-center space-y-1">
                  <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--eqx-secondary)'
              }}>
                    No availability yet
                  </p>
                  <p style={{
                fontSize: '13px',
                color: 'var(--eqx-tertiary)'
              }}>
                    Tap any upcoming date above
                  </p>
                </div>
              </div>;
        }
        return <>
              <motion.div initial={{
            opacity: 0,
            y: 8
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.22,
            ease: EQX_EASING
          }} className="rounded-[24px] overflow-hidden" style={{
            backgroundColor: 'var(--eqx-surface)',
            border: '1px solid var(--eqx-hairline)'
          }}>
                {bestEntries.map(({
              dateStr,
              count,
              memberIds
            }, i) => {
              const d = new Date(dateStr + 'T00:00:00');
              const weekday = d.toLocaleDateString('en-US', {
                weekday: 'short'
              });
              const dateLabel = d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              const pct = Math.round(count / members.length * 100);
              const isFirst = i === 0;
              const barFill = isFirst ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)';
              const isConfirmedForDate = memberIds.includes(currentUserId);
              const isExpanded = expandedDateStr === dateStr;
              return <div key={dateStr}>
                      {i > 0 && <div style={{
                  height: 1,
                  backgroundColor: 'var(--eqx-hairline)'
                }} />}
                      <button onClick={() => setExpandedDateStr(isExpanded ? null : dateStr)} className="w-full text-left active:opacity-[0.88]">
                        <div className="px-4 py-4 flex items-center gap-3">
                          {/* Rank badge */}
                          <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{
                      width: 24,
                      height: 24,
                      backgroundColor: isFirst ? 'color-mix(in srgb, var(--eqx-orange) 12%, transparent)' : 'var(--eqx-hairline)',
                      border: isFirst ? '1px solid color-mix(in srgb, var(--eqx-orange) 35%, transparent)' : '1px solid var(--eqx-hairline)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isFirst ? 'var(--eqx-orange)' : 'var(--eqx-tertiary)'
                    }}>
                            {i + 1}
                          </div>

                          {/* Date block */}
                          <div className="flex-shrink-0" style={{
                      width: 44
                    }}>
                            <p style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--eqx-tertiary)',
                        lineHeight: 1.2
                      }}>
                              {weekday}
                            </p>
                            <p style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--eqx-primary)',
                        lineHeight: 1.2
                      }}>
                              {dateLabel}
                            </p>
                          </div>

                          {/* Middle: text + bar */}
                          <div className="flex-1 min-w-0">
                            <p style={{
                        fontSize: '14px',
                        color: 'var(--eqx-primary)',
                        marginBottom: 6
                      }}>
                              {count} of {members.length} free
                            </p>
                            <div style={{
                        height: 4,
                        borderRadius: 999,
                        backgroundColor: 'var(--eqx-hairline)',
                        overflow: 'hidden',
                        marginBottom: isConfirmedForDate ? 4 : 0
                      }}>
                              <motion.div initial={{
                          width: 0
                        }} animate={{
                          width: `${pct}%`
                        }} transition={{
                          duration: 0.3,
                          delay: i * 0.06 + 0.1,
                          ease: [0.2, 0.0, 0.0, 1.0]
                        }} style={{
                          height: '100%',
                          borderRadius: 999,
                          backgroundColor: barFill
                        }} />
                            </div>
                            <AnimatePresence>
                              {isConfirmedForDate && <motion.p key={`youre-in-${dateStr}`} initial={{
                          opacity: 0,
                          y: 4
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          y: 4
                        }} transition={{
                          duration: 0.2,
                          delay: 0.35,
                          ease: [0.2, 0.0, 0.0, 1.0]
                        }} style={{
                          fontSize: '11px',
                          color: 'var(--eqx-mint)',
                          marginTop: 2
                        }}>
                                  You're in
                                </motion.p>}
                            </AnimatePresence>
                          </div>

                          {/* Right: chevron rotates when expanded */}
                          <motion.div animate={{
                      rotate: isExpanded ? 90 : 0
                    }} transition={{
                      duration: 0.18,
                      ease: EQX_EASING
                    }} style={{
                      flexShrink: 0
                    }}>
                            <ChevronRightSmallIcon size={13} style={{
                        color: 'var(--eqx-tertiary)'
                      }} />
                          </motion.div>
                        </div>
                      </button>

                      {/* Inline expanded detail */}
                      <AnimatePresence>
                        {isExpanded && <motion.div initial={{
                    opacity: 0,
                    height: 0
                  }} animate={{
                    opacity: 1,
                    height: 'auto'
                  }} exit={{
                    opacity: 0,
                    height: 0
                  }} transition={{
                    duration: 0.22,
                    ease: EQX_EASING
                  }} style={{
                    overflow: 'hidden'
                  }}>
                            <div className="px-4 pb-4" style={{
                      borderTop: '1px solid var(--eqx-hairline)'
                    }}>
                              {/* Member avatar row — Settings style */}
                              <div className="flex gap-4 overflow-x-auto pt-3 pb-3" style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        paddingLeft: '4px'
                      }}>
                                {memberIds.map((id) => {
                          const m = members.find((mb) => mb.id === id);
                          if (!m) return null;
                          const isMe = id === currentUserId;
                          return <div key={id} className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{
                            minWidth: 40
                          }}>
                                      <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: m.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              outline: isMe ? '2px solid var(--eqx-mint)' : 'none',
                              outlineOffset: '2px'
                            }}>
                                        <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#fff',
                                lineHeight: 1
                              }}>
                                          {m.initials}
                                        </span>
                                      </div>
                                      <span style={{
                              fontSize: '10px',
                              fontWeight: 500,
                              color: isMe ? 'var(--eqx-mint)' : 'var(--eqx-tertiary)',
                              maxWidth: 44,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                                        {isMe ? 'You' : m.name.split(' ')[0]}
                                      </span>
                                    </div>;
                        })}
                              </div>
                              {/* Create Event — outlined secondary style */}
                              <button onClick={(e) => {
                        e.stopPropagation();
                        onCreateEvent();
                      }} className="w-full flex items-center justify-center gap-1.5 rounded-full font-semibold active:opacity-[0.88]" style={{
                        height: 36,
                        fontSize: '13px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--eqx-hairline)',
                        color: 'var(--eqx-primary)'
                      }}>
                                <PlusIcon size={13} strokeWidth={2.5} />
                                Create Event
                              </button>
                            </div>
                          </motion.div>}
                      </AnimatePresence>
                    </div>;
            })}
              </motion.div>

              {/* See all dates */}
              {allEntries.length > 3 && <button onClick={() => setSeeAllExpanded((v) => !v)} className="w-full flex items-center justify-center gap-1 mt-3 active:opacity-[0.88]" style={{
            paddingTop: 4,
            paddingBottom: 4
          }}>
                  <span style={{
              fontSize: '12px',
              color: 'var(--eqx-secondary)'
            }}>
                    {seeAllExpanded ? 'Show less' : 'See all dates'}
                  </span>
                  <motion.div animate={{
              rotate: seeAllExpanded ? 180 : 0
            }} transition={{
              duration: 0.2,
              ease: EQX_EASING
            }}>
                    <ChevronDownIcon size={13} style={{
                color: 'var(--eqx-tertiary)'
              }} />
                  </motion.div>
                </button>}
            </>;
      })()}
      </div>
    </motion.div>;
}