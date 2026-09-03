'use client';

/**
 * /virtual-tour/[tourId] — Public viewer page.
 * Isolated: only mounts TourViewer, no editor, no global state.
 * Fallback: if tour not found, show landing CTA.
 */
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Eye, Compass, MessageSquare, Send } from 'lucide-react';

const TourViewer = dynamic(() => import('@/components/xr/TourViewer'), { ssr: false });

interface Room {
  id: string;
  name: string;
  panoramaUrl: string;
  thumbnailUrl: string;
}
interface Comment {
  id: string;
  body: string;
  author_name?: string;
  created_at?: string;
}

export default function VirtualTourPublicPage() {
  const params = useParams();
  const tourId = Array.isArray(params.tourId) ? params.tourId[0] : params.tourId;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!tourId) return;
    fetch(`/api/tour?tour=${tourId}`)
      .then((r) => r.json())
      .then((d) => {
        const roomList = d.rooms || [];
        setRooms(roomList);
        if (roomList.length > 0) setCurrentRoom(roomList[0]);
      })
      .finally(() => setLoading(false));
    fetch(`/api/tour/collab?tourId=${tourId}&type=comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.data || []));
  }, [tourId]);

  const post = async () => {
    if (!comment || !tourId) return;
    await fetch('/api/tour/collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, type: 'comments', body: comment, authorName: 'Viewer' }),
    });
    setComment('');
    const { data } = await fetch(`/api/tour/collab?tourId=${tourId}&type=comments`).then((r) => r.json());
    setComments(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-xs font-mono text-[#3ECF8E] animate-pulse">Loading tour…</div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Compass className="w-10 h-10 text-[#3ECF8E]" />
        <h1 className="text-xl font-bold text-white">Tour Not Found</h1>
        <p className="text-sm text-[#71717A] max-w-md">
          This tour may not exist or has not been published yet.
        </p>
      </div>
    );
  }

  // Build TourScene from room for TourViewer
  const tourScene = {
    id: currentRoom.id,
    name: currentRoom.name,
    type: '360' as const,
    url: currentRoom.panoramaUrl,
    tileUrl: undefined,
    thumbnailUrl: currentRoom.thumbnailUrl,
    initialYaw: 0,
    initialPitch: 0,
    initialFov: 90,
    hotspots: rooms
      .filter((r) => r.id !== currentRoom.id)
      .map((r, i) => ({
        id: r.id,
        yaw: (i / (rooms.length - 1)) * Math.PI,
        pitch: 0,
        type: 'link' as const,
        targetSceneId: r.id,
        targetYaw: 0,
        title: r.name,
        description: '',
      })),
    viewConstraints: { top: -90, bottom: 90, left: -180, right: 180, zoomMin: 60, zoomMax: 120, mobileZoomEnabled: false },
    autorotateEnabled: true,
    autorotateSpeed: 0.5,
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#09090B]/90 backdrop-blur-sm z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#3ECF8E]" />
          <span className="text-xs font-mono font-bold text-white">{currentRoom.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Room switcher thumbnails */}
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setCurrentRoom(r)}
              className={`w-8 h-6 rounded border ${r.id === currentRoom.id ? 'border-[#3ECF8E]' : 'border-[#27272A]'} bg-cover bg-center transition-all`}
              style={{ backgroundImage: `url(${r.thumbnailUrl || r.panoramaUrl})` }}
              aria-label={`Switch to ${r.name}`}
            />
          ))}
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-1.5 rounded bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
            aria-label="Toggle comments"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Tour viewer */}
        <div className="flex-1 min-h-0">
          <TourViewer
            scene={tourScene}
            onHotspotClick={(sceneId, hotspotId) => {
              const target = rooms.find((r) => r.id === hotspotId);
              if (target) setCurrentRoom(target);
            }}
          />
        </div>

        {/* Comment sidebar */}
        {showChat && (
          <aside className="w-72 shrink-0 border-l border-[#27272A] bg-[#09090B] flex flex-col">
            <div className="p-3 border-b border-[#27272A] text-xs font-mono text-[#3ECF8E]">
              Comments ({comments.length})
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="text-[10px] font-mono text-[#A1A1AA] bg-[#18181B] rounded p-2">
                  <span className="text-[#3ECF8E]">{c.author_name || 'Viewer'}: </span>
                  {c.body}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#27272A] flex gap-1">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && post()}
                placeholder="Add a comment…"
                className="flex-1 bg-[#18181B] border border-[#27272A] rounded px-2 py-1 text-xs text-white"
              />
              <button onClick={post} className="px-2 py-1 rounded bg-[#3ECF8E] text-black text-xs">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}