import type { PropsWithChildren, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Card({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-900 dark:border-slate-800 dark:text-slate-50',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx('text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={clsx('px-5 py-4 text-sm text-slate-600 dark:text-slate-300', className)} {...props} />
  );
}


