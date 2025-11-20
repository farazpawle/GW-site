"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SCROLL_THRESHOLD = 300; // Pixels scrolled before showing button

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop || 0;
      setIsVisible(scrollPosition >= SCROLL_THRESHOLD);
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        updateVisibility();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateVisibility();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#6e0000] text-white shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9999] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "pointer-events-none opacity-0 translate-y-3"}`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
