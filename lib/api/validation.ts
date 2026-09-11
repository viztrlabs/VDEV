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
    // In a real implementation, this would get the user from auth
    // For now, we'll use a header-based approach for demo
    const authHeader = request.headers.get('x-user-role');
    if (!authHeader) {
      throw new UnauthorizedError('Authentication required');
    }
    
    const user = {
      id: request.headers.get('x-user-id') || 'unknown',
      email: request.headers.get('x-user-email') || 'unknown',
      role: authHeader,
    };
    
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
 * Rate limiting helper (simple in-memory, use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  options: { limit: number; windowMs: number }
): { allowed: boolean; resetTime: number; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return { allowed: true, resetTime: now + options.windowMs, remaining: options.limit - 1 };
  }
  
  if (record.count >= options.limit) {
    return { allowed: false, resetTime: record.resetTime, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, resetTime: record.resetTime, remaining: options.limit - record.count };
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  request: NextRequest,
  options: { limit: number; windowMs: number }
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const identifier = `api:${ip}`;
  
  const result = rateLimit(identifier, options);
  
  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': options.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        },
      }
    );
  }
  
  return null;
}

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