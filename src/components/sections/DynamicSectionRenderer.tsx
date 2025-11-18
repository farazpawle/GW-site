"use client";

import { useMemo } from "react";
import {
  PageSection,
  HeroSectionConfig,
  BrandStorySectionConfig,
  CarouselSectionConfig,
  CategoriesSectionConfig,
  PrecisionMfgSectionConfig,
} from "@/types/page-section";
import HeroSection from "@/components/sections/HeroSection";
import BrandStorySection from "@/components/sections/BrandStorySection";
import BrandCarouselSection from "@/components/sections/BrandCarouselSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import PrecisionManufacturingSection from "@/components/sections/PrecisionManufacturingSection";
import { generateGoogleFontsUrl } from "@/lib/utils/typography";

interface DynamicSectionRendererProps {
  sections: PageSection[];
}

export default function DynamicSectionRenderer({
  sections,
}: DynamicSectionRendererProps) {
  // Filter only visible sections and sort by position
  const visibleSections = sections
    .filter((section) => section.visible)
    .sort((a, b) => a.position - b.position);

  // Dynamically load fonts used in sections
  const fontUrl = useMemo(() => {
    const fonts = new Set<string>();

    // Add default fonts that are used in section defaults
    fonts.add("Montserrat"); // Hero default

    // Extract fonts from config JSON
    // This is a robust way to find all "fontFamily" keys regardless of nesting
    const json = JSON.stringify(sections);
    const matches = json.matchAll(/"fontFamily":"([^"]+)"/g);
    for (const match of matches) {
      fonts.add(match[1]);
    }

    return generateGoogleFontsUrl(Array.from(fonts));
  }, [sections]);

  return (
    <>
      {/* Load dynamic fonts */}
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}

      {visibleSections.map((section) => {
        switch (section.sectionType) {
          case "hero":
            return (
              <HeroSection
                key={section.id}
                config={section.config as HeroSectionConfig}
              />
            );

          case "brandStory":
            return (
              <BrandStorySection
                key={section.id}
                config={section.config as BrandStorySectionConfig}
              />
            );

          case "carousel":
            return (
              <BrandCarouselSection
                key={section.id}
                config={section.config as CarouselSectionConfig}
              />
            );

          case "categories":
            return (
              <CategoriesSection
                key={section.id}
                config={section.config as CategoriesSectionConfig}
              />
            );

          case "precisionMfg":
            return (
              <PrecisionManufacturingSection
                key={section.id}
                config={section.config as PrecisionMfgSectionConfig}
              />
            );

          default:
            console.warn(`Unknown section type: ${section.sectionType}`);
            return null;
        }
      })}
    </>
  );
}
