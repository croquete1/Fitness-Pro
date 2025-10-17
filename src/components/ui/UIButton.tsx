'use client';

import Button, { type ButtonProps } from './Button';

type LegacyVariant = 'primary' | 'outline' | 'danger' | 'ghost';
type LegacySize = 'sm' | 'md';

type UIButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  variant?: LegacyVariant;
  size?: LegacySize;
};

const variantMap: Record<LegacyVariant, ButtonProps['variant']> = {
  primary: 'primary',
  outline: 'secondary',
  danger: 'danger',
  ghost: 'ghost',
};

const sizeMap: Record<LegacySize, ButtonProps['size']> = {
  sm: 'sm',
  md: 'md',
};

export default function UIButton({ variant = 'primary', size = 'md', ...rest }: UIButtonProps) {
  return <Button variant={variantMap[variant]} size={sizeMap[size]} {...rest} />;
}
