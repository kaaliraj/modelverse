'use client';

import { useState, useEffect, useRef } from 'react';
import type { Model, MediaCardData } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { ScrollingCarousel } from './ScrollingCarousel';

const ProgressBar = ({ onAnimationEnd }: { onAnimationEnd: () => void }) => (
  <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20 overflow-hidden rounded-b-lg">
    <div
      className="h-full bg-primary animate-progress-bar"
      style={{ animationDuration: '5s' }}
      onAnimationEnd={onAnimationEnd}
    ></div>
  </div>
);

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  const cardRef = useRef<HTMLLIElement>(null);
  const isInView = useInView(cardRef, { threshold: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const shouldPlay = isInView || isHovered;
    if (shouldPlay !== isPlaying) {
      setIsPlaying(shouldPlay);
      if (shouldPlay) {
        setAnimationKey(prev => prev + 1);
      }
    }
  }, [isInView, isHovered, isPlaying]);

  const handleAnimationEnd = () => {
    setAnimationKey(prev => prev + 1);
  };

  const formatCompact = (num: number) => {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  return (
    <li
      ref={cardRef}
      className="group w-full flex flex-col transition-transform duration-300 ease-in-out hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {model.media && model.media.length > 0 ? (
        <div className="relative">
          <ScrollingCarousel media={model.media} />
          <ProgressBar key={animationKey} onAnimationEnd={handleAnimationEnd} />
        </div>
      ) : (
        <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden rounded-lg border bg-card shadow-sm group-hover:shadow-lg transition-shadow">
          <Link href="#">
            <Image
              src={isPlaying ? model.previewUrl : model.thumbnailUrl}
              alt={`Preview of ${model.name}`}
              fill
              className="object-cover transition-opacity duration-300"
              data-ai-hint="abstract technology"
              unoptimized={true}
            />
          </Link>
          {isPlaying && <ProgressBar key={animationKey} onAnimationEnd={handleAnimationEnd} />}
        </div>
      )}
      <div className="flex w-full items-start justify-between gap-3 flex-col">
        <div className="flex flex-col gap-2 w-full">
          <Link href="#" className="flex flex-col gap-2 transition-colors text-muted-foreground group-hover:text-foreground">
            <div className="text-lg font-medium text-secondary-foreground transition-colors md:text-xl">
              <div className="flex justify-between gap-4">
                <div className="flex w-full items-center gap-2 group-hover:underline">
                  {model.name}
                </div>
                <div className="flex flex-shrink-0 items-center justify-end text-xs text-muted-foreground/80 md:w-40 md:text-base">
                  <TrendingUp className="h-4 w-4 text-primary/80 mr-1" />
                  <span className="hidden md:inline">
                    <span>{formatCompact(model.weeklyUsage)}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="line-clamp-2 text-sm tracking-tight text-muted-foreground/90 group-hover:text-muted-foreground">
              <p>{model.description}</p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 truncate pt-1 text-xs text-muted-foreground/80">
            <span>
              by{' '}
              <a href="#" className="font-medium text-foreground/80 hover:underline">
                {model.provider}
              </a>
            </span>
            <span className="h-3 border-l border-muted-foreground/30"></span>
            <span>{formatCompact(model.contextLength)} context</span>
            <span className="h-3 border-l border-muted-foreground/30"></span>
            <span>${model.inputPrice.toFixed(2)}/M input</span>
            <span className="h-3 border-l border-muted-foreground/30"></span>
            <span>${model.outputPrice.toFixed(2)}/M output</span>
          </div>
        </div>
      </div>
    </li>
  );
}
