import type { User, AuthState } from '../types/auth';

const AUTH_KEY = 'clientPortal.auth.v1';
const USERS_KEY = 'clientPortal.users.v1';

// Demo users for testing (in production, this would be a backend API)
const DEMO_USERS: User[] = [
  {
    id: 'client-001',
    email: 'layla@example.com',
    name: 'Layla Odam',
    companyName: 'Example Corp',
    role: 'client',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-002',
    email: 'john@acmecorp.com',
    name: 'John Smith',
    companyName: 'ACME Corporation',
    role: 'client',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-001',
    email: 'admin@portal.com',
    name: 'Admin User',
    companyName: 'Portal Admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

// Initialize demo users in localStorage if not present
function initializeDemoUsers() {
  if (typeof window === 'undefined') return;
  const existing = window.localStorage.getItem(USERS_KEY);
  if (!existing) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  }
}

export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }

  initializeDemoUsers();

  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) {
      return { user: null, isAuthenticated: false };
    }
    const authState = JSON.parse(raw) as AuthState;
    return authState;
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

export function saveAuthState(authState: AuthState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
}

export function login(email: string, _password: string): User | null {
  if (typeof window === 'undefined') return null;

  initializeDemoUsers();

  // Get users from localStorage
  const usersRaw = window.localStorage.getItem(USERS_KEY);
  const users: User[] = usersRaw ? JSON.parse(usersRaw) : DEMO_USERS;

  // Simple authentication (in production, this would be a secure backend API)
  // For demo: any password works, just match email
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    const authState: AuthState = {
      user,
      isAuthenticated: true,
    };
    saveAuthState(authState);
    return user;
  }

  return null;
}

export function logout() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_KEY);
}

export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];

  initializeDemoUsers();

  const usersRaw = window.localStorage.getItem(USERS_KEY);
  return usersRaw ? JSON.parse(usersRaw) : DEMO_USERS;
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  if (typeof window === 'undefined') throw new Error('Window not available');

  const users = getAllUsers();

  // Check if user already exists
  if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    ...userData,
    id: `client-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return newUser;
}
