export type Role = 'member' | 'contributor' | 'mentor' | 'admin'

export type MembershipStatus = 'active' | 'expired' | 'pending'

export type StatCategory = 'code' | 'social' | 'learn' | 'impact'
export type ChallengeType = 'quest' | 'track_milestone' | 'achievement'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Member {
  id: string
  email: string
  password_hash: string | null
  student_number: string | null
  role: Role
  commissie: string | null
  commissie_voorstel: string | null
  points: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  membership_active: boolean
  membership_started_at: string | null
  membership_expires_at: string | null
  created_at: string
  updated_at: string
  active_skin: string
  active_badges: string[]
}

export interface Scan {
  id: string
  member_id: string
  points: number
  reason: string
  scanned_by: string | null
  event_name: string | null
  event_id: string | null
  category: StatCategory
  created_at: string
}

export interface SitEvent {
  id: string
  title: string
  description: string | null
  date: string
  end_date: string | null
  location: string | null
  category: StatCategory
  tags: string[]
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  is_paid: boolean
  price_members: number
  price_nonmembers: number
  capacity: number | null
  stripe_price_id: string | null
  created_by: string | null
  created_at: string
}

export interface Ticket {
  id: string
  event_id: string
  member_id: string | null
  email: string
  name: string | null
  status: 'pending' | 'paid' | 'cancelled' | 'checked_in'
  stripe_session_id: string | null
  paid_amount: number
  created_at: string
  checked_in_at: string | null
}

export interface Reward {
  id: string
  member_id: string
  type: 'skin_unlock' | 'badge' | 'merch_claim'
  reward_id: string
  claimed_at: string | null
  created_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  category: StatCategory
  points: number
  track_id: string | null
  track_order: number | null
  proof_required: boolean
  proof_type: 'link' | 'screenshot' | 'text' | 'scan' | null
  active_from: string | null
  active_until: string | null
  created_by: string | null
  created_at: string
}

export interface ChallengeSubmission {
  id: string
  challenge_id: string
  member_id: string
  proof_url: string | null
  proof_text: string | null
  status: SubmissionStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Payment {
  id: string
  member_id: string
  stripe_session_id: string | null
  stripe_subscription_id: string | null
  amount: number
  status: string
  created_at: string
  paid_at: string | null
}

export interface Database {
  public: {
    Tables: {
      members: {
        Row: Member
        Insert: Partial<Member> & Pick<Member, 'email'>
        Update: Partial<Member>
        Relationships: []
      }
      scans: {
        Row: Scan
        Insert: Partial<Scan> & Pick<Scan, 'member_id' | 'points' | 'reason'>
        Update: Partial<Scan>
        Relationships: [
          {
            foreignKeyName: 'scans_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'members'
            referencedColumns: ['id']
          }
        ]
      }
      payments: {
        Row: Payment
        Insert: Partial<Payment> & Pick<Payment, 'member_id' | 'amount'>
        Update: Partial<Payment>
        Relationships: [
          {
            foreignKeyName: 'payments_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'members'
            referencedColumns: ['id']
          }
        ]
      }
      rewards: {
        Row: Reward
        Insert: Partial<Reward> & Pick<Reward, 'member_id' | 'type' | 'reward_id'>
        Update: Partial<Reward>
        Relationships: [
          {
            foreignKeyName: 'rewards_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'members'
            referencedColumns: ['id']
          }
        ]
      }
      challenges: {
        Row: Challenge
        Insert: Partial<Challenge> & Pick<Challenge, 'title' | 'description' | 'type' | 'category' | 'points'>
        Update: Partial<Challenge>
        Relationships: []
      }
      challenge_submissions: {
        Row: ChallengeSubmission
        Insert: Partial<ChallengeSubmission> & Pick<ChallengeSubmission, 'challenge_id' | 'member_id'>
        Update: Partial<ChallengeSubmission>
        Relationships: [
          {
            foreignKeyName: 'challenge_submissions_challenge_id_fkey'
            columns: ['challenge_id']
            referencedRelation: 'challenges'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'challenge_submissions_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'members'
            referencedColumns: ['id']
          }
        ]
      }
      events: {
        Row: SitEvent
        Insert: Partial<SitEvent> & Pick<SitEvent, 'title' | 'date'>
        Update: Partial<SitEvent>
        Relationships: []
      }
      tickets: {
        Row: Ticket
        Insert: Partial<Ticket> & Pick<Ticket, 'event_id' | 'email'>
        Update: Partial<Ticket>
        Relationships: [
          {
            foreignKeyName: 'tickets_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tickets_member_id_fkey'
            columns: ['member_id']
            referencedRelation: 'members'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
