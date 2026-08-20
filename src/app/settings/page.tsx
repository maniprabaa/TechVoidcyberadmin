'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Settings {
  siteName?: string;
  siteDescription?: string;
  defaultAuthor?: string;
  nvidiaModel?: string;
  aiDailyLimit?: number;
  autoDiscovery?: boolean;
  autoGeneration?: boolean;
  autoPublishing?: boolean;
  breakingDurationHours?: number;
  rssCron?: string;
  theme?: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    api
      .get<{ settings: Settings }>('/admin/settings')
      .then((res) => setSettings(res.settings))
      .catch((err) => setMessage(err.message));
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.put<{ settings: Settings }>('/admin/settings', settings);
      setSettings(res.settings);
      setMessage('Settings saved');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-3xl text-white">Settings</h1>
      {(
        [
          ['siteName', 'Site name'],
          ['siteDescription', 'Site description'],
          ['defaultAuthor', 'Default author'],
          ['nvidiaModel', 'NVIDIA model'],
          ['rssCron', 'RSS cron'],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="text-xs uppercase tracking-wider text-ink-400">{label}</label>
          <input
            className="mt-1 h-10 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm"
            value={String(settings[key] ?? '')}
            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
          />
        </div>
      ))}
      <div>
        <label className="text-xs uppercase tracking-wider text-ink-400">AI daily limit</label>
        <input
          type="number"
          className="mt-1 h-10 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm"
          value={settings.aiDailyLimit ?? 5}
          onChange={(e) => setSettings({ ...settings, aiDailyLimit: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-ink-400">Breaking duration (hours)</label>
        <input
          type="number"
          className="mt-1 h-10 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm"
          value={settings.breakingDurationHours ?? 6}
          onChange={(e) =>
            setSettings({ ...settings, breakingDurationHours: Number(e.target.value) })
          }
        />
      </div>
      {(
        [
          ['autoDiscovery', 'Auto discovery'],
          ['autoGeneration', 'Auto generation'],
          ['autoPublishing', 'Auto publishing'],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm text-ink-300">
          <input
            type="checkbox"
            checked={Boolean(settings[key])}
            onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
          />
          {label}
        </label>
      ))}
      {message && <p className="text-sm text-ink-300">{message}</p>}
      <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white">
        Save settings
      </button>
    </form>
  );
}
