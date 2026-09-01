// Quote Management System - Phase 2 Core Feature
// Enables comprehensive quote lifecycle management for client projects

import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Clock, AlertCircle, DollarSign, Calendar, Users, Edit3, Trash2, Plus } from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  projectId: string;
  clientName: string;
  projectName: string;
  amount: number;
  tax: number;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  lineItems: QuoteLineItem[];
  notes?: string;
  terms?: string;
}

interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'design' | 'development' | 'support' | 'consulting';
}

interface QuoteManagementProps {
  projectId?: string;
  clientId?: string;
}

export default function QuoteManagement({ projectId, clientId }: QuoteManagementProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'>('all');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Partial<Quote>>({
    quoteNumber: `QUOTE-${Date.now()}`,
    projectId: projectId || 'current-project',
    clientName: 'VizTR Client',
    projectName: 'Luxury Villa',
    amount: 0,
    tax: 18,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'draft',
    createdAt: new Date(),
    lineItems: []
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockQuotes: Quote[] = [
      {
        id: 'quote_001',
        quoteNumber: 'QUOTE-2024-001',
        projectId: 'proj_001',
        clientName: 'Luxury Properties Inc',
        projectName: 'Luxury Villa',
        amount: 125000,
        tax: 22500,
        validUntil: new Date('2024-12-15'),
        status: 'sent',
        createdAt: new Date('2024-11-15'),
        sentAt: new Date('2024-11-16'),
        acceptedAt: new Date('2024-11-20'),
        lineItems: [
          { id: 'item1', description: '3D Visualization', quantity: 1, unitPrice: 50000, total: 50000, category: 'design' },
          { id: 'item2', description: '3D Rendering', quantity: 2, unitPrice: 25000, total: 50000, category: 'design' },
          { id: 'item3', description: 'Support Package', quantity: 1, unitPrice: 25000, total: 25000, category: 'support' }
        ],
        notes: 'Initial project proposal includes comprehensive 3D visualization and rendering services.',
        terms: 'Payment due within 30 days of receipt.'
      },
      {
        id: 'quote_002',
        quoteNumber: 'QUOTE-2024-002',
        projectId: 'proj_001',
        clientName: 'Luxury Properties Inc',
        projectName: 'Luxury Villa - Expansion',
        amount: 75000,
        tax: 13500,
        validUntil: new Date('2024-12-20'),
        status: 'draft',
        createdAt: new Date('2024-11-25'),
        lineItems: [
          { id: 'item4', description: 'Additional 3D Models', quantity: 3, unitPrice: 15000, total: 45000, category: 'design' },
          { id: 'item5', description: 'Advanced Lighting', quantity: 1, unitPrice: 30000, total: 30000, category: 'development' }
        ],
        notes: 'Expansion project for existing luxury villa.',
        terms: 'Payment due within 30 days of receipt.'
      },
      {
        id: 'quote_003',
        quoteNumber: 'QUOTE-2024-003',
        projectId: 'proj_002',
        clientName: 'Modern Homes Ltd',
        projectName: 'Modern Townhouse',
        amount: 95000,
        tax: 17100,
        validUntil: new Date('2024-12-10'),
        status: 'rejected',
        createdAt: new Date('2024-11-10'),
        sentAt: new Date('2024-11-11'),
        lineItems: [
          { id: 'item6', description: 'Interior Design', quantity: 1, unitPrice: 40000, total: 40000, category: 'design' },
          { id: 'item7', description: '3D walkthroughs', quantity: 1, unitPrice: 35000, total: 35000, category: 'development' },
          { id: 'item8', description: 'Support Services', quantity: 1, unitPrice: 20000, total: 20000, category: 'support' }
        ],
        notes: 'Initial proposal for modern townhouse project.',
        terms: 'Payment due within 30 days of receipt.'
      }
    ];

    setQuotes(mockQuotes);
  }, []);

  const calculateTotal = (quote: Quote) => {
    const itemsTotal = quote.lineItems.reduce((sum, item) => sum + item.total, 0);
    return itemsTotal + quote.tax;
  };

  const createQuote = () => {
    const newQuote: Quote = {
      ...currentQuote as Quote,
      amount: calculateTotal(currentQuote as Quote),
      id: `quote_${Date.now()}`
    };
    setQuotes(prev => [...prev, newQuote]);
    setShowQuoteForm(false);
    setCurrentQuote({
      quoteNumber: `QUOTE-${Date.now()}`,
      projectId: projectId || 'current-project',
      clientName: 'VizTR Client',
      projectName: 'Luxury Villa',
      amount: 0,
      tax: 18,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      createdAt: new Date(),
      lineItems: []
    });
  };

  const updateQuote = (quoteId: string, updates: Partial<Quote>) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId 
        ? { ...quote, ...updates, amount: calculateTotal({ ...quote, ...updates }) }
        : quote
    ));
  };

  const deleteQuote = (quoteId: string) => {
    setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
  };

  const sendQuote = (quoteId: string) => {
    updateQuote(quoteId, { 
      status: 'sent', 
      sentAt: new Date() 
    });
  };

  const acceptQuote = (quoteId: string) => {
    updateQuote(quoteId, { 
      status: 'accepted', 
      acceptedAt: new Date() 
    });
  };

  const rejectQuote = (quoteId: string) => {
    updateQuote(quoteId, { status: 'rejected' });
  };

  const addLineItem = (quoteId: string, lineItem: QuoteLineItem) => {
    updateQuote(quoteId, {
      lineItems: [...(quotes.find(q => q.id === quoteId)?.lineItems || []), lineItem]
    });
  };

  const deleteLineItem = (quoteId: string, lineItemId: string) => {
    updateQuote(quoteId, {
      lineItems: quotes.find(q => q.id === quoteId)?.lineItems.filter(item => item.id !== lineItemId) || []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'sent': return <FileText className="w-4 h-4" />;
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredQuotes = quotes.filter(quote => 
    filter === 'all' || quote.status === filter
  );

  return (
    <div className="quote-management">
      <div className="section-header">
        <h2>📋 Quote Management</h2>
        <p>Manage client quotes, proposals, and billing estimates</p>
      </div>

      <div className="quote-actions">
        <button 
          className="create-quote-btn"
          onClick={() => setShowQuoteForm(true)}
        >
          <Plus className="w-4 h-4" />
          Create Quote
        </button>
      </div>

      {showQuoteForm && (
        <div className="quote-form-overlay">
          <div className="quote-form">
            <h3>Create New Quote</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Quote Number</label>
                <input
                  type="text"
                  value={currentQuote.quoteNumber}
                  onChange={(e) => setCurrentQuote(prev => ({ 
                    ...prev, 
                    quoteNumber: e.target.value 
                  }))
                  }
                  placeholder="QUOTE-2024-001"
                />
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  value={currentQuote.clientName}
                  onChange={(e) => setCurrentQuote(prev => ({ 
                    ...prev, 
                    clientName: e.target.value 
                  }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={currentQuote.projectName}
                  onChange={(e) => setCurrentQuote(prev => ({ 
                    ...prev, 
                    projectName: e.target.value 
                  }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Tax (%)</label>
                <input
                  type="number"
                  value={currentQuote.tax}
                  onChange={(e) => setCurrentQuote(prev => ({ 
                    ...prev, 
                    tax: parseFloat(e.target.value) || 0 
                  }))
                  }
                  min="0"
                  step="1"
                />
              </div>

              <div className="form-group">
                <label>Valid Until</label>
                <input
                  type="date"
                  value={currentQuote.validUntil?.toISOString().split('T')[0]}
                  onChange={(e) => setCurrentQuote(prev => ({ 
                    ...prev, 
                    validUntil: new Date(e.target.value) 
                  }))
                  }
                />
              </div>
            </div>

            <div className="line-items-section">
              <h4>Line Items</h4>
              {currentQuote.lineItems?.map((item, index) => (
                <div key={item.id} className="line-item">
                  <div className="line-item-header">
                    <span className="item-number">Item {index + 1}</span>
                    <button 
                      onClick={() => deleteLineItem(currentQuote.id || '', item.id)}
                      className="delete-item-btn"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="line-item-fields">
                    <div className="field-group">
                      <label>Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updatedItems = [...(currentQuote.lineItems || [])];
                          updatedItems[index].description = e.target.value;
                          setCurrentQuote(prev => ({ ...prev, lineItems: updatedItems }));
                        }}
                      />
                    </div>
                    <div className="field-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const updatedItems = [...(currentQuote.lineItems || [])];
                          updatedItems[index].quantity = parseInt(e.target.value) || 0;
                          updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
                          setCurrentQuote(prev => ({ ...prev, lineItems: updatedItems }));
                        }}
                        min="1"
                      />
                    </div>
                    <div className="field-group">
                      <label>Unit Price</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updatedItems = [...(currentQuote.lineItems || [])];
                          updatedItems[index].unitPrice = parseFloat(e.target.value) || 0;
                          updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
                          setCurrentQuote(prev => ({ ...prev, lineItems: updatedItems }));
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="field-group">
                      <label>Total</label>
                      <input
                        type="text"
                        value={`$${item.total.toLocaleString()}`}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                className="add-line-item-btn"
                onClick={() => {
                  const newItem: QuoteLineItem = {
                    id: `item_${Date.now()}`,
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    total: 0,
                    category: 'design'
                  };
                  setCurrentQuote(prev => ({ 
                    ...prev, 
                    lineItems: [...(prev.lineItems || []), newItem] 
                  }));
                }}
              >
                <Plus className="w-4 h-4" />
                Add Line Item
              </button>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                value={currentQuote.notes}
                onChange={(e) => setCurrentQuote(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                placeholder="Additional notes for this quote..."
              />
            </div>

            <div className="quote-summary">
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>${(calculateTotal(currentQuote as Quote) - (currentQuote.tax || 0)).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>Tax ({currentQuote.tax}%):</span>
                <span>${(currentQuote.tax || 0).toLocaleString()}</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>${calculateTotal(currentQuote as Quote).toLocaleString()}</span>
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowQuoteForm(false);
                  setCurrentQuote({
                    quoteNumber: `QUOTE-${Date.now()}`,
                    projectId: projectId || 'current-project',
                    clientName: 'VizTR Client',
                    projectName: 'Luxury Villa',
                    amount: 0,
                    tax: 18,
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: 'draft',
                    createdAt: new Date(),
                    lineItems: []
                  });
                }}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={createQuote}
                disabled={!currentQuote.clientName || !currentQuote.projectName || (currentQuote.lineItems?.length || 0) === 0}
              >
                Create Quote
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="quotes-list">
        <div className="quotes-header">
          <h3>All Quotes</h3>
          <div className="filter-tabs">
            {['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'].map(status => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="count">
                  {quotes.filter(q => status === 'all' || q.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="no-quotes">
            <FileText className="w-12 h-12" />
            <p>No quotes found</p>
          </div>
        ) : (
          <div className="quotes-grid">
            {filteredQuotes.map(quote => (
              <div key={quote.id} className="quote-card">
                <div className="quote-card-header">
                  <div className="quote-info">
                    <h4>{quote.quoteNumber}</h4>
                    <span className={`status-badge ${quote.status}`}>
                      {getStatusIcon(quote.status)}
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                  </div>
                  <div className="quote-actions">
                    {quote.status === 'draft' && (
                      <button
                        className="action-btn send-btn"
                        onClick={() => sendQuote(quote.id)}
                        title="Send Quote"
                      >
                        📧
                      </button>
                    )}
                    {quote.status === 'sent' && (
                      <button
                        className="action-btn accept-btn"
                        onClick={() => acceptQuote(quote.id)}
                        title="Accept Quote"
                      >
                        ✓
                      </button>
                    )}
                    {quote.status === 'sent' && (
                      <button
                        className="action-btn reject-btn"
                        onClick={() => rejectQuote(quote.id)}
                        title="Reject Quote"
                      >
                        ✗
                      </button>
                    )}
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedQuote(quote)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteQuote(quote.id)}
                      title="Delete Quote"
                    >
                      🗑️
                    </button>
</div>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
}
