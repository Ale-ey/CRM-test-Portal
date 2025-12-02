export type User = {
  id: string;
  email: string;
  name: string;
  companyName: string;
  role: 'client' | 'admin';
  createdAt: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};
