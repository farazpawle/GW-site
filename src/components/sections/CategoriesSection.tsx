import { Car, Truck, Cog } from "lucide-react";

export default function CategoriesSection() {
  return (
    <section className="py-20" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-5xl font-oswald font-bold text-white mb-4"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Our Categories
          </h2>
          <div 
            className="w-24 h-1 mx-auto mb-4"
            style={{ backgroundColor: '#6e0000' }}
          ></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Comprehensive range of premium auto parts for all your vehicle needs
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* European Parts */}
          <div 
            className="group text-center p-10 transition-all duration-300 cursor-pointer rounded-2xl border hover:border-[#6e0000] hover:transform hover:scale-105"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a'
            }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: '#6e0000' }}
            >
              <Car className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">European Parts</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Precision-engineered components tailored for European vehicles.
            </p>
          </div>

          {/* American Parts */}
          <div 
            className="group text-center p-10 transition-all duration-300 cursor-pointer rounded-2xl border hover:border-[#6e0000] hover:transform hover:scale-105"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a'
            }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: '#6e0000' }}
            >
              <Cog className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">American Parts</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Reliable, high-performance parts for American cars and SUVs.
            </p>
          </div>

          {/* Truck Parts */}
          <div 
            className="group text-center p-10 transition-all duration-300 cursor-pointer rounded-2xl border hover:border-[#6e0000] hover:transform hover:scale-105"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a'
            }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: '#6e0000' }}
            >
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Truck Parts</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Robust components built to support heavy-duty truck applications.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}