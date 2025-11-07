/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  Car, Truck, Cog, 
  Wrench, Settings, Package,
  Gauge, Zap, Battery,
  CircleDot, Disc, Fuel,
  Wind, Droplet, Flame,
  Shield, Lock, Key,
  Radio, Wifi, Bluetooth,
  Headphones, Speaker, Mic,
  Camera, Monitor, Cpu,
  HardDrive, Database, Server,
  Box, Archive, Container
} from "lucide-react";
import Image from "next/image";
import { CategoriesSectionConfig } from '@/types/page-section';
import { applyTextStyles } from '@/lib/utils/typography';

interface CategoriesSectionProps {
  config: CategoriesSectionConfig;
}

export default function CategoriesSection({ config }: CategoriesSectionProps) {
  if (!config.show) return null;

  const accentColor = config.accentColor || '#6e0000';
  const gridColumns = config.gridColumns || 3;
  const cardStyle = config.cardStyle || 'boxed';
  const iconPosition = config.iconPosition || 'top';
  
  // Icon mapping
  const iconMap: Record<string, any> = {
    'Car': Car, 'Truck': Truck, 'Cog': Cog,
    'Wrench': Wrench, 'Settings': Settings, 'Package': Package,
    'Gauge': Gauge, 'Zap': Zap, 'Battery': Battery,
    'CircleDot': CircleDot, 'Disc': Disc, 'Fuel': Fuel,
    'Wind': Wind, 'Droplet': Droplet, 'Flame': Flame,
    'Shield': Shield, 'Lock': Lock, 'Key': Key,
    'Radio': Radio, 'Wifi': Wifi, 'Bluetooth': Bluetooth,
    'Headphones': Headphones, 'Speaker': Speaker, 'Mic': Mic,
    'Camera': Camera, 'Monitor': Monitor, 'Cpu': Cpu,
    'HardDrive': HardDrive, 'Database': Database, 'Server': Server,
    'Box': Box, 'Archive': Archive, 'Container': Container
  };
  
  // Filter active categories and sort
  const activeCategories = config.categories
    .filter(cat => cat.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Grid class based on columns
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }[gridColumns] || 'md:grid-cols-3';
  
  return (
    <section className="relative py-20 overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Background Pattern */}
      {config.backgroundPattern && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(110, 0, 0) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-oswald font-bold text-white mb-4"
            style={{ fontFamily: "'Oswald', sans-serif", ...applyTextStyles(config.titleStyle) }}
          >
            {config.title}
          </h2>
          <div 
            className="w-24 h-1 mx-auto mb-4"
            style={{ backgroundColor: accentColor }}
          ></div>
          {config.description && (
            <p 
              className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4"
              style={applyTextStyles(config.descriptionStyle)}
            >
              {config.description}
            </p>
          )}
        </div>

        {/* Category Cards */}
        <div className={`grid ${gridClass} gap-6 md:gap-8 max-w-6xl mx-auto`}>
          {activeCategories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Car;
            const hasCTA = category.cta?.show;
            
            // Layout classes based on icon position and card style
            const getLayoutClasses = () => {
              if (cardStyle === 'image-heavy') {
                return 'relative overflow-hidden h-80';
              }
              if (iconPosition === 'left' || iconPosition === 'right') {
                return 'flex items-center gap-6';
              }
              return 'text-center';
            };
            
            const getIconClasses = () => {
              if (iconPosition === 'left') return 'order-1';
              if (iconPosition === 'right') return 'order-3';
              if (iconPosition === 'bottom') return 'order-3 mt-auto';
              return '';
            };
            
            return (
              <div 
                key={`${category.title}-${index}`}
                className={`group ${getLayoutClasses()} p-6 md:p-10 transition-all duration-300 rounded-2xl border ${
                  cardStyle === 'minimal' ? 'border-transparent hover:border-opacity-50' : 'hover:transform hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: cardStyle === 'minimal' ? 'transparent' : '#1a1a1a',
                  borderColor: accentColor,
                  borderWidth: cardStyle === 'minimal' ? '2px' : '1px',
                  borderStyle: cardStyle === 'minimal' ? 'solid' : 'solid'
                }}
              >
                {/* Background Image for image-heavy style */}
                {cardStyle === 'image-heavy' && category.backgroundImage && (
                  <>
                    <Image
                      src={category.backgroundImage}
                      alt={category.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  </>
                )}
                
                {/* Icon */}
                <div className={`${getIconClasses()} ${cardStyle === 'image-heavy' ? 'relative z-10' : ''}`}>
                  <div 
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ${
                      iconPosition === 'top' || iconPosition === 'bottom' ? 'mx-auto' : ''
                    } ${iconPosition === 'bottom' ? 'mt-4' : iconPosition === 'top' ? 'mb-4 md:mb-6' : ''} group-hover:scale-110 transition-transform flex-shrink-0`}
                    style={{ backgroundColor: accentColor }}
                  >
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className={`${iconPosition === 'left' || iconPosition === 'right' ? 'flex-1 order-2' : ''} ${
                  cardStyle === 'image-heavy' ? 'relative z-10 mt-auto' : ''
                }`}>
                  <h3 
                    className={`text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 ${
                      iconPosition === 'left' || iconPosition === 'right' ? 'text-left' : 'text-center'
                    }`}
                    style={applyTextStyles(category.titleStyle)}
                  >
                    {category.title}
                  </h3>
                  <p 
                    className={`text-gray-400 text-base md:text-lg leading-relaxed ${
                      iconPosition === 'left' || iconPosition === 'right' ? 'text-left' : 'text-center'
                    }`}
                    style={applyTextStyles(category.descriptionStyle)}
                  >
                    {category.description}
                  </p>
                  
                  {/* CTA Button */}
                  {hasCTA && category.cta && (
                    <a
                      href={category.cta.link || '#'}
                      className={`inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 ${
                        iconPosition === 'left' || iconPosition === 'right' ? '' : 'mx-auto'
                      }`}
                      style={{ backgroundColor: accentColor }}
                    >
                      {category.cta.text || 'View Products'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}