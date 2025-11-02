import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSetting } from '@/lib/settings/settings-manager';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch logo settings on the server side
  const logoUrl = await getSetting('logo_url') || '/images/GW_LOGO-removebg.png';
  const siteName = await getSetting('site_name') || 'Garrit & Wulf';

  return (
    <>
      <Header logoUrl={logoUrl} siteName={siteName} />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}
