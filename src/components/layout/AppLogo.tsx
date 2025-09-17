'use client';
export default function AppLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <img src="/assets/logo.png" alt="Fitness Pro" width={size} height={size} className={className} />;
}
