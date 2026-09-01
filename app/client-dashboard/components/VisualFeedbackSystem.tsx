// Visual Feedback System - Phase 1 Core Feature
// Enables client to add, assign, and resolve visual comments on project assets

import React, { useState, useEffect } from 'react';
import { Pin, MessageSquare, User, Clock, CheckCircle2, AlertCircle, MapPin, Trash2, Edit3 } from 'lucide-react';

interface Feedback {
  id: string;
  assetName: string;
  assetType: 'image' | '3d-model' | 'video' | 'pdf';
  x: number;
  y: number;
  width: number;
  height: number;
  comment: string;
  author: string;
  authorRole: 'client' | 'designer' | 'architect';
  assignedTo: string;
  status: 'open' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: Date;
  resolvedAt?: Date;
  resolution: string;
}

interface VisualFeedbackSystemProps {
  projectId: string;
  assets: Array<{
    id: string;
    name: string;
    type: 'image' | '3d-model' | 'video' | 'pdf';
    url: string;
    thumbnail?: string;
  }>;
}

export default function VisualFeedbackSystem({ projectId, assets }: VisualFeedbackSystemProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>(assets[0]?.id || '');
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [newFeedback, setNewFeedback] = useState<Partial<Feedback> | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [showResolution, setShowResolution] = useState<string | null>(null);

  // Mock client data
  const currentUser = {
    name: 'Sarah Chen',
    role: 'client'
  };

  // Mock team members
  const teamMembers = [
    { id: 'designer1', name: 'Mike Johnson', role: 'designer' },
    { id: 'architect1', name: 'Emily Rodriguez', role: 'architect' },
    { id: '3dartist1', name: 'David Kim', role: '3d-artist' }
  ];

  const addFeedback = (feedbackData: Partial<Feedback>) => {
    const newFeedback: Feedback = {
      id: `feedback_${Date.now()}`,
      assetName: assets.find(a => a.id === selectedAsset)?.name || '',
      assetType: assets.find(a => a.id === selectedAsset)?.type || 'image',
      x: feedbackData.x || 0,
      y: feedbackData.y || 0,
      width: feedbackData.width || 100,
      height: feedbackData.height || 100,
      comment: feedbackData.comment || '',
      author: currentUser.name,
      authorRole: currentUser.role,
      assignedTo: feedbackData.assignedTo || teamMembers[0].id,
      status: 'open',
      createdAt: new Date(),
      resolution: ''
    };

    setFeedbacks(prev => [...prev, newFeedback]);
    setIsAddingFeedback(false);
    setNewFeedback(null);
  };

  const resolveFeedback = (feedbackId: string, resolution: string) => {
    setFeedbacks(prev => prev.map(fb => 
      fb.id === feedbackId 
        ? { ...fb, status: 'resolved', resolvedAt: new Date(), resolution } 
        : fb
    ));
    setShowResolution(null);
  };

  const deleteFeedback = (feedbackId: string) => {
    setFeedbacks(prev => prev.filter(fb => fb.id !== feedbackId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => 
    filter === 'all' || fb.status === filter
  );

  return (
    <section className="visual-feedback-system">
      <div className="section-header">
        <h2>🎯 Visual Feedback / Pin Comments</h2>
        <p>Collaborate on project assets with targeted feedback</p>
      </div>

      <div className="feedback-container">
        {/* Asset Selection */}
        <div className="asset-selection">
          <h3>Asset Selection</h3>
          <div className="asset-grid">
            {assets.map(asset => (
              <button
                key={asset.id}
                className={'asset-card ' + (selectedAsset === asset.id ? 'selected' : '')}
                onClick={() => setSelectedAsset(asset.id)}
              >
                <div className="asset-thumbnail">
                  {asset.thumbnail ? (
                    <img src={asset.thumbnail} alt={asset.name} />
                  ) : (
                    <div className="placeholder-thumbnail">
                      {asset.type === '3d-model' ? '🔳' : 
                       asset.type === 'video' ? '▶️' : 
                       asset.type === 'pdf' ? '📄' : '🖼️'}
                    </div>
                  )}
                </div>
                <div className="asset-info">
                  <span className="asset-name">{asset.name}</span>
                  <span className="asset-type">{asset.type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Tools */}
        <div className="feedback-tools">
          <div className="tool-header">
            <h3>Feedback Tools</h3>
            <button 
              className="add-feedback-btn"
              onClick={() => setIsAddingFeedback(true)}
            >
              <Pin className="w-4 h-4" />
              Add Feedback
            </button>
          </div>

          {/* Feedback Overlay */}
          {isAddingFeedback && (
            <div className="feedback-overlay">
              <div className="feedback-form">
                <h4>Add New Feedback</h4>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={newFeedback?.comment || ''}
                    onChange={(e) => setNewFeedback(prev => ({ 
                      ...prev, 
                      comment: e.target.value,
                      x: 50, y: 50, width: 150, height: 150
                    }))
                    }
                    placeholder="Describe your feedback..."
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    value={newFeedback?.assignedTo || ''}
                    onChange={(e) => setNewFeedback(prev => ({ 
                      ...prev, 
                      assignedTo: e.target.value 
                    }))
                    }
                  >
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setIsAddingFeedback(false);
                      setNewFeedback(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn"
                    onClick={() => addFeedback(newFeedback || {})}
                    disabled={!newFeedback?.comment}
                  >
                    Add Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback List */}
          <div className="feedback-list">
            <div className="feedback-header">
              <h4>Feedback Items</h4>
              <div className="filter-tabs">
                {['all', 'open', 'in-progress', 'resolved'].map(status => (
                  <button
                    key={status}
                    className={'filter-tab ' + (filter === status ? 'active' : '')}
                    onClick={() => setFilter(status as any)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className="count">
                      {filteredFeedbacks.filter(fb => status === 'all' || fb.status === status).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filteredFeedbacks.length === 0 ? (
              <div className="no-feedback">
                <MessageSquare className="w-12 h-12" />
                <p>No feedback items found</p>
              </div>
            ) : (
              <div className="feedback-items">
                {filteredFeedbacks.map(feedback => (
                  <div key={feedback.id} className="feedback-item">
                    <div className="feedback-header">
                      <div className="feedback-info">
                        <span className={'status-badge ' + feedback.status}>
                          {getStatusIcon(feedback.status)}
                          {feedback.status.replace('-', ' ')}
                        </span>
                        <span className="author">by {feedback.author}</span>
                        <span className="assigned-to">assigned to {teamMembers.find(m => m.id === feedback.assignedTo)?.name}</span>
                      </div>
                      <div className="feedback-actions">
                        {feedback.status === 'open' && (
                          <button
                            className="resolve-btn"
                            onClick={() => setShowResolution(feedback.id)}
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => deleteFeedback(feedback.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="feedback-content">
                      <p>{feedback.comment}</p>
                      <div className="feedback-meta">
                        <span>Created: {feedback.createdAt.toLocaleDateString()}</span>
                        {feedback.resolvedAt && (
                          <span>Resolved: {feedback.resolvedAt.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {showResolution === feedback.id && (
                      <div className="resolution-form">
                        <h5>Resolve Feedback</h5>
                        <textarea
                          placeholder="Describe how this was resolved..."
                          onChange={(e) => {
                            // Store resolution locally for now
                            // In real implementation, this would update state
                          }}
                        />
                        <div className="resolution-actions">
                          <button 
                            onClick={() => {
                              // Implement resolution logic
                              resolveFeedback(feedback.id, 'Resolved by team');
                            }}
                          >
                            Confirm Resolution
                          </button>
                          <button 
                            onClick={() => setShowResolution(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Asset Preview with Feedback Overlays */}
        <div className="asset-preview">
          <h3>Asset Preview with Feedback Overlays</h3>
          <div className="preview-container">
            {assets.find(a => a.id === selectedAsset) && (
              <div className="preview-wrapper">
                <img 
                  src={assets.find(a => a.id === selectedAsset)?.thumbnail} 
                  alt={assets.find(a => a.id === selectedAsset)?.name}
                  className="preview-image"
                />
                {feedbacks
                  .filter(fb => fb.assetId === selectedAsset && fb.status === 'open')
                  .map(feedback => (
                    <div
                      key={feedback.id}
                      className="feedback-overlay"
                      style={{
                        left: `${feedback.x}%`,
                        top: `${feedback.y}%`,
                        width: `${feedback.width}%`,
                        height: `${feedback.height}%`
                      }}
                    >
                      <div className="overlay-marker">
                        <Pin className="w-3 h-3" />
                      </div>
                      <div className="overlay-tooltip">
                        <strong>{feedback.author}</strong>: {feedback.comment}
                      </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      <style jsx>{`
        .visual-feedback-system {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 24px;
          min-height: 600px;
        }

        .section-header {
          grid-column: 1 / -1;
          margin-bottom: 20px;
        }

        .feedback-container {
          display: contents;
        }

        .asset-selection {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          padding: 20px;
        }

        .asset-grid {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .asset-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .asset-card:hover {
          border-color: #3ECF8E;
          background: #131315;
        }

        .asset-card.selected {
          border-color: #3ECF8E;
          background: #1a1a1d;
        }

        .asset-thumbnail {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          overflow: hidden;
          background: #27272A;
        }

        .asset-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-thumbnail {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .asset-info {
          flex: 1;
        }

        .asset-name {
          font-weight: 500;
          color: #FAFAFA;
          display: block;
          margin-bottom: 4px;
        }

        .asset-type {
          font-size: 12px;
          color: #A1A1AA;
        }

        .feedback-tools {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .add-feedback-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3ECF8E;
          color: #000000;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .add-feedback-btn:hover {
          background: #34b27b;
        }

        .feedback-overlay {
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

        .feedback-form {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          padding: 24px;
          width: 400px;
          max-width: 90vw;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #A1A1AA;
          font-size: 14px;
        }

        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 6px;
          color: #FAFAFA;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .cancel-btn,
        .save-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #27272A;
          color: #FAFAFA;
        }

        .cancel-btn:hover {
          background: #3a3a3d;
        }

        .save-btn {
          background: #3ECF8E;
          color: #000000;
        }

        .save-btn:hover:not(:disabled) {
          background: #34b27b;
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .feedback-list {
          flex: 1;
          margin-top: 20px;
          overflow-y: auto;
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tab {
          padding: 6px 12px;
          background: #27272A;
          border: 1px solid #3a3a3d;
          border-radius: 4px;
          color: #A1A1AA;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: #3ECF8E;
          color: #000000;
          border-color: #3ECF8E;
        }

        .count {
          margin-left: 6px;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
        }

        .no-feedback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #A1A1AA;
        }

        .feedback-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feedback-item {
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 8px;
          padding: 16px;
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .feedback-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .author,
        .assigned-to {
          font-size: 12px;
          color: #A1A1AA;
        }

        .feedback-actions {
          display: flex;
          gap: 8px;
        }

        .resolve-btn,
        .delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .resolve-btn {
          background: #3ECF8E;
          color: #000000;
        }

        .resolve-btn:hover {
          background: #34b27b;
        }

        .delete-btn {
          background: #dc2626;
          color: #ffffff;
        }

        .delete-btn:hover {
          background: #ef4444;
        }

        .feedback-content {
          margin: 12px 0;
        }

        .feedback-meta {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #71717A;
        }

        .resolution-form {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #27272A;
        }

        .resolution-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .resolution-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .resolution-actions button:first-child {
          background: #3ECF8E;
          color: #000000;
        }

        .resolution-actions button:last-child {
          background: #27272A;
          color: #FAFAFA;
        }

        .asset-preview {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          padding: 20px;
        }

        .preview-container {
          position: relative;
          margin-top: 16px;
          background: #09090B;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 16/9;
        }

        .preview-image {
          width: 100%;
          height: 100%;
n          object-fit: cover;
        }

        .feedback-overlay {
          position: absolute;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 10;
        }

        .overlay-marker {
          color: #3ECF8E;
          filter: drop-shadow(0 0 4px rgba(62, 207, 142, 0.5));
        }

        .overlay-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 8px 12px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 6px;
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .feedback-overlay:hover .overlay-tooltip {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .visual-feedback-system {
            grid-template-columns: 1fr;
          }

          .feedback-container {
            display: flex;
            flex-direction: column;
          }

          .asset-selection,
          .feedback-tools,
          .asset-preview {
            order: var(--order, 0);
          }
        }
      `}</style>
    </section>
  );
}
