// modelverse/src/components/location-preview.tsx

import React, { useState, useRef, useEffect } from "react";
// import your map library here

type CarouselImage = {
  id: string;
  alt: string;
  base64?: string; // for the first image
  url?: string;    // for lazy-loaded images
};

type LocationPreviewProps = {
  images: CarouselImage[];
  staticMapBase64: string;
  mapCoords: { lat: number; lng: number };
};

export const LocationPreview: React.FC<LocationPreviewProps> = ({
  images,
  staticMapBase64,
  mapCoords,
}) => {
  const [current, setCurrent] = useState(0);
  const [showMap, setShowMap] = useState(false);

  // Lazy-load images logic here

  // Show interactive map after a delay or when in view
  useEffect(() => {
    const timeout = setTimeout(() => setShowMap(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Carousel */}
      <div className="relative w-full md:w-2/3 overflow-hidden">
        <ol
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, idx) => (
            <li
              key={img.id}
              aria-hidden={current !== idx}
              className="w-full flex-shrink-0"
            >
              <img
                src={idx === 0 ? img.base64 : img.url}
                alt={img.alt}
                loading={idx === 0 ? "eager" : "lazy"}
                className="w-full h-auto object-cover"
              />
            </li>
          ))}
        </ol>
        {/* Navigation buttons, progress dots, etc. */}
      </div>

      {/* Map */}
      <div className="relative w-full md:w-1/3 min-h-[300px]">
        {!showMap ? (
          <img
            src={staticMapBase64}
            alt="Static map preview"
            className="w-full h-full object-cover"
          />
        ) : (
          // Replace with your interactive map component
          <div className="w-full h-full">
            {/* <InteractiveMap coords={mapCoords} /> */}
          </div>
        )}
      </div>
    </div>
  );
};