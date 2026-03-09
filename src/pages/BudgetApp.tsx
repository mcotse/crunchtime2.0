import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMembers } from '../hooks/useMembers';
import { useTransactions, useAddTransaction, useUpdateFinePaid, useUpdateSplit } from '../hooks/useTransactions';
import { useChallenges, useJoinChallenge } from '../hooks/useChallenges';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useArchiveEvent, useUnarchiveEvent, useRsvp } from '../hooks/useEvents';
import { usePolls, useCreatePoll, useDeletePoll, useVote, useAddPollOption, useArchivePoll, useUnarchivePoll, useAddComment, useDeleteComment } from '../hooks/usePolls';
import { useCalendarAvailability, useToggleAvailability } from '../hooks/useCalendar';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import type { Transaction, TransactionSplit, Challenge } from '../data/mockData';
import { getCrunchFundBalance, getTotalFinesCollected, getTotalChallengeSpend, getPendingFines } from '../data/mockData';
import type { Poll } from '../data/pollsData';
import type { GroupEvent } from '../data/eventsData';
import { TabBar } from '../components/TabBar';
import { HomeTab } from '../components/HomeTab';
import { FeedTab } from '../components/FeedTab';
import { SettingsTab } from '../components/SettingsTab';
import { AddTransactionSheet } from '../components/AddTransactionSheet';
import { CreatePollSheet } from '../components/CreatePollSheet';
import { PollDetailSheet } from '../components/PollDetailSheet';
import { EventsTab } from '../components/EventsTab';
import { DayDetailSheet } from '../components/DayDetailSheet';
import { EventDetailSheet } from '../components/EventDetailSheet';
import { CreateEventSheet } from '../components/CreateEventSheet';
import { TransactionDetailSheet } from '../components/TransactionDetailSheet';
import { SplitEditorSheet } from '../components/SplitEditorSheet';
import { ChallengeDetailSheet } from '../components/ChallengeDetailSheet';
import { NotificationsSheet } from '../components/NotificationsSheet';
import { SplitsTab } from '../components/SplitsTab';
export function CrunchTime() {
  const { member, isAdmin, signOut } = useAuth();
  const CURRENT_USER_ID = member?.id ?? '';

  // Server data from hooks
  const { data: members = [], isLoading: membersLoading, error: membersError } = useMembers();
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useTransactions();
  const { data: challenges = [], isLoading: challengesLoading, error: challengesError } = useChallenges();
  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: polls = [], isLoading: pollsLoading, error: pollsError } = usePolls();
  const { data: calendarAvailability = {}, isLoading: calendarLoading, error: calendarError } = useCalendarAvailability();

  const isDataLoading = membersLoading || transactionsLoading || challengesLoading || eventsLoading || pollsLoading || calendarLoading;
  const dataError = membersError || transactionsError || challengesError || eventsError || pollsError || calendarError;
  const hasLoadedOnce = useRef(false);
  if (!isDataLoading && !dataError) hasLoadedOnce.current = true;

  // Mutations
  const addTransactionMutation = useAddTransaction();
  const updateFinePaidMutation = useUpdateFinePaid();
  const updateSplitMutation = useUpdateSplit();
  const joinChallengeMutation = useJoinChallenge();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  const archiveEventMutation = useArchiveEvent();
  const unarchiveEventMutation = useUnarchiveEvent();
  const rsvpMutation = useRsvp();
  const createPollMutation = useCreatePoll();
  const deletePollMutation = useDeletePoll();
  const voteMutation = useVote();
  const addPollOptionMutation = useAddPollOption();
  const archivePollMutation = useArchivePoll();
  const unarchivePollMutation = useUnarchivePoll();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();
  const toggleAvailabilityMutation = useToggleAvailability();

  // Realtime sync
  useRealtimeSync();

  // Local UI state
  const [activeTab, setActiveTab] = useState('events');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [groupName, setGroupName] = useState('Crunch Fund');
  const [isDark, setIsDark] = useState(true);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [isPollDetailOpen, setIsPollDetailOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  const [isSplitEditorOpen, setIsSplitEditorOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [isChallengeDetailOpen, setIsChallengeDetailOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  // Scroll reset: when switching tabs, reset both main scroll and body scroll
  const mainRef = useRef<HTMLElement>(null);
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Reset main scroll container
    if (mainRef.current) mainRef.current.scrollTop = 0;
    // Reset any body-level scroll (iOS PWA)
    window.scrollTo(0, 0);
  }, []);

  // Derived selected objects from query data
  const selectedPoll = polls.find(p => p.id === selectedPollId) ?? null;
  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId) ?? null;
  const selectedEvent = events.find(e => e.id === selectedEventId) ?? null;
  const selectedChallenge = challenges.find(c => c.id === selectedChallengeId) ?? null;

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
    setSelectedChallengeId(challenge.id);
    setIsChallengeDetailOpen(true);
  };
  const handleJoinChallenge = (challengeId: string) => {
    joinChallengeMutation.mutate({ challengeId, memberId: CURRENT_USER_ID });
  };
  // ── Transaction handlers ───────────────────────────────────────────────────
  const handleAddTransaction = (newTransaction: Transaction) => {
    addTransactionMutation.mutate({ transaction: newTransaction });
    if (newTransaction.type === 'fine' && newTransaction.fineStatus === 'pending') {
      setNotificationsRead(false);
    }
  };
  const handleOpenTransaction = (tx: Transaction) => {
    setSelectedTransactionId(tx.id);
    setIsTransactionDetailOpen(true);
  };
  const handleUpdateSplit = (txId: string, splits: TransactionSplit[]) => {
    updateSplitMutation.mutate({ transactionId: txId, splits });
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
    updateFinePaidMutation.mutate(transactionId);
  };
  // ── Poll handlers ──────────────────────────────────────────────────────────
  const handleOpenPoll = (poll: Poll) => {
    setSelectedPollId(poll.id);
    setIsPollDetailOpen(true);
  };
  const handleCreatePoll = (newPoll: Poll) => {
    createPollMutation.mutate({
      title: newPoll.title,
      creatorId: newPoll.creatorId,
      expiresAt: newPoll.expiresAt,
      allowMembersToAddOptions: newPoll.allowMembersToAddOptions,
      allowMultiSelect: newPoll.allowMultiSelect,
      options: newPoll.options.map(o => o.text),
    });
  };
  const handleDeletePoll = (pollId: string) => {
    deletePollMutation.mutate(pollId);
    if (selectedPollId === pollId) setSelectedPollId(null);
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
      coverEmoji: 'bar-chart-3',
      rsvps: []
    };
    setEditingEvent(stub);
    setTimeout(() => setIsCreateEventOpen(true), 320);
  };
  const handleVote = async (pollId: string, optionIds: string[]) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    for (const option of poll.options) {
      const wasVoted = option.voterIds.includes(CURRENT_USER_ID);
      const shouldBeVoted = optionIds.includes(option.id);
      if (wasVoted !== shouldBeVoted) {
        await voteMutation.mutateAsync({ optionId: option.id, memberId: CURRENT_USER_ID });
      }
    }
  };
  const handleAddOption = (pollId: string, text: string) => {
    addPollOptionMutation.mutate({ pollId, text });
  };
  const handleArchive = (pollId: string) => {
    archivePollMutation.mutate(pollId);
  };
  const handleUnarchive = (pollId: string) => {
    unarchivePollMutation.mutate(pollId);
  };
  const handleAddComment = (pollId: string, text: string) => {
    addCommentMutation.mutate({ pollId, memberId: CURRENT_USER_ID, text });
  };
  const handleDeleteComment = (_pollId: string, commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };
  // ── Calendar handlers ──────────────────────────────────────────────────────
  const handleDayTap = (dateStr: string) => {
    setSelectedCalendarDate(dateStr);
    setIsDayDetailOpen(true);
  };
  const handleToggleAvailability = (dateStr: string) => {
    toggleAvailabilityMutation.mutate({ dateStr, memberId: CURRENT_USER_ID });
  };
  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleOpenEvent = (event: GroupEvent) => {
    setSelectedEventId(event.id);
    setIsEventDetailOpen(true);
  };
  const handleCreateEvent = async (newEvent: GroupEvent) => {
    const newId = await createEventMutation.mutateAsync({
      title: newEvent.title,
      description: newEvent.description,
      dateStr: newEvent.dateStr,
      time: newEvent.time,
      location: newEvent.location,
      locationMapsQuery: newEvent.locationMapsQuery,
      creatorId: newEvent.creatorId,
      coverEmoji: newEvent.coverEmoji,
    });
    setSelectedEventId(newId);
    setIsEventDetailOpen(true);
  };
  const handleRsvp = async (eventId: string, rsvpData: {
    status: 'going' | 'maybe' | 'not_going';
    guestCount?: number;
    proxyFor?: string[];
  }) => {
    await rsvpMutation.mutateAsync({
      eventId,
      memberId: CURRENT_USER_ID,
      status: rsvpData.status,
      guestCount: rsvpData.guestCount,
    });
    if (rsvpData.proxyFor) {
      for (const proxyMemberId of rsvpData.proxyFor) {
        await rsvpMutation.mutateAsync({
          eventId,
          memberId: proxyMemberId,
          status: rsvpData.status,
        });
      }
    }
  };
  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
    if (selectedEventId === eventId) setSelectedEventId(null);
  };
  const handleArchiveEvent = (eventId: string) => {
    archiveEventMutation.mutate(eventId);
  };
  const handleUnarchiveEvent = (eventId: string) => {
    unarchiveEventMutation.mutate(eventId);
  };
  const handleEditEvent = (event: GroupEvent) => {
    setEditingEvent(event);
    setIsCreateEventOpen(true);
  };
  const handleUpdateEvent = (updatedEvent: GroupEvent) => {
    updateEventMutation.mutate({
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      dateStr: updatedEvent.dateStr,
      time: updatedEvent.time,
      location: updatedEvent.location,
      locationMapsQuery: updatedEvent.locationMapsQuery,
      coverEmoji: updatedEvent.coverEmoji,
    });
    setSelectedEventId(updatedEvent.id);
  };
  const linkedEventForTx = selectedTransaction ? events.find((ev) => ev.linkedTransactionId === selectedTransaction.id) ?? null : null;

  if (isDataLoading && !hasLoadedOnce.current) {
    return (
      <div className={`${isDark ? 'dark' : 'light'} min-h-screen font-sans bg-eqx-base text-eqx-primary`}>
        <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'var(--eqx-hairline)',
                borderTopColor: 'var(--eqx-mint)',
              }}
            />
            <p className="text-sm" style={{ color: 'var(--eqx-secondary)' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className={`${isDark ? 'dark' : 'light'} min-h-screen font-sans bg-eqx-base text-eqx-primary`}>
        <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="flex justify-center"><AlertCircleIcon size={40} strokeWidth={1.5} style={{ color: 'var(--eqx-coral)' }} /></div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--eqx-primary)' }}>
              Failed to load data
            </h1>
            <p className="text-sm" style={{ color: 'var(--eqx-secondary)' }}>
              {dataError instanceof Error ? dataError.message : 'Could not connect to the server. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--eqx-mint)',
                color: 'var(--eqx-base)',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div className={`${isDark ? 'dark' : 'light'} fixed inset-0 overflow-hidden font-sans bg-eqx-base text-eqx-primary selection:bg-eqx-raised`}>
      <div className="max-w-md mx-auto h-full relative flex flex-col">
        <main ref={mainRef} className="flex-1 flex flex-col overflow-y-auto" style={{ overscrollBehavior: 'none' }}>
          {activeTab === 'home' && <HomeTab members={members} transactions={transactions} challenges={challenges} crunchFundBalance={crunchFundBalance} totalFinesCollected={totalFinesCollected} totalChallengeSpend={totalChallengeSpend} pendingFinesCount={pendingFines.length} onAddTransaction={() => setIsSheetOpen(true)} groupName={groupName} onSeeAll={() => handleTabChange('feed')} onOpenNotifications={handleOpenNotifications} hasUnread={hasUnread} onOpenChallenge={handleOpenChallenge} onSwitchToPolls={() => handleTabChange('events')} onOpenTransaction={handleOpenTransaction} />}
          {activeTab === 'feed' && <FeedTab transactions={transactions} members={members} challenges={challenges} events={events} currentUserId={CURRENT_USER_ID} isAdmin={isAdmin} onOpenTransaction={handleOpenTransaction} onOpenEvent={handleOpenEvent} onOpenNotifications={handleOpenNotifications} hasUnread={hasUnread} />}
          {activeTab === 'events' && <EventsTab availability={calendarAvailability} members={members} currentUserId={CURRENT_USER_ID} onDayTap={handleDayTap} onToggleAvailability={handleToggleAvailability} events={events} transactions={transactions} onCreateEvent={() => setIsCreateEventOpen(true)} onOpenEvent={handleOpenEvent} onArchiveEvent={handleArchiveEvent} onUnarchiveEvent={handleUnarchiveEvent} onOpenNotifications={handleOpenNotifications} hasUnread={hasUnread} challenges={challenges} onOpenChallenge={handleOpenChallenge} onProposeChallenge={() => setIsCreatePollOpen(true)} polls={polls} onOpenPoll={handleOpenPoll} onVote={handleVote} onRsvp={handleRsvp} />}
          {activeTab === 'splits' && <SplitsTab />}
          {activeTab === 'settings' && <SettingsTab members={members} groupName={groupName} onGroupNameChange={setGroupName} isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} isAdmin={isAdmin} onSignOut={signOut} />}
        </main>

        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

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
        handleTabChange('events');
      }} onOpenPoll={(poll) => {
        setIsChallengeDetailOpen(false);
        setTimeout(() => handleOpenPoll(poll), 320);
      }} onJoinChallenge={handleJoinChallenge} currentUserId={CURRENT_USER_ID} />

        <NotificationsSheet isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} transactions={transactions} members={members} challenges={challenges} events={events} currentUserId={CURRENT_USER_ID} isAdmin={isAdmin} onMarkFinePaid={handleMarkFinePaid} />
      </div>
    </div>;
}
