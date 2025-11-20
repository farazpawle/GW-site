/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { 
  Award, Shield, Zap, 
  CheckCircle, Star, Target, 
  Layers, Box, Package,
  Wrench, Settings, Cog,
  TrendingUp, BarChart, Activity,
  Clock, Timer, Gauge,
  Users, UserCheck, UsersRound,
  Heart, ThumbsUp, Smile,
  Sparkles, Gem, Crown,
  Rocket, Zap as Lightning, Flame,
  Lock, ShieldCheck, ShieldAlert,
  Globe, MapPin, Compass,
  FileCheck, ClipboardCheck, BadgeCheck
} from "lucide-react";
import { BrandStorySectionConfig } from '@/types/page-section';
import { applyTextStyles } from '@/lib/utils/typography';

interface BrandStorySectionProps {
  config: BrandStorySectionConfig;
}

export default function BrandStorySection({ config }: BrandStorySectionProps) {
  return (
    <section className="py-12 md:py-20 bg-[#1a1a1a] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-oswald font-bold text-white mb-4"
              style={{ 
                fontFamily: "'Oswald', sans-serif",
                ...applyTextStyles(config.titleStyle)
              }}
            >
              {config.title}
            </h2>
            <div className="w-24 h-1 mx-auto mb-4" style={{ backgroundColor: '#6e0000' }}></div>
            <h3 
              className="text-lg md:text-xl text-gray-400"
              style={applyTextStyles(config.subtitleStyle)}
            >
              {config.subtitle}
            </h3>
          </div>
          
          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`space-y-6 ${config.features.show ? '' : 'lg:col-span-2'}`}>
              {config.content.map((paragraph, index) => (
                <p 
                  key={index} 
                  className="text-gray-300 leading-relaxed text-base md:text-lg"
                  style={applyTextStyles(config.contentStyle)}
                >
                  {paragraph}
                </p>
              ))}
              
              {config.cta.show && (
                <a 
                  href={config.cta.link}
                  className="inline-flex items-center gap-2 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg uppercase transition-all duration-300 hover:scale-105 hover:shadow-xl group mt-4 text-sm md:text-base"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <span>{config.cta.text}</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              )}
            </div>
            
            {/* Feature Cards */}
            {config.features.show && (
              <div className="space-y-4">
                {config.features.items.map((feature, index) => {
                  // Map icon names to components with extensive icon library
                  const iconMap: Record<string, any> = {
                    // Achievement & Success
                    'Award': Award, 'Star': Star, 'Trophy': Award, 'Crown': Crown,
                    'CheckCircle': CheckCircle, 'BadgeCheck': BadgeCheck,
                    
                    // Protection & Security
                    'Shield': Shield, 'ShieldCheck': ShieldCheck, 'ShieldAlert': ShieldAlert,
                    'Lock': Lock,
                    
                    // Energy & Speed
                    'Zap': Zap, 'Lightning': Lightning, 'Flame': Flame, 'Rocket': Rocket,
                    
                    // Quality & Precision
                    'Target': Target, 'Sparkles': Sparkles, 'Gem': Gem,
                    
                    // Products & Manufacturing
                    'Box': Box, 'Package': Package, 'Layers': Layers,
                    
                    // Tools & Technical
                    'Wrench': Wrench, 'Settings': Settings, 'Cog': Cog,
                    
                    // Performance & Analytics
                    'TrendingUp': TrendingUp, 'BarChart': BarChart, 'Activity': Activity,
                    'Gauge': Gauge,
                    
                    // Time & Efficiency
                    'Clock': Clock, 'Timer': Timer,
                    
                    // People & Service
                    'Users': Users, 'UserCheck': UserCheck, 'UsersRound': UsersRound,
                    
                    // Trust & Satisfaction
                    'Heart': Heart, 'ThumbsUp': ThumbsUp, 'Smile': Smile,
                    
                    // Global & Location
                    'Globe': Globe, 'MapPin': MapPin, 'Compass': Compass,
                    
                    // Verification & Documentation
                    'FileCheck': FileCheck, 'ClipboardCheck': ClipboardCheck
                  };
                  
                  const IconComponent = iconMap[feature.icon] || Award;
                  
                  return (
                    <div 
                      key={index}
                      className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                      style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a' }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: '#6e0000' }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 
                            className="text-white font-bold text-lg mb-1"
                            style={applyTextStyles(feature.titleStyle)}
                          >
                            {feature.title}
                          </h4>
                          <p 
                            className="text-gray-400 text-sm"
                            style={applyTextStyles(feature.descriptionStyle)}
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}