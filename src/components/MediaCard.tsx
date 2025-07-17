import { useRef, useState, useEffect } from 'react';
import { MediaCardData } from '@/lib/types';
import { useInView } from '@/hooks/use-in-view';
import { useIsMobile } from '@/hooks/use-mobile';

interface MediaCardProps {
  data: MediaCardData;
}

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const watchMatch = url.match(/watch\?v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=1`;
  const shortsMatch = url.match(/shorts\/([^?&/]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&mute=1`;
  // fallback: try to extract ID from end
  const idMatch = url.match(/([\w-]{11})$/);
  if (idMatch) return `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&mute=1`;
  return null;
}

export function MediaCard({ data }: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { threshold: 0.5 });
  const isMobile = useIsMobile();

  // Play video if hovered or in view; pause/reset otherwise (for non-YouTube)
  useEffect(() => {
    if (data.mediaType !== 'youtube' && videoRef.current) {
      const shouldPlay = hovered || isInView;
      if (shouldPlay) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [hovered, isInView, data.mediaType]);

  // For YouTube: show iframe on hover (desktop) or in view (mobile)
  useEffect(() => {
    if (data.mediaType === 'youtube') {
      if ((isMobile && isInView) || (!isMobile && hovered)) {
        setShowIframe(true);
      } else {
        setShowIframe(false);
      }
    }
  }, [hovered, isInView, isMobile, data.mediaType]);

  // Preload video only when hovered or in view
  const shouldPreload = hovered || isInView;

  // Only for YouTube: get embed URL
  const youTubeEmbedUrl = data.mediaType === 'youtube' ? getYouTubeEmbedUrl(data.previewVideoURL || data.destinationURL) : null;

  return (
    <div
      ref={cardRef}
      className="media-card flex-shrink-0 w-64 h-full relative rounded-lg overflow-hidden bg-gray-100 shadow hover:shadow-lg transition-shadow cursor-pointer mx-2"
      data-media-type={data.mediaType}
      data-destination-url={data.destinationURL}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image always present */}
      {data.mediaType === 'youtube' ? (
        <>
          <img
            src={data.thumbnailURL}
            alt={data.sourceName}
            className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-300 ${showIframe ? 'opacity-0' : 'opacity-100'}`}
            style={{ zIndex: 1 }}
          />
          {showIframe && youTubeEmbedUrl && (
            <iframe
              src={youTubeEmbedUrl}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full z-10"
              frameBorder={0}
              title={data.sourceName}
            />
          )}
        </>
      ) : (
        <>
          <img
            src={data.thumbnailURL}
            alt={data.sourceName}
            className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-300 ${((hovered || isInView) && data.previewVideoURL) ? 'opacity-0' : 'opacity-100'}`}
            style={{ zIndex: 1 }}
          />
          {/* Video preview on hover or in view, if available */}
          {data.previewVideoURL && (
            <video
              ref={videoRef}
              src={data.previewVideoURL}
              muted
              loop
              playsInline
              autoPlay
              preload={shouldPreload ? 'auto' : 'none'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${((hovered || isInView)) ? 'opacity-100' : 'opacity-0'}`}
              style={{ zIndex: 2 }}
            />
          )}
        </>
      )}
      {/* Duration overlay for videos */}
      {data.duration && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded z-10">
          {data.duration}
        </div>
      )}
      {/* Source name/channel overlay */}
      <div className="absolute bottom-2 left-2 bg-white/80 text-xs px-2 py-0.5 rounded z-10 flex flex-col">
        <span className="font-semibold text-gray-800">{data.sourceName}</span>
        {data.sourceChannel && <span className="text-gray-600">{data.sourceChannel}</span>}
      </div>
      {/* Clickable overlay for non-YouTube types */}
      {data.mediaType !== 'youtube' ? (
        <a
          href={data.destinationURL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-20"
          tabIndex={-1}
        />
      ) : null}
    </div>
  );
} 