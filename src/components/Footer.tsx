import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { getSettings } from '@/lib/settings/settings-manager';

export default async function Footer() {
  // Fetch contact settings with fallbacks
  const contactSettings = await getSettings('CONTACT');
  
  const contactEmail = contactSettings.contact_email || 'sales@garritwulf.com';
  const contactPhone = contactSettings.contact_phone || '+971 4 224 38 51';
  const contactAddress = contactSettings.contact_address || 'Corporate Office: 26 6A Street\nAl Quoz Industrial Area 3\nDubai, UAE';
  const businessHours = contactSettings.business_hours || '';
  
  const socialFacebook = contactSettings.social_facebook || 'https://facebook.com/garritwulf';
  const socialTwitter = contactSettings.social_twitter || 'https://twitter.com/garritwulf';
  const socialInstagram = contactSettings.social_instagram || 'https://instagram.com/garritwulf';
  const socialLinkedin = contactSettings.social_linkedin || 'https://youtube.com/@garritwulf';
  
  const siteName = contactSettings.site_name || 'Garrit & Wulf';
  const eghLogo = contactSettings.egh_logo || '/images/egh_member_200x.avif';

  // Fetch general settings for privacy policy and terms pages
  const generalSettings = await getSettings('GENERAL');
  const privacyPolicyPageId = generalSettings.privacy_policy_page_id;
  const termsPageId = generalSettings.terms_page_id;

  // Fetch page slugs if IDs are set
  let privacyPolicySlug = '/privacy'; // default
  let termsSlug = '/terms'; // default

  if (privacyPolicyPageId || termsPageId) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pages`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const { pages } = await response.json();
        
        if (privacyPolicyPageId) {
          const privacyPage = pages.find((p: { id: string }) => p.id === privacyPolicyPageId);
          if (privacyPage) privacyPolicySlug = `/${privacyPage.slug}`;
        }
        
        if (termsPageId) {
          const termsPage = pages.find((p: { id: string }) => p.id === termsPageId);
          if (termsPage) termsSlug = `/${termsPage.slug}`;
        }
      }
    } catch (error) {
      console.error('Error fetching pages for footer:', error);
    }
  }
  
  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Decorative Top Border */}
      <div className="h-1 w-full" style={{ backgroundColor: '#6e0000' }}></div>
      
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6e0000] opacity-5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Top Section with Logo */}
        <div className="flex justify-center mb-16">
          <div 
            className="text-center p-4 rounded-2xl border"
            style={{ 
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a'
            }}
          >
            <Image 
              src={eghLogo}
              alt="A Member of Economic Group Holdings"
              width={200}
              height={50}
              className="mx-auto"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Contact Us</h3>
            <div className="space-y-4">
              {/* Main Corporate Office - Germany */}
              <div className="flex items-start gap-3 group">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">Headquarters:</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    ET EUROTECHNIK HANDELS GmBH<br />
                    Kurt-Blaum-Platz 8<br />
                    63450 Hanau, Hessen<br />
                    Germany
                  </p>
                </div>
              </div>

              {/* UAE Office */}
              <div className="flex items-start gap-3 group">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">UAE Office:</p>
                  <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                    {contactAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-gray-400 hover:text-white transition-colors">
                    {contactPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <a href={`mailto:${contactEmail}`} className="text-gray-400 hover:text-white transition-colors">
                    {contactEmail}
                  </a>
                </div>
              </div>
              
              {businessHours && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-gray-500 text-xs font-semibold mb-2">Business Hours:</p>
                  <p className="text-gray-400 text-sm whitespace-pre-line">
                    {businessHours}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link href="/career" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  Career
                </Link>
              </li>
              <li>
                <Link href={privacyPolicySlug} className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={termsSlug} className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?origin=Germany" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  German Parts
                </Link>
              </li>
              <li>
                <Link href="/products?origin=USA" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  American Parts
                </Link>
              </li>
              <li>
                <Link href="/products?origin=Japan" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  Japanese Parts
                </Link>
              </li>
              <li>
                <Link href="/products?difficulty=Beginner" className="text-gray-400 hover:text-[#ff9999] transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#6e0000] transition-colors"></span>
                  Easy Install Parts
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              {socialFacebook && (
                <a 
                  href={socialFacebook} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:brightness-110"
                  style={{ backgroundColor: '#1877F2' }}
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {socialTwitter && (
                <a 
                  href={socialTwitter} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:brightness-110"
                  style={{ backgroundColor: '#000000' }}
                  aria-label="Twitter/X"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {socialInstagram && (
                <a 
                  href={socialInstagram} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:brightness-110"
                  style={{ 
                    background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' 
                  }}
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {socialLinkedin && (
                <a 
                  href={socialLinkedin} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:brightness-110"
                  style={{ backgroundColor: '#FF0000' }}
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-[#2a2a2a] mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              Copyright © {new Date().getFullYear()} All Rights Reserved by {siteName}
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]/50">
              <span className="text-gray-400">Website Managed by</span>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff9999] to-[#6e0000] tracking-wider">
                FRZ
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}