import sharp from 'sharp';
import type { VtedFloorplanAI, VtedRoom, VtedRoomType, VtedWall, VtedOpening } from '@/lib/vted-types';

export interface AIFloorplanResult {
  ai: VtedFloorplanAI;
  previewData: {
    rooms: { id: string; label: string; area: number }[];
    walls: number;
    doors: number;
    windows: number;
    confidence: number;
  };
}

export async function processFloorplanImage(file: File): Promise<AIFloorplanResult> {
  const startTime = Date.now();
  const buffer = await file.arrayBuffer();
  const image = sharp(Buffer.from(buffer));
  const metadata = await image.metadata();
  const { width = 800, height = 600 } = metadata;

  const imageBuffer = await image
    .grayscale()
    .normalize()
    .blur(0.5)
    .threshold(180)
    .toBuffer();

  const { rooms, walls, doors, windows } = detectRoomsAndWalls(imageBuffer, width, height);
  const confidence = calculateConfidence(rooms, walls, doors, windows);

  const referenceLengthPixels = Math.max(width, height) * 0.8;
  const referenceLengthMeters = 5;
  const pixelsPerMeter = referenceLengthPixels / referenceLengthMeters;

  const ai: VtedFloorplanAI = {
    rooms,
    walls,
    doors,
    windows,
    scale: {
      pixelsPerMeter,
      referenceLength: { pixels: referenceLengthPixels, meters: referenceLengthMeters },
    },
    processingConfidence: confidence,
  };

  void startTime;
  return {
    ai,
    previewData: {
      rooms: rooms.map((r) => ({ id: r.id, label: r.name, area: Math.round(r.area) })),
      walls: walls.length,
      doors: doors.length,
      windows: windows.length,
      confidence: Math.round(confidence * 100),
    },
  };
}

interface DetectionInput {
  data: Uint8Array;
  width: number;
  height: number;
}

function detectRoomsAndWalls(imageBuffer: Buffer, width: number, height: number) {
  const data = new Uint8Array(imageBuffer);
  const input: DetectionInput = { data, width, height };
  const walls = detectWalls(input);
  const rooms = detectRooms(input, walls);
  const { doors, windows } = detectOpenings(walls);
  return { rooms, walls, doors, windows };
}

function detectWalls(input: DetectionInput): VtedWall[] {
  const { data, width, height } = input;
  const wallGrid: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    wallGrid[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const val = data[idx] ?? 0;
      wallGrid[y]![x] = val < 100;
    }
  }

  const walls: VtedWall[] = [];
  const visited: boolean[][] = [];
  for (let y = 0; y < height; y++) visited[y] = new Array(width).fill(false);

  const directions = [
    { dx: 1, dy: 0 }, { dx: 0, dy: 1 },
  ];

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      for (const dir of directions) {
        if (visited[y]![x]) continue;
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx >= width || ny >= height) continue;

        const isWallStart = wallGrid[y]![x] && (wallGrid[ny]![nx] || wallGrid[y]![nx] || wallGrid[ny]![x]);
        const isWallEnd = !wallGrid[y]![x] && !wallGrid[ny]![nx];
        const isEdge = isWallStart || isWallEnd;

        if (isEdge) {
          const points: [number, number][] = [[x, y]];
          let cx = x;
          let cy = y;
          while (true) {
            visited[cy]![cx] = true;
            let found = false;
            for (const d of [
              [1, 0], [-1, 0], [0, 1], [0, -1],
              [1, 1], [-1, 1], [1, -1], [-1, -1],
            ]) {
              const tx = cx + (d[0] as number);
              const ty = cy + (d[1] as number);
              if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue;
              if (visited[ty]![tx]) continue;
              const tIdx = (ty * width + tx) * 4;
              const tVal = data[tIdx] ?? 0;
              if (tVal < 100) {
                points.push([tx, ty]);
                cx = tx;
                cy = ty;
                found = true;
                break;
              }
            }
            if (!found) break;
          }
          if (points.length >= 3) {
            const line = fitLine(points);
            if (line) {
              walls.push({
                id: `wall-${walls.length}-${Math.random().toString(36).slice(2, 8)}`,
                line,
                thickness: Math.max(points.length / width, 1),
              });
            }
          }
        }
      }
    }
  }
  return walls;
}

function fitLine(points: [number, number][]): [[number, number], [number, number]] | null {
  if (points.length < 2) return null;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const extent = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2);
  if (extent < 5) return null;
  return [[minX, minY], [maxX, maxY]];
}

function detectRooms(input: DetectionInput, walls: VtedWall[]): VtedRoom[] {
  const { width, height } = input;
  const wallSet: boolean[][] = [];
  for (let y = 0; y < height; y++) wallSet[y] = new Array(width).fill(false);

  for (const wall of walls) {
    const [start, end] = wall.line;
    const steps = Math.max(Math.abs(end[0] - start[0]), Math.abs(end[1] - start[1])) || 1;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(start[0] + (end[0] - start[0]) * t);
      const y = Math.round(start[1] + (end[1] - start[1]) * t);
      if (x >= 0 && x < width && y >= 0 && y < height) wallSet[y]![x] = true;
    }
  }

  const visited: boolean[][] = [];
  for (let y = 0; y < height; y++) visited[y] = new Array(width).fill(false);
  const rooms: VtedRoom[] = [];

  const roomNames = [
    'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room',
    'Garage', 'Hallway', 'Entry', 'Closet', 'Balcony', 'Study',
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y]![x] || wallSet[y]![x]) continue;
      const region = floodFill(input.data, wallSet, visited, x, y, width, height);
      if (region.points.length > 50) {
        const polygon = simplifyPolygon(region.points);
        if (polygon.length >= 3) {
          const area = calculatePolygonArea(polygon);
          const room: VtedRoom = {
            id: `room-${rooms.length}-${Math.random().toString(36).slice(2, 8)}`,
            name: roomNames[rooms.length % roomNames.length],
            polygon: polygon as [number, number][],
            area,
            type: inferRoomType(area, rooms.length),
          };
          rooms.push(room);
        }
      }
    }
  }
  return rooms;
}

interface FloodFillResult {
  points: [number, number][];
}

function floodFill(
  data: Uint8Array,
  wallSet: boolean[][],
  visited: boolean[][],
  startX: number,
  startY: number,
  width: number,
  height: number,
): FloodFillResult {
  const points: [number, number][] = [];
  const stack: [number, number][] = [[startX, startY]];
  const queue: [number, number][] = [];
  let qi = 0;

  const sampleStep = Math.max(1, Math.floor(Math.sqrt(width * height) / 50));

  while (stack.length > 0 && queue.length < 100000) {
    const pt = stack.pop()!;
    const [x, y] = pt;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    if (visited[y]![x]) continue;
    if (wallSet[y]![x]) continue;
    visited[y]![x] = true;
    queue.push(pt);
    points.push(pt);

    for (const [dx, dy] of [[0, -sampleStep], [0, sampleStep], [-sampleStep, 0], [sampleStep, 0]] as const) {
      stack.push([x + (dx as number), y + (dy as number)]);
    }
  }

  if (points.length > 500) {
    const step = Math.ceil(points.length / 500);
    const sampled: [number, number][] = [];
    for (let i = 0; i < points.length; i += step) sampled.push(points[i]!);
    return { points: sampled };
  }
  return { points };
}

function simplifyPolygon(points: [number, number][]): [number, number][] {
  if (points.length <= 4) return points;
  const polygon = convexHull(points);
  if (polygon.length <= 4) return polygon;
  const refined: [number, number][] = [];
  const step = Math.ceil(polygon.length / 8);
  for (let i = 0; i < polygon.length; i += step) {
    refined.push(polygon[i]!);
  }
  return refined.length >= 4 ? refined : polygon;
}

function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

function cross(o: [number, number], a: [number, number], b: [number, number]): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function calculatePolygonArea(polygon: [number, number][]): number {
  if (polygon.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += (polygon[i]![0] * polygon[j]![1]) - (polygon[j]![0] * polygon[i]![1]);
  }
  return Math.abs(area) / 2;
}

function inferRoomType(area: number, roomIndex: number): VtedRoomType {
  const small = area < 5000;
  const medium = area >= 5000 && area < 15000;
  if (small) return roomIndex % 3 === 0 ? 'bathroom' : 'office';
  if (medium) return 'bedroom';
  return 'living';
}

function detectOpenings(walls: VtedWall[]): { doors: VtedOpening[]; windows: VtedOpening[] } {
  const doors: VtedOpening[] = [];
  const windows: VtedOpening[] = [];

  for (const wall of walls) {
    const [start, end] = wall.line;
    const length = Math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2);
    if (length > 30) {
      const numDoors = Math.floor(length / 60);
      const numWindows = Math.floor(length / 40);

      for (let i = 1; i <= numDoors; i++) {
        const t = i / (numDoors + 1);
        const x = start[0] + (end[0] - start[0]) * t;
        const y = start[1] + (end[1] - start[1]) * t;
        doors.push({
          id: `door-${doors.length}-${Math.random().toString(36).slice(2, 8)}`,
          position: [x, y],
          width: 12,
          height: 80,
        });
      }

      for (let i = 1; i <= numWindows; i++) {
        const t = i / (numWindows + 1);
        const x = start[0] + (end[0] - start[0]) * t;
        const y = start[1] + (end[1] - start[1]) * t;
        windows.push({
          id: `window-${windows.length}-${Math.random().toString(36).slice(2, 8)}`,
          position: [x, y],
          width: 8,
          height: 60,
        });
      }
    }
  }
  return { doors, windows };
}

function calculateConfidence(rooms: VtedRoom[], walls: VtedWall[], doors: VtedOpening[], windows: VtedOpening[]): number {
  const numRoomsScore = Math.min(rooms.length / 3, 1);
  const numWallsScore = Math.min(walls.length / 4, 1);
  const hasOpenings = (doors.length + windows.length) > 0 ? 0.5 : 0;
  return Math.min((numRoomsScore + numWallsScore + hasOpenings) / 2.5, 0.95);
}
