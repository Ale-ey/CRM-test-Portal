import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type LoginPageProps = {
  onLogin: (email: string, password: string) => void;
  error?: string;
};

export function LoginPage({ onLogin, error }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Client Portal
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Debt Collection Management System
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                Sign in
              </Button>

              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-900 mb-2">Demo Accounts:</p>
                <div className="space-y-1 text-xs text-blue-800">
                  <div>
                    <span className="font-medium">Client 1:</span> layla@example.com
                  </div>
                  <div>
                    <span className="font-medium">Client 2:</span> john@acmecorp.com
                  </div>
                  <div>
                    <span className="font-medium">Admin:</span> admin@portal.com
                  </div>
                  <div className="mt-2 text-blue-600">
                    (Any password works for demo)
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-500">
          Secure portal for managing your debt collection cases
        </p>
      </div>
    </div>
  );
}
