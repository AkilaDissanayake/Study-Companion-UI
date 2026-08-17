import { useEffect, useRef, useState } from 'react';

/**
 * Tracks whether an element has scrolled into view, for the shared .reveal
 * CSS utility (see index.css). Short-circuits to already-visible when the
 * user has requested reduced motion, so content never depends on a scroll
 * event to become visible/readable.
 */
export default function useInView({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isInView, setIsInView] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isInView };
}
