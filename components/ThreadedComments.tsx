'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock, AlertCircle, MoreVertical, Reply, Trash2, Edit3 } from 'lucide-react';
import type { Comment } from '@/lib/super-admin-store-types';

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: 'bg-sky-950/40', text: 'text-sky-400', border: 'border-sky-800/40' },
  in_progress: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  resolved: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
  closed: { bg: 'bg-zinc-800/40', text: 'text-zinc-400', border: 'border-zinc-700/40' },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ThreadedCommentsProps {
  projectId: string;
  deliverableId?: string;
  currentUserId?: string;
  currentUserRole?: string;
}

export default function ThreadedComments({ projectId, deliverableId, currentUserId = 'current-user', currentUserRole = 'client' }: ThreadedCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deliverableId) params.set('deliverableId', deliverableId);
      if (filter !== 'all') params.set('status', filter);

      const res = await fetch(`/api/projects/${projectId}/comments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId, deliverableId, filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverableId,
          content: newComment.trim(),
          mentions: [],
        }),
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      } else {
        setError('Failed to post comment');
      }
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId,
          content: replyContent.trim(),
          mentions: [],
        }),
      });

      if (res.ok) {
        setReplyTo(null);
        setReplyContent('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (commentId: string, status: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const statusStyle = STATUS_STYLES[comment.status] || STATUS_STYLES.open;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-12 mt-3' : 'mb-4'} p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-xs font-bold text-[#3ECF8E]">
              {comment.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{comment.authorName}</div>
              <div className="text-[10px] font-mono text-[#71717A]">{comment.authorRole}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {comment.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-mono text-[#71717A]">{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        <div className="text-xs text-white leading-relaxed whitespace-pre-wrap">{comment.content}</div>

        {comment.mentions.length > 0 && (
          <div className="text-[10px] font-mono text-[#3ECF8E]">
            Mentioned: {comment.mentions.join(', ')}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-[#27272A]">
          {currentUserId !== comment.authorId && (
            <button
              onClick={() => setReplyTo(comment.id)}
              className="text-[10px] font-mono text-[#71717A] hover:text-[#3ECF8E] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}
          {currentUserId === comment.authorId && comment.status === 'open' && (
            <button
              onClick={() => handleStatusChange(comment.id, 'resolved')}
              className="text-[10px] font-mono text-[#71717A] hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              Resolve
            </button>
          )}
          {currentUserId === comment.authorId && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-[10px] font-mono text-[#71717A] hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>

        {replyTo === comment.id && (
          <div className="mt-3 p-3 rounded-lg bg-[#09090B] border border-[#27272A] space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReply(comment.id)}
                className="px-3 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3" />
                Reply
              </button>
              <button
                onClick={() => { setReplyTo(null); setReplyContent(''); }}
                className="px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#3ECF8E]" />
            <h3 className="text-sm font-bold text-white">Threaded Comments</h3>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white focus:outline-none focus:border-[#3ECF8E]"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs font-mono text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#71717A]">
              {newComment.length}/2000
            </span>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              Post Comment
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#3ECF8E]/30 border-t-[#3ECF8E] rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center">
          <MessageSquare className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No comments yet</h4>
          <p className="text-xs text-[#A1A1AA] mt-1">Start the conversation by posting a comment above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
