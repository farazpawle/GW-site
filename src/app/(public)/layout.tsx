import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSetting, getMediaSettingUrl } from '@/lib/settings/settings-manager';

// Revalidate every 60 seconds to ensure logo updates are reflected
export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch logo settings on the server side
  const logoUrl = await getMediaSettingUrl('logo_url') || '/images/GW_LOGO-removebg.png';
  const mobileLogoUrl = await getMediaSettingUrl('logo_mobile_url') || undefined;
  const siteName = await getSetting('site_name') || 'Garrit & Wulf';

  return (
    <>
      <Header 
        logoUrl={logoUrl} 
        mobileLogoUrl={mobileLogoUrl} 
        siteName={siteName} 
      />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}
