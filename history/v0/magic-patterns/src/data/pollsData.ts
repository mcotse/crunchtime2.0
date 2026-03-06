export interface PollOption {
  id: string;
  text: string;
  voterIds: string[];
}

export interface PollComment {
  id: string;
  memberId: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  creatorId: string;
  createdAt: string;
  expiresAt?: string;
  isArchived: boolean;
  archivedAt?: string;
  allowMembersToAddOptions: boolean;
  allowMultiSelect: boolean;
  comments: PollComment[];
}

// Helper: dates relative to NOW (real current time)
const NOW = new Date();
const tomorrow = new Date(NOW);
tomorrow.setDate(tomorrow.getDate() + 1);
const inThreeDays = new Date(NOW);
inThreeDays.setDate(inThreeDays.getDate() + 3);
const yesterday = new Date(NOW);
yesterday.setDate(yesterday.getDate() - 1);
const twoWeeksAgo = new Date(NOW);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
const oneWeekAgo = new Date(NOW);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

export const POLLS: Poll[] = [
{
  id: 'p1',
  title: 'Where should we go for team dinner?',
  options: [
  {
    id: 'p1o1',
    text: 'Italian — Bella Napoli',
    voterIds: ['m1', 'm3', 'm5', 'm9']
  },
  {
    id: 'p1o2',
    text: 'Japanese — Sakura Sushi',
    voterIds: ['m2', 'm6', 'm11']
  },
  {
    id: 'p1o3',
    text: 'Mexican — Casa Fuego',
    voterIds: ['m4', 'm7', 'm8']
  },
  { id: 'p1o4', text: 'Thai — Lotus Garden', voterIds: ['m10', 'm12'] }],

  creatorId: 'm1',
  createdAt: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  isArchived: false,
  allowMembersToAddOptions: true,
  allowMultiSelect: false,
  comments: [
  {
    id: 'c1',
    memberId: 'm3',
    text: 'Italian has the best ambiance for a group!',
    createdAt: new Date(
      NOW.getTime() - 1 * 24 * 60 * 60 * 1000
    ).toISOString()
  },
  {
    id: 'c2',
    memberId: 'm6',
    text: 'Sakura has a great private dining room for us.',
    createdAt: new Date(NOW.getTime() - 18 * 60 * 60 * 1000).toISOString()
  }]

},
{
  id: 'p2',
  title: 'Which streaming services should we share?',
  options: [
  {
    id: 'p2o1',
    text: 'Netflix',
    voterIds: ['m1', 'm2', 'm3', 'm5', 'm7', 'm9', 'm11']
  },
  {
    id: 'p2o2',
    text: 'Spotify',
    voterIds: ['m1', 'm4', 'm6', 'm8', 'm10', 'm12']
  },
  { id: 'p2o3', text: 'Disney+', voterIds: ['m2', 'm3', 'm5'] },
  { id: 'p2o4', text: 'Apple TV+', voterIds: ['m7', 'm9'] }],

  creatorId: 'm2',
  createdAt: new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: tomorrow.toISOString(),
  isArchived: false,
  allowMembersToAddOptions: false,
  allowMultiSelect: true,
  comments: [
  {
    id: 'c3',
    memberId: 'm1',
    text: 'We should definitely keep Netflix, it has the most content.',
    createdAt: new Date(
      NOW.getTime() - 2 * 24 * 60 * 60 * 1000
    ).toISOString()
  }]

},
{
  id: 'p3',
  title: 'Best day for our monthly check-in?',
  options: [
  { id: 'p3o1', text: 'First Monday', voterIds: ['m1', 'm2', 'm4', 'm6'] },
  {
    id: 'p3o2',
    text: 'First Friday',
    voterIds: ['m3', 'm5', 'm7', 'm8', 'm9']
  },
  { id: 'p3o3', text: 'Last Friday', voterIds: ['m10', 'm11', 'm12'] }],

  creatorId: 'm3',
  createdAt: new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: inThreeDays.toISOString(),
  isArchived: false,
  allowMembersToAddOptions: true,
  allowMultiSelect: false,
  comments: []
},
{
  id: 'p4',
  title: 'Should we increase the monthly shared budget?',
  options: [
  {
    id: 'p4o1',
    text: 'Yes — increase by $50',
    voterIds: ['m1', 'm2', 'm5', 'm6', 'm9', 'm11']
  },
  { id: 'p4o2', text: 'Yes — increase by $100', voterIds: ['m3', 'm7'] },
  {
    id: 'p4o3',
    text: 'No — keep it the same',
    voterIds: ['m4', 'm8', 'm10', 'm12']
  }],

  creatorId: 'm1',
  createdAt: new Date(NOW.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: yesterday.toISOString(),
  isArchived: false,
  allowMembersToAddOptions: false,
  allowMultiSelect: false,
  comments: [
  {
    id: 'c4',
    memberId: 'm4',
    text: 'I think we should review our current spending first before increasing.',
    createdAt: new Date(
      NOW.getTime() - 5 * 24 * 60 * 60 * 1000
    ).toISOString()
  },
  {
    id: 'c5',
    memberId: 'm9',
    text: '$50 increase seems reasonable given inflation.',
    createdAt: new Date(
      NOW.getTime() - 4 * 24 * 60 * 60 * 1000
    ).toISOString()
  }]

},
{
  id: 'p5',
  title: 'Summer vacation destination vote',
  options: [
  {
    id: 'p5o1',
    text: 'Beach — Cancún',
    voterIds: ['m1', 'm2', 'm3', 'm5', 'm6']
  },
  {
    id: 'p5o2',
    text: 'Mountains — Colorado',
    voterIds: ['m4', 'm7', 'm8']
  },
  {
    id: 'p5o3',
    text: 'City — New York',
    voterIds: ['m9', 'm10', 'm11', 'm12']
  }],

  creatorId: 'm2',
  createdAt: twoWeeksAgo.toISOString(),
  expiresAt: new Date(
    twoWeeksAgo.getTime() + 7 * 24 * 60 * 60 * 1000
  ).toISOString(),
  isArchived: true,
  archivedAt: oneWeekAgo.toISOString(),
  allowMembersToAddOptions: false,
  allowMultiSelect: false,
  comments: []
},
{
  id: 'p6',
  title: 'What should we name our group fund?',
  options: [
  { id: 'p6o1', text: 'The Vault', voterIds: ['m1', 'm4', 'm7', 'm10'] },
  {
    id: 'p6o2',
    text: 'Crunch Fund',
    voterIds: ['m2', 'm5', 'm8', 'm11', 'm12']
  },
  { id: 'p6o3', text: 'Common Pot', voterIds: ['m3', 'm6', 'm9'] }],

  creatorId: 'm5',
  createdAt: new Date(NOW.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  isArchived: false,
  allowMembersToAddOptions: true,
  allowMultiSelect: false,
  comments: []
}];