'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, Package, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6e0000] rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative Waves */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#6e0000"
            fillOpacity="0.3"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Animated 404 with Glitch Effect */}
        <div
          className={`mb-8 transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          <h1
            className="text-[150px] md:text-[200px] font-black leading-none tracking-tight animate-glitch"
            style={{
              background: 'linear-gradient(135deg, #ff9999 0%, #6e0000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(110, 0, 0, 0.5)',
            }}
          >
            404
          </h1>
        </div>

        {/* Rotating Gear Icon */}
        <div
          className={`mb-8 flex justify-center transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#6e0000]/20 flex items-center justify-center animate-spin-slow">
              <Package className="w-12 h-12 text-[#ff9999]" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-[#6e0000]/30 animate-ping" />
          </div>
        </div>

        {/* Error Message */}
        <div
          className={`mb-6 transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Oops! This Part Wasn&apos;t Found
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-2">
            Looks like this page took a wrong turn in the warehouse
          </p>
          <p className="text-gray-500 text-sm md:text-base">
            The page you&apos;re looking for doesn&apos;t exist or has been moved
          </p>
        </div>

        {/* Action Button */}
        <div
          className={`flex justify-center transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Link
            href="/"
            className="group flex items-center gap-3 px-8 py-4 bg-[#6e0000] text-white rounded-full font-semibold hover:bg-[#8e0000] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#6e0000]/50"
          >
            <Home className="w-5 h-5" />
            Back to Home
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Animated Hint Text */}
        <div
          className={`mt-12 transition-all duration-1000 delay-700 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-gray-600 text-sm animate-pulse">
            Need help? Contact us at{' '}
            <a
              href="mailto:sales@garritwulf.com"
              className="text-[#ff9999] hover:text-[#6e0000] transition-colors underline"
            >
              sales@garritwulf.com
            </a>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes glitch {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        .animate-glitch {
          animation: glitch 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
