import { brand, brandFallbackLogos } from '@/lib/brand';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string | null;
};

export default function BrandMark({ size = brand.size ?? 30, className, priority = false, alt }: Props) {
  const lightLogo = brand.logoLight ?? brandFallbackLogos.light;
  const darkLogo = brand.logoDark ?? brandFallbackLogos.dark;
  const altText = alt ?? '';
  const isDecorative = altText.trim().length === 0;

  return (
    <picture className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {darkLogo ? <source srcSet={darkLogo} media="(prefers-color-scheme: dark)" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lightLogo}
        alt={altText}
        aria-hidden={isDecorative ? true : undefined}
        width={size}
        height={size}
        loading={priority ? 'eager' : 'lazy'}
        style={{ display: 'block', width: size, height: 'auto' }}
        draggable={false}
      />
    </picture>
  );
}
