import type { User } from '../../types/auth';
import type { CaseMessage, CaseRecord } from '../../types/case';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Upload, User as UserIcon, Database, Bell, Shield } from 'lucide-react';

type SettingsPageProps = {
  user: User;
  cases: CaseRecord[];
  messages: CaseMessage[];
  onLoadFromJson: () => void;
  onExportMessages: () => void;
  onExportCases: () => void;
};

export function SettingsPage({
  user,
  cases,
  messages,
  onLoadFromJson,
  onExportMessages,
  onExportCases,
}: SettingsPageProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings and data preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-emerald-500" />
              <CardTitle>Account Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500">Name</label>
              <div className="mt-1 text-sm font-medium text-slate-900">{user.name}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Email</label>
              <div className="mt-1 text-sm text-slate-900">{user.email}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Company</label>
              <div className="mt-1 text-sm text-slate-900">{user.companyName}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Role</label>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Member Since</label>
              <div className="mt-1 text-sm text-slate-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <CardTitle>Data Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Your Data</div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-semibold text-slate-900">{cases.length}</div>
                  <div className="text-xs text-slate-500">Cases</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-900">{messages.length}</div>
                  <div className="text-xs text-slate-500">Messages</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadFromJson}
                className="w-full justify-start gap-2"
              >
                <Upload className="h-4 w-4" />
                Reload from JSON file
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCases}
                className="w-full justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                Export Cases (CSV)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportMessages}
                className="w-full justify-start gap-2"
              >
                <Download className="h-4 w-4" />
                Export Messages (CSV)
              </Button>
            </div>

            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Data is stored locally in your browser. Export your data regularly to keep backups.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">Email Notifications</div>
                <div className="text-xs text-slate-500">Receive updates via email</div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">Case Updates</div>
                <div className="text-xs text-slate-500">Notify when cases are updated</div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">New Messages</div>
                <div className="text-xs text-slate-500">Notify when collector responds</div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <CardTitle>Security & Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-900 mb-1">Data Security</div>
              <p className="text-xs text-slate-600">
                Your data is stored securely in your browser's local storage. Each client's data is isolated and cannot be accessed by other users.
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-900 mb-1">Privacy</div>
              <p className="text-xs text-slate-600">
                We respect your privacy. Your case data and messages are only visible to you and your assigned collector.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Change Password
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Password management coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

