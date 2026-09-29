// TypeScript interfaces for all data models
export interface User {
  _id?: string
  id: string
  email: string
  username: string
  password: string
  eFootballCode: string
  country?: string
  dateOfBirth?: string
  balance: number
  verified: boolean
  emailVerified: boolean
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface League {
  _id?: string
  id: string
  name: string
  description: string
  entryFee: number
  maxMembers: number
  currentMembers: number
  stakes: string
  prizePool: number
  owner: string
  members: LeagueMember[]
  status: "active" | "inactive" | "completed"
  season: number
  createdAt: Date
  updatedAt: Date
}

export interface LeagueMember {
  userId: string
  username: string
  joinedAt: Date
  totalScore: number
  rank: number
}

export interface Match {
  _id?: string
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: "scheduled" | "live" | "completed"
  startTime: Date
  endTime?: Date
  leagueId: string
  createdAt: Date
  updatedAt: Date
}

export interface Player {
  _id?: string
  id: string
  name: string
  team: string
  position: string
  price: number
  totalScore: number
  matchesPlayed: number
  createdAt: Date
  updatedAt: Date
}

export interface UserRoster {
  _id?: string
  id: string
  userId: string
  leagueId: string
  players: RosterPlayer[]
  totalScore: number
  gameweek: number
  createdAt: Date
  updatedAt: Date
}

export interface RosterPlayer {
  playerId: string
  name: string
  price: number
  score: number
}

export interface Transaction {
  _id?: string
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "league_entry" | "prize"
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  description: string
  externalId?: string
  providerReference?: string
  completedAt?: Date
  updatedAt?: Date
  createdAt: Date
}

export type TournamentStatus = "DRAFT" | "UPCOMING" | "REGISTRATION_OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED"

export interface Tournament {
  _id?: string
  id: string
  name: string
  description?: string
  entryFee: number
  maxParticipants?: number
  minParticipants?: number
  registrationOpenAt: Date
  registrationCloseAt: Date
  startAt: Date
  endAt: Date
  status: TournamentStatus
  rules?: string
  payoutConfig: { rank: number; type: "percentage" | "fixed"; value: number }[]
  participantCount: number
  createdAt: Date
  updatedAt: Date
}

export interface TournamentEntry {
  _id?: string
  id: string
  tournamentId: string
  userId: string
  pesId: string
  status: "active" | "withdrawn" | "refunded"
  joinedAt: Date
  transactionId: string
}

export interface EventLog {
  _id?: string
  id: string
  type: string
  userId?: string
  leagueId?: string
  data: Record<string, any>
  timestamp: Date
}
