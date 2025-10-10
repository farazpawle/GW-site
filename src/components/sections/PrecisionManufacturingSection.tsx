import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ServiceItem {
  title: string;
  description: string;
  image: string;
}

const services: ServiceItem[] = [
  {
    title: "Engine Components",
    description: "High-performance parts for various engine types.",
    image: "/images/engine.jpg"
  },
  {
    title: "Transmission Parts", 
    description: "Durable components for smooth gear shifting.",
    image: "/images/transmision.jpeg"
  },
  {
    title: "Braking Systems",
    description: "Reliable parts for enhanced safety.",
    image: "/images/brake.jpg"
  },
  {
    title: "Electrical Components",
    description: "Advanced parts for modern vehicles.",
    image: "/images/elec-com-e1740055106227.jpeg"
  }
];

export default function PrecisionManufacturingSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-5xl font-oswald font-bold text-white mb-4"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Precision-Manufactured Auto Parts
          </h2>
          <div className="w-24 h-1 mx-auto mb-4" style={{ backgroundColor: '#6e0000' }}></div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Crafted with cutting-edge technology and rigorous quality control to ensure peak performance
          </p>
        </div>
        
        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group rounded-2xl overflow-hidden border hover:border-[#6e0000] transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              style={{ 
                backgroundColor: '#0a0a0a',
                borderColor: '#2a2a2a'
              }}
            >
              {/* Image Area with Overlay */}
              <div className="relative w-full h-56 overflow-hidden">
                <Image 
                  src={service.image} 
                  alt={service.title} 
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Badge on image */}
                <div className="absolute top-4 right-4">
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: '#6e0000' }}
                  >
                    Premium
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#ff9999] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  {service.description}
                </p>
                <button 
                  className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#6e0000]/30 group-hover:gap-3 w-full justify-center"
                  style={{ 
                    backgroundColor: '#6e0000',
                    fontSize: '0.875rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  <span>LEARN MORE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}