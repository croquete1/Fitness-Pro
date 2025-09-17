'use client';

type Props = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
};

/**
 * Logo simples usando <img> para evitar 400 do next/image em /public/assets/logo.png.
 * Aceita className para poderes aplicar sombras/anim.
 */
export default function AppLogo({
  size = 32,
  className = '',
  style,
  alt = 'Fitness Pro',
}: Props) {
  return (
    <img
      src="/assets/logo.png"
      width={size}
      height={size}
      alt={alt}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 8,
        ...style,
      }}
    />
  );
}
