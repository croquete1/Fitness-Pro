'use client';
export default function AppLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <img src="/public/logo.png" alt="Fitness Pro" width={size} height={size} className={className} />;
}
