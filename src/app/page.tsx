'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  metrics: {
    articlesToday: number;
    storiesDiscovered: number;
    aiGenerations: number;
    published: number;
    pendingReview: number;
    criticalStories: number;
    totalViews: number;
  };
  charts: {
    articlesPerDay: Array<{ date: string; count: number }>;
    discoveryPerDay: Array<{ date: string; count: number }>;
    categoryDistribution: Array<{ _id: string; count: number }>;
    topStories: Array<{ _id: string; title: string; slug: string; views: number; category: string }>;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    api
      .get<DashboardData>('/admin/dashboard')
      .then(setData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load');
        if (String(err.message).includes('Authentication') || String(err.message).includes('Invalid client')) {
          router.replace('/login');
        }
      });
  }, [router]);

  if (error) return <p className="text-critical">{error}</p>;
  if (!data) return <p className="text-ink-400">Loading dashboard…</p>;

  const cards = [
    ['Articles Today', data.metrics.articlesToday],
    ['Stories Discovered', data.metrics.storiesDiscovered],
    ['AI Generations', data.metrics.aiGenerations],
    ['Published', data.metrics.published],
    ['Pending Review', data.metrics.pendingReview],
    ['Critical Stories', data.metrics.criticalStories],
    ['Total Views', data.metrics.totalViews],
  ] as const;

  const maxArticles = Math.max(1, ...data.charts.articlesPerDay.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-400">Newsroom operations and discovery health.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-ink-800 bg-ink-900 p-4">
            <p className="text-xs uppercase tracking-wider text-ink-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-ink-800 bg-ink-900 p-5">
          <h2 className="text-sm font-medium text-white">Articles per day</h2>
          <div className="mt-4 flex h-40 items-end gap-1">
            {data.charts.articlesPerDay.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-accent/80"
                  style={{ height: `${(d.count / maxArticles) * 100}%`, minHeight: d.count ? 4 : 0 }}
                  title={`${d.date}: ${d.count}`}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-ink-800 bg-ink-900 p-5">
          <h2 className="text-sm font-medium text-white">Category distribution</h2>
          <ul className="mt-4 space-y-2">
            {data.charts.categoryDistribution.map((c) => (
              <li key={c._id} className="flex items-center justify-between text-sm">
                <span className="text-ink-300">{c._id}</span>
                <span className="text-white">{c.count}</span>
              </li>
            ))}
            {!data.charts.categoryDistribution.length && (
              <li className="text-sm text-ink-400">No published categories yet.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-ink-800 bg-ink-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Top stories</h2>
          <Link href="/articles" className="text-xs text-accent">
            Manage articles
          </Link>
        </div>
        <ul className="space-y-3">
          {data.charts.topStories.map((s) => (
            <li key={s._id} className="flex items-center justify-between gap-4 text-sm">
              <div>
                <p className="text-ink-100">{s.title}</p>
                <p className="text-xs text-ink-400">{s.category}</p>
              </div>
              <span className="text-ink-300">{s.views} views</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
