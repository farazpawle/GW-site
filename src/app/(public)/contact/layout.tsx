import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Garrit & Wulf for premium auto parts. Contact us for inquiries, support, and automotive solutions.",
  openGraph: {
    title: "Contact Us - Garrit & Wulf",
    description: "Get in touch with Garrit & Wulf for premium auto parts",
    url: "https://garritwulf.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
