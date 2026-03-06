import React, { useEffect, useState, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, LinkIcon, ChevronDownIcon, CheckIcon, MapPinIcon, SearchIcon } from 'lucide-react';
import { GroupEvent } from '../data/eventsData';
import { Transaction } from '../data/mockData';
import { Button } from './ui/Button';
import { SectionLabel } from './ui/SectionLabel';
import { CalendarPicker } from './CalendarPicker';
import { EQX_TRANSITION, EQX_EASING, EMOJI_OPTIONS, autoEmoji, generateId, parseTimeInput, to24hr, formatTimeDisplay, getAmpm, formatDateDisplay } from './eventFormHelpers';
interface CreateEventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  transactions: Transaction[];
  onCreateEvent: (event: GroupEvent) => void;
  initialEvent?: GroupEvent;
  onUpdateEvent?: (event: GroupEvent) => void;
}
// ─── Main Component ───────────────────────────────────────────────────────────
export function CreateEventSheet({
  isOpen,
  onClose,
  currentUserId,
  transactions,
  onCreateEvent,
  initialEvent,
  onUpdateEvent
}: CreateEventSheetProps) {
  const isEditMode = !!initialEvent;
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📅');
  const [emojiLocked, setEmojiLocked] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiInputRef = useRef<HTMLInputElement>(null);
  const [dateStr, setDateStr] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  // Time: stored as 24hr HH:MM, displayed as "10:30" + tappable AM/PM
  const [time, setTime] = useState(''); // 24hr HH:MM
  const [timeText, setTimeText] = useState(''); // raw display text (without AM/PM)
  const [timeAmpm, setTimeAmpm] = useState<'AM' | 'PM'>('AM');
  const [timeEditing, setTimeEditing] = useState(false);
  const [location, setLocation] = useState('');
  const [locationMapsEnabled, setLocationMapsEnabled] = useState(false);
  const [description, setDescription] = useState('');
  const [linkedTxId, setLinkedTxId] = useState<string>('');
  const [showTxPicker, setShowTxPicker] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  // Sync fields when sheet opens
  useEffect(() => {
    if (isOpen) {
      const t = initialEvent?.title ?? '';
      setTitle(t);
      setEmoji(initialEvent?.coverEmoji ?? (t ? autoEmoji(t) : '📅'));
      setEmojiLocked(!!initialEvent);
      setShowEmojiPicker(false);
      setDateStr(initialEvent?.dateStr ?? '');
      setShowCalendar(false);
      const initTime = initialEvent?.time ?? '';
      setTime(initTime);
      setTimeText(initTime ? formatTimeDisplay(initTime) : '');
      setTimeAmpm(initTime ? getAmpm(initTime) : 'AM');
      setTimeEditing(false);
      setLocation(initialEvent?.location ?? '');
      setLocationMapsEnabled(!!initialEvent?.locationMapsQuery);
      setDescription(initialEvent?.description ?? '');
      setLinkedTxId(initialEvent?.linkedTransactionId ?? '');
      setShowTxPicker(false);
      setTxSearch('');
      setShowErrors(false);
    }
  }, [isOpen, initialEvent?.id]);
  // Auto-assign emoji as user types
  useEffect(() => {
    if (!emojiLocked && title) setEmoji(autoEmoji(title));
    if (!title) {
      setEmojiLocked(false);
      setEmoji('📅');
    }
  }, [title, emojiLocked]);
  // Disable maps if location cleared
  useEffect(() => {
    if (!location) setLocationMapsEnabled(false);
  }, [location]);
  // ── Time helpers ──
  const handleTimeBlur = () => {
    setTimeEditing(false);
    if (!timeText.trim()) {
      setTime('');
      setTimeText('');
      return;
    }
    const parsed = parseTimeInput(timeText);
    if (parsed) {
      setTimeAmpm(parsed.ampm);
      setTimeText(`${parsed.h}:${String(parsed.m).padStart(2, '0')}`);
      setTime(to24hr(parsed.h, parsed.m, parsed.ampm));
    } else {
      // Invalid — clear
      setTime('');
      setTimeText('');
    }
  };
  const handleToggleAmpm = () => {
    const newAmpm: 'AM' | 'PM' = timeAmpm === 'AM' ? 'PM' : 'AM';
    setTimeAmpm(newAmpm);
    if (time) {
      const [h, m] = time.split(':').map(Number);
      const hour12 = h % 12 || 12;
      setTime(to24hr(hour12, m, newAmpm));
    }
  };
  const isValid = title.trim() !== '' && dateStr !== '';
  const reset = () => {
    setTitle('');
    setEmoji('📅');
    setEmojiLocked(false);
    setShowEmojiPicker(false);
    setDateStr('');
    setShowCalendar(false);
    setTime('');
    setTimeText('');
    setTimeAmpm('AM');
    setTimeEditing(false);
    setLocation('');
    setLocationMapsEnabled(false);
    setDescription('');
    setLinkedTxId('');
    setShowTxPicker(false);
    setTxSearch('');
    setShowErrors(false);
  };
  const handleClose = () => {
    if (!isEditMode) reset();
    onClose();
  };
  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    const locationMapsQuery = locationMapsEnabled && location.trim() ? location.trim() : undefined;
    if (isEditMode && initialEvent && onUpdateEvent) {
      onUpdateEvent({
        ...initialEvent,
        title: title.trim(),
        description: description.trim() || undefined,
        dateStr: dateStr || undefined,
        time: time || undefined,
        location: location.trim() || undefined,
        locationMapsQuery,
        linkedTransactionId: linkedTxId || undefined,
        coverEmoji: emoji
      });
    } else {
      onCreateEvent({
        id: generateId(),
        title: title.trim(),
        description: description.trim() || undefined,
        dateStr: dateStr || undefined,
        time: time || undefined,
        location: location.trim() || undefined,
        locationMapsQuery,
        creatorId: currentUserId,
        createdAt: new Date().toISOString(),
        linkedTransactionId: linkedTxId || undefined,
        rsvps: [{
          memberId: currentUserId,
          status: 'going'
        }],
        coverEmoji: emoji
      });
    }
    if (!isEditMode) reset();
    onClose();
  };
  const linkedTx = linkedTxId ? transactions.find((t) => t.id === linkedTxId) : null;
  const filteredTx = transactions.filter((tx) => tx.description.toLowerCase().includes(txSearch.toLowerCase()));
  const titleHasError = showErrors && !title.trim();
  const dateHasError = showErrors && !dateStr;
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
        ease: EQX_EASING
      }} onClick={handleClose} className="fixed inset-0 z-50" style={{
        backgroundColor: '#000000'
      }} />

          {/* Sheet */}
          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={EQX_TRANSITION} className="fixed bottom-0 left-0 right-0 z-[51] flex flex-col max-w-md mx-auto" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderRadius: '32px 32px 0 0',
        maxHeight: '92vh'
      }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{
            backgroundColor: 'var(--eqx-hairline)'
          }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 flex-shrink-0">
              <h2 className="font-semibold" style={{
            fontSize: '20px',
            lineHeight: '24px',
            color: 'var(--eqx-primary)'
          }}>
                {isEditMode ? 'Edit Event' : 'New Event'}
              </h2>
              <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }} aria-label="Close">
                <XIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* ── Hero: Emoji + Name ── */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  {/* Emoji badge — tapping opens OS emoji keyboard */}
                  <div className="flex-shrink-0 relative">
                    {/* Hidden input to trigger emoji keyboard */}
                    <input ref={emojiInputRef} type="text" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" style={{
                  fontSize: '16px'
                }} // prevents iOS zoom
                onChange={(e) => {
                  const val = e.target.value;
                  // Extract first emoji character
                  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
                  const match = val.match(emojiRegex);
                  if (match && match[0]) {
                    setEmoji(match[0]);
                    setEmojiLocked(true);
                    setShowEmojiPicker(false);
                    e.target.value = '';
                  } else if (val.length > 0) {
                    e.target.value = '';
                  }
                }} aria-label="Pick emoji from keyboard" />
                    <button type="button" onClick={() => {
                  setShowEmojiPicker((v) => !v);
                  emojiInputRef.current?.focus();
                }} className="flex items-center justify-center rounded-[16px] active:opacity-[0.7] relative pointer-events-none" style={{
                  width: '52px',
                  height: '52px',
                  fontSize: '28px',
                  backgroundColor: 'var(--eqx-raised)',
                  border: `1px solid ${showEmojiPicker ? 'var(--eqx-primary)' : 'var(--eqx-hairline)'}`
                }} tabIndex={-1} aria-hidden="true">
                      {emoji}
                    </button>
                  </div>

                  {/* Name input */}
                  <div className="flex-1 pt-1">
                    <input value={title} onChange={(e) => {
                  setTitle(e.target.value);
                  if (showErrors) setShowErrors(false);
                }} placeholder="Event name" autoFocus={!isEditMode} className="w-full text-[17px] font-semibold bg-transparent outline-none border-b pb-2 leading-snug" style={{
                  color: 'var(--eqx-primary)',
                  borderColor: titleHasError ? 'var(--eqx-coral)' : 'var(--eqx-hairline)',
                  caretColor: 'var(--eqx-primary)'
                }} />
                    {titleHasError && <p className="text-[13px] mt-1" style={{
                  color: 'var(--eqx-coral)'
                }}>
                        Event name is required
                      </p>}
                  </div>
                </div>

                {/* Quick-pick emoji row */}
                <AnimatePresence>
                  {showEmojiPicker && <motion.div initial={{
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
                ease: EQX_EASING
              }} className="overflow-hidden">
                      <div className="flex gap-2 px-3 py-3 rounded-[20px] border" style={{
                  backgroundColor: 'var(--eqx-raised)',
                  borderColor: 'var(--eqx-hairline)'
                }}>
                        {EMOJI_OPTIONS.map((e) => <button key={e} type="button" onClick={() => {
                    setEmoji(e);
                    setEmojiLocked(true);
                    setShowEmojiPicker(false);
                  }} className="flex-1 h-10 flex items-center justify-center rounded-[12px] text-[22px] active:opacity-[0.7]" style={{
                    backgroundColor: emoji === e ? 'var(--eqx-primary)' : 'var(--eqx-surface)',
                    border: `1px solid ${emoji === e ? 'var(--eqx-primary)' : 'var(--eqx-hairline)'}`
                  }} aria-pressed={emoji === e}>
                            {e}
                          </button>)}
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </div>

              {/* ── When & Where ── */}
              <div className="space-y-2">
                <SectionLabel>When &amp; Where</SectionLabel>
                <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                  {/* Date row */}
                  <button type="button" onClick={() => setShowCalendar((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 active:opacity-[0.92]" style={{
                borderBottom: '1px solid var(--eqx-hairline)'
              }}>
                    <span className="text-[13px] font-medium" style={{
                  color: dateHasError ? 'var(--eqx-coral)' : 'var(--eqx-tertiary)'
                }}>
                      Date{dateHasError ? ' *' : ''}
                    </span>
                    <span className="text-[15px] font-medium" style={{
                  color: dateStr ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
                }}>
                      {dateStr ? formatDateDisplay(dateStr) : 'Select'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showCalendar && <motion.div initial={{
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
                }} className="overflow-hidden" style={{
                  borderBottom: '1px solid var(--eqx-hairline)'
                }}>
                        <div className="p-3">
                          <CalendarPicker value={dateStr} onChange={(v) => {
                      setDateStr(v);
                      setShowCalendar(false);
                      if (showErrors) setShowErrors(false);
                    }} />
                        </div>
                      </motion.div>}
                  </AnimatePresence>

                  {/* Time row */}
                  <div className="flex items-center justify-between px-4 py-3" style={{
                borderBottom: '1px solid var(--eqx-hairline)'
              }}>
                    <span className="text-[13px] font-medium flex-shrink-0" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                      Time
                    </span>
                    <div className="flex items-center gap-1">
                      {timeEditing ? <input autoFocus value={timeText} onChange={(e) => setTimeText(e.target.value)} onBlur={handleTimeBlur} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      ;
                      (e.target as HTMLInputElement).blur();
                    }
                  }} placeholder="e.g. 7pm" className="text-[15px] font-medium bg-transparent outline-none text-right w-24" style={{
                    color: 'var(--eqx-primary)',
                    caretColor: 'var(--eqx-primary)'
                  }} /> : <button type="button" onClick={() => {
                    setTimeEditing(true);
                    setTimeText(time ? formatTimeDisplay(time) : '');
                  }} className="text-[15px] font-medium active:opacity-[0.7]" style={{
                    color: time ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
                  }}>
                          {time ? formatTimeDisplay(time) : 'Optional'}
                        </button>}
                      {/* Tappable AM/PM — only shown when time is set */}
                      {time && !timeEditing && <button type="button" onClick={handleToggleAmpm} className="text-[15px] font-medium active:opacity-[0.7]" style={{
                    color: 'var(--eqx-tertiary)'
                  }} aria-label={`Switch to ${timeAmpm === 'AM' ? 'PM' : 'AM'}`}>
                          {timeAmpm}
                        </button>}
                    </div>
                  </div>

                  {/* Location row */}
                  <div className="flex items-center px-4 py-3 gap-3">
                    {/* MapPin: dim when no location, tappable toggle when location exists */}
                    <button type="button" onClick={() => location.trim() && setLocationMapsEnabled((v) => !v)} className="flex-shrink-0" style={{
                  color: locationMapsEnabled ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)',
                  opacity: location.trim() ? 1 : 0.3,
                  cursor: location.trim() ? 'pointer' : 'default',
                  transition: 'color 0.15s ease, opacity 0.15s ease'
                }} aria-label={locationMapsEnabled ? 'Disable maps link' : 'Enable maps link'} aria-pressed={locationMapsEnabled} tabIndex={location.trim() ? 0 : -1}>
                      <MapPinIcon size={15} strokeWidth={locationMapsEnabled ? 2.5 : 1.5} />
                    </button>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="flex-1 text-[15px] bg-transparent outline-none" style={{
                  color: 'var(--eqx-primary)',
                  caretColor: 'var(--eqx-primary)'
                }} />
                  </div>
                </div>
              </div>

              {/* ── Description ── */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-1.5">
                  <SectionLabel>Description</SectionLabel>
                  <span className="text-[13px] normal-case font-normal" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                    optional
                  </span>
                </div>
                <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                  <div className="px-4 py-3.5">
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details…" rows={2} className="w-full text-[15px] bg-transparent outline-none resize-none leading-relaxed" style={{
                  color: 'var(--eqx-primary)',
                  caretColor: 'var(--eqx-primary)'
                }} />
                  </div>
                </div>
              </div>

              {/* ── Link Transaction — only shown if transactions exist ── */}
              {transactions.length > 0 && <div className="space-y-2">
                  <div className="flex items-baseline gap-1.5">
                    <SectionLabel>Link Transaction</SectionLabel>
                    <span className="text-[13px] normal-case font-normal" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      optional
                    </span>
                  </div>
                  <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                    <button type="button" onClick={() => {
                setShowTxPicker((v) => !v);
                setTxSearch('');
              }} className="w-full flex items-center justify-between px-4 py-3.5 active:opacity-[0.92]">
                      <div className="flex items-center gap-2.5">
                        <LinkIcon size={14} strokeWidth={1.5} style={{
                    color: 'var(--eqx-tertiary)',
                    opacity: 0.7
                  }} />
                        <span className="text-[15px]" style={{
                    color: linkedTx ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
                  }}>
                          {linkedTx ? `${linkedTx.description} · $${Math.abs(linkedTx.amount).toFixed(2)}` : 'Select a transaction'}
                        </span>
                      </div>
                      <motion.div animate={{
                  rotate: showTxPicker ? 180 : 0
                }} transition={{
                  duration: 0.2,
                  ease: EQX_EASING
                }}>
                        <ChevronDownIcon size={16} style={{
                    color: 'var(--eqx-tertiary)'
                  }} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showTxPicker && <motion.div initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: 'auto'
                }} exit={{
                  opacity: 0,
                  height: 0
                }} transition={{
                  duration: 0.2,
                  ease: EQX_EASING
                }} className="overflow-hidden" style={{
                  borderTop: '1px solid var(--eqx-hairline)'
                }}>
                          {/* Search input */}
                          <div className="flex items-center gap-2.5 px-4 py-2.5" style={{
                    borderBottom: '1px solid var(--eqx-hairline)'
                  }}>
                            <SearchIcon size={13} strokeWidth={1.5} style={{
                      color: 'var(--eqx-tertiary)',
                      flexShrink: 0
                    }} />
                            <input autoFocus value={txSearch} onChange={(e) => setTxSearch(e.target.value)} placeholder="Search transactions…" className="flex-1 text-[14px] bg-transparent outline-none" style={{
                      color: 'var(--eqx-primary)',
                      caretColor: 'var(--eqx-primary)'
                    }} />
                            {txSearch && <button type="button" onClick={() => setTxSearch('')} style={{
                      color: 'var(--eqx-tertiary)'
                    }}>
                                <XIcon size={12} />
                              </button>}
                          </div>

                          {/* None option */}
                          <button type="button" onClick={() => {
                    setLinkedTxId('');
                    setShowTxPicker(false);
                  }} className="w-full flex items-center justify-between px-4 py-3.5 active:opacity-[0.92]" style={{
                    borderBottom: '1px solid var(--eqx-hairline)',
                    backgroundColor: !linkedTxId ? 'var(--eqx-primary)' : 'transparent'
                  }}>
                            <span className="text-[15px] font-medium" style={{
                      color: !linkedTxId ? 'var(--eqx-base)' : 'var(--eqx-tertiary)'
                    }}>
                              None
                            </span>
                            {!linkedTxId && <CheckIcon size={14} strokeWidth={2.5} style={{
                      color: 'var(--eqx-base)'
                    }} />}
                          </button>

                          {/* Filtered transactions */}
                          {filteredTx.length === 0 ? <div className="px-4 py-4 text-center">
                              <p className="text-[13px]" style={{
                      color: 'var(--eqx-tertiary)'
                    }}>
                                No transactions found
                              </p>
                            </div> : filteredTx.map((tx, idx) => {
                    const isSel = linkedTxId === tx.id;
                    const isLast = idx === filteredTx.length - 1;
                    return <button key={tx.id} type="button" onClick={() => {
                      setLinkedTxId(tx.id);
                      setShowTxPicker(false);
                    }} className="w-full flex items-center justify-between px-4 py-3.5 active:opacity-[0.92]" style={{
                      borderBottom: isLast ? 'none' : '1px solid var(--eqx-hairline)',
                      backgroundColor: isSel ? 'var(--eqx-primary)' : 'transparent'
                    }}>
                                  <span className="text-[15px] font-medium truncate flex-1 text-left" style={{
                        color: isSel ? 'var(--eqx-base)' : 'var(--eqx-primary)'
                      }}>
                                    {tx.description}
                                  </span>
                                  <span className="text-[13px] font-semibold tabular-nums ml-3 flex-shrink-0" style={{
                        color: isSel ? 'var(--eqx-base)' : tx.amount < 0 ? 'var(--eqx-coral)' : 'var(--eqx-mint)'
                      }}>
                                    {tx.amount < 0 ? '-' : '+'}$
                                    {Math.abs(tx.amount).toFixed(2)}
                                  </span>
                                </button>;
                  })}
                        </motion.div>}
                    </AnimatePresence>
                  </div>
                </div>}
            </div>

            {/* Pinned CTA */}
            <div className="px-5 py-4 border-t flex-shrink-0" style={{
          backgroundColor: 'var(--eqx-surface)',
          borderColor: 'var(--eqx-hairline)'
        }}>
              <Button type="button" onClick={handleSubmit} className="w-full h-11 text-[15px] font-semibold">
                {isEditMode ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}