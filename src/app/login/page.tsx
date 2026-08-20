'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@cyberintel.local');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ token: string }>('/auth/login', {
        email,
        password,
        website,
      });
      localStorage.setItem('token', res.token);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-panel"
        autoComplete="on"
      >
        <h1 className="font-display text-2xl text-white">Secure editorial login</h1>
        <p className="mt-1 text-sm text-ink-400">
          Separate admin app · rate-limited · bot-protected
        </p>

        {/* Honeypot — hidden from users, filled by naive bots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="website">Company website</label>
          <input
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <label className="mt-6 block text-xs uppercase tracking-wider text-ink-400">Email</label>
        <input
          className="mt-1 h-11 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm outline-none focus:border-accent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="username"
        />
        <label className="mt-4 block text-xs uppercase tracking-wider text-ink-400">Password</label>
        <input
          className="mt-1 h-11 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm outline-none focus:border-accent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          autoComplete="current-password"
        />
        {error && <p className="mt-3 text-sm text-critical">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-11 w-full rounded-lg bg-accent text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
