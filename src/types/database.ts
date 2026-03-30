export type Role = 'member' | 'contributor' | 'mentor'

export type MembershipStatus = 'active' | 'expired' | 'pending'

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
}

export interface Scan {
  id: string
  member_id: string
  points: number
  reason: string
  scanned_by: string | null
  event_name: string | null
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
