import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Garrit & Wulf, your trusted source for premium European and American auto parts. Our story, mission, and commitment to quality.",
  openGraph: {
    title: "About Us - Garrit & Wulf",
    description: "Learn about Garrit & Wulf, your trusted source for premium auto parts",
    url: "https://garritwulf.com/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
