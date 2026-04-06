import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Wachtwoord vergeten — {SIT}',
  description: 'Vraag een wachtwoord reset link aan voor je SIT account.',
}

export default function ForgotPasswordPage() {
  return (
    <main
      className="min-h-screen relative flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245, 158, 11, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10">
          <a href="/login" className="inline-block mb-6">
            <span className="font-mono text-3xl font-bold tracking-tight">
              <span className="text-[var(--color-accent-gold)]">{'{'}</span>
              <span className="text-[var(--color-text)]">SIT</span>
              <span className="text-[var(--color-accent-gold)]">{'}'}</span>
            </span>
          </a>

          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight uppercase"
            style={{
              color: 'var(--color-text)',
              fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
            }}
          >
            Wachtwoord vergeten
          </h1>

          <p className="font-mono text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
            {'>'} auth.resetPassword()
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="flex items-center justify-center gap-3 mt-12">
          <span className="text-[var(--color-accent-red)] text-[10px] font-bold">&times;</span>
          <span className="text-[var(--color-accent-green)] text-[10px] font-bold">&times;</span>
          <span className="text-[var(--color-accent-blue)] text-[10px] font-bold">&times;</span>
        </div>
      </div>
    </main>
  )
}
