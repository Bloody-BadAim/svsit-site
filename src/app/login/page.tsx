import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Login — SIT',
  description: 'Log in bij SIT, de studievereniging voor HBO-ICT aan de HvA.',
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="mb-12 text-center">
        <span
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
        >
          {'{'}<span style={{ color: 'var(--color-text)' }}>SIT</span>{'}'}
        </span>
        <h1
          className="text-2xl font-bold mt-4"
          style={{ color: 'var(--color-text)' }}
        >
          Welkom terug
        </h1>
        <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Log in om je dashboard te openen
        </p>
      </div>

      <LoginForm />
    </main>
  )
}
