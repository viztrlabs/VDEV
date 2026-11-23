import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.EDITOR_JWT_SECRET;
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3487',
];

/**
 * Extract JWT from request headers or cookies.
 * Returns null if no token is found.
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const nextAuthCookie = cookies.find(c => c.startsWith('next-auth.session-token='));
    if (nextAuthCookie) {
      return nextAuthCookie.split('=').slice(1).join('=');
    }
  }
  return null;
}

/**
 * Validate a JWT and return the decoded payload.
 * Returns null if invalid or if JWT_SECRET is not configured.
 */
export function validateToken(token) {
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function validateLaunchToken(token) {
  const secret = process.env.EDITOR_LAUNCH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!token || !secret) return null;
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
    if (signatureB64 !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Express middleware that validates a VizTR session JWT.
 * Attaches the decoded user to req.viztrUser.
 *
 * The JWT is the same NextAuth JWT used by the VizTR app.
 * In production, rotate NEXTAUTH_SECRET and ensure it matches.
 */
export function requireEditorAuth(req, res, next) {
  // Allow static assets and favicon without auth
  const publicPaths = ['/favicon.ico', '/css', '/static', '/engine', '/editor/scene/img'];
  if (publicPaths.some(p => req.url.startsWith(p))) {
    return next();
  }

  // Check Origin header for API routes
  const origin = req.headers.origin || req.headers.referer;
  if (origin && !ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    // In production, reject cross-origin requests from untrusted origins
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Forbidden: untrusted origin' });
    }
  }

  // Extract token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const nextAuthCookie = cookies.find(c => c.startsWith('next-auth.session-token='));
    if (nextAuthCookie) {
      token = nextAuthCookie.split('=')[1];
    }
  }

  if (!token && req.query?.token) {
    token = req.query.token;
  }

  if (!token) {
    if (process.env.NODE_ENV !== 'production' && process.env.EDITOR_DEV_BYPASS === 'true') {
      console.warn('[Editor Auth] No token provided — dev bypass enabled via EDITOR_DEV_BYPASS');
      req.viztrUser = { id: 'dev-user', role: 'admin' };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!JWT_SECRET) {
    console.error('[Editor Auth] NEXTAUTH_SECRET/EDITOR_JWT_SECRET not configured — auth disabled');
    if (process.env.NODE_ENV !== 'production' && process.env.EDITOR_DEV_BYPASS === 'true') {
      console.warn('[Editor Auth] Dev bypass enabled — allowing without token');
      req.viztrUser = { id: 'dev-user', role: 'admin' };
      return next();
    }
    return res.status(500).json({ error: 'Auth not configured' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.viztrUser = {
      id: decoded.id || decoded.sub || decoded.email,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch (err) {
    const launchPayload = validateLaunchToken(token);
    if (launchPayload) {
      req.viztrUser = {
        id: launchPayload.sub,
        email: launchPayload.user?.email,
        role: launchPayload.user?.role || 'user',
      };
      return next();
    }
    if (process.env.NODE_ENV !== 'production' && process.env.EDITOR_DEV_BYPASS === 'true') {
      console.warn('[Editor Auth] Invalid token — dev bypass enabled via EDITOR_DEV_BYPASS');
      req.viztrUser = { id: 'dev-user', role: 'admin' };
      return next();
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Validate Origin header for WebSocket upgrade requests.
 * Returns true if the origin is trusted.
 */
export function validateWsOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true; // Allow non-browser clients (e.g., curl)
  return ALLOWED_ORIGINS.some(o => origin.startsWith(o));
}
