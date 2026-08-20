'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Bot,
  Bug,
  FileText,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Radio,
  Settings,
  Shield,
  Skull,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/stories', label: 'Stories', icon: Newspaper },
  { href: '/generation', label: 'AI Generation', icon: Bot },
  { href: '/ai-providers', label: 'AI Providers', icon: Bot },
  { href: '/sources', label: 'RSS Sources', icon: Radio },
  { href: '/analytics', label: 'Analytics', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    router.replace('/login');
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-ink-800 md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-lg text-white">
            CyberIntel Admin
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded p-2 text-ink-400 hover:text-white"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <p className="px-4 pb-2 text-[10px] uppercase tracking-wider text-ink-500">Secure desk</p>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-ink-300 hover:bg-ink-800 hover:text-white',
                  active && 'bg-ink-800 text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            <Shield className="h-4 w-4" />
            View site
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cve`}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            <Skull className="h-4 w-4" />
            CVE / Threats
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/malware`}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            <Bug className="h-4 w-4" />
            Malware
          </a>
        </nav>
      </aside>
      <div className="p-4 md:p-8">{children}</div>
    </div>
  );
}
