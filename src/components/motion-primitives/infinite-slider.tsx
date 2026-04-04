'use client';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useCallback } from 'react';
import useMeasure from 'react-use-measure';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<Animation | null>(null);
  const [measureRef, bounds] = useMeasure();

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      trackRef.current = node;
      measureRef(node);
    },
    [measureRef]
  );

  const size = direction === 'horizontal' ? bounds.width : bounds.height;

  useEffect(() => {
    const el = trackRef.current;
    if (!el || size === 0) return;

    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;
    const distance = Math.abs(to - from);
    const duration = (distance / speed) * 1000;

    const prop = direction === 'horizontal' ? 'translateX' : 'translateY';

    if (animRef.current) animRef.current.cancel();

    const anim = el.animate(
      [
        { transform: `${prop}(${from}px)` },
        { transform: `${prop}(${to}px)` },
      ],
      { duration, iterations: Infinity, easing: 'linear' }
    );
    animRef.current = anim;

    return () => {
      anim.cancel();
      animRef.current = null;
    };
  }, [size, speed, gap, direction, reverse]);

  const handleMouseEnter = speedOnHover
    ? () => {
        if (animRef.current) {
          animRef.current.playbackRate = speedOnHover / speed;
        }
      }
    : undefined;

  const handleMouseLeave = speedOnHover
    ? () => {
        if (animRef.current) {
          animRef.current.playbackRate = 1;
        }
      }
    : undefined;

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        ref={setRef}
        className='flex w-max'
        style={{
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
