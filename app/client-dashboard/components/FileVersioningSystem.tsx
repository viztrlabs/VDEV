// File Versioning System - Phase 1 Core Feature
// Enables comprehensive file version control and history tracking

import React, { useState, useEffect } from 'react';
import { History, Download, Upload, RotateCcw, Clock, FileText, Image, Video, Archive, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileVersion {
  id: string;
  version: number;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedAt: Date;
  changes: string;
  description: string;
  isCurrent: boolean;
  checksum?: string;
  checksumAlgorithm?: string;
}

interface FileVersionHistory {
  fileId: string;
  filename: string;
  currentVersion: number;
  totalVersions: number;
  lastModified: Date;
  lastModifiedBy: string;
  versions: FileVersion[];
}

interface FileVersioningProps {
  projectId: string;
  fileId: string;
  initialHistory?: FileVersionHistory;
}

export default function FileVersioning({ projectId, fileId, initialHistory }: FileVersioningProps) {
  const [versionHistory, setVersionHistory] = useState<FileVersionHistory>(
    initialHistory || {
      fileId,
      filename: 'Sample Document.pdf',
      currentVersion: 4,
      totalVersions: 4,
      lastModified: new Date('2024-12-18T14:30:00Z'),
      lastModifiedBy: 'Sarah Chen',
      versions: [
        {
          id: 'v1',
          version: 1,
          filename: 'Sample Document.pdf',
          size: 2.4,
          mimeType: 'application/pdf',
          thumbnail: '/thumbnails/version1.png',
          uploadedBy: 'John Doe',
          uploadedAt: new Date('2024-12-15T10:00:00Z'),
          changes: 'Initial document upload',
          description: 'First version of the document',
          isCurrent: false,
          checksum: 'a1b2c3d4e5f6',
          checksumAlgorithm: 'SHA-256'
        },
        {
          id: 'v2',
          version: 2,
          filename: 'Sample Document.pdf',
          size: 2.4,
          mimeType: 'application/pdf',
          thumbnail: '/thumbnails/version2.png',
          uploadedBy: 'Sarah Chen',
          uploadedAt: new Date('2024-12-16T14:30:00Z'),
          changes: 'Added section 3 and revised introduction',
          description: 'Second version with improvements',
          isCurrent: false,
          checksum: 'b2c3d4e5f6a1',
          checksumAlgorithm: 'SHA-256'
        },
        {
          id: 'v3',
          version: 3,
          filename: 'Sample Document.pdf',
          size: 2.4,
          mimeType: 'application/pdf',
          thumbnail: '/thumbnails/version3.png',
          uploadedBy: 'Mike Johnson',
          uploadedAt: new Date('2024-12-17T16:45:00Z'),
          changes: 'Fixed formatting errors and added table of contents',
          description: 'Third version with formatting fixes',
          isCurrent: false,
          checksum: 'c3d4e5f6a1b2',
          checksumAlgorithm: 'SHA-256'
        },
        {
          id: 'v4',
          version: 4,
          filename: 'Sample Document.pdf',
          size: 2.4,
          mimeType: 'application/pdf',
          thumbnail: '/thumbnails/version4.png',
          uploadedBy: 'Sarah Chen',
          uploadedAt: new Date('2024-12-18T14:30:00Z'),
          changes: 'Final version - approved by client',
          description: 'Final approved version',
          isCurrent: true,
          checksum: 'd4e5f6a1b2c3',
          checksumAlgorithm: 'SHA-256'
        }
      ]
    }
  );

  const [selectedVersion, setSelectedVersion] = useState<FileVersion>(versionHistory.versions[versionHistory.versions.length - 1]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isUploadingNewVersion, setIsUploadingNewVersion] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');
  const [versionChanges, setVersionChanges] = useState('');

  const handleVersionSelect = (version: FileVersion) => {
    setSelectedVersion(version);
  };

  const handleUploadNewVersion = () => {
    if (!versionDescription || !versionChanges) {
      alert('Please provide version description and changes');
      return;
    }

    setIsUploadingNewVersion(true);

    // Decrement current version flag
    setVersionHistory(prev => ({
      ...prev,
      versions: prev.versions.map(v => ({ ...v, isCurrent: false })),
      currentVersion: prev.currentVersion + 1
    }));

    // Add new version
    const newVersion: FileVersion = {
      id: `v${versionHistory.currentVersion + 1}`,
      version: versionHistory.currentVersion + 1,
      filename: versionHistory.filename,
      size: 2.4,
      mimeType: versionHistory.versions[0].mimeType,
      thumbnail: `/thumbnails/version${versionHistory.currentVersion + 1}.png`,
      uploadedBy: 'Sarah Chen',
      uploadedAt: new Date(),
      changes: versionChanges,
      description: versionDescription,
      isCurrent: true,
      checksum: 'checksum_' + Date.now(),
      checksumAlgorithm: 'SHA-256'
    };

    setVersionHistory(prev => ({
      ...prev,
      versions: [...prev.versions, newVersion],
      currentVersion: prev.currentVersion + 1,
      lastModified: new Date(),
      lastModifiedBy: 'Sarah Chen'
    }));

    setSelectedVersion(newVersion);
    setVersionDescription('');
    setVersionChanges('');
    setIsUploadingNewVersion(false);
    setShowVersionHistory(false);
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-400" />;
    } else if (mimeType.includes('image')) {
      return <Image className="w-5 h-5 text-green-400" />;
} else if (mimeType.includes('video')) {
       return <Video className="w-5 h-5 text-purple-400" />;
     } else if (mimeType.includes('zip') || mimeType.includes('archive')) {
       return <Archive className="w-5 h-5 text-yellow-400" />;
     } else {
       return <FileText className="w-5 h-5 text-gray-400" />;
     }
  };

  const formatFileSize = (size: number) => {
    if (size < 1) return `${(size * 1024).toFixed(1)} KB`;
    return `${size.toFixed(1)} MB`;
  };

  const getStatusColor = (isCurrent: boolean) => {
    return isCurrent 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="file-versioning">
      <div className="section-header">
        <h2>📋 File Versioning</h2>
        <p>Track and manage file versions with immutable history</p>
      </div>

      <div className="versioning-container">
        {/* Version History Sidebar */}
        <div className="version-history-sidebar">
          <div className="sidebar-header">
            <h3>Version History</h3>
            <span className="version-count">
              {versionHistory.totalVersions} total versions
            </span>
          </div>

          <div className="current-version-info">
            <div className="current-badge">
              <CheckCircle2 className="w-4 h-4" />
              Current Version
            </div>
            <div className="current-version-details">
              <strong>v{versionHistory.currentVersion}</strong>
              <span>Modified by {versionHistory.lastModifiedBy}</span>
              <span>{versionHistory.lastModified.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="version-list">
{versionHistory.versions.map((version) => (
               <div
                 key={version.id}
                 className={`version-item ${selectedVersion?.id === version.id ? 'selected' : ''}`}
                 onClick={() => setSelectedVersion(version)}
               >
                 <div className="version-info">
                   <div className="version-header">
                     <span className={`version-number ${version.isCurrent ? 'current' : ''}`}>v{version.version}</span>
                     <span className={`status-badge ${version.isCurrent ? 'current' : ''}`}>
                       {version.isCurrent ? 'Current' : 'Previous'}
                     </span>
                   </div>
                   <div className="version-meta">
                     <span>by {version.uploadedBy}</span>
                     <span>{version.uploadedAt.toLocaleDateString()}</span>
                   </div>
                   <div className="version-changes">
                     {version.changes.length > 50
                       ? `${version.changes.substring(0, 50)}...`
                       : version.changes
                     }
                   </div>
                 </div>
               </div>
             ))}
          </div>

          <div className="sidebar-actions">
            <button
              className="upload-version-btn"
              onClick={() => setShowVersionHistory(!showVersionVersionHistory)}
            >
              <Upload className="w-4 h-4" />
              Upload New Version
            </button>
          </div>
        </div>

        {/* Version Details Panel */}
        <div className="version-details-panel">
{selectedVersion ? (
             <div className="version-detail-content">
               <div className="detail-header">
                 <h3>{selectedVersion.filename}</h3>
                 <div className="detail-meta">
                   <span>Version {selectedVersion.version}</span>
                   <span>Uploaded by {selectedVersion.uploadedBy}</span>
                   <span>Uploaded on {selectedVersion.uploadedAt.toLocaleDateString()}</span>
                   <span>Size: {formatFileSize(selectedVersion.size)}</span>
                   {selectedVersion.checksum && (
                     <span>Checksum: {selectedVersion.checksum}</span>
                   )}
                 </div>
                 <span className={`status-badge ${selectedVersion.isCurrent ? 'current' : ''}`}>
                   {selectedVersion.isCurrent ? 'Current Version' : 'Previous Version'}
                 </span>
               </div>

              <div className="detail-preview">
                <div className="preview-placeholder">
                  {getFileTypeIcon(selectedVersion.mimeType)}
                  <p>{selectedVersion.filename}</p>
                  <p className="text-sm text-[#A1A1AA]">
                    {selectedVersion.mimeType || 'Unknown file type'}
                  </p>
                </div>
              </div>

              <div className="detail-description">
                <h4>Description</h4>
                <p>{selectedVersion.description}</p>
              </div>

<div className="detail-changes">
                 <h4>Changes</h4>
                   <p>{selectedVersion.changes}</p>
               </div>

              <div className="detail-actions">
                <button className="action-btn primary">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {!selectedVersion.isCurrent && (
                  <button 
                    className="action-btn secondary"
                    onClick={() => {
                      const updatedVersions = versionHistory.versions.map(v => ({
                        ...v,
                        isCurrent: v.id === selectedVersion.id
                      }));
                      setVersionHistory(prev => ({
                        ...prev,
                        versions: updatedVersions,
                        currentVersion: selectedVersion.version
                      }));
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="no-version-selected">
              <History className="w-16 h-16" />
              <h3>No Version Selected</h3>
              <p>Select a version from the history to view details</p>
            </div>
          )}
        </div>

        {/* Upload Version Dialog */}
        {showVersionHistory && (
          <div className="upload-version-overlay">
            <div className="upload-version-dialog">
              <h3>Upload New Version</h3>
              
              <div className="form-group">
                <label>Version Description</label>
                <textarea
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Changes Summary</label>
                <textarea
                  value={versionChanges}
                  onChange={(e) => setVersionChanges(e.target.value)}
                  placeholder="Brief summary of changes..."
                  rows={2}
                />
              </div>

              <div className="version-preview-info">
                <p><strong>Current Version:</strong> v{versionHistory.currentVersion}</p>
                <p><strong>New Version Will Be:</strong> v{versionHistory.currentVersion + 1}</p>
              </div>

              <div className="upload-actions">
                <button
                  className="cancel-upload-btn"
                  onClick={() => {
                    setShowVersionHistory(false);
                    setVersionDescription('');
                    setVersionChanges('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="confirm-upload-btn"
                  onClick={handleUploadNewVersion}
                  disabled={!versionDescription || !versionChanges || isUploadingNewVersion}
                >
                  {isUploadingNewVersion ? 'Uploading...' : 'Upload Version'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .file-versioning {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          height: 600px;
          background: #0F172A;
          color: #F8FAFC;
          font-family: system-ui, sans-serif;
        }

        .section-header {
          grid-column: 1 / -1;
          padding: 24px;
          border-bottom: 1px solid #27272A;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #FFFFFF;
        }

        .section-header p {
          color: #94A3B8;
          font-size: 14px;
        }

        .versioning-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          padding: 0 24px 24px;
          overflow: hidden;
        }

        .version-history-sidebar {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid #27272A;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #FFFFFF;
        }

        .version-count {
          font-size: 12px;
          color: #A1A1AA;
          background: #27272A;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .current-version-info {
          padding: 16px;
          border-bottom: 1px solid #27272A;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .current-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #10b981;
          color: #ffffff;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .current-version-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .current-version-details strong {
          color: #FFFFFF;
          font-size: 14px;
        }

        .current-version-details span {
          font-size: 12px;
          color: #A1A1AA;
        }

        .version-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .version-item {
          display: flex;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 4px;
        }

        .version-item:hover {
          background: #27272A;
        }

        .version-item.selected {
          background: #3ECF8E20;
          border-left: 3px solid #3ECF8E;
        }

        .version-info {
          flex: 1;
        }

        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .version-number {
          font-weight: 600;
          color: #3ECF8E;
          font-size: 14px;
        }

        .version-number.current {
          color: #10b981;
          font-weight: 700;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .status-badge.current {
          background: #10b981;
          color: #ffffff;
        }

        .status-badge.previous {
          background: #6b7280;
          color: #d1d5db;
        }

        .version-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #71717A;
          margin-bottom: 8px;
        }

        .version-changes {
          font-size: 12px;
          color: #94A3B8;
          font-style: italic;
        }

        .sidebar-actions {
          padding: 16px;
          border-top: 1px solid #27272A;
        }

        .upload-version-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: #3ECF8E;
          color: #000000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .upload-version-btn:hover {
          background: #34b27b;
        }

        .version-details-panel {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          padding: 24px;
          overflow-y: auto;
        }

        .detail-header {
          margin-bottom: 24px;
        }

        .detail-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .detail-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          color: #A1A1AA;
        }

        .detail-meta strong {
          color: #FFFFFF;
        }

        .detail-meta .status-badge {
          align-self: flex-start;
          margin-top: 8px;
        }

        .detail-preview {
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 8px;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          margin-bottom: 24px;
        }

        .file-preview-placeholder {
          text-align: center;
        }

        .detail-description,
        .detail-changes {
          margin-bottom: 24px;
        }

        .detail-description h4,
        .detail-changes h4 {
          font-size: 16px;
          color: #FFFFFF;
          margin-bottom: 12px;
        }

        .detail-description p,
        .detail-changes p {
          color: #E2E8F0;
          line-height: 1.6;
        }

        .detail-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .action-btn.primary {
          background: #3ECF8E;
          color: #000000;
        }

        .action-btn.primary:hover {
          background: #34b27b;
        }

        .action-btn.secondary {
          background: #27272A;
          color: #FFFFFF;
        }

        .action-btn.secondary:hover {
          background: #3a3a3d;
        }

        .no-version-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #A1A1AA;
        }

        .upload-version-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .upload-version-dialog {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 500px;
        }

        .upload-version-dialog h3 {
          font-size: 20px;
          margin-bottom: 24px;
          color: #FFFFFF;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #A1A1AA;
          font-size: 14px;
          font-weight: 500;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 14px;
          transition: all 0.2s;
          resize: vertical;
          min-height: 80px;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #3ECF8E;
          box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.1);
        }

        .upload-version-dialog .upload-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .cancel-upload-btn,
        .confirm-upload-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .cancel-upload-btn {
          background: #27272A;
          color: #FFFFFF;
          flex: 1;
        }

        .cancel-upload-btn:hover {
          background: #3a3a3d;
        }

        .confirm-upload-btn {
          background: #3ECF8E;
          color: #000000;
        }

        .confirm-upload-btn:hover:not(:disabled) {
          background: #34b27b;
          transform: translateY(-1px);
        }

        .confirm-upload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .file-versioning {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;
          }

          .versioning-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }

          .version-history-sidebar {
            order: 2;
            height: 200px;
          }

          .version-details-panel {
            order: 1;
          }
        }
      `}</style>
    </div>
  );
}
