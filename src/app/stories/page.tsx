'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { relativeTime } from '@/lib/utils';

interface Story {
  _id: string;
  title: string;
  sourceName?: string;
  category?: string;
  status: string;
  severity?: string;
  discoveredAt?: string;
  url: string;
}

interface Provider {
  _id: string;
  name: string;
  model: string;
  enabled: boolean;
  isDefault?: boolean;
}

export default function AdminStoriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Story[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [stories, ai] = await Promise.all([
      api.get<{ items: Story[] }>('/admin/stories?limit=50'),
      api.get<{ items: Provider[] }>('/admin/ai-providers'),
    ]);
    setItems(stories.items);
    const enabled = ai.items.filter((p) => p.enabled);
    setProviders(enabled);
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    load().catch((err) => setMessage(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function generate(id: string) {
    setMessage('Generating…');
    try {
      await api.post(`/admin/stories/${id}/generate`, providerId ? { providerId } : {});
      setMessage('Generation completed');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Generation failed');
    }
  }

  async function reject(id: string) {
    await api.patch(`/admin/stories/${id}`, {
      status: 'rejected',
      rejectionReason: 'Editorial reject',
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Stories</h1>
          <p className="text-sm text-ink-400">
            Auto mode rotates across all enabled agents and fails over if one hangs or errors.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-10 max-w-xs rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          >
            <option value="">Auto (multi-AI failover)</option>
            {providers.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} · {p.model}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-lg border border-ink-700 px-3 py-2 text-sm"
            onClick={() =>
              api
                .post('/admin/stories/classify')
                .then(() => load())
                .catch((e) => setMessage(e.message))
            }
          >
            Classify now
          </button>
          <button
            type="button"
            className="rounded-lg border border-ink-700 px-3 py-2 text-sm"
            onClick={() =>
              api
                .post('/admin/stories/cluster')
                .then(() => load())
                .catch((e) => setMessage(e.message))
            }
          >
            Cluster now
          </button>
        </div>
      </div>
      {message && <p className="text-sm text-ink-300">{message}</p>}
      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-ink-900 text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">Story</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Discovered</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id} className="border-t border-ink-800 align-top">
                <td className="px-4 py-3">
                  <p className="text-ink-100">{s.title}</p>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-accent">
                    Source link
                  </a>
                </td>
                <td className="px-4 py-3 text-ink-300">{s.sourceName}</td>
                <td className="px-4 py-3 text-ink-300">{s.status}</td>
                <td className="px-4 py-3 text-ink-400">{relativeTime(s.discoveredAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {s.status === 'review' && (
                      <button
                        type="button"
                        onClick={() => generate(s._id)}
                        className="text-left text-accent"
                      >
                        Generate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => reject(s._id)}
                      className="text-left text-ink-400"
                    >
                      Reject
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
