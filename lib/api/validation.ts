/**
 * API Route Validation Middleware
 * 
 * Helper utilities for validating requests in Next.js App Router route handlers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  validate, 
  validateQuery, 
  ApiError, 
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/api/contracts/schemas';
import { requireAuth } from '@/lib/api-guard';
import { applyRateLimit, rateLimitHeaders, type RateLimitConfig } from '@/lib/rate-limit';

/**
 * Higher-order function to create a validated route handler
 */
export function withValidation<T extends z.ZodType<any, any, any>>(
  schema: T,
  handler: (data: z.infer<T>, request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let data: z.infer<T>;
      
      if (request.method === 'GET') {
        data = validateQuery(schema as any, request.nextUrl.searchParams);
      } else {
        const body = await request.json().catch(() => ({}));
        data = validate(schema as any, body);
      }
      
      return handler(data, request);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrapper for route handlers that need auth validation
 */
export function withAuth<T extends z.ZodType<any, any, any>>(
  schema: T,
  handler: (data: z.infer<T>, request: NextRequest, user: { id: string; email: string; role: string }) => Promise<NextResponse>
) {
  return withValidation(schema, async (data, request) => {
    const guard = await requireAuth(request);
    if (guard.error) {
      throw new UnauthorizedError('Authentication required');
    }

    const { session, role, userId } = guard;
    const user = {
      id: userId,
      email: (session?.user as any)?.email || '',
      role,
    };

    return handler(data, request, user);
  });
}

/**
 * Wrapper that adds rate limiting to a route handler
 */
export function withRateLimit<T extends z.ZodType<any, any, any>>(
  schema: T,
  handler: (data: z.infer<T>, request: NextRequest) => Promise<NextResponse>,
  rateLimitConfig: RateLimitConfig
) {
  return withValidation(schema, async (data, request) => {
    const rateLimitResponse = await applyRateLimit(request, rateLimitConfig);
    if (rateLimitResponse) return rateLimitResponse;
    
    return handler(data, request);
  });
}

/**
 * Wrapper that adds both auth and rate limiting
 */
export function withAuthAndRateLimit<T extends z.ZodType<any, any, any>>(
  schema: T,
  handler: (data: z.infer<T>, request: NextRequest, user: { id: string; email: string; role: string }) => Promise<NextResponse>,
  rateLimitConfig: RateLimitConfig
) {
  return withAuth(schema, async (data, request, user) => {
    const rateLimitResponse = await applyRateLimit(request, rateLimitConfig);
    if (rateLimitResponse) return rateLimitResponse;
    
    return handler(data, request, user);
  });
}

/**
 * Centralized error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: { issues: (error.details as { issues: any[] } | undefined)?.issues },
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      },
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: error.message,
        },
      },
      { status: 403 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          details: error.details,
        },
      },
      { status: 404 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  // Unknown error
  console.error('API Error:', error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, meta?: { requestId?: string }): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status: 200 }
  );
}

/**
 * Created response helper (201)
 */
export function createdResponse<T>(data: T, meta?: { requestId?: string }): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status: 201 }
  );
}

/**
 * No content response helper (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Apply rate limiting to a request (re-export from rate-limit.ts)
 */
export { applyRateLimit, rateLimitHeaders, type RateLimitConfig } from '@/lib/rate-limit';

/**
 * Request ID generator for tracing
 */
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Add request ID to response headers
 */
export function addRequestIdHeaders(res: NextResponse, requestId: string): NextResponse {
  res.headers.set('X-Request-ID', requestId);
  return res;
}

/**
 * CORS headers for API routes
 */
export function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
  };
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}