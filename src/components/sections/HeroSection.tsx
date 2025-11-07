'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Statistics from "@/components/ui/Statistics";
import { Sparkles } from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import ShaderBackground from "@/components/ui/shader-background";
import { HeroSectionConfig } from '@/types/page-section';
import { applyTextStyles } from '@/lib/utils/typography';

// Interactive character component
function InteractiveChar({ 
  char, 
  mouseX, 
  mouseY, 
  baseColor, 
  hoverColorStart, 
  hoverColorEnd, 
  radius = 150 
}: { 
  char: string; 
  mouseX: number; 
  mouseY: number; 
  baseColor: string; 
  hoverColorStart: [number, number, number]; 
  hoverColorEnd: [number, number, number]; 
  radius?: number;
}) {
  const charRef = useRef<HTMLSpanElement>(null);
  const [color, setColor] = useState(baseColor);

  useEffect(() => {
    if (!charRef.current) return;

    const rect = charRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + 
      Math.pow(mouseY - centerY, 2)
    );

    if (distance < radius) {
      const intensity = 1 - (distance / radius);
      const r = Math.round(hoverColorStart[0] + intensity * (hoverColorEnd[0] - hoverColorStart[0]));
      const g = Math.round(hoverColorStart[1] + intensity * (hoverColorEnd[1] - hoverColorStart[1]));
      const b = Math.round(hoverColorStart[2] + intensity * (hoverColorEnd[2] - hoverColorStart[2]));
      setColor(`rgb(${r}, ${g}, ${b})`);
    } else {
      setColor(baseColor);
    }
  }, [mouseX, mouseY, baseColor, hoverColorStart, hoverColorEnd, radius]);

  return (
    <span
      ref={charRef}
      className="inline-block transition-colors duration-200"
      style={{ color }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}

interface HeroSectionProps {
  config: HeroSectionConfig;
}

export default function HeroSection({ config }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section 
        className="text-white py-20 relative overflow-hidden min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        {/* Animated Background - Conditional Rendering */}
        {(config.backgroundType || 'paths') === 'shader' ? (
          <ShaderBackground />
        ) : (
          <BackgroundPaths />
        )}
        
        <div className="container mx-auto px-4 text-center relative z-10 max-w-6xl">
          {/* Premium Badge */}
          <div className="inline-block animate-fade-in mb-6">
            <div 
              className="flex items-center gap-2 px-6 py-3 rounded-full cursor-default transition-all duration-300"
              style={{
                background: 'rgba(110, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(110, 0, 0, 0.3)'
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: config.badge.icon || '#6e0000' }} />
              <span 
                className="uppercase tracking-wider font-semibold text-sm"
                style={{ 
                  color: '#ff9999',
                  ...applyTextStyles(config.badge.textStyle)
                }}
              >
                {config.badge.text}
              </span>
            </div>
          </div>
          
          {/* Main Heading with Mouse Proximity Effect */}
          <h1 
            className="font-oswald font-bold mb-6 animate-fade-in cursor-default relative"
            style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: '1.1',
              fontFamily: "'Oswald', sans-serif"
            }}
          >
            <div className="relative z-10">
              <div style={applyTextStyles(config.title.line1Style)}>
                {config.title.line1.split('').map((char, index) => (
                  <InteractiveChar
                    key={index}
                    char={char}
                    mouseX={mousePosition.x}
                    mouseY={mousePosition.y}
                    baseColor={config.title.line1Style?.color || "white"}
                    hoverColorStart={[255, 255, 255]}
                    hoverColorEnd={[147, 32, 32]}
                    radius={200}
                  />
                ))}
              </div>
              <br />
              <div style={applyTextStyles(config.title.line2Style)}>
                {config.title.line2.split('').map((char, index) => (
                  <InteractiveChar
                    key={index}
                    char={char}
                    mouseX={mousePosition.x}
                    mouseY={mousePosition.y}
                    baseColor={config.title.line2Style?.color || "#6e0000"}
                    hoverColorStart={[110, 0, 0]}
                    hoverColorEnd={[255, 180, 180]}
                    radius={200}
                  />
                ))}
              </div>
            </div>
          </h1>
          
          {/* Subheading with Mouse Proximity Effect */}
          <h2 
            className="text-xl md:text-2xl mb-12 animate-fade-in max-w-3xl mx-auto cursor-default"
            style={{ 
              animationDelay: '0.2s',
              ...applyTextStyles(config.descriptionStyle)
            }}
          >
            {config.description.split('').map((char, index) => (
              <InteractiveChar
                key={index}
                char={char}
                mouseX={mousePosition.x}
                mouseY={mousePosition.y}
                baseColor={config.descriptionStyle?.color || "rgb(209, 213, 219)"}
                hoverColorStart={[209, 213, 219]}
                hoverColorEnd={[147, 32, 32]}
                radius={150}
              />
            ))}
          </h2>

          {/* CTA Buttons */}
          {(config.primaryCTA.show || config.secondaryCTA.show) && (
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {config.primaryCTA.show && (
                <Link
                  href={config.primaryCTA.link}
                  className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-lg uppercase transition-all duration-300 hover:scale-105 hover:shadow-xl group text-sm md:text-base"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <span>{config.primaryCTA.text}</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
              
              {config.secondaryCTA.show && (
                <Link
                  href={config.secondaryCTA.link}
                  className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-lg uppercase transition-all duration-300 hover:scale-105 group text-sm md:text-base border-2"
                  style={{ 
                    borderColor: '#6e0000',
                    color: '#fff',
                    backgroundColor: 'rgba(110, 0, 0, 0.1)'
                  }}
                >
                  <span>{config.secondaryCTA.text}</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          )}
          
          {/* Statistics Component */}
          {config.statistics.show && (
            <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Statistics stats={config.statistics.stats} />
            </div>
          )}
        </div>

        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#1a1a1a"/>
          </svg>
        </div>
      </section>
    </>
  );
}