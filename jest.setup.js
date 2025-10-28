import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Minimal Response polyfill for NextResponse import
// Provides status and json() used in tests
global.Response = class {
  constructor(body, init = {}) {
    this.status = init.status || 200;
    this._body = body;
  }
  async json() {
    try {
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
    } catch {
      return this._body;
    }
  }
};
// Add static Response.json to create JSON responses like NextResponse uses
(global.Response).json = (body, init = {}) => new global.Response(
  typeof body === 'string' ? body : JSON.stringify(body),
  init
);


// Mock next/server for NextResponse.json
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, init = {}) => {
      const status = init.status || 200;
      return {
        status,
        json: async () => body,
      };
    },
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, style, className, ...props }) => {
    // Strip Next.js-specific props that aren't valid on <img> (e.g., fill)
    const { fill, loader, sizes, quality, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={alt} className={className} style={style} />;
  },
}));

// Mock useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock cart store
jest.mock('@/lib/stores/cart-store', () => ({
  useCart: jest.fn(() => ({
    items: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    total: 0,
  })),
}));

// Mock prisma client to use test double
import { prismaMock } from '@/lib/__mocks__/prisma';
jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

// Mock FormControl and FormItem components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }) => <div data-testid="form">{children}</div>,
  FormField: ({ children }) => <div data-testid="form-field">{children}</div>,
  FormControl: ({ children }) => <div data-testid="form-control">{children}</div>,
  FormItem: ({ children }) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }) => <div data-testid="form-label">{children}</div>,
  FormMessage: ({ children }) => <div data-testid="form-message">{children}</div>,
  FormDescription: ({ children }) => <div data-testid="form-description">{children}</div>,
}));

// Mock withAuth HOC
jest.mock('@/components/auth/with-auth', () => ({
  withAuth: (Component, roles) => {
    const WithAuthComponent = (props) => <Component {...props} />;
    WithAuthComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
    return WithAuthComponent;
  },
}));

// Mock shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input {...props} data-testid="input" />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ children }) => <div data-testid="select-value">{children}</div>,
  SelectContent: ({ children }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children }) => <div data-testid="select-item">{children}</div>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date) => date.toISOString()),
  parseISO: jest.fn((dateString) => new Date(dateString)),
}));

jest.mock('ioredis', () => {
  class MockRedis {
    constructor(_opts) {
      this.store = new Map();
      this.status = 'ready';
      this.handlers = {};
    }
    on(event, handler) {
      this.handlers[event] = handler;
    }
    async get(key) {
      return this.store.has(key) ? this.store.get(key) : null;
    }
    setex(key, _ttl, value) {
      this.store.set(key, value);
      return Promise.resolve('OK');
    }
    del(...keys) {
      let count = 0;
      keys.forEach(key => {
        if (this.store.delete(key)) count++;
      });
      return Promise.resolve(count);
    }
    keys(pattern) {
      const regex = new RegExp('^' + pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\\\*/g, '.*') + '$');
      const result = Array.from(this.store.keys()).filter(k => regex.test(k));
      return Promise.resolve(result);
    }
    quit() {
      this.status = 'end';
      return Promise.resolve('OK');
    }
  }
  return {
    __esModule: true,
    default: MockRedis,
  };
}, { virtual: true });

jest.mock('node-cache', () => {
  class MockNodeCache {
    constructor(_opts = {}) {
      this.store = new Map();
      this.timeouts = new Map();
    }
    set(key, value, ttlSeconds = 0) {
      this.store.set(key, value);
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
      }
      if (ttlSeconds && ttlSeconds > 0) {
        const to = setTimeout(() => {
          this.store.delete(key);
          this.timeouts.delete(key);
        }, ttlSeconds * 1000);
        this.timeouts.set(key, to);
      }
      return true;
    }
    get(key) {
      return this.store.has(key) ? this.store.get(key) : undefined;
    }
    del(key) {
      const existed = this.store.delete(key);
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
        this.timeouts.delete(key);
      }
      return existed ? 1 : 0;
    }
    flushAll() {
      this.store.clear();
      for (const to of this.timeouts.values()) clearTimeout(to);
      this.timeouts.clear();
    }
    keys() {
      return Array.from(this.store.keys());
    }
    getStats() {
      return { keys: this.store.size };
    }
    close() {
      this.flushAll();
    }
  }
  return {
    __esModule: true,
    default: MockNodeCache,
  };
}, { virtual: true });