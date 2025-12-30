'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Images,
  Utensils,
  PartyPopper,
  Palmtree,
  Waves
} from 'lucide-react';

// Gallery images from public/images folder
const galleryImages = [
  { src: '/images/images (1).jpeg', alt: 'Resort View 1', category: 'resort' },
  { src: '/images/images (1).jpg', alt: 'Resort View 2', category: 'resort' },
  { src: '/images/images (2).jpg', alt: 'Activities', category: 'activities' },
  { src: '/images/images (3).jpg', alt: 'Pool Area', category: 'pool' },
  { src: '/images/images (4).jpg', alt: 'Dining Experience', category: 'food' },
  { src: '/images/images (5).jpg', alt: 'Event Space', category: 'events' },
  { src: '/images/images (6).jpg', alt: 'Garden View', category: 'resort' },
  { src: '/images/images (7).jpg', alt: 'Party Setup', category: 'events' },
  { src: '/images/images (8).jpg', alt: 'Relaxation Zone', category: 'pool' },
  { src: '/images/images (9).jpg', alt: 'Adventure Activities', category: 'activities' },
  { src: '/images/images (10).jpg', alt: 'Food Station', category: 'food' },
  { src: '/images/images (11).jpg', alt: 'Entertainment', category: 'events' },
  { src: '/images/images (12).jpg', alt: 'Nature Trail', category: 'resort' },
  { src: '/images/images (13).jpg', alt: 'Sunset View', category: 'resort' },
];

const menuItems = [
  { id: 'all', label: 'All Photos', icon: Images },
  { id: 'resort', label: 'Resort', icon: Palmtree },
  { id: 'pool', label: 'Pool & Water', icon: Waves },
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'events', label: 'Events', icon: PartyPopper },
  { id: 'activities', label: 'Activities', icon: Camera },
];

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const filteredImages = activeCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeCategory);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Scroll thumbnails to center the active one
  useEffect(() => {
    if (thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const activeThumb = container.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        const scrollLeft = activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
  }, [filteredImages.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
  };

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev();
        if (e.key === 'ArrowRight') lightboxNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const handleImageLoad = (index: number) => {
    setIsLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setIsLoading((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <>
      <section id="gallery" className="glass-strong rounded-3xl p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Event Gallery</h2>
            <p className="text-sm text-gray-500">Explore our amazing venue</p>
          </div>
        </div>

        {/* Category Menu */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2 min-w-max">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;
              const count = item.id === 'all'
                ? galleryImages.length
                : galleryImages.filter(img => img.category === item.id).length;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                    isActive ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Carousel */}
        <div className="relative group">
          {/* Main Image Container */}
          <div
            className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => openLightbox(currentIndex)}
          >
            {filteredImages.length > 0 && (
              <>
                <Image
                  src={filteredImages[currentIndex].src}
                  alt={filteredImages[currentIndex].alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
                  priority={currentIndex === 0}
                  loading={currentIndex === 0 ? 'eager' : 'lazy'}
                  onLoadingComplete={() => handleImageLoad(currentIndex)}
                  onLoadStart={() => handleImageLoadStart(currentIndex)}
                />

                {/* Loading Skeleton */}
                {isLoading[currentIndex] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                {/* Zoom Icon Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                    <ZoomIn className="w-6 h-6 text-gray-800" />
                  </div>
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-medium backdrop-blur-sm">
                  {currentIndex + 1} / {filteredImages.length}
                </div>

                {/* Caption */}
                <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/60 text-white backdrop-blur-sm">
                  <p className="font-medium">{filteredImages[currentIndex].alt}</p>
                </div>
              </>
            )}
          </div>

          {/* Navigation Arrows */}
          {filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div
          ref={thumbnailsRef}
          className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2"
        >
          {filteredImages.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                currentIndex === index
                  ? 'ring-3 ring-pink-500 ring-offset-2 scale-105'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
            {lightboxIndex + 1} / {filteredImages.length}
          </div>

          {/* Main Lightbox Image */}
          <div
            className="relative w-full h-full max-w-6xl max-h-[85vh] mx-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filteredImages[lightboxIndex].src}
              alt={filteredImages[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Lightbox Navigation */}
          {filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Lightbox Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 scrollbar-hide">
            {filteredImages.map((image, index) => (
              <button
                key={`lightbox-${image.src}-${index}`}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); }}
                className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                  lightboxIndex === index
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Caption */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-black/60 text-white backdrop-blur-sm">
            <p className="font-medium text-center">{filteredImages[lightboxIndex].alt}</p>
          </div>
        </div>
      )}
    </>
  );
}
