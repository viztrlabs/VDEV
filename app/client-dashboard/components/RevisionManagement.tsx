// Revision Management System - Phase 1 Core Feature
// Enables tracking and management of project revisions with approval workflow

import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Clock, AlertCircle, User, Calendar, Edit3, Trash2, Plus, GitBranch } from 'lucide-react';

interface Revision {
  id: string;
  revisionNumber: string;
  projectId: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  assignedTo: string;
  dueDate: Date;
  createdAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
  changes: string[];
  attachments: RevisionAttachment[];
  comments: RevisionComment[];
  approvalWorkflow: ApprovalStep[];
  currentStep: number;
  budget?: {
    estimatedHours: number;
    actualHours?: number;
    cost?: number;
    actualCost?: number;
  };
  scope: {
    include: string[];
    exclude: string[];
  };
}

interface RevisionAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface RevisionComment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

interface ApprovalStep {
  id: string;
  name: string;
  role: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  assignedTo: string;
  completedAt?: Date;
  comments?: string;
}

interface RevisionManagementProps {
  projectId: string;
  currentUser: {
    name: string;
    role: string;
    id: string;
  };
}

// RevisionManagement component with fixes
export default function RevisionManagement({ projectId, currentUser }: RevisionManagementProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'workflow'>('list');

  // Mock team members
  const teamMembers = [
    { id: 'designer1', name: 'Mike Johnson', role: 'designer' },
    { id: 'architect1', name: 'Emily Rodriguez', role: 'architect' },
    { id: '3dartist1', name: 'David Kim', role: '3d-artist' },
    { id: 'client1', name: 'Sarah Chen', role: 'client' }
  ];

  // Mock data for demonstration
  useEffect(() => {
    const mockRevisions: Revision[] = [
      {
        id: 'rev_001',
        revisionNumber: 'REV-001',
        projectId: 'proj_001',
        title: 'Exterior Rendering Improvements',
        description: 'Enhance exterior lighting and material details',
        status: 'completed',
        requestedBy: 'Emily Rodriguez',
        assignedTo: 'David Kim',
        dueDate: new Date('2024-12-20'),
        createdAt: new Date('2024-12-15'),
        submittedAt: new Date('2024-12-16'),
        completedAt: new Date('2024-12-19'),
        changes: [
          'Updated exterior material library',
          'Enhanced shadow calculations',
          'Improved atmospheric effects',
          'Added sun-glow integration'
        ],
        attachments: [
          {
            id: 'att_001',
            name: 'Exterior_Rendering_Improvements.pdf',
            url: '/downloads/rev1/docs.pdf',
            size: 2.4,
            type: 'application/pdf',
            uploadedBy: 'David Kim',
            uploadedAt: new Date('2024-12-19')
          },
          {
            id: 'att_002',
            name: 'Exterior_Rendering_Improvements_V04.jpg',
            url: '/downloads/rev1/images/exterior_v04.jpg',
            size: 45.2,
            type: 'image/jpeg',
            uploadedBy: 'David Kim',
            uploadedAt: new Date('2024-12-19')
          }
        ],
        comments: [
          {
            id: 'comment_001',
            author: 'Sarah Chen',
            content: 'Great improvements to the exterior lighting!',
            createdAt: new Date('2024-12-17'),
            replies: []
          },
          {
            id: 'comment_002',
            author: 'Emily Rodriguez',
            content: 'The material changes look professional and consistent with the overall design.',
            createdAt: new Date('2024-12-18'),
            replies: []
          }
        ],
        approvalWorkflow: [
          {
            id: 'step_1',
            name: 'Design Review',
            role: 'designer',
            status: 'completed',
            assignedTo: 'David Kim',
            completedAt: new Date('2024-12-18'),
            comments: 'Approved with minor suggestions for glass materials'
          },
          {
            id: 'step_2',
            name: 'Client Approval',
            role: 'client',
            status: 'completed',
            assignedTo: 'Sarah Chen',
            completedAt: new Date('2024-12-19'),
            comments: 'Overall excellent work, approved'
          }
        ],
        currentStep: 2,
        budget: {
          estimatedHours: 16,
          actualHours: 14,
          cost: 2240,
          actualCost: 1960
        },
scope: {
           include: ['exterior materials', 'lighting effects', 'atmospheric effects'],
           exclude: ['structural changes', 'new architectural elements']
         },
         changes: ['Updated exterior material specifications', 'Enhanced lighting fixtures'],
         attachments: [],
         comments: []
       },
      {
        id: 'rev_002',
        revisionNumber: 'REV-002',
        projectId: 'proj_001',
        title: 'Interior Layout Optimization',
        description: 'Optimize interior space usage and flow',
        status: 'in-progress',
        requestedBy: 'David Kim',
        assignedTo: 'Alex Martinez',
        dueDate: new Date('2024-12-25'),
        createdAt: new Date('2024-12-20'),
        submittedAt: new Date('2024-12-21'),
        lineItems: [
          { id: 'item1', description: 'Kitchen layout redesign', quantity: 1, estimatedHours: 8 },
          { id: 'item2', description: 'Bathroom optimization', quantity: 2, estimatedHours: 6 },
          { id: 'item3', description: 'Open plan integration', quantity: 1, estimatedHours: 4 }
        ],
        approvalWorkflow: [
          {
            id: 'step_1',
            name: 'Design Review',
            role: 'designer',
            status: 'completed',
            assignedTo: 'Alex Martinez',
            completedAt: new Date('2024-12-22'),
            comments: 'Solid design, good flow'
          },
          {
            id: 'step_2',
            name: 'Internal Review',
            role: 'architect',
status: 'submitted',
            assignedTo: 'Emily Rodriguez',
            comments: 'Reviewing with client feedback'
          }
        ],
        currentStep: 2,
        budget: {
          estimatedHours: 18,
          actualHours: 12,
          cost: 2160,
          actualCost: 1440
        },
        scope: {
          include: ['interior layout', 'space optimization', 'flow improvement'],
          exclude: ['exterior changes', 'structural modifications']
        }
      },
      {
        id: 'rev_003',
        revisionNumber: 'REV-003',
        projectId: 'proj_002',
        title: 'Model Architecture Refinement',
        description: 'Refine architectural model and structural elements',
        status: 'draft',
        requestedBy: 'Emily Rodriguez',
        assignedTo: 'Alex Martinez',
        dueDate: new Date('2024-12-30'),
        createdAt: new Date('2024-12-24'),
        approvalWorkflow: [
          {
            id: 'step_1',
            name: 'Architecture Review',
            role: 'architect',
            status: 'pending',
            assignedTo: 'Alex Martinez',
            comments: ''
          },
          {
            id: 'step_2',
            name: 'Structural Review',
            role: 'engineer',
            status: 'pending',
            assignedTo: 'Technical Team'
          },
          {
            id: 'step_3',
            name: 'Client Sign-off',
            role: 'client',
            status: 'pending',
            assignedTo: 'Sarah Chen'
          }
        ],
        currentStep: 1,
        budget: {
          estimatedHours: 24,
          actualHours: 0,
          cost: 2400,
          actualCost: 0
        },
        scope: {
          include: ['architectural refinement', 'structural optimization', 'material selection'],
          exclude: ['cosmetic changes', 'non-critical updates']
        }
      }
    ];

    setRevisions(mockRevisions);
  }, []);

  const createRevision = () => {
    const newRevision: Revision = {
      id: `rev_${Date.now()}`,
      revisionNumber: `REV-${String(revisions.length + 1).padStart(3, '0')}`,
      projectId: projectId,
      title: '',
      description: '',
      status: 'draft',
      requestedBy: currentUser.name,
      assignedTo: teamMembers[0].id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      createdAt: new Date(),
      approvalWorkflow: [
        {
          id: 'step_1',
          name: 'Design Review',
          role: 'designer',
          status: 'pending',
          assignedTo: currentUser.id,
          comments: ''
        }
      ],
      currentStep: 0,
      budget: {
        estimatedHours: 0,
        actualHours: 0,
        cost: 0,
        actualCost: 0
      },
      scope: {
        include: [],
        exclude: []
      }
    };

    setRevisions(prev => [...prev, newRevision]);
    setSelectedRevision(newRevision);
    setShowRevisionForm(true);
  };

  const updateRevision = (revisionId: string, updates: Partial<Revision>) => {
    setRevisions(prev => prev.map(revision => 
      revision.id === revisionId 
        ? { ...revision, ...updates }
        : revision
    ));
  };

  const deleteRevision = (revisionId: string) => {
    setRevisions(prev => prev.filter(revision => revision.id !== revisionId));
    if (selectedRevision?.id === revisionId) {
      setSelectedRevision(null);
    }
  };

  const submitRevision = (revisionId: string) => {
    updateRevision(revisionId, { 
      status: 'submitted', 
      submittedAt: new Date() 
    });
  };

  const completeRevision = (revisionId: string, comments: string) => {
    const revision = revisions.find(r => r.id === revisionId);
    if (!revision) return;

    const updatedWorkflow = revision.approvalWorkflow.map((step, index) => {
      if (index === revision.currentStep) {
        return { ...step, status: 'completed', completedAt: new Date(), comments };
      }
      return step;
    });

    updateRevision(revisionId, {
      status: 'completed',
      completedAt: new Date(),
      approvalWorkflow: updatedWorkflow,
      currentStep: revision.currentStep + 1
    });
  };

  const getRevisionStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRevisionStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRevisions = revisions.filter(revision => 
    filter === 'all' || revision.status === filter
  );

  return (
    <div className="revision-management">
      <div className="section-header">
        <h2>🔄 Revision Management</h2>
        <p>Track and manage project revisions with approval workflow</p>
      </div>

      <div className="revision-actions">
        <button 
          className="create-revision-btn"
          onClick={() => {
            createRevision();
            setShowRevisionForm(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Create Revision
        </button>
      </div>

      {showRevisionForm && selectedRevision && (
        <div className="revision-form-overlay">
          <div className="revision-form">
            <h3>Create New Revision</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Revision Number</label>
                <input
                  type="text"
                  value={selectedRevision.revisionNumber}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={selectedRevision.title}
                  onChange={(e) => updateRevision(selectedRevision.id, { title: e.target.value })}
                  placeholder="e.g., Exterior Rendering Improvements"
                />
              </div>

              <div className="form-group">
                <label>Requested By</label>
                <select
                  value={selectedRevision.requestedBy}
                  onChange={(e) => updateRevision(selectedRevision.id, { requestedBy: e.target.value })}
                >
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned To</label>
                <select
                  value={selectedRevision.assignedTo}
                  onChange={(e) => updateRevision(selectedRevision.id, { assignedTo: e.target.value })}
                >
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={selectedRevision.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => updateRevision(selectedRevision.id, { 
                    dueDate: new Date(e.target.value) 
                  })}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={selectedRevision.description}
                onChange={(e) => updateRevision(selectedRevision.id, { description: e.target.value })}
                placeholder="Describe the revision requirements..."
                rows={4}
              />
            </div>

            <div className="form-group full-width">
              <label>Include Scope</label>
              <textarea
                value={selectedRevision.scope.include.join(', ')}
                onChange={(e) => updateRevision(selectedRevision.id, { 
                  scope: { 
                    ...selectedRevision.scope, 
                    include: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  } 
                })}
                placeholder="What will be included (comma separated)"
                rows={2}
              />
            </div>

            <div className="form-group full-width">
              <label>Exclude Scope</label>
              <textarea
                value={selectedRevision.scope.exclude.join(', ')}
                onChange={(e) => updateRevision(selectedRevision.id, { 
                  scope: { 
                    ...selectedRevision.scope, 
                    exclude: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  } 
                })}
                placeholder="What will be excluded (comma separated)"
                rows={2}
              />
            </div>

            <div className="form-group full-width">
              <label>Estimated Hours</label>
              <input
                type="number"
                value={selectedRevision.budget?.estimatedHours}
                onChange={(e) => updateRevision(selectedRevision.id, { 
                  budget: { 
                    ...selectedRevision.budget, 
                    estimatedHours: parseInt(e.target.value) || 0 
                  } 
                })}
                min="0"
              />
            </div>

            <div className="approval-workflow-section">
              <h4>Approval Workflow</h4>
              {selectedRevision.approvalWorkflow?.map((step, index) => (
                <div key={step.id} className="workflow-step">
                  <div className="workflow-step-header">
                    <span className={`step-number ${step.status}`}>
                      {index + 1}
                    </span>
                    <div className="step-info">
                      <strong>{step.name}</strong>
                      <span>Assigned to: {teamMembers.find(m => m.id === step.assignedTo)?.name || step.assignedTo}</span>
                    </div>
                    <span className={`step-status ${step.status}`}>{
                      step.status.charAt(0).toUpperCase() + step.status.slice(1)
                    }</span>
                  </div>
                  {step.status === 'pending' && index === selectedRevision.currentStep && (
                    <div className="step-actions">
                      <button
                        className="complete-step-btn"
                        onClick={() => {
                          const updatedWorkflow = selectedRevision.approvalWorkflow?.map((s, i) => {
                            if (i === index) {
                              return { ...s, status: 'completed', completedAt: new Date() };
                            } else if (i > index) {
                              return { ...s, status: 'pending' };
                            }
                            return s;
                          });
                          updateRevision(selectedRevision.id, { 
                            approvalWorkflow: updatedWorkflow,
                            currentStep: index + 1
                          });
                        }}
                      >
                        Complete Step
                      </button>
                    </div>
                  )}
                  {step.status === 'completed' && step.completedAt && (
                    <div className="step-completed-info">
                      <span>Completed: {step.completedAt.toLocaleDateString()}</span>
                      {step.comments && (
                        <div className="step-comments">
                          Comments: {step.comments}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowRevisionForm(false);
                  setSelectedRevision(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={() => {
                  if (selectedRevision.title && selectedRevision.description) {
                    setShowRevisionForm(false);
                  }
                }}
                disabled={!selectedRevision?.title || !selectedRevision?.description}
              >
                Save Revision
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="revisions-list">
        <div className="revisions-header">
          <h3>All Revisions</h3>
          <div className="filter-tabs">
            {['all', 'draft', 'submitted', 'approved', 'rejected', 'completed'].map(status => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="count">
                  {revisions.filter(r => status === 'all' || r.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredRevisions.length === 0 ? (
          <div className="no-revisions">
            <GitBranch className="w-12 h-12" />
            <p>No revisions found</p>
          </div>
        ) : (
          <div className="revisions-grid">
            {filteredRevisions.map(revision => (
              <div key={revision.id} className="revision-card">
                <div className="revision-card-header">
                  <div className="revision-info">
                    <h4>{revision.revisionNumber} - {revision.title}</h4>
                    <span className={`status-badge ${revision.status}`}>
                      {getRevisionStatusIcon(revision.status)}
                      {revision.status.charAt(0).toUpperCase() + revision.status.slice(1)}
                    </span>
                  </div>
                  <div className="revision-actions">
                    {revision.status === 'draft' && (
                      <button
                        className="action-btn submit-btn"
                        onClick={() => submitRevision(revision.id)}
                        title="Submit for Review"
                      >
                        Submit
                      </button>
                    )}
                    {revision.status === 'submitted' && (
                      <button
                        className="action-btn complete-btn"
                        onClick={() => {
                          setSelectedRevision(revision);
                          setShowRevisionForm(true);
                        }}
                        title="Update Progress"
                      >
                        Update
                      </button>
                    )}
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedRevision(revision)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteRevision(revision.id)}
                      title="Delete Revision"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="revision-content">
                  <div className="revision-description">
                    <p>{revision.description}</p>
                  </div>
                  <div className="revision-meta">
                    <div className="meta-item">
                      <strong>Requested by:</strong> {revision.requestedBy}
                    </div>
                    <div className="meta-item">
                      <strong>Assigned to:</strong> {teamMembers.find(m => m.id === revision.assignedTo)?.name || revision.assignedTo}
                    </div>
                    <div className="meta-item">
                      <strong>Due:</strong> {revision.dueDate.toLocaleDateString()}
                    </div>
                    <div className="meta-item">
                      <strong>Steps:</strong> {revision.currentStep + 1}/{revision.approvalWorkflow?.length}
                    </div>
                  </div>

                  {revision.budget?.estimatedHours && (
                    <div className="budget-info">
                      <span>
                        Budget: {revision.budget.actualHours || 0}/{revision.budget.estimatedHours} hours
                      </span>
                      <span>
                        Cost: ${revision.budget.actualCost || 0}/${revision.budget.cost || 0}
                      </span>
                    </div>
                  )}

                  {revision.status === 'submitted' && (
                    <div className="workflow-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${((revision.currentStep + 1) / (revision.approvalWorkflow?.length || 1)) * 100}%` 
                          }}
                        />
                      </div>
                      <span>Workflow Progress: {Math.round(((revision.currentStep + 1) / (revision.approvalWorkflow?.length || 1)) * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRevision && (
        <div className="revision-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Revision Details - {selectedRevision.revisionNumber}</h3>
              <button 
                onClick={() => {
                  setSelectedRevision(null);
                  setShowRevisionForm(false);
                }}
                className="close-modal-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Revision Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Title:</strong> {selectedRevision.title}
                  </div>
                  <div className="info-item">
<strong>Status:</strong> 
                     <span className={`status-badge ${selectedRevision.status}`}>
                       {getRevisionStatusIcon(selectedRevision.status)}
                       {selectedRevision.status.charAt(0).toUpperCase() + selectedRevision.status.slice(1)}
                     </span>
                  </div>
                  <div className="info-item">
                    <strong>Requested by:</strong> {selectedRevision.requestedBy}
                  </div>
                  <div className="info-item">
                    <strong>Assigned to:</strong> {teamMembers.find(m => m.id === selectedRevision.assignedTo)?.name || selectedRevision.assignedTo}
                  </div>
                  <div className="info-item">
                    <strong>Created:</strong> {selectedRevision.createdAt.toLocaleDateString()}
                  </div>
                  {selectedRevision.submittedAt && (
                    <div className="info-item">
                      <strong>Submitted:</strong> {selectedRevision.submittedAt.toLocaleDateString()}
                    </div>
                  )}
                  {selectedRevision.completedAt && (
                    <div className="info-item">
                      <strong>Completed:</strong> {selectedRevision.completedAt.toLocaleDateString()}
                    </div>
                  )}
                  <div className="info-item">
                    <strong>Due Date:</strong> {selectedRevision.dueDate.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Description</h4>
                <p>{selectedRevision.description}</p>
             �่                <div className="scope-info">
                  <div className="scope-item">
                    <strong>Include:</strong> {selectedRevision.scope.include.join(', ')}
                  </div>
                  <div className="scope-item">
                    <strong>Exclude:</strong> {selectedRevision.scope.exclude.join(', ')}
                  </div>
                </div>
              </div>

              {selectedRevision.approvalWorkflow && (
                <div className="detail-section">
                  <h4>Approval Workflow</h4>
                  <div className="workflow-timeline">
                    {selectedRevision.approvalWorkflow.map((step, index) => (
                      <div key={step.id} className="workflow-step-timeline">
                        <div className={`step-node ${step.status}`}>
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : step.status === 'in-progress' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <div className="step-placeholder" />
                          )}
                        </div>
                        <div className="step-content">
                          <strong>{step.name}</strong>
                          <span>Assigned to: {teamMembers.find(m => m.id === step.assignedTo)?.name || step.assignedTo}</span>
                          {step.completedAt && (
                            <span>Completed: {step.completedAt.toLocaleDateString()}</span>
                          )}
                          {step.comments && (
                            <div className="step-comments">
                              Comments: {step.comments}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRevision.attachments && selectedRevision.attachments.length > 0 && (
                <div className="detail-section">
                  <h4>Attachments</h4>
                  <div className="attachments-list">
                    {selectedRevision.attachments.map((attachment, index) => (
                      <div key={attachment.id} className="attachment-item">
                        <FileText className="w-4 h-4" />
                        <div className="attachment-info">
                          <strong>{attachment.name}</strong>
                          <span>{(attachment.size / 1024).toFixed(1)} KB</span>
                          <span>Uploaded by {attachment.uploadedBy} on {attachment.uploadedAt.toLocaleDateString()}</span>
                        </div>
                        <button
                          className="download-attachment-btn"
                          onClick={() => {
                            // Download functionality
                            console.log('Downloading:', attachment.name);
                          }}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setSelectedRevision(null);
                  setShowRevisionForm(false);
                }}
                className="close-btn"
              >
                Close
              </button>
              {selectedRevision.status === 'draft' && (
                <button 
                  onClick={() => submitRevision(selectedRevision.id)}
                  className="submit-btn"
                >
                  Submit for Review
                </button>
              )}
              {selectedRevision.status === 'submitted' && (
                <button 
                  onClick={() => {
                    // Mark as completed
                    completeRevision(selectedRevision.id, 'Revision completed successfully');
                    setSelectedRevision(null);
                  }}
                  className="complete-btn"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .revision-management {
          background: #0F172A;
          color: #F8FAFC;
          font-family: system-ui, sans-serif;
        }

        .section-header {
          padding: 32px;
          border-bottom: 1px solid #27272A;
        }

        .section-header h2 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #FFFFFF;
        }

        .section-header p {
          color: #94A3B8;
          font-size: 16px;
        }

        .revision-actions {
          padding: 0 32px;
          margin-bottom: 32px;
        }

        .create-revision-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #3ECF8E;
          color: #000000;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .create-revision-btn:hover {
          background: #34b27b;
          transform: translateY(-1px);
        }

        .revision-form-overlay {
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

        .revision-form {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .revision-form h3 {
          font-size: 24px;
          margin-bottom: 24px;
          color: #FFFFFF;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #A1A1AA;
          font-size: 14px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3ECF8E;
          box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.1);
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .approval-workflow-section {
          margin: 32px 0;
        }

        .approval-workflow-section h4 {
          font-size: 18px;
          margin-bottom: 16px;
          color: #FFFFFF;
        }

        .workflow-step {
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .workflow-step-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .step-number.completed {
          background: #10b981;
          color: #ffffff;
        }

        .step-number.in-progress {
          background: #3b82f6;
          color: #ffffff;
          animation: pulse 2s infinite;
        }

        .step-number.pending {
          background: #6b7280;
          color: #d1d5db;
        }

        .step-info {
          flex: 1;
        }

        .step-info strong {
          display: block;
          color: #FFFFFF;
          margin-bottom: 4px;
        }

        .step-info span {
          font-size: 12px;
          color: #A1A1AA;
        }

        .step-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .step-status.completed {
          background: #10b981;
          color: #ffffff;
        }

        .step-status.in-progress {
          background: #3b82f6;
          color: #ffffff;
        }

        .step-status.pending {
          background: #6b7280;
          color: #d1d5db;
        }

        .step-actions {
          margin-top: 12px;
        }

        .complete-step-btn {
          padding: 8px 16px;
          background: #3ECF8E;
          color: #000000;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .complete-step-btn:hover {
          background: #34b27b;
        }

        .step-completed-info {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #27272A;
          font-size: 12px;
          color: #A1A1AA;
        }

        .step-comments {
          margin-top: 4px;
          font-style: italic;
          color: #94A3B8;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }

        .cancel-btn,
        .save-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #27272A;
          color: #FFFFFF;
          flex: 1;
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
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quotes-header {
          padding: 0 32px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quotes-header h3 {
          font-size: 20px;
          color: #FFFFFF;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tab {
          padding: 8px 16px;
          background: #27272A;
          border: 1px solid #3a3a3d;
          border-radius: 6px;
          color: #A1A1AA;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-tab.active {
          background: #3ECF8E;
          color: #000000;
          border-color: #3ECF8E;
        }

        .count {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .no-revisions {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: #A1A1AA;
        }

        .revisions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          padding: 0 32px;
        }

        .revision-card {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .revision-card:hover {
          border-color: #3ECF8E;
          transform: translateY(-2px);
        }

        .revision-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .revision-info h4 {
          margin: 0 0 8px 0;
          color: #FFFFFF;
          font-size: 16px;
        }

        .revision-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
n          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .submit-btn { background: #3b82f6; color: #ffffff; }
        .submit-btn:hover { background: #2563eb; }

        .update-btn { background: #10b981; color: #ffffff; }
        .update-btn:hover { background: #059669; }

        .view-btn { background: #6366f1; color: #ffffff; }
        .view-btn:hover { background: #4f46e5; }

        .delete-btn { background: #dc2626; color: #ffffff; }
        .delete-btn:hover { background: #ef4444; }

        .revision-content {
          margin-bottom: 16px;
        }

        .revision-description {
          margin-bottom: 12px;
        }

        .revision-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          color: #A1A1AA;
        }

        .workflow-progress {
          background: #27272A;
          border-radius: 4px;
          padding: 8px;
          margin-top: 12px;
        }

        .progress-bar {
          background: #3a3a3d;
          border-radius: 2px;
          height: 6px;
          margin-bottom: 4px;
          overflow: hidden;
        }

        .progress-fill {
          background: #3ECF8E;
          height: 100%;
          transition: width 0.3s ease;
        }

        .modal-content {
          background: #18181B;
          border: 1px solid #27272A;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          font-size: 20px;
          color: #FFFFFF;
        }

        .close-modal-btn {
          padding: 8px;
          background: #27272A;
          border: none;
          border-radius: 6px;
          color: #FFFFFF;
          cursor: pointer;
          font-size: 16px;
        }

        .modal-body .detail-section {
          margin-bottom: 24px;
        }

        .modal-body h4 {
          font-size: 16px;
          color: #FFFFFF;
          margin-bottom: 12px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .info-item {
          padding: 8px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 6px;
          font-size: 14px;
        }

        .info-item strong {
          color: #FFFFFF;
          display: block;
          margin-bottom: 4px;
        }

        .workflow-timeline {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 0;
        }

        .workflow-step-timeline {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .step-node {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .step-node.completed {
          background: #10b981;
          color: #ffffff;
          border: 2px solid #10b981;
        }

        .step-node.in-progress {
          background: #3b82f6;
          color: #ffffff;
          border: 2px solid #3b82f6;
          animation: pulse 2s infinite;
        }

        .step-node.pending {
          background: #6b7280;
          color: #d1d5db;
          border: 2px solid #6b7280;
        }

        .step-content {
          flex: 1;
        }

        .step-content strong {
          display: block;
          color: #FFFFFF;
          margin-bottom: 4px;
        }

        .step-content span {
          font-size: 12px;
          color: #A1A1AA;
        }

        .attachments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #09090B;
          border: 1px solid #27272A;
          border-radius: 8px;
        }

        .attachment-info {
          flex: 1;
        }

        .download-attachment-btn {
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

        .download-attachment-btn:hover {
          background: #34b27b;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .revision-management {
            padding: 16px;
          }

          .section-header {
            padding: 16px;
          }

          .revisions-grid {
            grid-template-columns: 1fr;
            padding: 0 16px;
          }

          .revision-form {
            padding: 20px;
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
}
