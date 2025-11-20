"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import AutoScroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { CarouselSectionConfig } from "@/types/page-section";
import { applyTextStyles } from "@/lib/utils/typography";
import { buildPublicMediaUrl, resolveMinioSource } from "@/lib/minio-client";

interface BrandCarouselSectionProps {
  config: CarouselSectionConfig;
  className?: string;
}

interface LogoWithUrl {
  id: string;
  image: string;
  url: string; // Presigned URL
  order: number;
  altText: string;
  isActive: boolean;
  description: string;
}

type CarouselLogo = CarouselSectionConfig["logos"][number];

interface NormalizedLogo extends CarouselLogo {
  storageKey: string | null;
  fallbackUrl: string;
}

const BrandCarouselSection = ({ config }: BrandCarouselSectionProps) => {
  const carouselRef = useRef(null);

  // Filter only active logos and sort by order
  const activeLogos = useMemo(() => {
    const filtered = config.logos.filter((logo) => logo.isActive !== false);
    return [...filtered].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [config.logos]);

  const normalizedLogos = useMemo<NormalizedLogo[]>(() => {
    return activeLogos.map((logo) => {
      const resolution = resolveMinioSource(logo.image);
      const fallbackUrl = resolution.url || logo.image;

      if (!resolution.key && !resolution.isExternal) {
        console.warn(
          "[BrandCarousel] Missing MinIO key for logo, falling back to raw value",
          logo.id,
        );
      }

      return {
        ...logo,
        storageKey: resolution.key,
        fallbackUrl,
      };
    });
  }, [activeLogos]);

  const logosWithUrls = useMemo<LogoWithUrl[]>(() => {
    return normalizedLogos.map(({ storageKey, fallbackUrl, ...logo }) => {
      if (!storageKey) {
        return {
          ...logo,
          url: fallbackUrl,
        };
      }

      return {
        ...logo,
        url: buildPublicMediaUrl(storageKey),
      };
    });
  }, [normalizedLogos]);

  // Duplicate logos for seamless infinite loop
  const duplicatedLogos = useMemo(
    () => [...logosWithUrls, ...logosWithUrls, ...logosWithUrls],
    [logosWithUrls],
  );

  return (
    <section className="relative py-20 md:py-28 bg-[#0d0d0d] overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Main Heading */}
          <h2
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight px-4"
            style={applyTextStyles(config.headingStyle)}
          >
            {config.heading}
          </h2>

          {/* Description */}
          <p
            className="text-gray-400 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4"
            style={applyTextStyles(config.descriptionStyle)}
          >
            {config.description ||
              "Collaborating with world-class organizations to deliver excellence in precision manufacturing"}
          </p>
        </div>

        {/* Carousel Section */}
        <div className="relative mt-12">
          <div ref={carouselRef} className="relative">
            <Carousel
              opts={{
                loop: true,
                align: "start",
                dragFree: true,
              }}
              plugins={[
                AutoScroll({
                  playOnInit: true,
                  speed: config.speed || 0.5,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                  stopOnFocusIn: false,
                }),
              ]}
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {duplicatedLogos.map((logo, idx) => {
                  return (
                    <CarouselItem
                      key={`${logo.id}-${idx}`}
                      className="pl-4 md:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/5"
                    >
                      <div className="group relative h-32 flex items-center justify-center overflow-hidden rounded-2xl">
                        {/* Card Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm"></div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 blur-xl transition-all duration-500"></div>

                        {/* Content Container - Full Size */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                          <Image
                            src={logo.url}
                            alt={logo.altText || logo.description}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover transition-all duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        </div>

                        {/* Subtle shine effect on hover */}
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            {/* Gradient Fade Overlays */}
            <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-[#0d0d0d] to-transparent pointer-events-none z-20"></div>
            <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-[#0d0d0d] to-transparent pointer-events-none z-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandCarouselSection;
