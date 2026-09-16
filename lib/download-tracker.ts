/**
 * Download Tracking Store
 * 
 * Tracks file downloads for analytics and audit purposes.
 */

export interface DownloadRecord {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  projectId: string;
  downloadedBy: string;
  downloadedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

const DOWNLOAD_STORAGE_KEY = 'viztr_downloads';

function loadDownloads(): DownloadRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(DOWNLOAD_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDownloads(downloads: DownloadRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DOWNLOAD_STORAGE_KEY, JSON.stringify(downloads));
  } catch {
    // Storage full or unavailable
  }
}

export function recordDownload(record: Omit<DownloadRecord, 'id' | 'downloadedAt'>) {
  const downloads = loadDownloads();
  const newRecord: DownloadRecord = {
    ...record,
    id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    downloadedAt: new Date().toISOString(),
  };
  downloads.unshift(newRecord);
  saveDownloads(downloads);
  return newRecord;
}

export function getDownloadsForProject(projectId: string): DownloadRecord[] {
  return loadDownloads().filter((d) => d.projectId === projectId);
}

export function getRecentDownloads(limit = 50): DownloadRecord[] {
  return loadDownloads().slice(0, limit);
}
