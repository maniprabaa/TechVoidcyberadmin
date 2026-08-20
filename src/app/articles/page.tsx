'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { relativeTime } from '@/lib/utils';

interface Article {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  severity?: string;
  publishedAt?: string;
  updatedAt?: string;
  isBreaking?: boolean;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Article[]>([]);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const qs = status ? `?status=${status}` : '';
    const data = await api.get<{ items: Article[] }>(`/admin/articles${qs}`);
    setItems(data.items);
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    void load().catch((err) => setMessage(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, status]);

  async function publish(id: string) {
    try {
      await api.post(`/admin/articles/${id}/publish`);
      setMessage('Published');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Publish failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Articles</h1>
          <p className="text-sm text-ink-400">Editorial review and publishing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-ink-600 px-4 py-2 text-sm text-ink-200"
            onClick={async () => {
              setMessage('Crawling source images…');
              try {
                const res = await api.post<{
                  scanned: number;
                  updated: number;
                  cleared?: number;
                }>('/admin/articles/backfill-images?limit=40&force=1');
                setMessage(
                  `Images updated: ${res.updated}/${res.scanned}${
                    res.cleared ? `, defaults cleared: ${res.cleared}` : ''
                  }`
                );
                await load();
              } catch (err) {
                setMessage(err instanceof Error ? err.message : 'Backfill failed');
              }
            }}
          >
            Crawl images
          </button>
          <Link
            href="/articles/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            New article
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {['', 'draft', 'review', 'scheduled', 'published', 'rejected'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1 text-xs ${
              status === s ? 'border-accent text-accent' : 'border-ink-700 text-ink-400'
            }`}
          >
            {s || 'all'}
          </button>
        ))}
      </div>
      {message && <p className="text-sm text-ink-300">{message}</p>}
      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink-900 text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id} className="border-t border-ink-800">
                <td className="px-4 py-3">
                  <Link href={`/articles/${a._id}`} className="text-ink-100 hover:text-accent">
                    {a.title}
                  </Link>
                  {a.isBreaking && <span className="ml-2 text-[10px] text-critical">BREAKING</span>}
                </td>
                <td className="px-4 py-3 text-ink-300">{a.status}</td>
                <td className="px-4 py-3 text-ink-300">{a.category}</td>
                <td className="px-4 py-3 text-ink-400">{relativeTime(a.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/articles/${a._id}`} className="text-accent">
                      Edit
                    </Link>
                    {a.status !== 'published' && (
                      <button type="button" onClick={() => publish(a._id)} className="text-ink-300">
                        Publish
                      </button>
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
