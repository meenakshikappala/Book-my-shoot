import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1B19] via-[#282623] to-[#141413] text-[#E6E4DD] p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Camera className="w-7 h-7 text-[#C84B31] mb-2 opacity-90" />
        <span className="font-editorial text-base italic tracking-wide text-[#F4F4F0] line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
