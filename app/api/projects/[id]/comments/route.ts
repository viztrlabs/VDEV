import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyRateLimit } from '@/lib/rate-limit';
import { generateRequestId, addRequestIdHeaders } from '@/lib/api/validation';
import { requireAuth } from '@/lib/api-guard';
import type { Comment, CreateComment, UpdateComment, CommentFilters, CommentStatus } from '@/lib/super-admin-store-types';

const CommentStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed']);

const CreateCommentSchema = z.object({
  projectId: z.string().min(1),
  deliverableId: z.string().optional(),
  parentId: z.string().optional(),
  content: z.string().min(1).max(2000),
  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  status: CommentStatusSchema.optional(),
  mentions: z.array(z.string()).optional(),
});

const CommentFiltersSchema = z.object({
  status: CommentStatusSchema.optional(),
  authorId: z.string().optional(),
  deliverableId: z.string().optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

// In-memory comment store
let comments: Comment[] = [
  {
    id: 'comment-001',
    projectId: 'VIZTR-DEMO',
    deliverableId: 'del-001',
    parentId: undefined,
    authorId: 'user-1',
    authorName: 'Sarah Chen',
    authorRole: 'client',
    content: 'The exterior lighting looks great, but can we adjust the time of day to golden hour?',
    status: 'open',
    mentions: ['designer1'],
    attachments: [],
    createdAt: '2026-09-14T10:00:00Z',
    updatedAt: '2026-09-14T10:00:00Z',
    replies: [],
  },
  {
    id: 'comment-002',
    projectId: 'VIZTR-DEMO',
    deliverableId: 'del-001',
    parentId: 'comment-001',
    authorId: 'designer1',
    authorName: 'Mike Johnson',
    authorRole: 'designer',
    content: 'Sure, I will re-render with golden hour lighting settings.',
    status: 'open',
    mentions: [],
    attachments: [],
    createdAt: '2026-09-14T11:00:00Z',
    updatedAt: '2026-09-14T11:00:00Z',
    replies: [],
  },
];

function applyCommentFilters(list: Comment[], filters?: CommentFilters): Comment[] {
  if (!filters) return list;
  return list.filter((c) => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.authorId && c.authorId !== filters.authorId) return false;
    if (filters.deliverableId && c.deliverableId !== filters.deliverableId) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!c.content.toLowerCase().includes(s) && !c.authorName.toLowerCase().includes(s)) return false;
    }
    if (filters.date_from && c.createdAt < filters.date_from) return false;
    if (filters.date_to && c.createdAt > filters.date_to) return false;
    return true;
  });
}

function buildCommentTree(flat: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  for (const c of flat) {
    map.set(c.id, { ...c, replies: [] });
  }
  const roots: Comment[] = [];
  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// POST /api/projects/[id]/comments - Create comment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(request);
  if (guard.error) return guard.error;

  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const body = await request.json().catch(() => ({}));
    const validated = CreateCommentSchema.parse(body);
    const { id: projectId } = await params;

    const now = new Date().toISOString();
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      projectId,
      deliverableId: validated.deliverableId,
      parentId: validated.parentId,
      authorId: 'current-user',
      authorName: 'Current User',
      authorRole: 'client',
      content: validated.content,
      status: 'open',
      mentions: validated.mentions || [],
      attachments: validated.attachments || [],
      createdAt: now,
      updatedAt: now,
      replies: [],
    };

    comments.push(newComment);

    return addRequestIdHeaders(
      NextResponse.json({ success: true, data: newComment }, { status: 201 }),
      requestId
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues?.[0]?.message || 'Invalid request', issues: error.issues } },
          { status: 400 }
        ),
        requestId
      );
    }
    return addRequestIdHeaders(
      NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create comment' } },
        { status: 500 }
      ),
      requestId
    );
  }
}

// GET /api/projects/[id]/comments - List comments
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAuth(request);
  if (guard.error) return guard.error;

  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 100, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const { id: projectId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const filters: CommentFilters = {
      status: searchParams.get('status') as CommentStatus | undefined,
      authorId: searchParams.get('authorId') || undefined,
      deliverableId: searchParams.get('deliverableId') || undefined,
      search: searchParams.get('search') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    };

    let filtered = comments.filter((c) => c.projectId === projectId);
    filtered = applyCommentFilters(filtered, filters);

    const tree = buildCommentTree(filtered);

    return addRequestIdHeaders(
      {
        success: true,
        data: tree,
        total: filtered.length,
      } as any,
      requestId
    );
  } catch (error) {
    return addRequestIdHeaders(
      NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch comments' } },
        { status: 500 }
      ),
      requestId
    );
  }
}

// PATCH /api/projects/[id]/comments/[commentId] - Update comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const guard = await requireAuth(request);
  if (guard.error) return guard.error;

  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 50, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const body = await request.json().catch(() => ({}));
    const validated = UpdateCommentSchema.parse(body);
    const { id: projectId, commentId } = await params;

    const idx = comments.findIndex((c) => c.id === commentId);
    if (idx === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Comment ${commentId} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    const updated: Comment = {
      ...comments[idx],
      ...validated,
      updatedAt: new Date().toISOString(),
      resolvedAt: validated.status === 'resolved' || validated.status === 'closed' ? new Date().toISOString() : comments[idx].resolvedAt,
    };
    comments[idx] = updated;

    return addRequestIdHeaders(
      NextResponse.json({ success: true, data: updated }, { status: 200 }),
      requestId
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: error.issues?.[0]?.message || 'Invalid request', issues: error.issues } },
          { status: 400 }
        ),
        requestId
      );
    }
    return addRequestIdHeaders(
      NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update comment' } },
        { status: 500 }
      ),
      requestId
    );
  }
}

// DELETE /api/projects/[id]/comments/[commentId] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const guard = await requireAuth(request);
  if (guard.error) return guard.error;

  const requestId = generateRequestId();
  const rateLimitResponse = await applyRateLimit(request, { limit: 20, window: '60 s' });
  if (rateLimitResponse) return addRequestIdHeaders(rateLimitResponse, requestId);

  try {
    const { commentId } = await params;
    const idx = comments.findIndex((c) => c.id === commentId);
    if (idx === -1) {
      return addRequestIdHeaders(
        NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: `Comment ${commentId} not found` } },
          { status: 404 }
        ),
        requestId
      );
    }

    comments.splice(idx, 1);
    return addRequestIdHeaders(NextResponse.json({ success: true }, { status: 200 }), requestId);
  } catch (error) {
    return addRequestIdHeaders(
      NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete comment' } },
        { status: 500 }
      ),
      requestId
    );
  }
}
