require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Request/Response for Next.js middleware tests
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }
    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers }
      });
    }
  };
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this._map = new Map();
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([k, v]) => this._map.set(k.toLowerCase(), v));
        } else if (init instanceof Headers) {
          init.forEach((v, k) => this._map.set(k, v));
        } else {
          Object.entries(init).forEach(([k, v]) => this._map.set(k.toLowerCase(), v));
        }
      }
    }
    get(name) { return this._map.get(name.toLowerCase()) || null; }
    set(name, value) { this._map.set(name.toLowerCase(), value); }
    has(name) { return this._map.has(name.toLowerCase()); }
    delete(name) { this._map.delete(name.toLowerCase()); }
    forEach(callback) { this._map.forEach((v, k) => callback(v, k, this)); }
    entries() { return this._map.entries(); }
    keys() { return this._map.keys(); }
    values() { return this._map.values(); }
  };
}

// Mock IntersectionObserver
if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];
    disconnect() {}
    observe() {}
    takeRecords() { return []; }
    unobserve() {}
  };
}

// Mock ResizeObserver
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
