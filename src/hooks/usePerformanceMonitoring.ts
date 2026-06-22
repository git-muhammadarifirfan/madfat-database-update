import { useEffect } from 'react';

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only monitor in development
    if (import.meta.env.PROD) return;

    // Web Vitals
    const onMetric = (metric: { name: string; value: number; rating: string }) => {
      console.log(`%c${metric.name}`, 'color: blue; font-weight: bold', {
        value: metric.value,
        rating: metric.rating,
      });
    };

    // Monitor LCP (Largest Contentful Paint)
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        const value = lastEntry.renderTime ?? lastEntry.loadTime ?? lastEntry.startTime;
        onMetric({
          name: 'LCP',
          value,
          rating: value < 2500 ? 'good' : 'poor',
        });
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      return () => observer.disconnect();
    } catch {
      console.warn('LCP monitoring not supported');
    }
  }, []);
};

export const reportWebVitals = (metric: { value: number }) => {
  if (metric.value < 2500) {
    console.log('✅ Performance is good');
  } else if (metric.value < 4000) {
    console.warn('⚠️ Performance needs improvement');
  } else {
    console.error('❌ Performance is poor');
  }
};

export default usePerformanceMonitoring;
