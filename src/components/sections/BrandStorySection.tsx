'use client';

import { Award, Shield, Zap } from "lucide-react";

export default function BrandStorySection() {
  return (
    <section className="py-20 bg-[#1a1a1a] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 
              className="text-5xl font-oswald font-bold text-white mb-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Our Brand Story
            </h2>
            <div className="w-24 h-1 mx-auto mb-4" style={{ backgroundColor: '#6e0000' }}></div>
            <h3 className="text-xl text-gray-400">
              Driving Innovation in Auto Parts
            </h3>
          </div>
          
          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed text-lg">
                Garrit & Wulf began with a vision to revolutionize the auto parts industry. Our 
                passion for precision and dedication to quality have transformed humble beginnings 
                into a legacy of innovation.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg">
                We craft every part with meticulous attention to detail to ensure reliability 
                and performance for European, American, and heavy-duty trucks. Our story is one of 
                resilience, creativity, and continuous improvement.
              </p>
              
              <a 
                href="/about"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-lg uppercase transition-all duration-300 hover:scale-105 hover:shadow-xl group mt-4"
                style={{ backgroundColor: '#6e0000' }}
              >
                <span>Discover More</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            
            {/* Feature Cards */}
            <div className="space-y-4">
              <div 
                className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#6e0000' }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Quality Assurance</h4>
                    <p className="text-gray-400 text-sm">Every component undergoes rigorous testing for maximum reliability</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#6e0000' }}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Innovation Driven</h4>
                    <p className="text-gray-400 text-sm">Cutting-edge technology and continuous improvement</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#6e0000' }}
                  >
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Industry Leader</h4>
                    <p className="text-gray-400 text-sm">15+ years of excellence and trusted partnerships</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}