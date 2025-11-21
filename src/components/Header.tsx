"use client";

import { useState, useEffect } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { User, UserPlus } from "lucide-react";
import Logo from "./ui/Logo";
import Navigation from "./ui/Navigation";
import AnnouncementBar from "./ui/AnnouncementBar";

interface HeaderProps {
  logoUrl: string;
  mobileLogoUrl?: string;
  siteName: string;
  contactPhone?: string;
  contactEmail?: string;
  businessHours?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
}

export default function Header({
  logoUrl,
  mobileLogoUrl,
  siteName,
  contactPhone,
  contactEmail,
  businessHours,
  socialFacebook,
  socialTwitter,
  socialInstagram,
  socialLinkedin,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Enhanced Top Announcement Bar */}
      <AnnouncementBar
        contactPhone={contactPhone}
        contactEmail={contactEmail}
        businessHours={businessHours}
        socialFacebook={socialFacebook}
        socialTwitter={socialTwitter}
        socialInstagram={socialInstagram}
        socialLinkedin={socialLinkedin}
      />

      {/* Main Header - Sticky with Advanced Scroll Effects */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 backdrop-blur-md ${
          isScrolled ? "shadow-2xl py-3" : "shadow-lg py-5"
        }`}
        style={{ backgroundColor: "#ebe8e5ed" }}
      >
        <div className="container mx-auto px-4 xl:px-6">
          <div className="flex items-center justify-between gap-4 xl:gap-8">
            {/* Logo Section - Enhanced with Smooth Animation */}
            <div className="flex-shrink-0 relative">
              {/* Glow Effect on Logo Hover - Behind logo */}
              <div className="absolute inset-0 bg-[#6e0000] opacity-0 hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-full -z-10"></div>

              <div
                className={`relative z-10 transform transition-all duration-500 ease-out hover:scale-110 ${
                  isScrolled ? "scale-95" : "scale-100"
                }`}
              >
                <Logo
                  size={isScrolled ? "sm" : "md"}
                  logoUrl={logoUrl}
                  mobileLogoUrl={mobileLogoUrl}
                  siteName={siteName}
                />
              </div>
            </div>

            {/* Navigation - Premium Layout */}
            <div className="flex items-center gap-3 xl:gap-6">
              <Navigation />

              {/* Clerk Authentication UI */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-2 xl:px-4 py-2 text-sm font-medium text-[#6e0000] hover:text-[#8b0000] transition-colors duration-300 flex items-center justify-center">
                      <span className="hidden xl:inline">Sign In</span>
                      <User className="w-5 h-5 block xl:hidden" />
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-2 xl:px-4 py-2 text-sm font-medium text-white bg-[#6e0000] hover:bg-[#8b0000] rounded-md transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
                      <span className="hidden xl:inline">Sign Up</span>
                      <UserPlus className="w-5 h-5 block xl:hidden" />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 ring-2 ring-[#6e0000]",
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Bottom Border */}
        <div
          className={`h-[2px] bg-gradient-to-r from-transparent via-[#6e0000] to-transparent transition-opacity duration-300 ${
            isScrolled ? "opacity-50" : "opacity-30"
          }`}
        ></div>
      </header>
    </>
  );
}
