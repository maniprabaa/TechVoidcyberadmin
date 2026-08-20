'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const empty = {
  title: '',
  subtitle: '',
  excerpt: '',
  content: '',
  category: 'Threat Intelligence',
  severity: 'info',
  tags: '',
  cveIds: '',
  mitigation: '',
  securityDetails: '',
  seoTitle: '',
  seoDescription: '',
  isBreaking: false,
  isFeatured: false,
  status: 'draft',
  sourceName: '',
  sourceTitle: '',
  sourceUrl: '',
};

export default function ArticleEditorPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'new';
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    if (isNew) return;
    api
      .get<{
        article: {
          title: string;
          subtitle?: string;
          excerpt?: string;
          content: string;
          category: string;
          severity?: string;
          tags?: string[];
          cveIds?: string[];
          mitigation?: string;
          securityDetails?: string;
          seoTitle?: string;
          seoDescription?: string;
          isBreaking?: boolean;
          isFeatured?: boolean;
          status?: string;
          sources?: Array<{ name: string; title: string; url: string }>;
        };
      }>(`/admin/articles/${params.id}`)
      .then(({ article }) => {
        setForm({
          title: article.title,
          subtitle: article.subtitle || '',
          excerpt: article.excerpt || '',
          content: article.content,
          category: article.category,
          severity: article.severity || 'info',
          tags: (article.tags || []).join(', '),
          cveIds: (article.cveIds || []).join(', '),
          mitigation: article.mitigation || '',
          securityDetails: article.securityDetails || '',
          seoTitle: article.seoTitle || '',
          seoDescription: article.seoDescription || '',
          isBreaking: Boolean(article.isBreaking),
          isFeatured: Boolean(article.isFeatured),
          status: article.status || 'draft',
          sourceName: article.sources?.[0]?.name || '',
          sourceTitle: article.sources?.[0]?.title || '',
          sourceUrl: article.sources?.[0]?.url || '',
        });
      })
      .catch((err) => setMessage(err.message));
  }, [isNew, params.id, router]);

  function setField<K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(publish = false) {
    setLoading(true);
    setMessage('');
    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      severity: form.severity as 'critical' | 'high' | 'medium' | 'low' | 'info',
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      cveIds: form.cveIds
        .split(',')
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean),
      mitigation: form.mitigation,
      securityDetails: form.securityDetails,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      isBreaking: form.isBreaking,
      isFeatured: form.isFeatured,
      status: form.status,
      sources: form.sourceUrl
        ? [
            {
              name: form.sourceName || 'Source',
              title: form.sourceTitle || form.title,
              url: form.sourceUrl,
            },
          ]
        : [],
    };

    try {
      let id = params.id;
      if (isNew) {
        const created = await api.post<{ article: { _id: string } }>('/admin/articles', payload);
        id = created.article._id;
      } else {
        await api.put(`/admin/articles/${params.id}`, payload);
      }
      if (publish) {
        await api.post(`/admin/articles/${id}/publish`);
      }
      setMessage(publish ? 'Published' : 'Saved');
      router.push(`/articles/${id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-white">{isNew ? 'New article' : 'Edit article'}</h1>
        <input
          className="h-12 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-lg outline-none focus:border-accent"
          placeholder="Headline"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          required
        />
        <input
          className="h-11 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 outline-none focus:border-accent"
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={(e) => setField('subtitle', e.target.value)}
        />
        <textarea
          className="min-h-[120px] w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-3 outline-none focus:border-accent"
          placeholder="Excerpt"
          value={form.excerpt}
          onChange={(e) => setField('excerpt', e.target.value)}
        />
        <textarea
          className="min-h-[420px] w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-3 font-mono text-sm outline-none focus:border-accent"
          placeholder="Article content"
          value={form.content}
          onChange={(e) => setField('content', e.target.value)}
          required
        />
      </div>

      <aside className="space-y-4 rounded-xl border border-ink-800 bg-ink-900 p-4">
        <label className="block text-xs uppercase tracking-wider text-ink-400">Category</label>
        <input
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.category}
          onChange={(e) => setField('category', e.target.value)}
        />
        <label className="block text-xs uppercase tracking-wider text-ink-400">Severity</label>
        <select
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.severity}
          onChange={(e) => setField('severity', e.target.value)}
        >
          {['critical', 'high', 'medium', 'low', 'info'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="block text-xs uppercase tracking-wider text-ink-400">CVE IDs</label>
        <input
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.cveIds}
          onChange={(e) => setField('cveIds', e.target.value)}
          placeholder="CVE-2026-12345"
        />
        <label className="block text-xs uppercase tracking-wider text-ink-400">Tags</label>
        <input
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.tags}
          onChange={(e) => setField('tags', e.target.value)}
        />
        <label className="block text-xs uppercase tracking-wider text-ink-400">Source name</label>
        <input
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.sourceName}
          onChange={(e) => setField('sourceName', e.target.value)}
        />
        <label className="block text-xs uppercase tracking-wider text-ink-400">Source title</label>
        <input
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.sourceTitle}
          onChange={(e) => setField('sourceTitle', e.target.value)}
        />
        <label className="block text-xs uppercase tracking-wider text-ink-400">Source URL</label>
        <input
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.sourceUrl}
          onChange={(e) => setField('sourceUrl', e.target.value)}
        />
        <label className="block text-xs uppercase tracking-wider text-ink-400">SEO title</label>
        <input
          className="h-10 w-full rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.seoTitle}
          onChange={(e) => setField('seoTitle', e.target.value)}
        />
        <label className="block text-xs uppercase tracking-wider text-ink-400">SEO description</label>
        <textarea
          className="min-h-[80px] w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm"
          value={form.seoDescription}
          onChange={(e) => setField('seoDescription', e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input
            type="checkbox"
            checked={form.isBreaking}
            onChange={(e) => setField('isBreaking', e.target.checked)}
          />
          Breaking
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setField('isFeatured', e.target.checked)}
          />
          Featured
        </label>
        {message && <p className="text-sm text-ink-300">{message}</p>}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => save(false)}
            className="rounded-lg border border-ink-600 px-4 py-2 text-sm hover:border-accent"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => save(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Publish
          </button>
        </div>
      </aside>
    </div>
  );
}
