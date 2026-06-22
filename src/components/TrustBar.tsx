import React, { useState, useEffect, useRef } from 'react';

interface CounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function Counter({ target, duration = 1000, prefix = "", suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return <span ref={elementRef}>{prefix}{count}{suffix}</span>;
}

export default function TrustBar() {
  const stats = [
    {
      prefix: "",
      target: 84,
      suffix: "+",
      label: "PELANGGAN AKTIF",
    },
    {
      prefix: "< ",
      target: 5,
      suffix: "m",
      label: "RESPON ADMIN",
    },
    {
      prefix: "",
      target: 100,
      suffix: "%",
      label: "GARANSI FULL",
    }
  ];

  return (
    <section className="bg-[#1a1b1a] py-8 md:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-12 items-center justify-items-center">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Stat number */}
              <span className="font-sans text-xl sm:text-4xl md:text-6xl text-blaze-orange font-bold tracking-tight select-none">
                <Counter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
              </span>

              {/* Label */}
              <span className="font-tag text-[8px] sm:text-[10px] md:text-[11px] font-medium tracking-[0.05em] sm:tracking-[0.2em] text-white/50 mt-1.5 sm:mt-3 block uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
