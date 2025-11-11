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
  // Skip database queries during build
  const isBuildTime =
    process.env.CI === "true" ||
    process.env.NEXT_PHASE === "phase-production-build";

  // Fetch logo settings on the server side (skip during build)
  const logoUrl = isBuildTime
    ? "/images/GW_LOGO-removebg.png"
    : (await getMediaSettingUrl("logo_url")) || "/images/GW_LOGO-removebg.png";
  const mobileLogoUrl = isBuildTime
    ? undefined
    : (await getMediaSettingUrl("logo_mobile_url")) || undefined;
  const siteName = isBuildTime
    ? "Garrit & Wulf"
    : (await getSetting("site_name")) || "Garrit & Wulf";

  // Fetch contact settings for AnnouncementBar (skip during build)
  const contactSettings = isBuildTime ? {} : await getSettings("CONTACT");
  const contactPhone = contactSettings.contact_phone || "+971 4 224 38 51";
  const contactEmail = contactSettings.contact_email || "sales@garritwulf.com";
  const businessHours =
    contactSettings.business_hours || "Mon - Sat: 8:00 AM - 6:00 PM";

  // Social media URLs - use fallback URLs both during build AND when DB values are empty
  const socialFacebook =
    contactSettings.social_facebook || "https://facebook.com/garritwulf";
  const socialTwitter =
    contactSettings.social_twitter || "https://twitter.com/garritwulf";
  const socialInstagram =
    contactSettings.social_instagram || "https://instagram.com/garritwulf";
  const socialLinkedin =
    contactSettings.social_linkedin ||
    "https://linkedin.com/company/garritwulf";

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
