import React, { useState } from 'react';
import { LogOutIcon, ChevronRightIcon, ChevronDownIcon, PhoneIcon, MailIcon, PencilIcon, CheckIcon, SunIcon, MoonIcon, SmartphoneIcon, BellIcon, ScrollTextIcon, ShieldIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Member } from '../data/mockData';
import { CHANGELOG } from '../changelog';
interface SettingsTabProps {
  members: Member[];
  groupName: string;
  onGroupNameChange: (name: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  isAdmin?: boolean;
}
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
const INSTALL_STEPS = [{
  n: 1,
  text: 'Open Crunch Time in Safari'
}, {
  n: 2,
  text: 'Tap the Share button (box with arrow)'
}, {
  n: 3,
  text: 'Tap "Add to Home Screen" — if not visible, tap Edit Actions to add it'
}, {
  n: 4,
  text: 'Tap "Add" to confirm'
}];
// Shared section label style
function SectionLabel({
  children


}: {children: React.ReactNode;}) {
  return <h3 style={{
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--eqx-tertiary)',
    marginBottom: '4px',
    paddingLeft: '4px'
  }}>
      {children}
    </h3>;
}
export function SettingsTab({
  members,
  groupName,
  onGroupNameChange,
  isDark,
  onToggleDark,
  isAdmin = false
}: SettingsTabProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(groupName);
  const [installOpen, setInstallOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) onGroupNameChange(trimmed);
    setIsEditingName(false);
  };
  const handleSendNotif = () => {
    setBroadcastSent(true);
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSent(false), 2500);
  };
  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? null;
  return <div className="px-4 pb-24 pt-6 min-h-screen" style={{
    backgroundColor: 'var(--eqx-base)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  }}>
      <h2 className="font-semibold px-1" style={{
      fontSize: '24px',
      lineHeight: '28px',
      color: 'var(--eqx-primary)'
    }}>
        Settings
      </h2>

      {/* ── Appearance ── */}
      <div>
        <SectionLabel>Appearance</SectionLabel>
        <div className="rounded-[24px] border overflow-hidden" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderColor: 'var(--eqx-hairline)'
      }}>
          <button onClick={onToggleDark} className="w-full flex items-center justify-between px-4 active:opacity-[0.92]" style={{
          paddingTop: '12px',
          paddingBottom: '12px'
        }}>
            <div className="flex items-center gap-3">
              {isDark ? <MoonIcon size={16} style={{
              color: 'var(--eqx-secondary)'
            }} /> : <SunIcon size={16} style={{
              color: 'var(--eqx-secondary)'
            }} />}
              <span className="text-[15px] font-medium" style={{
              color: 'var(--eqx-primary)'
            }}>
                Appearance
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{
              fontSize: '13px',
              color: 'var(--eqx-tertiary)'
            }}>
                {isDark ? 'Dark' : 'Light'}
              </span>
              <ChevronDownIcon size={14} style={{
              color: 'var(--eqx-tertiary)'
            }} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Group Members ── */}
      <div>
        <SectionLabel>Group Members ({members.length})</SectionLabel>
        <div className="rounded-[24px] border overflow-hidden" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderColor: 'var(--eqx-hairline)'
      }}>
          {/* Horizontal avatar scroll */}
          <div className="flex gap-3 px-4 overflow-x-auto" style={{
          paddingTop: '14px',
          paddingBottom: '14px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
            {members.map((member) => <button key={member.id} onClick={() => setSelectedMemberId(selectedMemberId === member.id ? null : member.id)} className="flex flex-col items-center gap-1.5 flex-shrink-0 active:opacity-[0.75]" style={{
            minWidth: 44
          }}>
                <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: member.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: selectedMemberId === member.id ? `2px solid var(--eqx-primary)` : 'none',
              outlineOffset: '2px',
              transition: 'outline 150ms ease'
            }}>
                  <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1
              }}>
                    {member.initials}
                  </span>
                </div>
                <span style={{
              fontSize: '10px',
              color: selectedMemberId === member.id ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)',
              maxWidth: 44,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
              transition: 'color 150ms ease'
            }}>
                  {member.name.split(' ')[0]}
                </span>
              </button>)}
          </div>

          {/* Expanded member detail */}
          <AnimatePresence>
            {selectedMember && <motion.div key={selectedMember.id} initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.22,
            ease: EQX_EASING
          }} style={{
            overflow: 'hidden'
          }}>
                <div className="flex items-center gap-3 px-4" style={{
              paddingTop: '12px',
              paddingBottom: '12px',
              borderTop: '1px solid var(--eqx-hairline)',
              backgroundColor: 'var(--eqx-raised)'
            }}>
                  <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: selectedMember.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                    <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                      {selectedMember.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium truncate" style={{
                  color: 'var(--eqx-primary)'
                }}>
                      {selectedMember.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5" style={{
                  fontSize: '12px',
                  color: 'var(--eqx-tertiary)'
                }}>
                      <span className="flex items-center gap-1">
                        <PhoneIcon size={10} />
                        {selectedMember.phone}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MailIcon size={10} />
                        {selectedMember.email}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>

      {/* ── App / Install ── */}
      <div>
        <SectionLabel>App</SectionLabel>
        <div className="rounded-[24px] border overflow-hidden" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderColor: 'var(--eqx-hairline)'
      }}>
          <button onClick={() => setInstallOpen((v) => !v)} className="w-full flex items-center justify-between px-4 active:opacity-[0.92]" style={{
          paddingTop: '12px',
          paddingBottom: '12px'
        }}>
            <div className="flex items-center gap-3">
              <SmartphoneIcon size={16} style={{
              color: 'var(--eqx-secondary)'
            }} />
              <span className="text-[15px] font-medium" style={{
              color: 'var(--eqx-primary)'
            }}>
                Install Crunch Time
              </span>
            </div>
            <ChevronDownIcon size={14} style={{
            color: 'var(--eqx-tertiary)',
            transform: installOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms cubic-bezier(0.2,0,0,1)'
          }} />
          </button>

          <AnimatePresence>
            {installOpen && <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.24,
            ease: EQX_EASING
          }} style={{
            overflow: 'hidden'
          }}>
                <div className="border-t px-5 py-4 space-y-4" style={{
              borderColor: 'var(--eqx-hairline)',
              backgroundColor: 'var(--eqx-raised)'
            }}>
                  {INSTALL_STEPS.map((step) => <div key={step.n} className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0" style={{
                  backgroundColor: 'var(--eqx-surface)',
                  color: 'var(--eqx-primary)',
                  border: '1px solid var(--eqx-hairline)'
                }}>
                        {step.n}
                      </span>
                      <p className="text-[14px] leading-snug pt-0.5" style={{
                  color: 'var(--eqx-primary)'
                }}>
                        {step.text}
                      </p>
                    </div>)}
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Admin ── */}
      {isAdmin && <div>
          <SectionLabel>
            <span className="inline-flex items-center gap-1.5">
              <ShieldIcon size={10} strokeWidth={2} />
              Admin
            </span>
          </SectionLabel>
          <div className="rounded-[24px] border overflow-hidden" style={{
        backgroundColor: 'var(--eqx-surface)',
        borderColor: 'var(--eqx-hairline)'
      }}>
            {/* Group Name row */}
            <div className="flex items-center justify-between px-4 border-b" style={{
          paddingTop: '12px',
          paddingBottom: '12px',
          borderColor: 'var(--eqx-hairline)'
        }}>
              <div className="flex items-center gap-3">
                <PencilIcon size={15} style={{
              color: 'var(--eqx-secondary)'
            }} />
                <span className="text-[15px] font-medium" style={{
              color: 'var(--eqx-primary)'
            }}>
                  Group Name
                </span>
              </div>
              {isEditingName ? <div className="flex items-center gap-2 flex-1 ml-4 justify-end">
                  <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
              if (e.key === 'Escape') setIsEditingName(false);
            }} className="text-[13px] font-medium text-right bg-transparent outline-none border-b pb-0.5" style={{
              color: 'var(--eqx-primary)',
              borderColor: 'var(--eqx-hairline)',
              maxWidth: 120
            }} />
                  <button onClick={handleSaveName} className="active:opacity-[0.92]" style={{
              color: 'var(--eqx-primary)'
            }}>
                    <CheckIcon size={15} />
                  </button>
                </div> : <button onClick={() => {
            setNameInput(groupName);
            setIsEditingName(true);
          }} className="flex items-center gap-1.5 active:opacity-[0.92]">
                  <span style={{
              fontSize: '13px',
              color: 'var(--eqx-tertiary)'
            }}>
                    {groupName}
                  </span>
                  <ChevronRightIcon size={14} style={{
              color: 'var(--eqx-tertiary)'
            }} />
                </button>}
            </div>

            {/* Send push notification */}
            <button onClick={() => setNotifOpen((v) => !v)} className="w-full flex items-center justify-between px-4 border-b active:opacity-[0.92]" style={{
          paddingTop: '12px',
          paddingBottom: '12px',
          borderColor: 'var(--eqx-hairline)'
        }}>
              <div className="flex items-center gap-3">
                <BellIcon size={15} style={{
              color: 'var(--eqx-secondary)'
            }} />
                <span className="text-[15px] font-medium" style={{
              color: 'var(--eqx-primary)'
            }}>
                  Notifications
                </span>
              </div>
              <ChevronDownIcon size={14} style={{
            color: 'var(--eqx-tertiary)',
            transform: notifOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms cubic-bezier(0.2,0,0,1)'
          }} />
            </button>

            <AnimatePresence>
              {notifOpen && <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.24,
            ease: EQX_EASING
          }} style={{
            overflow: 'hidden'
          }}>
                  <div className="border-b px-5 py-4 space-y-3" style={{
              borderColor: 'var(--eqx-hairline)',
              backgroundColor: 'var(--eqx-raised)'
            }}>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{
                color: 'var(--eqx-tertiary)'
              }}>
                      Message all
                    </p>
                    <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Write a message…" rows={3} className="w-full text-[14px] bg-transparent outline-none resize-none placeholder:opacity-40" style={{
                color: 'var(--eqx-primary)',
                caretColor: 'var(--eqx-primary)'
              }} />
                    <div className="flex justify-end">
                      <AnimatePresence mode="wait">
                        {broadcastSent ? <motion.span key="sent" initial={{
                    opacity: 0,
                    scale: 0.85
                  }} animate={{
                    opacity: 1,
                    scale: 1
                  }} exit={{
                    opacity: 0
                  }} transition={{
                    duration: 0.15
                  }} className="text-[13px] font-semibold" style={{
                    color: 'var(--eqx-mint)'
                  }}>
                            Sent
                          </motion.span> : <motion.button key="send-btn" exit={{
                    opacity: 0
                  }} onClick={handleSendNotif} disabled={!broadcastMessage.trim()} className="px-4 py-1.5 rounded-full text-[13px] font-semibold active:opacity-[0.92] disabled:opacity-30 transition-opacity" style={{
                    backgroundColor: 'var(--eqx-primary)',
                    color: 'var(--eqx-base)'
                  }}>
                            Send
                          </motion.button>}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>}
            </AnimatePresence>

            {/* Changelog */}
            <button onClick={() => setChangelogOpen((v) => !v)} className="w-full flex items-center justify-between px-4 active:opacity-[0.92]" style={{
          paddingTop: '12px',
          paddingBottom: '12px'
        }}>
              <div className="flex items-center gap-3">
                <ScrollTextIcon size={15} style={{
              color: 'var(--eqx-secondary)'
            }} />
                <span className="text-[15px] font-medium" style={{
              color: 'var(--eqx-primary)'
            }}>
                  Changelog
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{
              fontSize: '13px',
              color: 'var(--eqx-tertiary)'
            }}>
                  v{__APP_VERSION__}
                </span>
                <ChevronDownIcon size={14} style={{
              color: 'var(--eqx-tertiary)',
              transform: changelogOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 200ms cubic-bezier(0.2,0,0,1)'
            }} />
              </div>
            </button>

            <AnimatePresence>
              {changelogOpen && <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.24,
            ease: EQX_EASING
          }} style={{
            overflow: 'hidden'
          }}>
                  <div className="border-t" style={{
              borderColor: 'var(--eqx-hairline)'
            }}>
                    {CHANGELOG.map((entry) => <div key={entry.version} className="flex items-start gap-3 px-5 py-3 border-b last:border-0" style={{
                borderColor: 'var(--eqx-hairline)'
              }}>
                        <span className="text-[12px] font-semibold tabular-nums flex-shrink-0 mt-0.5" style={{
                  color: 'var(--eqx-tertiary)'
                }}>
                          {entry.version}
                        </span>
                        <div className="flex-1">
                          <p className="text-[14px]" style={{
                    color: 'var(--eqx-primary)'
                  }}>
                            {entry.note}
                          </p>
                          <p className="text-[11px]" style={{
                    color: 'var(--eqx-tertiary)'
                  }}>
                            {entry.date}
                          </p>
                        </div>
                      </div>)}
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>}

      {/* ── Log Out pill ── */}
      <div style={{
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '8px'
    }}>
        <button className="flex items-center gap-2 active:opacity-[0.75]" style={{
        background: 'transparent',
        border: '1px solid var(--eqx-coral)',
        color: 'var(--eqx-coral)',
        borderRadius: 9999,
        fontSize: '13px',
        fontWeight: 600,
        padding: '8px 24px',
        cursor: 'pointer'
      }}>
          <LogOutIcon size={14} />
          Log Out
        </button>
      </div>

      <div className="text-center">
        <p className="text-[13px]" style={{
        color: 'var(--eqx-tertiary)'
      }}>
          v{__APP_VERSION__} · {__BUILD_HASH__} · {__BUILD_DATE__}
        </p>
      </div>
    </div>;
}