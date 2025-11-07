import { CheckCircle, Users, Award, Target, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Hero Section with Diagonal Design */}
      <section 
        className="relative text-white py-32 overflow-hidden"
        style={{ backgroundColor: '#6e0000' }}
      >
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Our Story</span>
              </div>
            </div>
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-oswald font-bold mb-8 px-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              About Garrit & Wulf
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed px-6 sm:px-8">
              Leading the automotive parts industry with innovation, quality, and exceptional service since 2008.
            </p>
          </div>
        </div>

        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#0a0a0a"/>
          </svg>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 
                className="text-5xl font-oswald font-bold text-white mb-4"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Why Choose Garrit & Wulf
              </h2>
              <div className="w-24 h-1 mx-auto" style={{ backgroundColor: '#6e0000' }}></div>
              <p className="text-gray-400 text-lg mt-4 max-w-3xl mx-auto">
                We stand out in the automotive parts industry with our unwavering commitment to excellence and customer satisfaction
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reason 1 */}
              <div 
                className="p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Premium Quality Parts</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every component is manufactured to the highest standards with rigorous quality control, ensuring 100% reliability and peak performance.
                </p>
              </div>

              {/* Reason 2 */}
              <div 
                className="p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">15+ Years Experience</h3>
                <p className="text-gray-400 leading-relaxed">
                  Since 2008, we&apos;ve been serving the automotive industry with expertise, innovation, and a proven track record of excellence.
                </p>
              </div>

              {/* Reason 3 */}
              <div 
                className="p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Global Distribution</h3>
                <p className="text-gray-400 leading-relaxed">
                  Our extensive network ensures fast, reliable delivery worldwide, serving customers across continents with efficiency.
                </p>
              </div>

              {/* Reason 4 */}
              <div 
                className="p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">5000+ Product Lines</h3>
                <p className="text-gray-400 leading-relaxed">
                  Comprehensive catalog covering European, American, and heavy-duty truck parts - everything you need in one place.
                </p>
              </div>

              {/* Reason 5 */}
              <div 
                className="p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Expert Support</h3>
                <p className="text-gray-400 leading-relaxed">
                  Our technical team provides personalized assistance, helping you find the perfect parts and solutions for your needs.
                </p>
              </div>

              {/* Reason 6 */}
              <div 
                className="p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Fast Delivery</h3>
                <p className="text-gray-400 leading-relaxed">
                  Quick turnaround times and efficient logistics ensure your parts arrive when you need them, minimizing downtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 
              className="text-5xl font-oswald font-bold text-white mb-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Mission & Vision
            </h2>
            <div className="w-24 h-1 mx-auto" style={{ backgroundColor: '#6e0000' }}></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div 
              className="p-10 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <Target className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Our Mission</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                To provide superior quality auto parts that exceed customer expectations while 
                maintaining the highest standards of reliability, performance, and innovation. 
                We are committed to supporting our customers with exceptional service and 
                technical expertise.
              </p>
            </div>
            
            <div 
              className="p-10 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <TrendingUp className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                To become the leading global supplier of premium auto parts, recognized for 
                our innovation, quality, and customer-centric approach. We envision a future 
                where every vehicle operates at peak performance with our components.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 
              className="text-5xl font-oswald font-bold text-white mb-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Our Values
            </h2>
            <div className="w-24 h-1 mx-auto" style={{ backgroundColor: '#6e0000' }}></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div 
              className="text-center p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Quality</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Every component undergoes rigorous testing and quality control to ensure 
                maximum reliability and performance.
              </p>
            </div>
            
            <div 
              className="text-center p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Customer Focus</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                We prioritize our customers&apos; needs and provide personalized solutions 
                with exceptional service and support.
              </p>
            </div>
            
            <div 
              className="text-center p-8 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Innovation</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Continuous improvement and cutting-edge technology drive our commitment 
                to developing next-generation auto parts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: '#6e0000' }}
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 
              className="text-5xl font-oswald font-bold text-white mb-6"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Ready to Partner with Us?
            </h2>
            <p className="text-white/90 text-xl mb-10 leading-relaxed">
              Discover how Garrit & Wulf can provide the premium auto parts your business needs to succeed.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-3 bg-white text-[#6e0000] px-10 py-5 rounded-lg text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 group"
            >
              <span>Get In Touch</span>
              <svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}