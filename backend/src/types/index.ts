export interface User {
  _id?: string
  email: string
  password: string
  fullName: string
  username: string
  wallet: {
    balance: number
    currency: string
  }
  profile: {
    avatar?: string
    bio?: string
  }
  isVerified: boolean
  role: "user" | "admin"
  suspended: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Transaction {
  _id?: string
  userId: string
  type: "deposit" | "withdrawal" | "bet" | "win" | "refund"
  amount: number
  status: "pending" | "completed" | "failed" | "cancelled"
  paymentMethod: string
  reference: string
  description: string
  metadata?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

export interface League {
  _id?: string
  name: string
  description: string
  code: string
  creatorId: string
  members: string[]
  status: "active" | "closed" | "draft"
  startDate: Date
  endDate: Date
  budget: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Match {
  _id?: string
  homeTeam: string
  awayTeam: string
  score: {
    home: number
    away: number
  }
  status: "scheduled" | "live" | "completed" | "cancelled"
  startTime: Date
  endTime?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface AuthPayload {
  userId: string
  email: string
  role: string
}
