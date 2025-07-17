import React, { useRef, useState, useEffect } from 'react';
import type { MediaCardData } from '@/lib/types';
import { MediaCard } from './MediaCard';
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Types for images and map
export type CarouselImage = {
  id: string;
  alt: string;
  base64?: string; // for the first image
  url?: string;    // for lazy-loaded images
};

export type LocationPreviewProps = {
  images: CarouselImage[];
  staticMapBase64: string;
  mapCoords: { lat: number; lng: number };
};

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false }) as React.ComponentType<any>;
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false }) as React.ComponentType<any>;
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false }) as React.ComponentType<any>;
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false }) as React.ComponentType<any>;

export const LocationPreview: React.FC<LocationPreviewProps> = ({
  images,
  staticMapBase64,
  mapCoords,
}) => {
  const [current, setCurrent] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
    const timeout = setTimeout(() => setShowMap(true), 1200);
    return () => clearTimeout(timeout);
  }, []);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= images.length) return;
    setCurrent(idx);
  };
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {/* Carousel */}
      <div className="relative w-full md:w-2/3 overflow-hidden">
        <ol
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, idx: number) => (
            <li
              key={img.id}
              aria-hidden={current !== idx}
              className="w-full flex-shrink-0"
              style={{ minWidth: "100%" }}
            >
              <img
                src={idx === 0 ? img.base64 : img.url}
                alt={img.alt}
                loading={idx === 0 ? "eager" : "lazy"}
                className="w-full h-64 md:h-80 object-cover rounded-lg shadow"
                style={{ objectPosition: "center" }}
              />
            </li>
          ))}
        </ol>
        {/* Navigation Buttons */}
        <button
          aria-label="Previous image"
          onClick={prev}
          disabled={current === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition disabled:opacity-50"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button
          aria-label="Next image"
          onClick={next}
          disabled={current === images.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition disabled:opacity-50"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
        </button>
        {/* Progress Dots */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, idx: number) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${current === idx ? "bg-blue-600 scale-125" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
      {/* Map */}
      <div className="relative w-full md:w-1/3 min-h-[256px] flex items-center justify-center">
        {!showMap ? (
          <img
            src={staticMapBase64}
            alt="Static map preview"
            className="w-full h-64 md:h-80 object-cover rounded-lg shadow"
          />
        ) : (
          isClient ? (
            <MapContainer
              center={[mapCoords.lat, mapCoords.lng]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "20rem", borderRadius: "0.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[mapCoords.lat, mapCoords.lng]}>
                <Popup>Location</Popup>
              </Marker>
            </MapContainer>
          ) : null
        )}
      </div>
    </div>
  );
};

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

  // --- New: Play video in view on scroll/touch ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let lastPlayed: HTMLVideoElement | null = null;

    const playVideoInView = () => {
      const cards = el.querySelectorAll('.media-card') as NodeListOf<HTMLElement>;
      let maxVisible = 0;
      let cardToPlay: HTMLElement | null = null;

      // Find the most visible card
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();
        // Calculate visible width within the carousel container
        const visibleWidth = Math.max(0, Math.min(rect.right, containerRect.right) - Math.max(rect.left, containerRect.left));
        if (visibleWidth > maxVisible) {
          maxVisible = visibleWidth;
          cardToPlay = card;
        }
      });
      if (cardToPlay) {
        const video = (cardToPlay as HTMLElement).querySelector('video') as HTMLVideoElement | null;
        if (video) {
          // If a new video is found and it's not the one currently playing
          if (video !== lastPlayed) {
            // Pause the previously played video
            if (lastPlayed && !lastPlayed.paused) {
              lastPlayed.pause();
              lastPlayed.currentTime = 0;
            }
            // Play the new video if it's paused
            if (video.paused) {
              video.play().catch(() => {});
            }
            lastPlayed = video; // Update lastPlayed to the current video
          }
        } else {
          // If cardToPlay has no video, pause the last played one
          if (lastPlayed && !lastPlayed.paused) {
            lastPlayed.pause();
            lastPlayed.currentTime = 0;
            lastPlayed = null;
          }
        }
      } else {
        // If no card is significantly in view, pause the last played video
        if (lastPlayed && !lastPlayed.paused) {
          lastPlayed.pause();
          lastPlayed.currentTime = 0;
          lastPlayed = null;
        }
      }
    };

    // Listen for scroll and touch events
    el.addEventListener('scroll', playVideoInView);
    el.addEventListener('touchend', playVideoInView);
    // Also try on initial mount
    playVideoInView();

    return () => {
      el.removeEventListener('scroll', playVideoInView);
      el.removeEventListener('touchend', playVideoInView);
      // Ensure video is paused on unmount
      if (lastPlayed) {
        lastPlayed.pause();
        lastPlayed.currentTime = 0;
      }
    };
  }, []);
  // --- End new code ---

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
        {media.map((item: MediaCardData, idx: number) => (
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

// NOTE: To use this, install leaflet and react-leaflet:
// npm install leaflet react-leaflet 