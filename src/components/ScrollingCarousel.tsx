import React, { useRef, useState, useEffect } from 'react';
import type { MediaCardData } from '@/lib/types';
import { MediaCard } from './MediaCard';

interface ScrollingCarouselProps {
  media: MediaCardData[];
}

export function ScrollingCarousel({ media }: ScrollingCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollByCard = (dir: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const card = el.querySelector('.media-card') as HTMLElement;
    const cardWidth = card ? card.offsetWidth : 300;
    el.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  return (
    <div className="ScrollingCarousel relative w-full aspect-[16/9] mb-4 overflow-hidden rounded-lg border bg-card shadow-sm group-hover:shadow-lg transition-shadow">
      {canScrollLeft && (
        <button
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
          onClick={() => scrollByCard('left')}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}
      <div
        ref={containerRef}
        className="carousel-list flex flex-row overflow-x-auto scrollbar-hide w-full h-full"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {media.map((item, idx) => (
          <div
            key={idx}
            className={`w-64 ${idx !== media.length - 1 ? 'mr-2' : 'mr-[-40px]'} h-full`}
            style={{ flexShrink: 0 }}
          >
            <MediaCard data={item} />
          </div>
        ))}
      </div>
      {canScrollRight && (
        <button
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
          onClick={() => scrollByCard('right')}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      )}
    </div>
  );
} 