import { useRef, useState } from 'react';
import { MediaCardData } from '@/lib/types';

interface MediaCardProps {
  data: MediaCardData;
}

export function MediaCard({ data }: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle hover preview for video
  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };
  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // For YouTube, Facebook, Instagram, Image
  const isVideo = data.mediaType === 'youtube' || data.mediaType === 'facebook' || data.mediaType === 'instagram';

  // For YouTube modal, you would add modal logic here (not implemented in this base version)

  return (
    <div
      className="media-card flex-shrink-0 w-64 h-full relative rounded-lg overflow-hidden bg-gray-100 shadow hover:shadow-lg transition-shadow cursor-pointer mx-2"
      data-media-type={data.mediaType}
      data-destination-url={data.destinationURL}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image always present */}
      <img
        src={data.thumbnailURL}
        alt={data.sourceName}
        className={`object-cover w-full h-full absolute inset-0 transition-opacity duration-300 ${hovered && data.previewVideoURL ? 'opacity-0' : 'opacity-100'}`}
        style={{ zIndex: 1 }}
      />
      {/* Video preview on hover, if available */}
      {data.previewVideoURL && (
        <video
          ref={videoRef}
          src={data.previewVideoURL}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ zIndex: 2 }}
        />
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
      {/* For YouTube, modal logic would go here */}
    </div>
  );
} 