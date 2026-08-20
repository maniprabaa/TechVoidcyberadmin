'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Provider {
  _id: string;
  name: string;
  baseURL: string;
  apiKey: string;
  apiKeySet?: boolean;
  model: string;
  protocol?: 'openai' | 'anthropic';
  enabled: boolean;
  isDefault: boolean;
  priority: number;
  roles: string[];
  temperature?: number;
  maxTokens?: number;
  enableThinking?: boolean;
  notes?: string;
  lastTestStatus?: string;
  lastTestError?: string;
  lastTestedAt?: string;
}

const emptyForm = {
  name: '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: '',
  model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
  protocol: 'openai' as 'openai' | 'anthropic',
  enabled: true,
  isDefault: false,
  priority: 10,
  roles: ['all'] as string[],
  temperature: 0.2,
  maxTokens: 4096,
  enableThinking: false,
  notes: '',
};

export default function AiProvidersPage() {
  const router = useRouter();
  const [items, setItems] = useState<Provider[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await api.get<{ items: Provider[] }>('/admin/ai-providers');
    setItems(data.items);
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    load().catch((err) => setMessage(err.message));
  }, [router]);

  function startEdit(p: Provider) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      baseURL: p.baseURL,
      apiKey: '',
      model: p.model,
      protocol: p.protocol === 'anthropic' ? 'anthropic' : 'openai',
      enabled: p.enabled,
      isDefault: p.isDefault,
      priority: p.priority,
      roles: p.roles?.length ? p.roles : ['all'],
      temperature: p.temperature ?? 0.2,
      maxTokens: p.maxTokens ?? 4096,
      enableThinking: Boolean(p.enableThinking),
      notes: p.notes || '',
    });
  }

  function onProtocolChange(protocol: 'openai' | 'anthropic') {
    if (protocol === 'anthropic') {
      setForm((prev) => ({
        ...prev,
        protocol,
        baseURL: prev.baseURL.includes('anthropic.com')
          ? prev.baseURL
          : 'https://api.anthropic.com/v1/messages',
        model: prev.model.startsWith('claude') ? prev.model : 'claude-opus-4-20250514',
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      protocol,
      baseURL: prev.baseURL.includes('anthropic.com')
        ? 'https://integrate.api.nvidia.com/v1'
        : prev.baseURL,
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        apiKey: form.apiKey.trim() || undefined,
      };
      if (editingId) {
        await api.put(`/admin/ai-providers/${editingId}`, payload);
        setMessage('Provider updated');
      } else {
        if (!payload.apiKey) throw new Error('API key is required for new providers');
        await api.post('/admin/ai-providers', payload);
        setMessage('Provider added');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">AI Providers</h1>
        <p className="mt-1 text-sm text-ink-400">
          OpenAI-compatible agents (NVIDIA NIM, OpenAI, Groq) and native Anthropic Claude are both
          supported. Generation rotates and fails over across enabled providers.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-xl border border-ink-800 bg-ink-900 p-4 md:grid-cols-2"
      >
        <input
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          placeholder="Name (e.g. NVIDIA Nemotron / Claude)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.protocol}
          onChange={(e) => onProtocolChange(e.target.value as 'openai' | 'anthropic')}
        >
          <option value="openai">Protocol: OpenAI-compatible</option>
          <option value="anthropic">Protocol: Anthropic (Claude)</option>
        </select>
        <input
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          placeholder="Model id"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          required
        />
        <input
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          placeholder={
            form.protocol === 'anthropic'
              ? 'https://api.anthropic.com/v1/messages'
              : 'https://integrate.api.nvidia.com/v1'
          }
          value={form.baseURL}
          onChange={(e) => setForm({ ...form, baseURL: e.target.value })}
          required
        />
        <input
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm md:col-span-2"
          placeholder={editingId ? 'API key (leave blank to keep existing)' : 'API key'}
          value={form.apiKey}
          onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
          type="password"
          autoComplete="off"
        />
        <input
          type="number"
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          placeholder="Priority (1 = first)"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
        />
        <select
          className="h-10 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm"
          value={form.roles[0] || 'all'}
          onChange={(e) => setForm({ ...form, roles: [e.target.value] })}
        >
          <option value="all">Roles: all</option>
          <option value="generate">generate only</option>
          <option value="classify">classify only</option>
          <option value="analyze">analyze only</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          Enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          Default agent
        </label>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {editingId ? 'Update provider' : 'Add provider'}
          </button>
          {editingId && (
            <button
              type="button"
              className="rounded-lg border border-ink-600 px-4 py-2 text-sm"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {message && <p className="text-sm text-ink-300">{message}</p>}

      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-ink-900 text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Test</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-t border-ink-800 align-top">
                <td className="px-4 py-3">
                  <p className="text-ink-100">
                    {p.name} {p.isDefault ? <span className="text-accent">(default)</span> : null}
                  </p>
                  <p className="text-xs text-ink-400">
                    {p.protocol || 'openai'} · {p.baseURL}
                  </p>
                  <p className="text-xs text-ink-500">key {p.apiKey}</p>
                </td>
                <td className="px-4 py-3 text-ink-300">{p.model}</td>
                <td className="px-4 py-3">{p.priority}</td>
                <td className="px-4 py-3">
                  {p.enabled ? 'enabled' : 'disabled'} · {p.roles?.join(', ')}
                </td>
                <td className="px-4 py-3 text-xs">
                  <p>{p.lastTestStatus || 'never'}</p>
                  {p.lastTestError && <p className="text-critical">{p.lastTestError}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <button type="button" className="text-left text-accent" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-left text-accent"
                      onClick={() =>
                        api
                          .post(`/admin/ai-providers/${p._id}/test`)
                          .then((res) => {
                            setMessage(JSON.stringify(res));
                            return load();
                          })
                          .catch((e) => setMessage(e.message))
                      }
                    >
                      Test
                    </button>
                    {!p.isDefault && (
                      <button
                        type="button"
                        className="text-left text-ink-300"
                        onClick={() =>
                          api
                            .post(`/admin/ai-providers/${p._id}/default`)
                            .then(load)
                            .catch((e) => setMessage(e.message))
                        }
                      >
                        Make default
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-left text-critical"
                      onClick={() =>
                        api
                          .delete(`/admin/ai-providers/${p._id}`)
                          .then(load)
                          .catch((e) => setMessage(e.message))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-ink-400">
                  No providers yet. Add NVIDIA NIM, Claude, or any supported endpoint above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 text-sm text-ink-400">
          <p className="font-medium text-ink-200">NVIDIA / OpenAI-compatible</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-ink-950 p-3 text-xs text-ink-300">{`protocol: openai
baseURL:  https://integrate.api.nvidia.com/v1
model:    nvidia/nemotron-3.5-lightning-30b-a3b
apiKey:   nvapi-...`}</pre>
        </div>
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 text-sm text-ink-400">
          <p className="font-medium text-ink-200">Anthropic Claude (native)</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-ink-950 p-3 text-xs text-ink-300">{`protocol: anthropic
baseURL:  https://api.anthropic.com/v1/messages
model:    claude-opus-4-20250514
apiKey:   sk-ant-...`}</pre>
        </div>
      </section>
    </div>
  );
}
