import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Scale, FileCheck, Users, AlertCircle } from 'lucide-react';
import styles from '../legal-pages.module.css';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: 'terms' },
    select: { metaTitle: true, metaDesc: true, title: true, description: true },
  });

  return {
    title: page?.metaTitle || 'Terms of Service | Garrit & Wulf',
    description: page?.metaDesc || page?.description || 'Terms of Service for Garrit & Wulf Auto Parts.',
  };
}

export default async function TermsPage() {
  const page = await prisma.page.findUnique({
    where: { slug: 'terms', published: true },
    select: { title: true, content: true, description: true },
  });

  if (!page) {
    notFound();
  }

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
                <Scale className="w-4 h-4" />
                <span className="text-sm font-medium">Legal</span>
              </div>
            </div>
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-oswald font-bold mb-8 px-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {page.title}
            </h1>
            {page.description && (
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed px-6 sm:px-8">
                {page.description}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#0a0a0a"/>
          </svg>
        </div>
      </section>

      {/* Key Points Section */}
      <section className="py-12" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {/* Key Point 1 */}
              <div 
                className="p-6 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Agreement Terms</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  By using our services, you agree to these terms and conditions in their entirety.
                </p>
              </div>

              {/* Key Point 2 */}
              <div 
                className="p-6 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">User Responsibilities</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account information.
                </p>
              </div>

              {/* Key Point 3 */}
              <div 
                className="p-6 rounded-2xl border group hover:border-[#6e0000] transition-all duration-300"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Service Usage</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Our services must be used lawfully and in accordance with all applicable regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 pb-24" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-2xl border p-8 md:p-12"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div 
                className={styles.legalContent}
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
              />
            </div>

            {/* Last Updated Notice */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                These terms are effective immediately and apply to all users of our services.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
