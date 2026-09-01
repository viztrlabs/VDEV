'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Compass, Loader2, X } from 'lucide-react';
import type { VtedGoogleMap, VtedMapType } from '@/lib/vted-types';
import type { TourRoom } from '@/data/tour-config';

interface MapManagerProps {
  rooms: TourRoom[];
  onUpdateRoom: (roomId: string, lat: number, lng: number) => void;
  display: VtedGoogleMap;
  onChangeDisplay: (next: VtedGoogleMap) => void;
  onSave: () => void;
  saved: boolean;
}

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // NYC
const DEFAULT_ZOOM = 11;

export default function MapManager({
  rooms,
  onUpdateRoom,
  display,
  onChangeDisplay,
  onSave,
  saved,
}: MapManagerProps) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build tile URL for OpenStreetMap (or satellite proxy)
  const tileUrl = (x: number, y: number) => {
    if (display.mapType === 'satellite') {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
    }
    if (display.mapType === 'terrain') {
      return `https://tile.opentopomap.org/${zoom}/${x}/${y}.png`;
    }
    return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
  };

  // Convert lat/lng to tile coords
  const latLngToTile = (lat: number, lng: number) => {
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom));
    return { x, y };
  };

  const tileToLatLng = (x: number, y: number) => {
    const n = Math.pow(2, zoom);
    const lng = (x / n) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
    const lat = (latRad * 180) / Math.PI;
    return { lat, lng };
  };

  // Pick scene pins
  const sceneMarkers = rooms
    .map((r) => {
      const lat = (r as any).lat;
      const lng = (r as any).lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return null;
      return { id: r.id, name: r.name, lat, lng };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!picking || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Approximate: assume tile size 256, center tile at container center
    const TILE = 256;
    const centerTile = latLngToTile(center.lat, center.lng);
    const tileX = centerTile.x + Math.floor((x - rect.width / 2) / TILE);
    const tileY = centerTile.y + Math.floor((y - rect.height / 2) / TILE);
    const latLng = tileToLatLng(tileX, tileY);
    onUpdateRoom(picking, latLng.lat, latLng.lng);
    setPicking(null);
  };

  const set = (patch: Partial<VtedGoogleMap>) => {
    onChangeDisplay({ ...(display || defaultMap()), ...patch });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Google Map & Scene Locations
        </h2>
        {picking && (
          <span className="text-[10px] font-mono text-amber-400 animate-pulse">
            Click on the map to set location for: {rooms.find((r) => r.id === picking)?.name}
          </span>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono rounded">
          {error}
        </div>
      )}

      {/* Picking list */}
      <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
          Scene locations ({sceneMarkers.length} of {rooms.length} set)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
          {rooms.map((r) => {
            const lat = (r as any).lat;
            const lng = (r as any).lng;
            const has = typeof lat === 'number';
            const isPicking = picking === r.id;
            return (
              <div
                key={r.id}
                className={`flex items-center gap-2 p-1.5 rounded border ${
                  isPicking
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-[#09090B] border-[#27272A]'
                }`}
              >
                <span className="text-[10px] font-mono text-white truncate flex-1">{r.name}</span>
                {has ? (
                  <span className="text-[9px] font-mono text-[#3ECF8E]">
                    {lat.toFixed(3)}, {lng.toFixed(3)}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-[#71717A]">not set</span>
                )}
                <button
                  type="button"
                  onClick={() => setPicking(isPicking ? null : r.id)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                    isPicking
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#27272A] text-white hover:bg-[#3f3f46]'
                  }`}
                >
                  {isPicking ? 'Cancel' : 'Set'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map display */}
      <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E]">
            Map Preview
          </div>
          <div className="flex items-center gap-1">
            <select
              value={display?.mapType || 'road'}
              onChange={(e) => set({ mapType: e.target.value as VtedMapType })}
              className="bg-[#09090B] border border-[#27272A] rounded px-1.5 py-0.5 text-[10px] font-mono text-white"
            >
              <option value="road">Road</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
            <input
              type="number"
              value={zoom}
              min={1}
              max={18}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-12 bg-[#09090B] border border-[#27272A] rounded px-1 py-0.5 text-[10px] font-mono text-white"
              title="Zoom"
            />
          </div>
        </div>

        <div
          ref={containerRef}
          onClick={handleMapClick}
          className={`relative w-full h-72 rounded overflow-hidden border border-[#27272A] bg-[#09090B] ${
            picking ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          <MapPreview
            center={center}
            zoom={zoom}
            mapType={display?.mapType || 'road'}
            tileUrl={tileUrl}
            onTileError={() => setError('Failed to load map tiles. Check your internet connection.')}
          />
          {/* Markers */}
          {sceneMarkers.map((m) => {
            const centerTile = latLngToTile(center.lat, center.lng);
            const mTile = latLngToTile(m.lat, m.lng);
            const dx = (mTile.x - centerTile.x) * 256;
            const dy = (mTile.y - centerTile.y) * 256;
            return (
              <div
                key={m.id}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `calc(50% + ${dx}px)`, top: `calc(50% + ${dy}px)` }}
                title={m.name}
              >
                <div className="w-5 h-5 rounded-full bg-[#3ECF8E] border-2 border-white shadow-[0_0_8px_rgba(62,207,142,0.5)] flex items-center justify-center text-white">
                  <MapPin className="w-3 h-3" />
                </div>
              </div>
            );
          })}
          {picking && (
            <div className="absolute inset-0 ring-2 ring-amber-500/40 pointer-events-none" />
          )}
        </div>
        <p className="text-[9px] font-mono text-[#71717A]">
          Tiles served from OpenStreetMap / ArcGIS / OpenTopoMap. Click a scene to pick its location.
        </p>
      </div>

      {/* Display settings */}
      <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-3 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#3ECF8E]">
          Map Display
        </div>
        <ToggleRow
          label="Map enabled"
          value={!!display?.enabled}
          onChange={(v) => set({ enabled: v })}
        />
        <ToggleRow
          label="Show on start"
          value={!!display?.showOnStart}
          onChange={(v) => set({ showOnStart: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Layout
            </label>
            <select
              value={display?.layout || 'box'}
              onChange={(e) => set({ layout: e.target.value as 'box' | 'panel' })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            >
              <option value="box">Box</option>
              <option value="panel">Panel</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
              Position
            </label>
            <select
              value={display?.position || 'left'}
              onChange={(e) => set({ position: e.target.value as 'left' | 'right' })}
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1 text-[11px] font-mono text-white"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
        >
          Save Map Settings
        </button>
      </div>
    </div>
  );
}

function defaultMap(): VtedGoogleMap {
  return {
    enabled: false,
    showOnStart: false,
    mapType: 'road',
    layout: 'box',
    position: 'left',
  };
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#09090B] border border-[#27272A]">
      <span className="text-[10px] font-mono text-[#FAFAFA]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full relative transition-colors ${
          value ? 'bg-[#3ECF8E]' : 'bg-[#27272A]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function MapPreview({
  center,
  zoom,
  mapType,
  tileUrl,
  onTileError,
}: {
  center: { lat: number; lng: number };
  zoom: number;
  mapType: VtedMapType;
  tileUrl: (x: number, y: number) => string;
  onTileError: () => void;
}) {
  const [tiles, setTiles] = useState<Array<{ x: number; y: number; url: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const TILE = 256;
    const centerTileX = Math.floor(((center.lng + 180) / 360) * Math.pow(2, zoom));
    const centerTileY = Math.floor(
      ((1 - Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom),
    );
    const newTiles: Array<{ x: number; y: number; url: string }> = [];
    // 3x2 grid
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = centerTileX + dx;
        const y = centerTileY + dy;
        if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
          newTiles.push({ x, y, url: tileUrl(x, y) });
        }
      }
    }
    setTiles(newTiles);
    setLoading(false);
  }, [center.lat, center.lng, zoom, mapType, tileUrl]);

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#09090B]/80 z-10">
          <Loader2 className="w-5 h-5 text-[#3ECF8E] animate-spin" />
        </div>
      )}
      {tiles.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-[#71717A]">
          No tiles at this zoom
        </div>
      )}
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}
      >
        {tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${t.x}-${t.y}`}
            src={t.url}
            alt=""
            onError={onTileError}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        ))}
      </div>
    </>
  );
}
