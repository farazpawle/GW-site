import HeroSection from "@/components/sections/HeroSection";
import BrandStorySection from "@/components/sections/BrandStorySection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import PrecisionManufacturingSection from "@/components/sections/PrecisionManufacturingSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <HeroSection />

      {/* Brand Story Section */}
      <BrandStorySection />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Precision Manufacturing Section */}
      <PrecisionManufacturingSection />
    </div>
  );
}
