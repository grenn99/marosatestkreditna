import { useState } from 'react';
import { Image as ImageComponent, ImageProps } from './Image';

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  fallbackSrc?: string;
  sizes?: string;
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  fallbackSrc = '/images/placeholder-product.jpg',
  sizes = '(max-width: 768px) 100vw, 50vw',
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle image loading errors
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsError(true);
    setIsLoading(false);
    // Call original onError if provided
    if (restProps.onError) restProps.onError(e);
  };

  // Handle successful image load
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    // Call original onLoad if provided
    if (restProps.onLoad) restProps.onLoad(e);
  };

  // Extract rest props to pass through
  const { onError, onLoad, ...imageProps } = restProps;

  // If there was an error loading the image, use the fallback
  if (isError) {
    return (
      <ImageComponent
        src={fallbackSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  // Generate WebP srcSet if the source is from our domain
  const isExternalImage = !src.startsWith('/') && !src.startsWith('./');
  let webpSrc = '';
  
  if (!isExternalImage) {
    const srcWithoutExt = src.replace(/\.(jpg|jpeg|png)$/i, '');
    webpSrc = `${srcWithoutExt}.webp`;
  }

  return (
    <div className="relative">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
      )}
      
      {/* WebP source with fallback */}
      <picture>
        {webpSrc && (
          <source
            srcSet={webpSrc}
            type="image/webp"
            sizes={sizes}
          />
        )}
        <ImageComponent
          {...imageProps}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading={loading}
        />
      </picture>
    </div>
  );
}
