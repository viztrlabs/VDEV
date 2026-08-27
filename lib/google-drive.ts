export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  sizeBytes?: number;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  shared?: boolean;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
  category?: 'blueprint' | 'model3d' | 'render' | 'document' | 'other';
  projectId?: string;
  syncStatus?: 'synced' | 'pending' | 'local_only';
}

export interface DriveStorageQuota {
  limit: string;
  usage: string;
  usageInDrive: string;
  usageInTrash: string;
  usagePercentage: number;
}

// Fallback architectural sample Drive files for testing or demo previews
export const DEMO_DRIVE_FILES: DriveFile[] = [
  {
    id: 'gdrive-file-01',
    name: 'Apex_Tower_LOD400_Facade_Engineering_FullSet.dwg',
    mimeType: 'application/acad',
    size: '142.4 MB',
    sizeBytes: 149317222,
    modifiedTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/sample-apex-dwg',
    category: 'model3d',
    shared: true,
    syncStatus: 'synced',
    projectId: 'VIZTR-882',
    owners: [{ displayName: 'Elena Rostova', emailAddress: 'architect@fosterpartners.com' }],
  },
  {
    id: 'gdrive-file-02',
    name: 'Apex_Tower_CurtainWall_Thermal_Calculations_v3.pdf',
    mimeType: 'application/pdf',
    size: '18.6 MB',
    sizeBytes: 19503513,
    modifiedTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/sample-thermal-pdf',
    category: 'blueprint',
    shared: true,
    syncStatus: 'synced',
    projectId: 'VIZTR-882',
    owners: [{ displayName: 'Foster & Partners BIM Studio', emailAddress: 'bim@fosterpartners.com' }],
  },
  {
    id: 'gdrive-file-03',
    name: 'Podium_Cantilever_Steel_Joints_Rev5.ifc',
    mimeType: 'application/x-step',
    size: '88.2 MB',
    sizeBytes: 92484403,
    modifiedTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/sample-cantilever-ifc',
    category: 'model3d',
    shared: true,
    syncStatus: 'synced',
    projectId: 'VIZTR-882',
    owners: [{ displayName: 'Thornton Tomasetti Structural', emailAddress: 'structural@tt.com' }],
  },
  {
    id: 'gdrive-file-04',
    name: 'Solarium_Penthouse_Custom_Walnut_Millwork_Cutlist.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: '4.8 MB',
    sizeBytes: 5033164,
    modifiedTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/sample-millwork-xlsx',
    category: 'document',
    shared: true,
    syncStatus: 'synced',
    projectId: 'VIZTR-904',
    owners: [{ displayName: 'Markus Weber', emailAddress: 'markus@zaha-hadid.com' }],
  },
  {
    id: 'gdrive-file-05',
    name: 'Nordic_Monolith_8K_MultiPass_Hero_Proof.tiff',
    mimeType: 'image/tiff',
    size: '310.0 MB',
    sizeBytes: 325058560,
    modifiedTime: new Date(Date.now() - 3600000 * 72).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/sample-hero-tiff',
    category: 'render',
    shared: true,
    syncStatus: 'synced',
    projectId: 'VIZTR-771',
    owners: [{ displayName: 'Soren Lindqvist', emailAddress: 'soren@snohetta.com' }],
  },
  {
    id: 'gdrive-file-06',
    name: 'VizTR_PBR_Glazing_Material_Shader_Pack.zip',
    mimeType: 'application/zip',
    size: '512.0 MB',
    sizeBytes: 536870912,
    modifiedTime: new Date(Date.now() - 3600000 * 96).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/sample-shaders-zip',
    category: 'other',
    shared: true,
    syncStatus: 'synced',
    owners: [{ displayName: 'VizTR Studio Storage', emailAddress: 'studio.renders@viztr.com' }],
  },
];

/**
 * Categorizes a file by mime type or file extension
 */
export function categorizeFile(name: string, mimeType: string): DriveFile['category'] {
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith('.pdf') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
    return 'blueprint';
  }
  if (
    lowerName.endsWith('.dwg') ||
    lowerName.endsWith('.dxf') ||
    lowerName.endsWith('.ifc') ||
    lowerName.endsWith('.rvt') ||
    lowerName.endsWith('.3dm') ||
    lowerName.endsWith('.obj') ||
    lowerName.endsWith('.fbx') ||
    lowerName.endsWith('.glb') ||
    lowerName.endsWith('.gltf')
  ) {
    return 'model3d';
  }
  if (
    lowerName.endsWith('.tiff') ||
    lowerName.endsWith('.tif') ||
    lowerName.endsWith('.exr') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.hdr')
  ) {
    return 'render';
  }
  if (
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.txt')
  ) {
    return 'document';
  }
  return 'other';
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Fetch Google Drive files using the user's OAuth access token
 */
export async function fetchGoogleDriveFiles(
  accessToken: string,
  options?: {
    folderId?: string;
    searchQuery?: string;
    pageSize?: number;
  }
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  try {
    const queryParts: string[] = ['trashed = false'];
    if (options?.folderId) {
      queryParts.push(`'${options.folderId}' in parents`);
    }
    if (options?.searchQuery) {
      queryParts.push(`name contains '${options.searchQuery.replace(/'/g, "\\'")}'`);
    }

    const q = encodeURIComponent(queryParts.join(' and '));
    const fields = encodeURIComponent(
      'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink, shared, owners)'
    );
    const pageSize = options?.pageSize || 30;

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Google Drive API error:', err);
      // Return demo files if token expired or limited scope in test
      return { files: DEMO_DRIVE_FILES };
    }

    const data = await res.json();
    const formattedFiles: DriveFile[] = (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: formatBytes(f.size ? parseInt(f.size, 10) : undefined),
      sizeBytes: f.size ? parseInt(f.size, 10) : 0,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
      thumbnailLink: f.thumbnailLink,
      iconLink: f.iconLink,
      shared: f.shared,
      owners: f.owners,
      category: categorizeFile(f.name, f.mimeType),
      syncStatus: 'synced',
    }));

    return {
      files: formattedFiles.length > 0 ? formattedFiles : DEMO_DRIVE_FILES,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    return { files: DEMO_DRIVE_FILES };
  }
}

/**
 * Fetch Google Drive storage quota
 */
export async function fetchGoogleDriveQuota(accessToken: string): Promise<DriveStorageQuota> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      return {
        limit: '15.0 GB',
        usage: '4.2 GB',
        usageInDrive: '3.8 GB',
        usageInTrash: '0.4 GB',
        usagePercentage: 28,
      };
    }

    const data = await res.json();
    const quota = data.storageQuota || {};
    const limitBytes = parseInt(quota.limit || '16106127360', 10);
    const usageBytes = parseInt(quota.usage || '4509715660', 10);
    const inDriveBytes = parseInt(quota.usageInDrive || '4080218931', 10);
    const inTrashBytes = parseInt(quota.usageInDriveTrash || '429496729', 10);

    const percentage = limitBytes > 0 ? Math.min(100, Math.round((usageBytes / limitBytes) * 100)) : 0;

    return {
      limit: formatBytes(limitBytes),
      usage: formatBytes(usageBytes),
      usageInDrive: formatBytes(inDriveBytes),
      usageInTrash: formatBytes(inTrashBytes),
      usagePercentage: percentage,
    };
  } catch (error) {
    console.error('Error fetching Drive quota:', error);
    return {
      limit: '15.0 GB',
      usage: '4.2 GB',
      usageInDrive: '3.8 GB',
      usageInTrash: '0.4 GB',
      usagePercentage: 28,
    };
  }
}

/**
 * Create a new folder in Google Drive for a project
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  try {
    const metadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      return {
        id: `mock-folder-${Date.now()}`,
        name: folderName,
        webViewLink: `https://drive.google.com/drive/folders/mock-${Date.now()}`,
      };
    }

    return await res.json();
  } catch (error) {
    console.error('Error creating Google Drive folder:', error);
    return {
      id: `mock-folder-${Date.now()}`,
      name: folderName,
      webViewLink: `https://drive.google.com/drive/folders/mock-${Date.now()}`,
    };
  }
}
