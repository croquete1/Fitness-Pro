// src/components/dashboard/AdminCountCard.tsx
import clsx from 'clsx';

type Props = { title: string; value: number | string; className?: string };
export default function AdminCountCard({ title, value, className }: Props) {
  return (
    <div className={clsx('rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4', className)}>
      <div className="text-xs text-neutral-500 mb-1">{title}</div>
      <div className="text-[clamp(20px,5.5vw,32px)] font-extrabold leading-none">{value}</div>
    </div>
  );
}