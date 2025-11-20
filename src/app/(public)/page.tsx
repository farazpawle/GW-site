import { prisma } from "@/lib/prisma";
import { getCached } from "@/lib/cache";
import DynamicSectionRenderer from "@/components/sections/DynamicSectionRenderer";
import { PageSection } from "@/types/page-section";

// Force dynamic rendering (required for Redis caching)
export const dynamic = "force-dynamic";

async function getHomepageSections(): Promise<PageSection[]> {
  return getCached(
    "homepage:sections",
    async () => {
      try {
        // Find the homepage
        const homepage = await prisma.page.findFirst({
          where: {
            OR: [{ slug: "home" }, { slug: "homepage" }, { pageType: "home" }],
          },
        });

        if (!homepage) {
          console.warn("Homepage not found in database");
          return [];
        }

        // Fetch sections for the homepage
        const sections = await prisma.pageSection.findMany({
          where: { pageId: homepage.id },
          orderBy: { position: "asc" },
        });

        console.log("[Homepage] Fetched sections from database:", {
          count: sections.length,
          timestamp: new Date().toISOString(),
        });

        return sections as PageSection[];
      } catch (error) {
        console.error("Error fetching homepage sections:", error);
        return [];
      }
    },
    60 // Cache for 60 seconds
  );
}

export default async function Home() {
  const sections = await getHomepageSections();

  return (
    <div className="min-h-screen bg-black">
      {sections.length > 0 ? (
        <DynamicSectionRenderer sections={sections} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400">
            No homepage sections found. Please configure sections in the admin
            panel.
          </p>
        </div>
      )}
    </div>
  );
}
