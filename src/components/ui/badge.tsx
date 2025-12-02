import type { HTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
  }
>;

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium';

  const variants: Record<BadgeVariant, string> = {
    default: 'border-slate-200 bg-slate-50 text-slate-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-100 bg-amber-50 text-amber-700',
    danger: 'border-rose-100 bg-rose-50 text-rose-700',
    info: 'border-blue-100 bg-blue-50 text-blue-700',
    outline: 'border-slate-200 text-slate-700',
  };

  return (
    <span className={clsx(base, variants[variant], className)} {...props} />
  );
}


