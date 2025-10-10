'use client';

import { useState, useEffect, useRef } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 5000, suffix: '+', label: 'LINE ITEMS' },
  { value: 15, suffix: '+', label: 'YEARS EXPERIENCE' },
  { value: 100, suffix: '%', label: 'TRUSTWORTHY PARTS' }
];

interface CounterProps {
  end: number;
  suffix: string;
  duration?: number;
}

function Counter({ end, suffix, duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, end, duration]);

  return (
    <div 
      ref={counterRef} 
      className="stat-number"
      style={{
        fontSize: '48px',
        fontWeight: '800',
        display: 'block',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #ffffff, #ff9999)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {count}{suffix}
    </div>
  );
}

export default function Statistics() {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="text-center p-6 rounded-xl border animate-fade-in-up group hover:border-[#6e0000] transition-all duration-300" 
          style={{ 
            animationDelay: `${index * 0.2}s`,
            backgroundColor: 'rgba(26, 26, 26, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <Counter end={stat.value} suffix={stat.suffix} />
          <div className="text-sm md:text-base uppercase tracking-widest text-gray-400 mt-2 font-medium group-hover:text-gray-300 transition-colors">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}