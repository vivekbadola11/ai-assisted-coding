import { useRef } from 'react';

/**
 * Dev-only helper: counts how many times the calling component rendered.
 * React StrictMode renders twice in development, so expect even numbers.
 */
export function useRenderCount(): number {
  const renders = useRef(0);
  renders.current += 1;
  return renders.current;
}
