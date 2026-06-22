import React from 'react';

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export const OptimizedImage = React.memo(
  ({
    src,
    alt,
    width,
    height,
    priority = false,
    className = '',
    ...props
  }: OptimizedImageProps) => {
    // Add webp support fallback
    const srcSet = src.includes('unsplash')
      ? `${src}&q=80&auto=format&fit=crop`
      : src;

    return (
      <img
        src={srcSet}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
        referrerPolicy="no-referrer"
        {...props}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
