import { ReactNode } from "react";

// Force dynamic rendering for all pages under /products
// This prevents Next.js from statically generating the products page during build
// when the database might not be accessible
export const dynamic = "force-dynamic";

interface ProductsLayoutProps {
  children: ReactNode;
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return <>{children}</>;
}
