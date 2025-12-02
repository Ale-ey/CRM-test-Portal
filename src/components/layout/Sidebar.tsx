import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { LayoutDashboard, FileSpreadsheet, MessageCircle, PieChart, Settings, LogOut } from 'lucide-react';
import type { User } from '../../types/auth';

type SidebarProps = {
  active: 'overview' | 'cases' | 'reports' | 'messages' | 'settings';
  onChange: (value: SidebarProps['active']) => void;
  user: User;
  onLogout: () => void;
};

type Item = {
  id: SidebarProps['active'];
  label: string;
  icon: ReactNode;
};

const items: Item[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'cases', label: 'Cases', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports', icon: <PieChart className="h-4 w-4" /> },
  { id: 'messages', label: 'Messages', icon: <MessageCircle className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export function Sidebar({ active, onChange, user, onLogout }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-950 text-slate-50">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold">
          SS
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">Sharkstack Portal</div>
          <div className="text-xs text-slate-400">Client dashboard</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200',
                isActive
                  ? 'bg-slate-900 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900/60 hover:text-white hover:shadow-sm',
              )}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/80">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 px-4 py-4">
        <div className="mb-3">
          <div className="text-xs text-slate-400">Logged in as</div>
          <div className="mt-1 text-sm font-medium text-slate-50">{user.name}</div>
          <div className="text-xs text-slate-400">{user.companyName}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}


