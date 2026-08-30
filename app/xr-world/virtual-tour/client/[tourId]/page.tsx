'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { MessageSquare, Send } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  subtitle: string;
  panoramaUrl: string;
  thumbnailUrl: string;
}
interface Comment {
  id: string;
  body: string;
  author_name?: string;
  created_at?: string;
}

export default function ClientSharePage() {
  const params = useParams();
  const tourId = Array.isArray(params.tourId) ? params.tourId[0] : params.tourId;
  const { openPanorama } = useAppStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!tourId) return;
    fetch(`/api/tour?tour=${tourId}`)
      .then((r) => r.json())
      .then((d) => setRooms(d.rooms || []));
    fetch(`/api/tour/collab?tourId=${tourId}&type=comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.data || []));
  }, [tourId]);

  const post = async () => {
    if (!comment || !tourId) return;
    await fetch('/api/tour/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, type: 'comments', body: comment, authorName: 'Client' }),
    });
    setComment('');
    const { data } = await fetch(`/api/tour/collab?tourId=${tourId}&type=comments`).then((r) => r.json());
    setComments(data || []);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex">
      <div className="flex-1 p-6">
        <div className="text-sm font-mono font-bold text-[#3ECF8E] mb-4">Shared Virtual Tour</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(rooms || []).map((r) => (
            <button
              key={r.id}
              onClick={() => openPanorama(r.panoramaUrl, r.name)}
              className="rounded-xl overflow-hidden border border-[#27272A] hover:border-[#3ECF8E]/40 text-left"
            >
              <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${r.panoramaUrl})` }} />
              <div className="px-2 py-1.5">
                <div className="text-xs font-mono text-white">{r.name}</div>
                <div className="text-[10px] font-mono text-[#71717A]">{r.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <aside className="w-80 shrink-0 border-l border-[#27272A] p-4 overflow-y-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-[#3ECF8E] mb-3">
          <MessageSquare className="w-4 h-4" /> Client Comments
        </div>
        <div className="space-y-2 mb-3">
          {(comments || []).map((c) => (
            <div key={c.id} className="text-[10px] font-mono text-[#A1A1AA] bg-[#18181B] rounded p-2">
              <span className="text-[#3ECF8E]">{c.author_name || 'Client'}: </span>
              {c.body}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
          />
          <button onClick={post} className="px-2 py-1 rounded bg-[#3ECF8E] text-black text-xs font-mono">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </div>
  );
}
