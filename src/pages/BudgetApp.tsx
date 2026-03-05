import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MEMBERS, TRANSACTIONS, CHALLENGES, Transaction, TransactionSplit, Challenge, getCrunchFundBalance, getTotalFinesCollected, getTotalChallengeSpend, getPendingFines } from '../data/mockData';
import { POLLS, Poll, PollOption, PollComment } from '../data/pollsData';
import { INITIAL_EVENTS, GroupEvent } from '../data/eventsData';
import { TabBar } from '../components/TabBar';
import { HomeTab } from '../components/HomeTab';
import { FeedTab } from '../components/FeedTab';
import { SettingsTab } from '../components/SettingsTab';
import { PollsTab } from '../components/PollsTab';
import { AddTransactionSheet } from '../components/AddTransactionSheet';
import { CreatePollSheet } from '../components/CreatePollSheet';
import { PollDetailSheet } from '../components/PollDetailSheet';
import { CalendarTab } from '../components/CalendarTab';
import { EventsTab } from '../components/EventsTab';
import { DayDetailSheet } from '../components/DayDetailSheet';
import { EventDetailSheet } from '../components/EventDetailSheet';
import { CreateEventSheet } from '../components/CreateEventSheet';
import { TransactionDetailSheet } from '../components/TransactionDetailSheet';
import { SplitEditorSheet } from '../components/SplitEditorSheet';
import { ChallengeDetailSheet } from '../components/ChallengeDetailSheet';
import { CalendarAvailability, INITIAL_CALENDAR_AVAILABILITY } from '../data/calendarData';
import { NotificationsSheet } from '../components/NotificationsSheet';
import { SplitsTab } from '../components/SplitsTab';
export function CrunchTime() {
  const [activeTab, setActiveTab] = useState('events');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [members, setMembers] = useState(MEMBERS);
  const [challenges] = useState<Challenge[]>(CHALLENGES);
  const [groupName, setGroupName] = useState('Crunch Fund');
  const [isDark, setIsDark] = useState(true);
  const [polls, setPolls] = useState<Poll[]>(POLLS);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [isPollDetailOpen, setIsPollDetailOpen] = useState(false);
  const [calendarAvailability, setCalendarAvailability] = useState<CalendarAvailability>(INITIAL_CALENDAR_AVAILABILITY);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  // Transaction detail
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  // Split editor
  const [isSplitEditorOpen, setIsSplitEditorOpen] = useState(false);
  // Events state
  const [events, setEvents] = useState<GroupEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<GroupEvent | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  // Challenge detail
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isChallengeDetailOpen, setIsChallengeDetailOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const { member, isAdmin } = useAuth();
  const CURRENT_USER_ID = member?.id ?? '';
  // ── Crunch Fund derived values ─────────────────────────────────────────────
  const crunchFundBalance = getCrunchFundBalance(transactions);
  const totalFinesCollected = getTotalFinesCollected(transactions);
  const totalChallengeSpend = getTotalChallengeSpend(transactions);
  const pendingFines = getPendingFines(transactions);
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingNotifEvents = events.filter((ev) => !ev.isArchived && ev.dateStr && ev.dateStr >= todayStr).sort((a, b) => (a.dateStr ?? '').localeCompare(b.dateStr ?? '')).slice(0, 3);
  const hasUnread = !notificationsRead && (pendingFines.length > 0 || upcomingNotifEvents.length > 0);
  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    setNotificationsRead(true);
  };
  // ── Challenge handlers ─────────────────────────────────────────────────────
  const handleOpenChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsChallengeDetailOpen(true);
  };
  const handleJoinChallenge = (challengeId: string) => {
    // Stub — in production would update backend
    console.log('Join challenge:', challengeId);
  };
  // ── Transaction handlers ───────────────────────────────────────────────────
  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
    if (newTransaction.type === 'fine' && newTransaction.fineStatus === 'pending') {
      setNotificationsRead(false);
    }
  };
  const handleOpenTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsTransactionDetailOpen(true);
  };
  const handleUpdateSplit = (txId: string, splits: TransactionSplit[]) => {
    setTransactions((prev) => prev.map((tx) => tx.id === txId ? {
      ...tx,
      splits,
      splitLocked: true
    } : tx));
    setSelectedTransaction((prev) => prev?.id === txId ? {
      ...prev,
      splits,
      splitLocked: true
    } : prev);
  };
  const canEditSplit = (tx: Transaction | null): boolean => {
    if (!tx) return false;
    if (tx.memberId === CURRENT_USER_ID) return true;
    if (isAdmin) return true;
    const linkedEvent = events.find((ev) => ev.linkedTransactionId === tx.id);
    if (linkedEvent?.creatorId === CURRENT_USER_ID) return true;
    return false;
  };
  const handleMarkFinePaid = (transactionId: string) => {
    setTransactions((prev) => prev.map((tx) => tx.id === transactionId ? {
      ...tx,
      fineStatus: 'paid' as const
    } : tx));
    setSelectedTransaction((prev) => prev?.id === transactionId ? {
      ...prev,
      fineStatus: 'paid' as const
    } : prev);
  };
  // ── Poll handlers ──────────────────────────────────────────────────────────
  const handleOpenPoll = (poll: Poll) => {
    setSelectedPoll(poll);
    setIsPollDetailOpen(true);
  };
  const handleCreatePoll = (newPoll: Poll) => {
    setPolls((prev) => [newPoll, ...prev]);
  };
  const handleDeletePoll = (pollId: string) => {
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
    if (selectedPoll?.id === pollId) setSelectedPoll(null);
  };
  const handleCreateEventFromPoll = (prefill: {
    title: string;
  }) => {
    setIsPollDetailOpen(false);
    const stub: GroupEvent = {
      id: '',
      title: prefill.title,
      creatorId: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
      coverEmoji: '📊',
      rsvps: []
    };
    setEditingEvent(stub);
    setTimeout(() => setIsCreateEventOpen(true), 320);
  };
  const handleVote = (pollId: string, optionIds: string[]) => {
    const updatePoll = (p: Poll): Poll => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        options: p.options.map((o) => {
          const wasVoted = o.voterIds.includes(CURRENT_USER_ID);
          const shouldBeVoted = optionIds.includes(o.id);
          if (wasVoted && !shouldBeVoted) return {
            ...o,
            voterIds: o.voterIds.filter((id) => id !== CURRENT_USER_ID)
          };
          if (!wasVoted && shouldBeVoted) return {
            ...o,
            voterIds: [...o.voterIds, CURRENT_USER_ID]
          };
          return o;
        })
      };
    };
    setPolls((prev) => prev.map(updatePoll));
    setSelectedPoll((prev) => prev ? updatePoll(prev) : prev);
  };
  const handleAddOption = (pollId: string, text: string) => {
    const newOption: PollOption = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      voterIds: []
    };
    const addOption = (p: Poll): Poll => p.id === pollId ? {
      ...p,
      options: [...p.options, newOption]
    } : p;
    setPolls((prev) => prev.map(addOption));
    setSelectedPoll((prev) => prev ? addOption(prev) : prev);
  };
  const handleArchive = (pollId: string) => {
    const archive = (p: Poll): Poll => p.id === pollId ? {
      ...p,
      isArchived: true,
      archivedAt: new Date().toISOString()
    } : p;
    setPolls((prev) => prev.map(archive));
    setSelectedPoll((prev) => prev ? archive(prev) : prev);
  };
  const handleUnarchive = (pollId: string) => {
    const unarchive = (p: Poll): Poll => p.id === pollId ? {
      ...p,
      isArchived: false,
      archivedAt: undefined
    } : p;
    setPolls((prev) => prev.map(unarchive));
    setSelectedPoll((prev) => prev ? unarchive(prev) : prev);
  };
  const handleAddComment = (pollId: string, text: string) => {
    const newComment: PollComment = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: CURRENT_USER_ID,
      text,
      createdAt: new Date().toISOString()
    };
    const addComment = (p: Poll): Poll => p.id === pollId ? {
      ...p,
      comments: [...p.comments, newComment]
    } : p;
    setPolls((prev) => prev.map(addComment));
    setSelectedPoll((prev) => prev ? addComment(prev) : prev);
  };
  const handleDeleteComment = (pollId: string, commentId: string) => {
    const deleteComment = (p: Poll): Poll => p.id === pollId ? {
      ...p,
      comments: p.comments.filter((c) => c.id !== commentId)
    } : p;
    setPolls((prev) => prev.map(deleteComment));
    setSelectedPoll((prev) => prev ? deleteComment(prev) : prev);
  };
  // ── Calendar handlers ──────────────────────────────────────────────────────
  const handleDayTap = (dateStr: string) => {
    setSelectedCalendarDate(dateStr);
    setIsDayDetailOpen(true);
  };
  const handleToggleAvailability = (dateStr: string) => {
    setCalendarAvailability((prev) => {
      const existing = prev[dateStr] ?? {
        memberIds: []
      };
      const isIn = existing.memberIds.includes(CURRENT_USER_ID);
      return {
        ...prev,
        [dateStr]: {
          memberIds: isIn ? existing.memberIds.filter((id) => id !== CURRENT_USER_ID) : [...existing.memberIds, CURRENT_USER_ID]
        }
      };
    });
  };
  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleOpenEvent = (event: GroupEvent) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };
  const handleCreateEvent = (newEvent: GroupEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEvent(newEvent);
    setIsEventDetailOpen(true);
  };
  const handleRsvp = (eventId: string, rsvpData: {
    status: 'going' | 'maybe' | 'not_going';
    guestCount?: number;
    proxyFor?: string[];
  }) => {
    const updateEvent = (ev: GroupEvent): GroupEvent => {
      if (ev.id !== eventId) return ev;
      const existingIdx = ev.rsvps.findIndex((r) => r.memberId === CURRENT_USER_ID);
      const newRsvp = {
        memberId: CURRENT_USER_ID,
        status: rsvpData.status,
        ...(rsvpData.guestCount !== undefined && rsvpData.guestCount > 0 ? {
          guestCount: rsvpData.guestCount
        } : {}),
        ...(rsvpData.proxyFor && rsvpData.proxyFor.length > 0 ? {
          proxyFor: rsvpData.proxyFor
        } : {})
      };
      const newRsvps = existingIdx >= 0 ? ev.rsvps.map((r, i) => i === existingIdx ? newRsvp : r) : [...ev.rsvps, newRsvp];
      return {
        ...ev,
        rsvps: newRsvps
      };
    };
    setEvents((prev) => prev.map(updateEvent));
    setSelectedEvent((prev) => prev ? updateEvent(prev) : prev);
  };
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    if (selectedEvent?.id === eventId) setSelectedEvent(null);
  };
  const handleArchiveEvent = (eventId: string) => {
    const archiveEv = (ev: GroupEvent): GroupEvent => ev.id === eventId ? {
      ...ev,
      isArchived: true
    } : ev;
    setEvents((prev) => prev.map(archiveEv));
    setSelectedEvent((prev) => prev ? archiveEv(prev) : prev);
  };
  const handleUnarchiveEvent = (eventId: string) => {
    const unarchiveEv = (ev: GroupEvent): GroupEvent => ev.id === eventId ? {
      ...ev,
      isArchived: false
    } : ev;
    setEvents((prev) => prev.map(unarchiveEv));
    setSelectedEvent((prev) => prev ? unarchiveEv(prev) : prev);
  };
  const handleEditEvent = (event: GroupEvent) => {
    setEditingEvent(event);
    setIsCreateEventOpen(true);
  };
  const handleUpdateEvent = (updatedEvent: GroupEvent) => {
    setEvents((prev) => prev.map((ev) => ev.id === updatedEvent.id ? updatedEvent : ev));
    setSelectedEvent(updatedEvent);
  };
  const linkedEventForTx = selectedTransaction ? events.find((ev) => ev.linkedTransactionId === selectedTransaction.id) ?? null : null;
  return <div className={`${isDark ? 'dark' : 'light'} min-h-screen font-sans bg-eqx-base text-eqx-primary selection:bg-eqx-raised`}>
      <div className="max-w-md mx-auto min-h-screen relative flex flex-col">
        <main className="flex-1 flex flex-col">
          {activeTab === 'home' && <HomeTab members={members} transactions={transactions} challenges={challenges} crunchFundBalance={crunchFundBalance} totalFinesCollected={totalFinesCollected} totalChallengeSpend={totalChallengeSpend} pendingFinesCount={pendingFines.length} onAddTransaction={() => setIsSheetOpen(true)} groupName={groupName} onSeeAll={() => setActiveTab('feed')} onOpenNotifications={handleOpenNotifications} hasUnread={hasUnread} onOpenChallenge={handleOpenChallenge} onSwitchToPolls={() => setActiveTab('events')} onOpenTransaction={handleOpenTransaction} events={events} polls={polls} currentUserId={CURRENT_USER_ID} />}
          {activeTab === 'feed' && <FeedTab transactions={transactions} members={members} challenges={challenges} events={events} currentUserId={CURRENT_USER_ID} isAdmin={isAdmin} onOpenTransaction={handleOpenTransaction} onOpenEvent={handleOpenEvent} onOpenNotifications={handleOpenNotifications} hasUnread={hasUnread} />}
          {activeTab === 'events' && <EventsTab availability={calendarAvailability} members={members} currentUserId={CURRENT_USER_ID} onDayTap={handleDayTap} onToggleAvailability={handleToggleAvailability} events={events} transactions={transactions} onCreateEvent={() => setIsCreateEventOpen(true)} onOpenEvent={handleOpenEvent} onArchiveEvent={handleArchiveEvent} onUnarchiveEvent={handleUnarchiveEvent} onOpenNotifications={handleOpenNotifications} hasUnread={hasUnread} challenges={challenges} onOpenChallenge={handleOpenChallenge} onProposeChallenge={() => setIsCreatePollOpen(true)} polls={polls} onOpenPoll={handleOpenPoll} onVote={handleVote} onRsvp={handleRsvp} />}
          {activeTab === 'splits' && <SplitsTab />}
          {activeTab === 'settings' && <SettingsTab members={members} groupName={groupName} onGroupNameChange={setGroupName} isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} isAdmin={true} />}
        </main>

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <AddTransactionSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} members={members} challenges={challenges} transactions={transactions} onAdd={handleAddTransaction} />

        <CreatePollSheet isOpen={isCreatePollOpen} onClose={() => setIsCreatePollOpen(false)} currentUserId={CURRENT_USER_ID} onCreatePoll={handleCreatePoll} />

        <PollDetailSheet poll={selectedPoll} members={members} currentUserId={CURRENT_USER_ID} isOpen={isPollDetailOpen} onClose={() => setIsPollDetailOpen(false)} onVote={handleVote} onAddOption={handleAddOption} onArchive={handleArchive} onUnarchive={handleUnarchive} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} isAdmin={isAdmin} onDelete={handleDeletePoll} onCreateEventFromPoll={handleCreateEventFromPoll} />

        <DayDetailSheet dateStr={selectedCalendarDate} isOpen={isDayDetailOpen} onClose={() => setIsDayDetailOpen(false)} availability={calendarAvailability} members={members} currentUserId={CURRENT_USER_ID} onToggle={handleToggleAvailability} events={events} onOpenEvent={handleOpenEvent} />

        <EventDetailSheet event={selectedEvent} isOpen={isEventDetailOpen} onClose={() => setIsEventDetailOpen(false)} members={members} transactions={transactions} currentUserId={CURRENT_USER_ID} isAdmin={isAdmin} onRsvp={handleRsvp} onDelete={handleDeleteEvent} onArchive={handleArchiveEvent} onUnarchive={handleUnarchiveEvent} onEdit={handleEditEvent} onOpenTransaction={handleOpenTransaction} onAddExpense={() => {
        setIsEventDetailOpen(false);
        setTimeout(() => setIsSheetOpen(true), 320);
      }} />

        <CreateEventSheet isOpen={isCreateEventOpen} onClose={() => {
        setIsCreateEventOpen(false);
        setEditingEvent(null);
      }} currentUserId={CURRENT_USER_ID} transactions={transactions} onCreateEvent={handleCreateEvent} initialEvent={editingEvent ?? undefined} onUpdateEvent={handleUpdateEvent} />

        <TransactionDetailSheet transaction={selectedTransaction} isOpen={isTransactionDetailOpen} onClose={() => setIsTransactionDetailOpen(false)} members={members} events={events} challenges={challenges} transactions={transactions} isAdmin={isAdmin} onOpenEvent={(ev) => {
        setIsTransactionDetailOpen(false);
        handleOpenEvent(ev);
      }} canEditSplit={canEditSplit(selectedTransaction)} onEditSplit={() => setIsSplitEditorOpen(true)} onMarkFinePaid={handleMarkFinePaid} />

        <SplitEditorSheet transaction={selectedTransaction} event={linkedEventForTx} isOpen={isSplitEditorOpen} onClose={() => setIsSplitEditorOpen(false)} members={members} onSave={handleUpdateSplit} />

        <ChallengeDetailSheet challenge={selectedChallenge} isOpen={isChallengeDetailOpen} onClose={() => setIsChallengeDetailOpen(false)} members={members} transactions={transactions} polls={polls} onSwitchToPolls={() => {
        setIsChallengeDetailOpen(false);
        setActiveTab('events');
      }} onJoinChallenge={handleJoinChallenge} currentUserId={CURRENT_USER_ID} />

        <NotificationsSheet isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} transactions={transactions} members={members} challenges={challenges} events={events} currentUserId={CURRENT_USER_ID} isAdmin={isAdmin} onMarkFinePaid={handleMarkFinePaid} />
      </div>
    </div>;
}