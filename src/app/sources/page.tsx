'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { relativeTime } from '@/lib/utils';

interface Source {
  _id: string;
  name: string;
  url: string;
  feedUrl: string;
  category?: string;
  reliabilityScore?: number;
  enabled: boolean;
  lastFetchedAt?: string;
  lastFetchStatus?: string;
  articlesFound?: number;
}

const empty = {
  name: '',
  url: '',
  feedUrl: '',
  category: 'Threat Intelligence',
  reliabilityScore: 4,
  reliabilityTier: 'established_publication',
  enabled: true,
};

export default function AdminSourcesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Source[]>([]);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');

  async function load() {
    const data = await api.get<{ items: Source[] }>('/admin/sources');
    setItems(data.items);
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    load().catch((err) => setMessage(err.message));
  }, [router]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/admin/sources', form);
      setForm(empty);
      setMessage('Source added');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function toggle(id: string, enabled: boolean) {
    await api.put(`/admin/sources/${id}`, { enabled: !enabled });
    await load();
  }

  async function test(id: string) {
    try {
      const res = await api.post<{ count: number; sampleTitles: string[] }>(`/admin/sources/${id}/test`);
      setMessage(`Test OK: ${res.count} items. Sample: ${res.sampleTitles.join(' · ')}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Test failed');
    }
  }

  async function fetchNow(id: string) {
    try {
      const res = await api.post<{ discovered: number }>(`/admin/sources/${id}/fetch`);
      setMessage(`Fetched. Discovered ${res.discovered}`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Fetch failed');
    }
  }

  async function remove(id: string) {
    await api.delete(`/admin/sources/${id}`);
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">RSS Sources</h1>
        <p className="text-sm text-ink-400">Source trust informs ranking, never absolute truth.</p>
      </div>

      <form onSubmit={onCreate} className="grid gap-3 rounded-xl border border-ink-800 bg-ink-900 p-4 md:grid-cols-2">
        <input
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          placeholder="Site URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          required
        />
        <input
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm md:col-span-2"
          placeholder="Feed URL"
          value={form.feedUrl}
          onChange={(e) => setForm({ ...form, feedUrl: e.target.value })}
          required
        />
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white md:col-span-2">
          Add source
        </button>
      </form>

      {message && <p className="text-sm text-ink-300">{message}</p>}

      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-ink-900 text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Reliability</th>
              <th className="px-4 py-3">Last fetch</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Found</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id} className="border-t border-ink-800">
                <td className="px-4 py-3">
                  <p className="text-ink-100">{s.name}</p>
                  <p className="text-xs text-ink-400">{s.feedUrl}</p>
                </td>
                <td className="px-4 py-3">{'★'.repeat(s.reliabilityScore || 1)}</td>
                <td className="px-4 py-3 text-ink-400">{relativeTime(s.lastFetchedAt) || 'Never'}</td>
                <td className="px-4 py-3">
                  {s.enabled ? s.lastFetchStatus || 'enabled' : 'disabled'}
                </td>
                <td className="px-4 py-3">{s.articlesFound || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button type="button" onClick={() => test(s._id)} className="text-accent">
                      Test
                    </button>
                    <button type="button" onClick={() => fetchNow(s._id)} className="text-accent">
                      Fetch
                    </button>
                    <button type="button" onClick={() => toggle(s._id, s.enabled)} className="text-ink-300">
                      {s.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button type="button" onClick={() => remove(s._id)} className="text-critical">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
