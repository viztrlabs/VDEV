// File Management System - Phase 1 Core Feature
// Enables comprehensive file organization, upload, and management for project assets

import React, { useState, useEffect } from 'react';
import { Upload, FolderOpen, Search, Download, Trash2, FileText, Image, Video, Archive, File, Edit3, Plus, Folder } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
  modifiedAt: Date;
  modifiedBy: string;
  version?: number;
  parentId?: string;
  isLocked?: boolean;
  isShared?: boolean;
}

interface FileManagementProps {
  projectId: string;
  initialFiles?: FileItem[];
}

export default function FileManagement({ projectId, initialFiles = [] }: FileManagementProps) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('root');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Mock current user
  const currentUser = {
    name: 'Sarah Chen',
    role: 'client'
  };

  // Generate mock data for demonstration
  useEffect(() => {
    const mockFiles: FileItem[] = [
      {
        id: 'folder_001',
        name: 'Reference Assets',
        type: 'folder',
        path: '/root/reference-assets',
        modifiedAt: new Date('2024-12-15'),
        modifiedBy: 'Mike Johnson',
        isLocked: false,
        isShared: true
      },
      {
        id: 'file_001',
        name: 'Project_Scope_Document.pdf',
        type: 'file',
        path: '/root/reference-assets',
        size: 2.4,
        mimeType: 'application/pdf',
        thumbnail: '/thumbnails/pdf-icon.png',
        modifiedAt: new Date('2024-12-18'),
        modifiedBy: 'Emily Rodriguez',
        version: 3,
        isLocked: false,
        isShared: true
      },
      {
        id: 'folder_002',
        name: '3D_Models',
        type: 'folder',
        path: '/root/3d-models',
        modifiedAt: new Date('2024-12-10'),
        modifiedBy: 'David Kim',
        isLocked: true,
        isShared: true
      },
      {
        id: 'file_002',
        name: 'Exterior_Render_Final_v04.jpg',
        type: 'file',
        path: '/root/3d-models',
        size: 45.2,
        mimeType: 'image/jpeg',
        thumbnail: '/thumbnails/exterior-final.jpg',
        modifiedAt: new Date('2024-12-17'),
        modifiedBy: 'David Kim',
        version: 4,
        isLocked: false,
        isShared: true
      },
      {
        id: 'file_003',
        name: 'Interior_Render_v02.jpg',
        type: 'file',
        path: '/root/3d-models',
        size: 38.7,
        mimeType: 'image/jpeg',
        thumbnail: '/thumbnails/interior-v02.jpg',
        modifiedAt: new Date('2024-12-14'),
        modifiedBy: 'Alex Martinez',
        version: 2,
        isLocked: false,
        isShared: false
      },
      {
        id: 'file_004',
        name: 'Animation_Sequence_Final.mp4',
        type: 'file',
        path: '/root/deliverables',
        size: 245.8,
        mimeType: 'video/mp4',
        thumbnail: '/thumbnails/animation-preview.jpg',
        modifiedAt: new Date('2024-12-16'),
        modifiedBy: 'Sarah Chen',
        version: 1,
        isLocked: true,
        isShared: true
      },
      {
        id: 'folder_003',
        name: 'Deliverables',
        type: 'folder',
        path: '/root/deliverables',
        modifiedAt: new Date('2024-12-12'),
        modifiedBy: 'Support Team',
        isLocked: false,
        isShared: true
      },
      {
        id: 'file_005',
        name: 'Sign_Contract_v03.pdf',
        type: 'file',
        path: '/root/deliverables',
        size: 1.2,
        mimeType: 'application/pdf',
        thumbnail: '/thumbnails/contract-v03.png',
        modifiedBy: 'Legal Team',
        modifiedAt: new Date('2024-12-15'),
        version: 3,
        isLocked: false,
        isShared: true
      },
      {
        id: 'folder_004',
        name: 'Archives',
        type: 'folder',
        path: '/root/archives',
        modifiedAt: new Date('2024-11-30'),
        modifiedBy: 'Archive System',
        isLocked: true,
        isShared: false
      }
    ];

    setFiles(mockFiles);
  }, []);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="w-5 h-5 text-blue-400" />;
    }

    const mimeType = file.mimeType || '';
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-400" />;
    } else if (mimeType.includes('image')) {
      return <Image className="w-5 h-5 text-green-400" />;
    } else if (mimeType.includes('video')) {
      return <Video className="w-5 h-5 text-purple-400" />;
    } else if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return <Archive className="w-5 h-5 text-yellow-400" />;
    } else {
      return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesPath = currentPath === 'root' || file.path.startsWith(currentPath + '/');
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPath && matchesSearch;
  });

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setIsUploading(true);

      Array.from(event.target.files).forEach((file, index) => {
        setTimeout(() => {
          const newFile: FileItem = {
            id: `file_${Date.now()}_${index}`,
            name: file.name,
            type: 'file',
            path: currentPath === 'root' ? file.name : `${currentPath}/${file.name}`,
            size: file.size / (1024 * 1024), // MB
            mimeType: file.type,
            thumbnail: URL.createObjectURL(file),
            modifiedAt: new Date(),
            modifiedBy: currentUser.name,
            version: 1,
            isLocked: false,
            isShared: false
          };

          setFiles(prev => [...prev, newFile]);
        }, index * 200); // Stagger the uploads
      });

      setTimeout(() => {
        setIsUploading(false);
      }, (event.target.files.length * 200) + 500);
    }
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: FileItem = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      type: 'folder',
      path: currentPath === 'root' ? newFolderName : `${currentPath}/${newFolderName}`,
      modifiedAt: new Date(),
      modifiedBy: currentUser.name,
      isLocked: false,
      isShared: false
    };

    setFiles(prev => [...prev, newFolder]);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const navigateToParent = () => {
    if (currentPath === 'root') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(parentPath || 'root');
  };

  const getBreadcrumbPath = () => {
    if (currentPath === 'root') return [{ name: 'Root', path: 'root' }];

    return currentPath.split('/').filter(part => part).map((part, index) => {
      const pathSoFar = currentPath.split('/').slice(0, index + 1).join('/');
      return {
        name: part,
        path: pathSoFar
      };
    });
  };

  const formatFileSize = (size: number) => {
    if (size < 1) return `${(size * 1024).toFixed(1)} KB`;
    return `${size.toFixed(1)} MB`;
  };

  return (
    <div className="file-management">
      <div className="section-header">
        <h2>📁 File Management</h2>
        <p>Organize and manage project files, versions, and deliverables</p>
      </div>

      <div className="file-management-container">
        {/* Sidebar - File Tree */}
        <div className="file-tree-sidebar">
<div className="sidebar-header">
             <h3>File Tree</h3>
             <button
               onClick={() => setIsCreatingFolder(true)}
               className="create-folder-btn"
             >
               <Plus className="w-4 h-4" />
               New Folder
             </button>
           </div>

          {isCreatingFolder && (
            <div className="create-folder-form">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="folder-input"
                autoFocus
              />
              <div className="folder-actions">
                <button
                  onClick={createFolder}
                  className="confirm-folder-btn"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  className="cancel-folder-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="tree-content">
            {getBreadcrumbPath().map((crumb, index) => (
              <div key={crumb.path} className="breadcrumb-item">
                {index > 0 && (
                  <span className="breadcrumb-separator">/</span>
                )}
                <button
                  onClick={() => setCurrentPath(crumb.path)}
                  className={`breadcrumb-link ${currentPath === crumb.path ? 'active' : ''}`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          <div className="tree-files">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className={`tree-item ${file.type} ${selectedFile?.id === file.id ? 'selected' : ''}`}
                onClick={() => handleFileClick(file)}
              >
                <div className="tree-item-icon">
                  {getFileIcon(file)}
                </div>
                <div className="tree-item-content">
                  <span className="tree-item-name">{file.name}</span>
                  <span className="tree-item-meta">
                    {file.type === 'file' && file.size && formatFileSize(file.size)}
                    {file.type === 'file' && file.version && ` v${file.version}`}
                    {file.isLocked && ' 🔒'}
                    {file.isShared && ' 🔗'}
                  </span>
                </div>
                <div className="tree-item-actions">
                  {file.type === 'file' && (
                    <button
                      className="tree-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Download functionality
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    className="tree-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${file.name}?`)) {
                        deleteFile(file.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - File Details */}
        <div className="file-details-panel">
          {selectedFile ? (
            <div className="file-detail-content">
              <div className="detail-header">
                <h3>{selectedFile.name}</h3>
                <div className="detail-meta">
                  <span>Size: {selectedFile.type === 'file' && selectedFile.size ? formatFileSize(selectedFile.size) : 'N/A'}</span>
                  <span>Modified: {selectedFile.modifiedAt.toLocaleDateString()}</span>
                  <span>By: {selectedFile.modifiedBy}</span>
                  {selectedFile.type === 'file' && selectedFile.version && (
                    <span>Version: v{selectedFile.version}</span>
                  )}
                </div>
              </div>

              <div className="detail-preview">
                {selectedFile.type === 'file' ? (
                  selectedFile.mimeType?.includes('image') ? (
                    <img
                      src={selectedFile.thumbnail || '/placeholder-image.png'}
                      alt={selectedFile.name}
                      className="preview-image"
                    />
                  ) : (
                    <div className="file-preview-placeholder">
                      {getFileIcon(selectedFile)}
                      <p>{selectedFile.name}</p>
                      <p className="text-sm text-[#A1A1AA]">
                        {selectedFile.mimeType || 'Unknown file type'}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="folder-preview">
                    <Folder className="w-16 h-16 text-blue-400" />
                    <p>Folder with {filteredFiles.filter(f => f.path.startsWith(selectedFile.path + '/')).length} items</p>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button className="action-btn primary">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="action-btn secondary">
                  <Edit3 className="w-4 h-4" />
                  Edit Details
                </button>
                <button 
                  className="action-btn danger"
                  onClick={() => {
                    if (confirm(`Delete ${selectedFile.name}? This action cannot be undone.`)) {
                      deleteFile(selectedFile.id);
                      setSelectedFile(null);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="no-file-selected">
              <FolderOpen className="w-16 h-16" />
              <h3>No File Selected</h3>
              <p>Select a file or folder from the tree to view details</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="file-toolbar">
          <div className="toolbar-section">
            <button
              className="toolbar-btn"
              onClick={() => setShowUploadDialog(!showUploadDialog)}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              className="toolbar-btn"
              onClick={navigateToParent}
              disabled={currentPath === 'root'}
            >
              <Folder className="w-4 h-4" />
              Up
            </button>
          </div>

          <div className="toolbar-section search-section">
            <div className="search-input">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="toolbar-section view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className="upload-dialog-overlay">
            <div className="upload-dialog">
              <h3>Upload Files</h3>
              <div className="upload-area">
                <input
                  type="file"
                  multiple
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="file-input"
                />
                <div className="upload-placeholder">
                  <Upload className="w-12 h-12" />
                  <p>Drag and drop files here or click to browse</p>
                  <p className="text-sm text-[#A1A1AA]">Supports: Images, PDFs, Videos, Archives</p>
                </div>
              </div>
              <button
                className="close-upload-btn"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .file-management {
          display: grid;
          grid-template-columns: 300px 1fr;
          grid-template-rows: auto 1fr;
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

        .file-management-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          padding: 0 24px 24px;
          overflow: hidden;
        }

        .file-tree-sidebar {
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

        .create-folder-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #3ECF8E;
          color: #000000;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .create-folder-btn:hover {
          background: #34b27b;
        }

        .create-folder-form {
          padding: 16px;
          border-top: 1px solid #27272A;
          display: flex;
          gap: 8px;
        }

        .folder-input {
          flex: 1;
          padding: 8px 12px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 6px;
          color: #FFFFFF;
          font-size: 14px;
        }

        .folder-input:focus {
          outline: none;
          border-color: #3ECF8E;
        }

        .folder-actions {
          display: flex;
          gap: 8px;
        }

        .confirm-folder-btn,
        .cancel-folder-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .confirm-folder-btn {
          background: #3ECF8E;
          color: #000000;
        }

        .confirm-folder-btn:hover {
          background: #34b27b;
        }

        .cancel-folder-btn {
          background: #27272A;
          color: #FFFFFF;
        }

        .cancel-folder-btn:hover {
          background: #3a3a3d;
        }

        .tree-content {
          padding: 8px;
          border-bottom: 1px solid #27272A;
          background: #09090B;
        }

        .breadcrumb-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin: 4px 0;
        }

        .breadcrumb-separator {
          color: #A1A1AA;
          font-size: 12px;
        }

        .breadcrumb-link {
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
          text-decoration: none;
        }

        .breadcrumb-link:hover {
          background: #27272A;
          color: #FFFFFF;
        }

        .breadcrumb-link.active {
          background: #3ECF8E;
          color: #000000;
        }

        .tree-files {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .tree-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 2px;
        }

        .tree-item:hover {
          background: #27272A;
        }

        .tree-item.selected {
          background: #3ECF8E20;
          border-left: 3px solid #3ECF8E;
        }

        .tree-item-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tree-item-content {
          flex: 1;
          min-width: 0;
        }

        .tree-item-name {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #FFFFFF;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tree-item-meta {
          font-size: 11px;
          color: #71717A;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tree-item-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .tree-item:hover .tree-item-actions {
          opacity: 1;
        }

        .tree-action-btn {
          padding: 4px;
          background: #27272A;
          border: none;
          border-radius: 4px;
          color: #FFFFFF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          transition: all 0.2s;
        }

        .tree-action-btn:hover {
          background: #3ECF8E;
          color: #000000;
        }

        .tree-action-btn.delete {
          background: #dc2626;
        }

        .tree-action-btn.delete:hover {
          background: #ef4444;
        }

        .file-details-panel {
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
          gap: 4px;
          font-size: 12px;
          color: #A1A1AA;
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

        .preview-image {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 4px;
        }

        .file-preview-placeholder {
          text-align: center;
        }

        .folder-preview {
          text-align: center;
        }

        .detail-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
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

        .action-btn.danger {
          background: #dc2626;
          color: #FFFFFF;
        }

        .action-btn.danger:hover {
          background: #ef4444;
        }

        .no-file-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #A1A1AA;
        }

        .file-toolbar {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .toolbar-section {
          display: flex;
          gap: 8px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #27272A;
          border: 1px solid #3a3a3d;
          border-radius: 6px;
          color: #FFFFFF;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .toolbar-btn:hover {
          background: #3a3a3d;
          border-color: #3ECF8E;
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .search-section {
          flex: 1;
          max-width: 400px;
          margin: 0 24px;
        }

        .search-input {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #27272A;
          border: 1px solid #3a3a3d;
          border-radius: 6px;
        }

        .search-input input {
          flex: 1;
          background: transparent;
          border: none;
          color: #FFFFFF;
          font-size: 14px;
          outline: none;
        }

        .view-toggle {
          gap: 4px;
        }

        .view-btn {
          padding: 6px 12px;
          background: #27272A;
          border: 1px solid #3a3a3d;
          border-radius: 4px;
          color: #A1A1AA;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .view-btn.active {
          background: #3ECF8E;
          color: #000000;
          border-color: #3ECF8E;
        }

        .upload-dialog-overlay {
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
        }

        .upload-dialog {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 16px;
          padding: 32px;
          width: 500px;
          text-align: center;
        }

        .upload-dialog h3 {
          font-size: 20px;
          margin-bottom: 24px;
          color: #FFFFFF;
        }

        .upload-area {
          border: 2px dashed #3a3a3d;
          border-radius: 12px;
          padding: 40px 20px;
          margin-bottom: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-area:hover {
          border-color: #3ECF8E;
          background: #3ECF8E10;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .file-input {
          display: none;
        }

        .close-upload-btn {
          padding: 12px 24px;
          background: #27272A;
          border: none;
          border-radius: 8px;
          color: #FFFFFF;
          cursor: pointer;
          font-weight: 500;
        }

        .close-upload-btn:hover {
          background: #3a3a3d;
        }

        @media (max-width: 768px) {
          .file-management {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;
          }

          .file-management-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            padding: 0 16px;
          }

          .file-tree-sidebar {
            order: 2;
          }

          .file-details-panel {
            order: 1;
          }

          .file-toolbar {
            order: 3;
            flex-direction: column;
            gap: 16px;
          }

          .search-section {
            max-width: 100%;
            margin: 0;
          }

          .view-toggle {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
