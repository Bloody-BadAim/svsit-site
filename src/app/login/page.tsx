import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Login — SIT',
  description: 'Log in bij SIT, de studievereniging voor HBO-ICT aan de HvA.',
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen relative flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Grid background like homepage hero */}
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

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: '30%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-10">
          {/* {SIT} logo */}
          <span className="font-mono text-3xl font-bold tracking-tight block mb-6">
            <span className="text-[var(--color-accent-gold)]">{'{'}</span>
            <span className="text-[var(--color-text)]">SIT</span>
            <span className="text-[var(--color-accent-gold)]">{'}'}</span>
          </span>

          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight uppercase"
            style={{
              color: 'var(--color-text)',
              fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
            }}
          >
            Log in op je account
          </h1>

          <p className="font-mono text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
            {'>'} auth.login()
          </p>
        </div>

        <LoginForm />

        {/* Amsterdam marks footer */}
        <div className="flex items-center justify-center gap-3 mt-12">
          <span className="text-[var(--color-accent-red)] text-[10px] font-bold">×</span>
          <span className="text-[var(--color-accent-green)] text-[10px] font-bold">×</span>
          <span className="text-[var(--color-accent-blue)] text-[10px] font-bold">×</span>
        </div>
      </div>
    </main>
  )
}
