export * from './splat-editor-store';

// Splat Processing Module
// Provides functions for loading, processing, and exporting splat data

export type SplatPoint = {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  size: number;
  selected?: boolean;
};

export type SplatFormat = 'splat' | 'ply' | 'ksplat';

/**
 * Generate initial sample splat cluster
 * @param preset Preset type ('villa', 'drone', or 'sculpture')
 * @returns Array of SplatPoint objects
 */
export function generateSampleSplats(preset: SplatPreset = 'villa'): SplatPoint[] {
  const points: SplatPoint[] = [];
  const count = preset === 'drone' ? 1200 : preset === 'sculpture' ? 600 : 900;

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    let r = 200, g = 200, b = 200;

    if (preset === 'villa') {
      // Architectural pavilion structure
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * 2;
      const radius = 2 + Math.random() * 0.8;
      x = Math.cos(u) * radius;
      z = Math.sin(u) * radius;
      y = (Math.random() * 2) - 0.5;
      r = Math.floor(62 + Math.random() * 60);
      g = Math.floor(207 + Math.random() * 40);
      b = Math.floor(142 + Math.random() * 60);
    } else if (preset === 'drone') {
      // Landscape terrain / photogrammetry
      x = (Math.random() - 0.5) * 6;
      z = (Math.random() - 0.5) * 6;
      y = Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.6 + (Math.random() - 0.5) * 0.2;
      r = Math.floor(180 + Math.random() * 50);
      g = Math.floor(130 + Math.random() * 50);
      b = Math.floor(90 + Math.random() * 40);
    } else {
      // Sculpture organic form
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 1.4 + Math.sin(theta * 3) * 0.3;
      x = radius * Math.sin(phi) * Math.cos(theta);
      y = radius * Math.sin(phi) * Math.sin(theta);
      z = radius * Math.cos(phi);
      r = Math.floor(129 + Math.random() * 80);
      g = Math.floor(140 + Math.random() * 80);
      b = Math.floor(248 + Math.random() * 30);
    }

    // Add floaters occasionally
    if (Math.random() < 0.05) {
      x += (Math.random() - 0.5) * 4;
      y += (Math.random() - 0.5) * 4;
      z += (Math.random() - 0.5) * 4;
    }

    points.push({
      x,
      y,
      z,
      r,
      g,
      b,
      size: 2 + Math.random() * 2.5,
      selected: false,
    });
  }

  return points;
}

type SplatPreset = 'villa' | 'drone' | 'sculpture';

/**
 * Filter outlier floaters from splat data
 * Removes points whose distance from centroid is an extreme outlier
 * @param splats Array of SplatPoint objects to filter
 * @returns New array with outliers removed
 */
export function cleanFloaters(splats: SplatPoint[]): SplatPoint[] {
  // Calculate centroid
  const centroid = {
    x: splats.reduce((sum, p) => sum + p.x, 0) / splats.length,
    y: splats.reduce((sum, p) => sum + p.y, 0) / splats.length,
    z: splats.reduce((sum, p) => sum + p.z, 0) / splats.length,
  };

  // Calculate distances from centroid
  const distances = splats.map(p => 
    Math.sqrt(
      Math.pow(p.x - centroid.x, 2) +
      Math.pow(p.y - centroid.y, 2) +
      Math.pow(p.z - centroid.z, 2)
    )
  );

  // Calculate mean and standard deviation of distances
  const meanDist = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const stdDist = Math.sqrt(
    distances.reduce((sum, d) => sum + Math.pow(d - meanDist, 2), 0) / distances.length
  );

  // Filter out points that are more than 2 standard deviations from the mean
  return splats.filter((_, index) => distances[index] <= meanDist + 2 * stdDist);
}

/**
 * Compress splat data by downsampling
 * Reduces the number of points by taking every nth point
 * @param splats Array of SplatPoint objects to compress
 * @param factor Compression factor (default: 2)
 * @returns New array with reduced number of points
 */
export function compressSplats(splats: SplatPoint[], factor: number = 2): SplatPoint[] {
  return splats.filter((_, index) => index % factor === 0);
}

/**
 * Crop splat data to selected points only
 * @param splats Array of SplatPoint objects
 * @returns New array containing only selected points
 */
export function cropToSelection(splats: SplatPoint[]): SplatPoint[] {
  return splats.filter(p => p.selected);
}

/**
 * Load splat data from a file
 * Currently supports .ply and .splat formats (simplified implementation)
 * @param arrayBuffer File contents as ArrayBuffer
 * @param filename Name of the file (used to determine format)
 * @returns Promise resolving to array of SplatPoint objects
 */
export async function loadSplatFile(
  arrayBuffer: ArrayBuffer,
  filename: string
): Promise<SplatPoint[]> {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  
  // Simplified implementation - in a real application, you would use proper parsers
  // For now, we'll generate sample data based on file extension
  if (extension === 'ply' || extension === 'splat' || extension === 'ksplat') {
    // Detect preset from filename or generate random
    const preset: SplatPreset = 
      filename.toLowerCase().includes('villa') ? 'villa' :
      filename.toLowerCase().includes('drone') ? 'drone' :
      'sculpture';
    return generateSampleSplats(preset);
  }
  
  // Default to villa preset
  return generateSampleSplats('villa');
}

/**
 * Export splat data to a file format
 * Currently creates a simplified PLY format (simplified implementation)
 * @param splats Array of SplatPoint objects to export
 * @param format Export format ('splat', 'ply', or 'ksplat')
 * @returns Promise resolving to Blob object
 */
export async function exportSplatFile(
  splats: SplatPoint[],
  format: SplatFormat = 'splat'
): Promise<Blob> {
  // Simplified implementation - creates a PLY-like format
  // In a real application, you would use proper format writers
  
  let content = '';
  
  if (format === 'ply') {
    content = `ply
format ascii 1.0
element vertex ${splats.length}
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
property float size
end_header
`;
    
    for (const point of splats) {
      content += `${point.x} ${point.y} ${point.z} ${point.r} ${point.g} ${point.b} ${point.size}\n`;
    }
  } else {
    // For splat and ksplat formats, create a simplified binary-like representation
    // In reality, these would be proper binary formats
    content = `VIZTR SPLAT FORMAT\n`;
    content += `points: ${splats.length}\n`;
    content += `format: ${format}\n`;
    
    for (const point of splats) {
      content += `${point.x},${point.y},${point.z},${point.r},${point.g},${point.b},${point.size}\n`;
    }
  }
  
  return new Blob([content], { 
    type: format === 'ply' ? 'text/plain' : 'application/octet-stream' 
  });
}