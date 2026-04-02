import NextAuth from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'
import type { Role } from '@/types/database'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      membershipActive: boolean
      isAdmin: boolean
    }
  }

  interface User {
    role?: Role
    membershipActive?: boolean
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    ...(process.env.AZURE_AD_CLIENT_ID ? [MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    })] : []),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const supabase = createServiceClient()
        const { data: member } = await supabase
          .from('members')
          .select('id, email, password_hash, role, membership_active')
          .eq('email', credentials.email as string)
          .single()

        if (!member?.password_hash) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          member.password_hash as string
        )
        if (!valid) return null

        return {
          id: member.id as string,
          email: member.email as string,
          role: member.role as Role,
          membershipActive: member.membership_active as boolean,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'microsoft-entra-id' && user.email) {
        const supabase = createServiceClient()
        const { data: existing } = await supabase
          .from('members')
          .select('id')
          .eq('email', user.email)
          .single()

        if (!existing) {
          const { data: newMember } = await supabase
            .from('members')
            .insert({ email: user.email, role: 'member', membership_active: false })
            .select('id')
            .single()

          if (newMember) user.id = newMember.id as string
        } else {
          user.id = existing.id as string
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.membershipActive = user.membershipActive
      }

      if (token.id) {
        const supabase = createServiceClient()
        const { data: member } = await supabase
          .from('members')
          .select('role, membership_active')
          .eq('id', token.id as string)
          .single()

        if (member) {
          token.role = member.role as string
          token.membershipActive = member.membership_active as boolean
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = (token.role as Role) || 'member'
      session.user.membershipActive = (token.membershipActive as boolean) || false
      session.user.isAdmin = ADMIN_EMAILS.includes(session.user.email)
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
})
