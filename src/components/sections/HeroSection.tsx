"use client";

import Link from "next/link";
import Statistics from "@/components/ui/Statistics";
import { Sparkles } from "lucide-react";
import ShaderBackground from "@/components/ui/shader-background";
import GradientMeshBackground from "@/components/ui/gradient-mesh-background";
import RibbonBackground from "@/components/ui/ribbon-background";
import IonStormBackground from "@/components/ui/ion-storm-background";
import { HeroSectionConfig } from "@/types/page-section";
import { applyTextStyles, mergeTextStyles } from "@/lib/utils/typography";
import { TextStyle } from "@/types/typography";

interface HeroSectionProps {
  config: HeroSectionConfig;
}

export default function HeroSection({ config }: HeroSectionProps) {
  // Default heading styles with responsive sizing
  const defaultHeadingStyle: TextStyle = {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    lineHeight: "1.1",
    fontFamily: "Montserrat",
    color: "#ffffff",
    fontWeight: "700",
  };

  // Default badge text styles
  const defaultBadgeStyle: TextStyle = {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#ff9999",
  };

  // Default description styles
  const defaultDescriptionStyle: TextStyle = {
    fontSize: "1.25rem", // text-xl equivalent
    lineHeight: "1.75",
    color: "#ffffff",
  };

  // Merge default styles with config styles (config overrides defaults)
  const line1Styles = mergeTextStyles(
    defaultHeadingStyle,
    config.title.line1Style,
  );
  const line2Styles = mergeTextStyles(
    defaultHeadingStyle,
    config.title.line2Style,
  );
  const badgeStyles = mergeTextStyles(
    defaultBadgeStyle,
    config.badge.textStyle,
  );
  const descriptionStyles = mergeTextStyles(
    defaultDescriptionStyle,
    config.descriptionStyle,
  );

  // Debug: Log final styles to verify they're being applied
  console.log("Hero Line 1 Styles:", line1Styles);
  console.log("Hero Line 2 Styles:", line2Styles);
  console.log("Badge Styles:", badgeStyles);
  console.log("Description Styles:", descriptionStyles);

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-20 relative overflow-hidden min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {/* Background - Conditional Rendering */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            isolation: "isolate",
          }}
        >
          {config.backgroundType === "gradient-mesh" ? (
            <GradientMeshBackground />
          ) : config.backgroundType === "ion-storm" ? (
            <IonStormBackground />
          ) : config.backgroundType === "ribbon" ? (
            <RibbonBackground />
          ) : (
            <ShaderBackground />
          )}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 max-w-6xl">
          {/* Premium Badge */}
          <div className="inline-block animate-fade-in mb-6">
            <div
              className="flex items-center gap-2 px-6 py-3 rounded-full cursor-default transition-all duration-300"
              style={{
                background: "rgba(110, 0, 0, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(110, 0, 0, 0.3)",
              }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: config.badge.icon || "#6e0000" }}
              />
              <span className="uppercase tracking-wider" style={badgeStyles}>
                {config.badge.text}
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 animate-fade-in cursor-default relative">
            <div className="relative z-10">
              <div style={line1Styles}>{config.title.line1}</div>
              <br />
              <div style={line2Styles}>{config.title.line2}</div>
            </div>
          </h1>

          {/* Subheading */}
          <h2
            className="mb-12 animate-fade-in max-w-3xl mx-auto cursor-default"
            style={{
              animationDelay: "0.2s",
              ...descriptionStyles,
              // Responsive font sizing for description (overridable by config)
              fontSize:
                descriptionStyles.fontSize || "clamp(1.125rem, 2vw, 1.5rem)",
            }}
          >
            {config.description}
          </h2>

          {/* CTA Buttons */}
          {(config.primaryCTA.show || config.secondaryCTA.show) && (
            <div
              className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              {config.primaryCTA.show && (
                <Link
                  href={config.primaryCTA.link}
                  className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-lg uppercase transition-all duration-300 hover:scale-105 hover:shadow-xl group text-sm md:text-base"
                  style={{ backgroundColor: "#6e0000" }}
                >
                  <span>{config.primaryCTA.text}</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              )}

              {config.secondaryCTA.show && (
                <Link
                  href={config.secondaryCTA.link}
                  className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-lg uppercase transition-all duration-300 hover:scale-105 group text-sm md:text-base border-2"
                  style={{
                    borderColor: "#6e0000",
                    color: "#fff",
                    backgroundColor: "rgba(110, 0, 0, 0.1)",
                  }}
                >
                  <span>{config.secondaryCTA.text}</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              )}
            </div>
          )}

          {/* Statistics Component */}
          {config.statistics.show && (
            <div
              className="mb-16 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Statistics stats={config.statistics.stats} />
            </div>
          )}
        </div>

        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="#1a1a1a"
            />
          </svg>
        </div>
      </section>
    </>
  );
}
