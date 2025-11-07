/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Building2, Zap } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "" // Honeypot field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('📤 Submitting form data:', formData);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📥 Response status:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📥 Response data:', result);

      if (response.ok) {
        alert("Thank you for your message. We will get back to you soon!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          website: ""
        });
      } else {
        const errorMessage = result.details 
          ? result.details.map((d: any) => d.message).join(', ')
          : result.error || "There was an error sending your message. Please try again.";
        alert(errorMessage);
        console.error("❌ Validation errors:", result);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Get In Touch</span>
              </div>
            </div>
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-oswald font-bold mb-8 px-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed px-6 sm:px-8">
              Have questions about our premium auto parts? Our expert team is ready to assist you with inquiries, quotes, and technical support.
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

      {/* Quick Contact Cards */}
      <section className="py-12" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 -mt-16 relative z-10">
            {/* Phone Card */}
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#6e0000] transition-all duration-300 group"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Call Us</h3>
              <p className="text-gray-400 text-sm mb-3">Mon-Fri from 8am to 6pm</p>
              <a 
                href="tel:+97142243851" 
                className="text-white font-medium hover:text-[#6e0000] transition-colors"
              >
                +971 4 224 38 51
              </a>
            </div>

            {/* Email Card */}
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#6e0000] transition-all duration-300 group"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm mb-3">We&apos;ll respond within 24 hours</p>
              <a 
                href="mailto:sales@garritwulf.com" 
                className="text-white font-medium hover:text-[#6e0000] transition-colors"
              >
                sales@garritwulf.com
              </a>
            </div>

            {/* Location Card */}
            <div 
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#6e0000] transition-all duration-300 group"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6e0000' }}
              >
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Visit Us</h3>
              <p className="text-gray-400 text-sm mb-3">Al Quoz Industrial Area 3</p>
              <p className="text-white font-medium">
                Dubai, UAE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div 
              className="rounded-2xl p-8 border"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div className="mb-8">
                <h2 
                  className="text-4xl font-oswald font-bold text-white mb-3"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Send us a Message
                </h2>
                <p className="text-gray-400">
                  Fill out the form below and our team will get back to you shortly
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6e0000] transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6e0000] transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6e0000] transition-colors"
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6e0000] transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6e0000] transition-colors resize-none"
                    placeholder="Tell us about your inquiry..."
                  ></textarea>
                </div>
                
                {/* Honeypot field - hidden from users, bots will fill it */}
                <input
                  type="text"
                  name="website"
                  id="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#6e0000]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#6e0000' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 
                  className="text-4xl font-oswald font-bold text-white mb-3"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Contact Information
                </h2>
                <p className="text-gray-400">
                  Reach out to us through any of the following channels
                </p>
              </div>

              {/* Info Cards */}
              <div className="space-y-6">
                {/* Main Headquarters - Germany */}
                <div 
                  className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: '#6e0000' }}
                    >
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Corporate Headquarters</h4>
                      <p className="text-gray-400 leading-relaxed">
                        ET EUROTECHNIK HANDELS GmBH<br />
                        Kurt-Blaum-Platz 8<br />
                        63450 Hanau, Hessen<br />
                        Germany
                      </p>
                    </div>
                  </div>
                </div>

                {/* UAE Office */}
                <div 
                  className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: '#6e0000' }}
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">UAE Office</h4>
                      <p className="text-gray-400 leading-relaxed">
                        Corporate Office: 26 6A Street - Al Quoz<br />
                        Al Quoz Industrial Area 3<br />
                        Dubai, United Arab Emirates
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div 
                  className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: '#6e0000' }}
                    >
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Business Hours</h4>
                      <div className="text-gray-400 space-y-1">
                        <p className="flex justify-between">
                          <span>Monday - Friday:</span>
                          <span className="text-white ml-4">8:00 AM - 6:00 PM</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Saturday:</span>
                          <span className="text-white ml-4">8:00 AM - 4:00 PM</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Sunday:</span>
                          <span className="text-white ml-4">Closed</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Response */}
                <div 
                  className="p-6 rounded-xl border group hover:border-[#6e0000] transition-all duration-300"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: '#6e0000' }}
                    >
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">Quick Response</h4>
                      <p className="text-gray-400 leading-relaxed">
                        We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 
              className="text-5xl font-oswald font-bold text-white mb-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Find Us on the Map
            </h2>
            <p className="text-gray-400 text-lg">
              Visit our facility in Al Quoz Industrial Area
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div 
              className="rounded-2xl overflow-hidden border h-[500px] shadow-2xl"
              style={{ borderColor: '#2a2a2a' }}
            >
              <iframe
                src="https://www.google.com/maps?q=46M9%2B54+Dubai&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
                title="Garrit & Wulf Location - Al Quoz Industrial Area 3, Dubai"
              ></iframe>
            </div>
            
            {/* Map Info Card */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div 
                className="p-4 rounded-lg border text-center"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <p className="text-gray-400 text-sm mb-1">Plus Code</p>
                <p className="text-white font-medium">46M9+54 Dubai</p>
              </div>
              <div 
                className="p-4 rounded-lg border text-center"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <p className="text-gray-400 text-sm mb-1">Distance from Airport</p>
                <p className="text-white font-medium">~15 km (25 min drive)</p>
              </div>
              <div 
                className="p-4 rounded-lg border text-center"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
              >
                <p className="text-gray-400 text-sm mb-1">Parking</p>
                <p className="text-white font-medium">Free On-Site Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}