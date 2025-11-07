import { prisma } from '@/lib/prisma';
import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer';
import { PageSection } from '@/types/page-section';

export const dynamic = 'force-dynamic'; // Disable caching to always get fresh data

async function getHomepageSections(): Promise<PageSection[]> {
  try {
    // Find the homepage
    const homepage = await prisma.page.findFirst({
      where: {
        OR: [
          { slug: 'home' },
          { slug: 'homepage' },
          { pageType: 'home' }
        ]
      }
    });

    if (!homepage) {
      console.warn('Homepage not found in database');
      return [];
    }

    // Fetch sections for the homepage
    const sections = await prisma.pageSection.findMany({
      where: { pageId: homepage.id },
      orderBy: { position: 'asc' }
    });

    return sections as PageSection[];
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return [];
  }
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
            No homepage sections found. Please configure sections in the admin panel.
          </p>
        </div>
      )}
    </div>
  );
}
