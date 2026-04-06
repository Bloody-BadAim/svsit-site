import RegisterFlow from '@/components/auth/RegisterFlow'
import { SessionProvider } from 'next-auth/react'

export const metadata = {
  title: 'Word lid — SIT',
  description: 'Word lid van SIT, de studievereniging voor HBO-ICT aan de HvA.',
}

export default function LidWordenPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <SessionProvider>
        <RegisterFlow />
      </SessionProvider>
    </main>
  )
}
