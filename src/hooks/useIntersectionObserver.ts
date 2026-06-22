import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  callback: (isVisible: boolean) => void,
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;

          if (triggerOnce && hasTriggered.current) {
            return;
          }

          if (isVisible) {
            hasTriggered.current = true;
          }

          callback(isVisible);
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [callback, threshold, rootMargin, triggerOnce]);

  return elementRef;
};

export default useIntersectionObserver;
