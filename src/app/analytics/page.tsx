'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    metrics: { totalViews: number; published: number; articlesToday: number };
    charts: { articlesPerDay: Array<{ date: string; count: number }>; topStories: Array<{ title: string; views: number }> };
  } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    api
      .get<{
        metrics: { totalViews: number; published: number; articlesToday: number };
        charts: {
          articlesPerDay: Array<{ date: string; count: number }>;
          topStories: Array<{ title: string; views: number }>;
        };
      }>('/admin/dashboard')
      .then(setData)
      .catch(() => router.replace('/login'));
  }, [router]);

  if (!data) return <p className="text-ink-400">Loading analytics…</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white">Analytics</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
          <p className="text-xs uppercase text-ink-400">Total views</p>
          <p className="mt-2 text-3xl text-white">{data.metrics.totalViews}</p>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
          <p className="text-xs uppercase text-ink-400">Published</p>
          <p className="mt-2 text-3xl text-white">{data.metrics.published}</p>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
          <p className="text-xs uppercase text-ink-400">Articles today</p>
          <p className="mt-2 text-3xl text-white">{data.metrics.articlesToday}</p>
        </div>
      </div>
      <section className="rounded-xl border border-ink-800 bg-ink-900 p-5">
        <h2 className="text-sm text-white">Top stories</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {data.charts.topStories.map((s) => (
            <li key={s.title} className="flex justify-between gap-4">
              <span>{s.title}</span>
              <span className="text-ink-400">{s.views}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
