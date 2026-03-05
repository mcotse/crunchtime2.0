import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, PlusIcon, Trash2Icon, AlertCircleIcon } from 'lucide-react';
import { Poll, PollOption } from '../data/pollsData';
import { Button } from './ui/Button';
interface CreatePollSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onCreatePoll: (poll: Poll) => void;
}
const EQX_TRANSITION = {
  duration: 0.32,
  ease: [0.2, 0.0, 0.0, 1.0] as const
};
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
export function CreatePollSheet({
  isOpen,
  onClose,
  currentUserId,
  onCreatePoll
}: CreatePollSheetProps) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMembersToAddOptions, setAllowMembersToAddOptions] = useState(true);
  const [allowMultiSelect, setAllowMultiSelect] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const hasContent = title.trim() !== '' || options.some((o) => o.trim() !== '');
  const validOptions = options.filter((o) => o.trim() !== '');
  const hasDuplicates = validOptions.some((o, i) => validOptions.findIndex((x) => x.toLowerCase() === o.toLowerCase()) !== i);
  const isValid = title.trim() !== '' && validOptions.length >= 2 && !hasDuplicates && options.every((o) => o.trim() !== '');
  const handleClose = () => {
    if (hasContent) setShowUnsavedWarning(true);else resetAndClose();
  };
  const resetAndClose = () => {
    setTitle('');
    setOptions(['', '']);
    setAllowMembersToAddOptions(true);
    setAllowMultiSelect(false);
    setExpiresAt('');
    setShowErrors(false);
    setShowUnsavedWarning(false);
    onClose();
  };
  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };
  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };
  const handleCreate = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    const pollOptions: PollOption[] = options.map((text) => ({
      id: generateId(),
      text: text.trim(),
      voterIds: []
    }));
    const newPoll: Poll = {
      id: generateId(),
      title: title.trim(),
      options: pollOptions,
      creatorId: currentUserId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt + 'T23:59:59-08:00').toISOString() : undefined,
      isArchived: false,
      allowMembersToAddOptions,
      allowMultiSelect,
      comments: []
    };
    onCreatePoll(newPoll);
    resetAndClose();
  };
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 0.6
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2,
        ease: [0.2, 0.0, 0.0, 1.0]
      }} onClick={handleClose} className="fixed inset-0 z-50" style={{
        backgroundColor: '#000000'
      }} />

          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={EQX_TRANSITION} className="fixed bottom-0 left-0 right-0 z-[51] h-[90vh] flex flex-col max-w-md mx-auto" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderRadius: '32px 32px 0 0'
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
                Create Poll
              </h2>
              <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full active:opacity-[0.92]" style={{
            color: 'var(--eqx-tertiary)'
          }}>
                <XIcon size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Question */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium uppercase tracking-widest block" style={{
              color: 'var(--eqx-secondary)'
            }}>
                  Question
                </label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ask the group something..." className="w-full text-[16px] font-medium bg-transparent outline-none border-b pb-2" style={{
              color: 'var(--eqx-primary)',
              borderColor: showErrors && !title.trim() ? 'var(--eqx-coral)' : 'var(--eqx-hairline)',
              caretColor: 'var(--eqx-primary)'
            }} autoFocus />
                {showErrors && !title.trim() && <p className="text-[13px] flex items-center gap-1" style={{
              color: 'var(--eqx-coral)'
            }}>
                    <AlertCircleIcon size={11} /> Question is required
                  </p>}
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium uppercase tracking-widest block" style={{
              color: 'var(--eqx-secondary)'
            }}>
                  Options
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => {
                const isDuplicate = showErrors && option.trim() !== '' && options.findIndex((o, i) => i !== index && o.toLowerCase() === option.toLowerCase()) !== -1;
                const isEmpty = showErrors && option.trim() === '';
                return <div key={index} className="flex items-center gap-2">
                        <span className="text-[13px] w-5 text-right flex-shrink-0 font-medium tabular-nums" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className="w-full text-[15px] bg-transparent outline-none border-b pb-1.5" style={{
                      color: 'var(--eqx-primary)',
                      borderColor: isDuplicate || isEmpty ? 'var(--eqx-coral)' : 'var(--eqx-hairline)',
                      caretColor: 'var(--eqx-primary)'
                    }} />
                          {isDuplicate && <p className="text-[13px] mt-0.5" style={{
                      color: 'var(--eqx-coral)'
                    }}>
                              Duplicate option
                            </p>}
                          {isEmpty && <p className="text-[13px] mt-0.5" style={{
                      color: 'var(--eqx-coral)'
                    }}>
                              Cannot be empty
                            </p>}
                        </div>
                        <button type="button" onClick={() => handleRemoveOption(index)} disabled={options.length <= 2} className="p-1.5 active:opacity-[0.92] disabled:opacity-0 disabled:pointer-events-none flex-shrink-0" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                          <Trash2Icon size={14} />
                        </button>
                      </div>;
              })}
                </div>
                <button type="button" onClick={handleAddOption} className="flex items-center gap-1.5 text-[13px] py-1 active:opacity-[0.92]" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                  <PlusIcon size={14} /> Add option
                </button>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium uppercase tracking-widest block" style={{
              color: 'var(--eqx-secondary)'
            }}>
                  Settings
                </label>
                <div className="rounded-[20px] border overflow-hidden" style={{
              backgroundColor: 'var(--eqx-raised)',
              borderColor: 'var(--eqx-hairline)'
            }}>
                  {/* Members can add options */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{
                borderColor: 'var(--eqx-hairline)'
              }}>
                    <p className="text-[15px] font-medium" style={{
                  color: 'var(--eqx-primary)'
                }}>
                      Members can add options
                    </p>
                    <button type="button" onClick={() => setAllowMembersToAddOptions((v) => !v)} className="relative inline-flex h-7 w-12 items-center rounded-full active:opacity-[0.92] flex-shrink-0" style={{
                  backgroundColor: allowMembersToAddOptions ? 'var(--eqx-primary)' : 'var(--eqx-hairline)'
                }}>
                      <span className="inline-block h-5 w-5 rounded-full shadow" style={{
                    backgroundColor: allowMembersToAddOptions ? 'var(--eqx-base)' : 'var(--eqx-tertiary)',
                    transform: allowMembersToAddOptions ? 'translateX(24px)' : 'translateX(4px)'
                  }} />
                    </button>
                  </div>

                  {/* Multi-select */}
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <p className="text-[15px] font-medium" style={{
                  color: 'var(--eqx-primary)'
                }}>
                      Allow multiple selections
                    </p>
                    <button type="button" onClick={() => setAllowMultiSelect((v) => !v)} className="relative inline-flex h-7 w-12 items-center rounded-full active:opacity-[0.92] flex-shrink-0" style={{
                  backgroundColor: allowMultiSelect ? 'var(--eqx-primary)' : 'var(--eqx-hairline)'
                }}>
                      <span className="inline-block h-5 w-5 rounded-full shadow" style={{
                    backgroundColor: allowMultiSelect ? 'var(--eqx-base)' : 'var(--eqx-tertiary)',
                    transform: allowMultiSelect ? 'translateX(24px)' : 'translateX(4px)'
                  }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium uppercase tracking-widest block" style={{
              color: 'var(--eqx-secondary)'
            }}>
                  Expiration Date
                  <span className="ml-1.5 normal-case font-normal" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                    (optional)
                  </span>
                </label>
                <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full text-[15px] bg-transparent outline-none border-b pb-2" style={{
              color: 'var(--eqx-primary)',
              borderColor: 'var(--eqx-hairline)'
            }} />
                <p className="text-[13px]" style={{
              color: 'var(--eqx-tertiary)'
            }}>
                  Poll closes at end of day (PST).
                </p>
              </div>
            </div>

            {/* Pinned CTA */}
            <div className="px-5 py-4 border-t flex-shrink-0" style={{
          backgroundColor: 'var(--eqx-surface)',
          borderColor: 'var(--eqx-hairline)'
        }}>
              <Button type="button" onClick={handleCreate} disabled={showErrors && !isValid} className="w-full h-14 text-base font-semibold">
                Create Poll
              </Button>
            </div>
          </motion.div>

          {/* Unsaved warning dialog */}
          <AnimatePresence>
            {showUnsavedWarning && <>
                <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 0.4
          }} exit={{
            opacity: 0
          }} className="fixed inset-0 z-[60]" style={{
            backgroundColor: '#000000'
          }} />
                <motion.div initial={{
            opacity: 0,
            scale: 0.96
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.96
          }} transition={{
            duration: 0.2,
            ease: [0.2, 0.0, 0.0, 1.0]
          }} className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[61] rounded-[24px] p-6" style={{
            backgroundColor: 'var(--eqx-raised)',
            border: '1px solid var(--eqx-hairline)'
          }}>
                  <h3 className="text-[18px] font-semibold mb-1" style={{
              color: 'var(--eqx-primary)'
            }}>
                    Discard poll?
                  </h3>
                  <p className="text-[15px] mb-5" style={{
              color: 'var(--eqx-secondary)'
            }}>
                    Your changes will be lost if you leave now.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowUnsavedWarning(false)} variant="secondary" className="flex-1">
                      Keep editing
                    </Button>
                    <Button onClick={resetAndClose} variant="danger" className="flex-1">
                      Discard
                    </Button>
                  </div>
                </motion.div>
              </>}
          </AnimatePresence>
        </>}
    </AnimatePresence>;
}