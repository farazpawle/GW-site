import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PrecisionMfgSectionConfig } from '@/types/page-section';
import { applyTextStyles } from '@/lib/utils/typography';

interface PrecisionManufacturingSectionProps {
  config: PrecisionMfgSectionConfig;
}

export default function PrecisionManufacturingSection({ config }: PrecisionManufacturingSectionProps) {
  // Return null if section is hidden
  if (config.show === false) return null;

  // Get config values with defaults
  const accentColor = config.accentColor || '#6e0000';
  const gridColumns = config.gridColumns || 4;
  const cardStyle = config.cardStyle || 'standard';
  const ctaStyle = config.ctaStyle || 'solid';
  const badge = config.badge || { show: true, position: 'top-right' };

  // Filter active services and sort by order
  const activeServices = config.services
    .filter(service => service.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Grid class based on columns
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }[gridColumns] || 'md:grid-cols-2 lg:grid-cols-4';

  // Badge position classes
  const badgePositionClass = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }[badge.position] || 'top-4 right-4';

  return (
    <section className="py-12 md:py-20 relative overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-oswald font-bold text-white mb-4 px-4"
            style={{ fontFamily: "'Oswald', sans-serif", ...applyTextStyles(config.titleStyle) }}
          >
            {config.title}
          </h2>
          <div className="w-24 h-1 mx-auto mb-4" style={{ backgroundColor: accentColor }}></div>
          <p 
            className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto px-4"
            style={applyTextStyles(config.descriptionStyle)}
          >
            {config.description}
          </p>
        </div>
        
        {/* Cards Grid */}
        <div className={`grid ${gridClass} gap-6 max-w-7xl mx-auto`}>
          {activeServices.map((service, index) => {
            const showBadge = badge.show && service.badgeText;
            const showCta = service.cta?.show !== false;
            
            return (
            <div 
              key={index} 
              className="group rounded-2xl overflow-hidden border hover:border-[#6e0000] transition-all duration-300 hover:transform hover:scale-105 cursor-pointer flex flex-col"
              style={{ 
                backgroundColor: '#0a0a0a',
                borderColor: '#2a2a2a'
              }}
            >
              {/* Image Area with Overlay */}
              <div className="relative w-full h-56 overflow-hidden">
                <Image 
                  src={service.image} 
                  alt={service.altText || service.title} 
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Badge on image */}
                {showBadge && (
                  <div className={`absolute ${badgePositionClass}`}>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {service.badgeText || 'Premium'}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col flex-1">
                <h3 
                  className="text-xl font-bold mb-3 text-white group-hover:text-[#ff9999] transition-colors"
                  style={applyTextStyles(service.titleStyle)}
                >
                  {service.title}
                </h3>
                <p 
                  className="text-gray-400 mb-6 text-sm leading-relaxed"
                  style={applyTextStyles(service.descriptionStyle)}
                >
                  {service.description}
                </p>
                {showCta && (
                  <Link 
                    href={service.cta?.link || '#'}
                    className={`flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg group-hover:gap-3 w-full justify-center mt-auto ${
                      ctaStyle === 'solid' 
                        ? `hover:shadow-[${accentColor}]/30`
                        : ctaStyle === 'outline'
                        ? 'bg-transparent border-2'
                        : 'bg-transparent hover:bg-white/5'
                    }`}
                    style={{ 
                      backgroundColor: ctaStyle === 'solid' ? accentColor : 'transparent',
                      borderColor: ctaStyle === 'outline' ? accentColor : 'transparent',
                      color: ctaStyle === 'solid' ? 'white' : accentColor,
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <span>{service.cta?.text || 'LEARN MORE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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