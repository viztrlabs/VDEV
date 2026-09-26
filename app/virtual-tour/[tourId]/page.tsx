'use client';

/**
 * /virtual-tour/[tourId] — Public viewer page.
 * Isolated: only mounts TourViewer, no editor, no global state.
 * Uses ?public=1 (enforces the live check + reserved slug gate server-side);
 * if the tour is not found/not live, shows "Tour Not Found" — never seeds.
 *
 * FABRICATION-FREE viewer: scenes, start room (featured ?? first), and links all
 * come from the authored tour via the canonical manifest (lib/tourManifest).
 * No fallback links are ever generated; info/metadata/media hotspots open typed
 * popups; link hotspots open their external URL.
 */
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Eye, Compass, MessageSquare, Send, ExternalLink, Layers } from 'lucide-react';
import type { AlignmentMarker, SpatialAlignment } from '@/lib/3d/bridge/types';
import { buildTourManifest, manifestSceneToTourScene } from '@/lib/tourManifest';
import type { ManifestHotspot } from '@/lib/tourManifest';

const TourViewer = dynamic(() => import('@/components/xr/TourViewer'), { ssr: false });
const SceneGalaxy = dynamic(() => import('@/components/xr/SceneGalaxy'), { ssr: false });

interface Room {
  id: string;
  name: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialYaw?: number;
  initialPitch?: number;
  featured?: boolean;
  spatialAlignment?: SpatialAlignment;
  alignmentMarkers?: AlignmentMarker[];
  defaultHotspots?: Array<Record<string, unknown> & { id: string }>;
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
  const [showMap, setShowMap] = useState(false);
  const [popup, setPopup] = useState<ManifestHotspot | null>(null);

  useEffect(() => {
    if (!tourId) return;
    fetch(`/api/tour?tour=${encodeURIComponent(tourId)}&public=1`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((d) => {
        const roomList = d.rooms || [];
        setRooms(roomList);
      })
      .catch(() => {
        setRooms([]);
      })
      .finally(() => setLoading(false));
    fetch(`/api/tour/collab?tourId=${tourId}&type=comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.data || []));
  }, [tourId]);

  const manifest = useMemo(() => buildTourManifest(rooms as any), [rooms]);
  const startSceneId = useMemo(
    () => manifest.featuredId ?? manifest.scenes[0]?.id ?? null,
    [manifest],
  );

  useEffect(() => {
    if (!startSceneId) {
      setCurrentRoom(null);
      return;
    }
    setCurrentRoom((prev) => {
      if (prev && prev.id === startSceneId) return prev;
      return rooms.find((r) => r.id === startSceneId) ?? null;
    });
  }, [startSceneId, rooms]);

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

  const tourScene = useMemo(() => {
    if (!currentRoom) return null;
    return manifestSceneToTourScene(currentRoom as any, manifest);
  }, [currentRoom, manifest]);

  const handleHotspotClick = useCallback(
    (sceneId: string, hotspotId: string) => {
      const sc = manifest.scenes.find((s) => s.id === sceneId);
      const hs = sc?.hotspots.find((h) => h.id === hotspotId);
      if (!hs) return;
      if (hs.kind === 'nav' && hs.targetRoomId) {
        const target = rooms.find((r) => r.id === hs.targetRoomId);
        if (target) setCurrentRoom(target);
        setPopup(null);
        return;
      }
      if (hs.kind === 'link' && hs.externalUrl) {
        window.open(hs.externalUrl, hs.openMode === 'same_tab' ? '_self' : '_blank', 'noopener,noreferrer');
        return;
      }
      setPopup(hs); // info / metadata / media
    },
    [manifest, rooms],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-xs font-mono text-[#3ECF8E] animate-pulse">Loading tour…</div>
      </div>
    );
  }

  if (!currentRoom || !tourScene) {
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

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#09090B]/90 backdrop-blur-sm z-20 shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 text-[#3ECF8E]" />
          <span className="text-xs font-mono font-bold text-white truncate">{currentRoom.name}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          {/* Labeled scene strip */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setCurrentRoom(r)}
                className={`flex flex-col items-center gap-1 w-20 shrink-0 rounded border p-1 transition-all ${
                  r.id === currentRoom.id ? 'border-[#3ECF8E]' : 'border-[#27272A] hover:border-[#3F3F46]'
                }`}
                aria-label={`Switch to ${r.name}`}
              >
                <span
                  className="w-14 h-10 rounded bg-cover bg-center border border-[#27272A]"
                  style={{ backgroundImage: `url(${r.thumbnailUrl || r.panoramaUrl})` }}
                />
                <span className="w-full truncate text-center text-[9px] font-mono text-[#A1A1AA]">{r.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowMap((v) => !v)}
            className="p-1.5 rounded bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
            aria-label="Open tour map (galaxy)"
            title="Tour map"
          >
            <Layers className="w-4 h-4" />
          </button>
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
        <div className="flex-1 min-h-0 relative">
          <TourViewer scene={tourScene} onHotspotClick={handleHotspotClick} />

          {/* Typed hotspot popups (info / metadata / media) */}
          {popup && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,420px)] bg-[#09090B]/95 backdrop-blur rounded-xl border border-[#27272A] shadow-2xl overflow-hidden max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#27272A]">
                <div className="text-xs font-mono font-bold text-white truncate">{popup.title}</div>
                <button onClick={() => setPopup(null)} className="text-[#71717A] hover:text-white text-xs px-1" aria-label="Close popup">
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-3">
                {popup.description && (
                  <p className="text-xs text-[#A1A1AA] whitespace-pre-wrap">{popup.description}</p>
                )}
                {!!popup.images?.length && (
                  <div className={`grid gap-2 ${popup.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {popup.images.map((src, i) => (
                      <button
                        key={src + i}
                        onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
                        className="block aspect-video w-full rounded-lg overflow-hidden border border-[#27272A]"
                        aria-label={`Open photo ${i + 1} in new tab`}
                      >
                        <img
                          src={src}
                          alt={`${popup.title} photo ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                )}
                {popup.externalUrl && (
                  <a
                    href={popup.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ECF8E] text-black text-xs font-mono font-bold"
                  >
                    {popup.type === 'link' ? 'Open Link' : 'Learn more'} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Galaxy map */}
          <SceneGalaxy
            open={showMap}
            scenes={manifest.scenes}
            links={manifest.links}
            currentId={currentRoom?.id ?? null}
            onSelect={(id) => {
              const r = rooms.find((x) => x.id === id);
              if (r) setCurrentRoom(r);
            }}
            onClose={() => setShowMap(false)}
            title="Tour map"
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