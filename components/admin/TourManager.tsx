'use client';

import { useEffect, useState, useCallback } from 'react';

interface TourSummary {
  id: string;
  title: string;
  is_live: boolean;
  access_level: 'public' | 'private';
  custom_domain?: string | null;
  streetview_status?: string;
  max_resolution?: number;
  guide_enabled?: boolean;
  auto_rotate?: boolean;
  updated_at?: string;
}
interface Member {
  id: string;
  email?: string;
  role: string;
  status: string;
}
interface Comment {
  id: string;
  body: string;
  author_name?: string;
  created_at?: string;
}
interface Task {
  id: string;
  title: string;
  done: boolean;
}

export default function TourManager() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<TourSummary | null>(null);
  const [tab, setTab] = useState<'tours' | 'team' | 'collab' | 'guided' | 'publish'>('tours');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const loadTours = useCallback(async () => {
    const res = await fetch('/api/tours');
    const { tours } = await res.json();
    setTours(tours || []);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('viztr_active_tour') : '';
    if (stored && (tours || []).some((t: TourSummary) => t.id === stored)) {
      setActiveId(stored);
      setActive((tours || []).find((t: TourSummary) => t.id === stored) || null);
    } else if ((tours || []).length) {
      setActiveId(tours[0].id);
      setActive(tours[0]);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  const setActiveTour = (t: TourSummary) => {
    setActiveId(t.id);
    setActive(t);
    localStorage.setItem('viztr_active_tour', t.id);
    setMsg(`Active tour: ${t.title}`);
  };

  const createTour = async () => {
    setBusy(true);
    const res = await fetch('/api/tours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Tour ${tours.length + 1}` }),
    });
    setBusy(false);
    if (res.ok) {
      const { tour } = await res.json();
      setActiveTour(tour);
      loadTours();
    }
  };

  const duplicateTour = async (id: string) => {
    setBusy(true);
    await fetch('/api/tours', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'duplicate' }),
    });
    setBusy(false);
    loadTours();
  };

  const deleteTour = async (id: string) => {
    if (!confirm('Delete this tour? This cannot be undone.')) return;
    await fetch(`/api/tours?id=${id}`, { method: 'DELETE' });
    loadTours();
  };

  const patchMeta = async (patch: any) => {
    if (!activeId) return;
    setBusy(true);
    await fetch(`/api/tours?id=${activeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    loadTours();
  };

  return (
    <div className="rounded-2xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#3ECF8E]">Tour Manager</h3>
        <button
          onClick={createTour}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
        >
          + New Tour
        </button>
      </div>

      {/* Tour list */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {(tours || []).length === 0 && (
          <div className="text-[10px] font-mono text-[#71717A]">No tours yet — create one (needs Supabase configured).</div>
        )}
        {(tours || []).map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between rounded-lg px-2 py-1.5 border ${
              activeId === t.id ? 'border-[#3ECF8E]/40 bg-[#18181B]' : 'border-transparent hover:bg-[#18181B]'
            }`}
          >
            <button onClick={() => setActiveTour(t)} className="flex-1 text-left">
              <div className="text-xs text-white font-mono">{t.title}</div>
              <div className="text-[9px] font-mono text-[#71717A]">
                {t.is_live ? 'LIVE' : 'offline'} · {t.access_level}
                {t.custom_domain ? ` · ${t.custom_domain}` : ''}
              </div>
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => duplicateTour(t.id)} className="text-[10px] font-mono text-[#A1A1AA] hover:text-white px-1">dup</button>
              <button onClick={() => deleteTour(t.id)} className="text-[10px] font-mono text-rose-400 hover:text-rose-300 px-1">del</button>
            </div>
          </div>
        ))}
      </div>

      {msg && <div className="text-[10px] font-mono text-[#3ECF8E]">{msg}</div>}

      {active && (
        <div className="border-t border-[#27272A] pt-3">
          <div className="flex gap-1 mb-3">
            {(['tours', 'team', 'collab', 'guided', 'publish'] as const).map((tb) => (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                className={`px-2 py-1 rounded text-[10px] font-mono ${
                  tab === tb ? 'bg-[#3ECF8E] text-black' : 'bg-[#18181B] text-[#A1A1AA]'
                }`}
              >
                {tb}
              </button>
            ))}
          </div>
          {tab === 'tours' && <TourMeta active={active} onPatch={patchMeta} busy={busy} />}
          {tab === 'team' && <TeamTab tourId={active.id} />}
          {tab === 'collab' && <CollabTab tourId={active.id} />}
          {tab === 'guided' && <GuidedTab tourId={active.id} />}
          {tab === 'publish' && <PublishTab active={active} onPatch={patchMeta} busy={busy} />}
        </div>
      )}
    </div>
  );
}

function TourMeta({ active, onPatch, busy }: { active: TourSummary; onPatch: (p: any) => void; busy: boolean }) {
  return (
    <div className="space-y-2">
      <input
        defaultValue={active.title}
        onBlur={(e) => onPatch({ title: e.target.value })}
        className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
        placeholder="Tour title"
      />
      <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
        <input type="checkbox" defaultChecked={active.is_live} onChange={(e) => onPatch({ is_live: e.target.checked })} />
        Live
      </label>
      <select
        defaultValue={active.access_level}
        onChange={(e) => onPatch({ access_level: e.target.value })}
        className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
      <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
        <input type="checkbox" defaultChecked={active.auto_rotate} onChange={(e) => onPatch({ auto_rotate: e.target.checked })} />
        Auto-rotate viewer
      </label>
      <label className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
        <input type="checkbox" defaultChecked={active.guide_enabled} onChange={(e) => onPatch({ guide_enabled: e.target.checked })} />
        Guided tour enabled
      </label>
    </div>
  );
}

function PublishTab({ active, onPatch, busy }: { active: TourSummary; onPatch: (p: any) => void; busy: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-mono text-[#A1A1AA]">Custom domain</label>
      <input
        defaultValue={active.custom_domain || ''}
        onBlur={(e) => onPatch({ custom_domain: e.target.value })}
        placeholder="tour.yourdomain.com"
        className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
      />
      <label className="block text-[10px] font-mono text-[#A1A1AA]">Max resolution (px)</label>
      <select
        defaultValue={active.max_resolution || 8192}
        onChange={(e) => onPatch({ max_resolution: Number(e.target.value) })}
        className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
      >
        <option value="4096">4096</option>
        <option value="8192">8192</option>
        <option value="16384">16384 (16K)</option>
        <option value="32768">32768 (32K)</option>
      </select>
      <label className="block text-[10px] font-mono text-[#A1A1AA]">Google Street View target</label>
      <input
        defaultValue={active.streetview_status === 'synced' ? '' : ''}
        onBlur={(e) => onPatch({ streetview_target: e.target.value, streetview_status: e.target.value ? 'pending' : 'unsynced' })}
        placeholder="Street View publish target id"
        className="w-full bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
      />
      <div className="text-[10px] font-mono text-[#71717A]">Street View status: {active.streetview_status || 'unsynced'}</div>
    </div>
  );
}

function TeamTab({ tourId }: { tourId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/tour/collab?tourId=${tourId}&type=members`);
    const { data } = await res.json();
    setMembers(data || []);
  };
  useEffect(() => {
    load();
  }, [tourId]);

  const invite = async () => {
    if (!email) return;
    setBusy(true);
    await fetch('/api/tour/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, type: 'members', email, role }),
    });
    setBusy(false);
    setEmail('');
    load();
  };

  const changeRole = async (memberId: string, r: string) => {
    await fetch('/api/tour/collab', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, type: 'members', op: 'setRole', memberId, role: r }),
    });
    load();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="member@email.com"
          className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
        />
        <select value={role} onChange={(e) => setRole} className="bg-[#18181B] border border-[#27272A] rounded px-1 text-xs text-white">
          <option value="viewer">viewer</option>
          <option value="editor">editor</option>
          <option value="owner">owner</option>
        </select>
        <button onClick={invite} disabled={busy} className="px-2 py-1 rounded bg-[#3ECF8E] text-black text-xs font-mono">invite</button>
      </div>
      {(members || []).map((m) => (
        <div key={m.id} className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
          <span>{m.email || '(pending)'}</span>
          <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} className="bg-[#18181B] border border-[#27272A] rounded px-1">
            <option value="viewer">viewer</option>
            <option value="editor">editor</option>
            <option value="owner">owner</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function CollabTab({ tourId }: { tourId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comment, setComment] = useState('');
  const [task, setTask] = useState('');

  const load = async () => {
    const c = await fetch(`/api/tour/collab?tourId=${tourId}&type=comments`).then((r) => r.json());
    const t = await fetch(`/api/tour/collab?tourId=${tourId}&type=tasks`).then((r) => r.json());
    setComments(c.data || []);
    setTasks(t.data || []);
  };
  useEffect(() => {
    load();
  }, [tourId]);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] font-mono text-[#71717A] mb-1">Comments</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {(comments || []).map((c) => (
            <div key={c.id} className="text-[10px] font-mono text-[#A1A1AA] bg-[#18181B] rounded p-1">
              <span className="text-[#3ECF8E]">{c.author_name || 'Guest'}: </span>
              {c.body}
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comment"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
          <button
            onClick={async () => {
              if (!comment) return;
              await fetch('/api/tour/collab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tourId, type: 'comments', body: comment }),
              });
              setComment('');
              load();
            }}
            className="px-2 py-1 rounded bg-[#3ECF8E] text-black text-xs font-mono"
          >
            post
          </button>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono text-[#71717A] mb-1">Tasks</div>
        {(tasks || []).map((t) => (
          <label key={t.id} className="flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA]">
            <input
              type="checkbox"
              defaultChecked={t.done}
              onChange={async (e) =>
                fetch('/api/tour/collab', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tourId, type: 'tasks', op: 'toggle', taskId: t.id, done: e.target.checked }),
                })
              }
            />
            {t.title}
          </label>
        ))}
        <div className="flex gap-1 mt-1">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="New task"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
          <button
            onClick={async () => {
              if (!task) return;
              await fetch('/api/tour/collab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tourId, type: 'tasks', title: task }),
              });
              setTask('');
              load();
            }}
            className="px-2 py-1 rounded bg-[#3ECF8E] text-black text-xs font-mono"
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
}

function GuidedTab({ tourId }: { tourId: string }) {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [waypoints, setWaypoints] = useState<{ room_id: string; position: number; dwell_seconds: number }[]>([]);

  useEffect(() => {
    fetch('/api/tour')
      .then((r) => r.json())
      .then((d) => setRooms((d.rooms || []).map((r: any) => ({ id: r.id, name: r.name }))));
    fetch(`/api/tour/collab?tourId=${tourId}&type=waypoints`)
      .then((r) => r.json())
      .then((d) => setWaypoints(d.data || []));
  }, [tourId]);

  const addWp = () => {
    setWaypoints((w) => [...w, { room_id: rooms[0]?.id || '', position: w.length, dwell_seconds: 8 }]);
  };
  const save = async () => {
    await fetch('/api/tour/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, type: 'waypoints', waypoints }),
    });
  };

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono text-[#71717A]">Ordered scenes for auto-play guided tour</div>
      {(waypoints || []).map((w, i) => (
        <div key={i} className="flex items-center gap-1 text-[10px] font-mono">
          <span className="text-[#71717A] w-5">#{i + 1}</span>
          <select
            value={w.room_id}
            onChange={(e) => setWaypoints((arr) => arr.map((x, j) => (j === i ? { ...x, room_id: e.target.value } : x)))}
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-1 py-0.5 text-white"
          >
            {(rooms || []).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={w.dwell_seconds}
            onChange={(e) => setWaypoints((arr) => arr.map((x, j) => (j === i ? { ...x, dwell_seconds: Number(e.target.value) } : x)))}
            className="w-14 bg-[#18181B] border border-[#27272A] rounded px-1 py-0.5 text-white"
            title="dwell seconds"
          />
        </div>
      ))}
      <div className="flex gap-1">
        <button onClick={addWp} className="px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-[#3ECF8E] text-xs font-mono">+ waypoint</button>
        <button onClick={save} className="px-2 py-1 rounded bg-[#3ECF8E] text-black text-xs font-mono">save sequence</button>
      </div>
    </div>
  );
}
