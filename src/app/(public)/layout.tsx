import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getSetting,
  getMediaSettingUrl,
  getSettings,
} from "@/lib/settings/settings-manager";

// Revalidate every 60 seconds to ensure logo updates are reflected
export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch logo settings on the server side
  const logoUrl =
    (await getMediaSettingUrl("logo_url")) || "/images/GW_LOGO-removebg.png";
  const mobileLogoUrl =
    (await getMediaSettingUrl("logo_mobile_url")) || undefined;
  const siteName = (await getSetting("site_name")) || "Garrit & Wulf";

  // Fetch contact settings for AnnouncementBar
  const contactSettings = await getSettings("CONTACT");
  const contactPhone = contactSettings.contact_phone || "+971 4 224 38 51";
  const contactEmail = contactSettings.contact_email || "sales@garritwulf.com";
  const businessHours =
    contactSettings.business_hours || "Mon - Sat: 8:00 AM - 6:00 PM";
  const socialFacebook = contactSettings.social_facebook || "";
  const socialTwitter = contactSettings.social_twitter || "";
  const socialInstagram = contactSettings.social_instagram || "";
  const socialLinkedin = contactSettings.social_linkedin || "";

  return (
    <>
      <Header
        logoUrl={logoUrl}
        mobileLogoUrl={mobileLogoUrl}
        siteName={siteName}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
        businessHours={businessHours}
        socialFacebook={socialFacebook}
        socialTwitter={socialTwitter}
        socialInstagram={socialInstagram}
        socialLinkedin={socialLinkedin}
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
