'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { relativeTime } from '@/lib/utils';

interface Job {
  _id: string;
  storyTitle?: string;
  category?: string;
  sourceName?: string;
  status: string;
  createdAt?: string;
  error?: string;
  model?: string;
  providerName?: string;
  article?: { _id: string; title: string; slug: string; status: string };
}

export default function AdminGenerationPage() {
  const router = useRouter();
  const [items, setItems] = useState<Job[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const data = await api.get<{ items: Job[] }>('/admin/generation?limit=50');
    setItems(data.items);
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    load().catch((err) => setMessage(err.message));
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">AI Generation Queue</h1>
          <p className="text-sm text-ink-400">Default: review required before publish.</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white"
          onClick={() =>
            api
              .post('/admin/generation/process')
              .then((res) => {
                setMessage(JSON.stringify(res));
                return load();
              })
              .catch((e) => setMessage(e.message))
          }
        >
          Process queue
        </button>
      </div>
      {message && <p className="text-sm text-ink-300">{message}</p>}
      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-ink-900 text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">Story</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((j) => (
              <tr key={j._id} className="border-t border-ink-800 align-top">
                <td className="px-4 py-3">
                  <p>{j.storyTitle}</p>
                  <p className="text-xs text-ink-400">{j.category}</p>
                  {(j.providerName || j.model) && (
                    <p className="text-xs text-ink-500">
                      {j.providerName || 'AI'} · {j.model}
                    </p>
                  )}
                  {j.error && <p className="text-xs text-critical">{j.error}</p>}
                </td>
                <td className="px-4 py-3 text-ink-300">{j.sourceName}</td>
                <td className="px-4 py-3">{j.status}</td>
                <td className="px-4 py-3 text-ink-400">{relativeTime(j.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    {(j.status === 'failed' || j.status === 'generated') && (
                      <button
                        type="button"
                        className="text-left text-accent"
                        onClick={() =>
                          api.post(`/admin/generation/${j._id}/retry`).then(load).catch((e) => setMessage(e.message))
                        }
                      >
                        Regenerate
                      </button>
                    )}
                    {j.status === 'generated' && (
                      <button
                        type="button"
                        className="text-left text-accent"
                        onClick={() =>
                          api
                            .post(`/admin/generation/${j._id}/publish`)
                            .then(load)
                            .catch((e) => setMessage(e.message))
                        }
                      >
                        Publish
                      </button>
                    )}
                    {j.article && (
                      <a href={`/articles/${j.article._id}`} className="text-ink-300">
                        Review
                      </a>
                    )}
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
