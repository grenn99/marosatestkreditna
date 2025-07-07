import { X } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { Image } from './Image';

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export function ImageModal({ imageUrl, alt, onClose }: ImageModalProps) {
  console.log('Opening image modal with URL:', imageUrl);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        aria-label="Close modal"
      >
        <X className="w-8 h-8" />
      </button>
      <Image
        src={imageUrl || ''}
        alt={alt}
        fallbackSrc="/images/placeholder.svg"
        className="max-w-full max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
