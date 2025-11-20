import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed site settings
  await prisma.siteSettings.upsert({
    where: { key: "ecommerce_enabled" },
    update: {},
    create: {
      key: "ecommerce_enabled",
      value: false, // Boolean value, not nested object
    },
  });

  await prisma.siteSettings.upsert({
    where: { key: "currency" },
    update: {},
    create: {
      key: "currency",
      value: {
        code: "AED",
        symbol: "AED",
        position: "before",
      },
    },
  });

  await prisma.siteSettings.upsert({
    where: { key: "contact_info" },
    update: {},
    create: {
      key: "contact_info",
      value: {
        email: "info@garritwulf.com",
        phone: "+971502345678",
        whatsapp: "+971502345678",
      },
    },
  });

  console.log("Site settings seeded successfully!");

  // Create categories (using upsert for idempotency)
  const europeanCategory = await prisma.category.upsert({
    where: { slug: "european-parts" },
    update: {},
    create: {
      name: "European Parts",
      slug: "european-parts",
      description:
        "Precision-engineered components tailored for European vehicles.",
      image: "/images/european-parts.jpg",
    },
  });

  const americanCategory = await prisma.category.upsert({
    where: { slug: "american-parts" },
    update: {},
    create: {
      name: "American Parts",
      slug: "american-parts",
      description:
        "Reliable, high-performance parts for American cars and SUVs.",
      image: "/images/american-parts.jpg",
    },
  });

  const truckCategory = await prisma.category.upsert({
    where: { slug: "truck-parts" },
    update: {},
    create: {
      name: "Truck Parts",
      slug: "truck-parts",
      description:
        "Robust components built to support heavy-duty truck applications.",
      image: "/images/truck-parts.jpg",
    },
  });

  // Create some sample parts
  const parts = [
    {
      name: "High-Performance Engine Block",
      slug: "high-performance-engine-block",
      shortDesc: "Premium engine block for European vehicles",
      description:
        "A high-quality engine block designed for European vehicles, manufactured with precision engineering and tested for reliability.",
      partNumber: "GW-ENG-001",
      sku: "GW-ENG-001",
      price: 2500.0,
      comparePrice: 3000.0,
      inStock: true,
      stockQuantity: 15,
      images: ["/images/engine-block.jpg", "/images/engine-block-2.jpg"],
      specifications: {
        material: "Cast Iron",
        weight: "45kg",
        compatibility: ["BMW", "Mercedes", "Audi"],
        warranty: "2 years",
      },
      compatibility: ["BMW 3 Series", "Mercedes C-Class", "Audi A4"],
      categoryId: europeanCategory.id,
      featured: true,
    },
    {
      name: "Advanced Transmission System",
      slug: "advanced-transmission-system",
      shortDesc: "Smooth gear shifting transmission",
      description:
        "Durable transmission system components for smooth gear shifting and enhanced performance.",
      partNumber: "GW-TRA-002",
      sku: "GW-TRA-002",
      price: 1800.0,
      inStock: true,
      stockQuantity: 8,
      images: ["/images/transmission.jpg"],
      specifications: {
        type: "Automatic",
        gears: "8-Speed",
        torque: "500 Nm",
      },
      compatibility: ["Ford F-150", "Chevrolet Silverado", "Dodge Ram"],
      categoryId: americanCategory.id,
      featured: true,
    },
    {
      name: "Heavy-Duty Brake System",
      slug: "heavy-duty-brake-system",
      shortDesc: "Enhanced safety braking system",
      description:
        "Reliable brake system parts designed for enhanced safety and performance in heavy-duty applications.",
      partNumber: "GW-BRK-003",
      sku: "GW-BRK-003",
      price: 950.0,
      inStock: true,
      stockQuantity: 25,
      images: ["/images/brake-system.jpg"],
      specifications: {
        type: "Disc Brake",
        material: "Carbon Ceramic",
        diameter: "370mm",
      },
      compatibility: ["Volvo FH", "Scania R-Series", "MAN TGX"],
      categoryId: truckCategory.id,
      featured: true,
    },
    {
      name: "Advanced Electrical Components",
      slug: "advanced-electrical-components",
      shortDesc: "Modern vehicle electrical system",
      description:
        "Advanced electrical components for modern vehicles with cutting-edge technology.",
      partNumber: "GW-ELE-004",
      sku: "GW-ELE-004",
      price: 450.0,
      inStock: true,
      stockQuantity: 30,
      images: ["/images/electrical.jpg"],
      specifications: {
        voltage: "12V",
        current: "100A",
        type: "LED System",
      },
      compatibility: ["Tesla Model S", "BMW i3", "Audi e-tron"],
      categoryId: europeanCategory.id,
      featured: false,
    },
  ];

  for (const part of parts) {
    await prisma.part.upsert({
      where: { partNumber: part.partNumber },
      update: {},
      create: part,
    });
  }

  console.log("Sample parts seeded successfully!");

  // ============================================
  // Phase 5: Navigation & Product Management
  // ============================================

  // Create essential pages
  const homePage = await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      title: "Home",
      slug: "home",
      pageType: "home",
      description: "Garrit & Wulf - Premium Auto Parts",
      metaTitle:
        "Garrit & Wulf - Premium Auto Parts for European, American & Truck Vehicles",
      metaDesc: "Quality European, American Vehicle & Truck Parts",
      published: true,
      isPermanent: true,
      groupType: "all",
      groupValues: {},
      layout: "grid",
      sortBy: "name",
      itemsPerPage: 12,
    },
  });

  const productsPage = await prisma.page.upsert({
    where: { slug: "products" },
    update: {},
    create: {
      title: "Products",
      slug: "products",
      description: "Browse our complete catalog of premium auto parts",
      groupType: "all",
      groupValues: {},
      layout: "grid",
      sortBy: "name",
      itemsPerPage: 20,
      published: true,
      isPermanent: false,
    },
  });

  const aboutPage = await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      title: "About Us",
      slug: "about",
      description: "Learn more about our company and commitment to quality",
      groupType: "all",
      groupValues: {},
      layout: "grid",
      sortBy: "name",
      itemsPerPage: 12,
      published: true,
      isPermanent: true,
    },
  });

  const contactPage = await prisma.page.upsert({
    where: { slug: "contact" },
    update: {},
    create: {
      title: "Contact Us",
      slug: "contact",
      description: "Get in touch with our team",
      groupType: "all",
      groupValues: {},
      layout: "grid",
      sortBy: "name",
      itemsPerPage: 12,
      published: true,
      isPermanent: true,
    },
  });

  await prisma.page.upsert({
    where: { slug: "all-products" },
    update: {},
    create: {
      title: "All Products",
      slug: "all-products",
      groupType: "all",
      groupValues: { showAll: true },
      layout: "grid",
      sortBy: "name",
      itemsPerPage: 24,
      metaTitle: "All Products - Garrit & Wulf",
      metaDesc:
        "Browse our complete catalog of premium automotive parts for European, American, and Truck vehicles.",
      published: true,
    },
  });

  console.log("Default pages seeded successfully!");

  // Create main menu items (check for existing items first)
  const existingMenuItems = await prisma.menuItem.findMany();

  if (existingMenuItems.length === 0) {
    await prisma.menuItem.createMany({
      data: [
        {
          label: "HOME",
          pageId: homePage.id,
          position: 0,
          visible: true,
          isPermanent: true,
        },
        {
          label: "PRODUCTS",
          pageId: productsPage.id,
          position: 1,
          visible: true,
          isPermanent: false,
        },
        {
          label: "ABOUT US",
          pageId: aboutPage.id,
          position: 2,
          visible: true,
          isPermanent: true,
        },
        {
          label: "CONTACT US",
          pageId: contactPage.id,
          position: 3,
          visible: true,
          isPermanent: true,
        },
      ],
    });
  }

  console.log("Menu items seeded successfully!");

  // Create "Featured Parts" collection
  await prisma.collection.upsert({
    where: { slug: "featured-parts" },
    update: {},
    create: {
      name: "Featured Parts",
      slug: "featured-parts",
      description: "Our handpicked selection of premium automotive parts",
      filterRules: {
        featured: true,
      },
      useManual: false,
      layout: "grid",
      sortBy: "name",
      itemsPerPage: 12,
      metaTitle: "Featured Parts - Garrit & Wulf",
      metaDesc:
        "Discover our featured collection of high-quality automotive parts for European, American, and Truck vehicles.",
      published: true,
    },
  });

  console.log("Default collection seeded successfully!");

  // ============================================
  // Homepage Sections
  // ============================================

  // Check if homepage sections exist
  const existingSections = await prisma.pageSection.findMany({
    where: { pageId: homePage.id },
  });

  if (existingSections.length === 0) {
    const homepageSections = [
      {
        pageId: homePage.id,
        sectionType: "hero",
        position: 0,
        visible: true,
        config: {
          badge: { text: "Premium Auto Parts", icon: "sparkles" },
          title: {
            line1: "Transform Your Drive with",
            line2: "Superior Parts",
          },
          description: "Quality European, American Vehicle & Truck Parts",
          primaryCTA: { show: false, text: "Shop Now", link: "/products" },
          secondaryCTA: { show: false, text: "Learn More", link: "/about" },
          statistics: {
            show: true,
            stats: [
              { value: 5000, suffix: "+", label: "LINE ITEMS" },
              { value: 15, suffix: "+", label: "YEARS EXPERIENCE" },
              { value: 100, suffix: "%", label: "TRUSTWORTHY PARTS" },
            ],
          },
        },
      },
      {
        pageId: homePage.id,
        sectionType: "brandStory",
        position: 1,
        visible: true,
        config: {
          title: "Our Brand Story",
          subtitle: "Driving Innovation in Auto Parts",
          content: [
            "Garrit & Wulf began with a vision to revolutionize the auto parts industry. Our passion for precision and dedication to quality have transformed humble beginnings into a legacy of innovation.",
            "We craft every part with meticulous attention to detail to ensure reliability and performance for European, American, and heavy-duty trucks. Our story is one of resilience, creativity, and continuous improvement.",
          ],
          cta: { show: true, text: "Discover More", link: "/about" },
          features: {
            show: true,
            items: [
              {
                icon: "Shield",
                title: "Quality Assurance",
                description:
                  "Every component undergoes rigorous testing for maximum reliability",
              },
              {
                icon: "Zap",
                title: "Innovation Driven",
                description:
                  "Cutting-edge technology and continuous improvement",
              },
              {
                icon: "Award",
                title: "Industry Leader",
                description: "15+ years of excellence and trusted partnerships",
              },
            ],
          },
        },
      },
      {
        pageId: homePage.id,
        sectionType: "carousel",
        position: 2,
        visible: true,
        config: {
          heading: "Trusted by Industry Leaders",
          description:
            "Collaborating with world-class organizations to deliver excellence in precision manufacturing",
          speed: 0.5,
          itemsPerView: { mobile: 2, tablet: 3, desktop: 5 },
          logos: [
            {
              id: "logo-1",
              description: "Partner Brand 1",
              altText: "Partner Brand 1 Logo",
              image:
                "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&h=120&fit=crop",
              isActive: true,
              order: 0,
            },
            {
              id: "logo-2",
              description: "Partner Brand 2",
              altText: "Partner Brand 2 Logo",
              image:
                "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=120&fit=crop",
              isActive: true,
              order: 1,
            },
            {
              id: "logo-3",
              description: "Partner Brand 3",
              altText: "Partner Brand 3 Logo",
              image:
                "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=300&h=120&fit=crop",
              isActive: true,
              order: 2,
            },
            {
              id: "logo-4",
              description: "Partner Brand 4",
              altText: "Partner Brand 4 Logo",
              image:
                "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&h=120&fit=crop",
              isActive: true,
              order: 3,
            },
            {
              id: "logo-5",
              description: "Partner Brand 5",
              altText: "Partner Brand 5 Logo",
              image:
                "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=120&fit=crop",
              isActive: true,
              order: 4,
            },
            {
              id: "logo-6",
              description: "Partner Brand 6",
              altText: "Partner Brand 6 Logo",
              image:
                "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=300&h=120&fit=crop",
              isActive: true,
              order: 5,
            },
          ],
        },
      },
      {
        pageId: homePage.id,
        sectionType: "categories",
        position: 3,
        visible: true,
        config: {
          title: "Our Categories",
          description:
            "Comprehensive range of premium auto parts for all your vehicle needs",
          show: true,
          accentColor: "#6e0000",
          backgroundPattern: true,
          gridColumns: 3,
          cardStyle: "boxed",
          iconPosition: "top",
          categories: [
            {
              icon: "Car",
              title: "European Parts",
              description:
                "Precision-engineered components tailored for European vehicles.",
              isActive: true,
              order: 0,
              backgroundImage: "",
              cta: { show: false, text: "View Products", link: "#" },
            },
            {
              icon: "Cog",
              title: "American Parts",
              description:
                "Reliable, high-performance parts for American cars and SUVs.",
              isActive: true,
              order: 1,
              backgroundImage: "",
              cta: { show: false, text: "View Products", link: "#" },
            },
            {
              icon: "Truck",
              title: "Truck Parts",
              description:
                "Robust components built to support heavy-duty truck applications.",
              isActive: true,
              order: 2,
              backgroundImage: "",
              cta: { show: false, text: "View Products", link: "#" },
            },
          ],
        },
      },
      {
        pageId: homePage.id,
        sectionType: "precisionMfg",
        position: 4,
        visible: true,
        config: {
          title: "Precision-Manufactured Auto Parts",
          description:
            "Crafted with cutting-edge technology and rigorous quality control to ensure peak performance",
          show: true,
          accentColor: "#6e0000",
          gridColumns: 4,
          cardStyle: "standard",
          ctaStyle: "solid",
          badge: { show: true, position: "top-right" },
          services: [
            {
              title: "Engine Components",
              description: "High-performance parts for various engine types.",
              image: "/images/engine.jpg",
              altText: "High-performance engine components",
              badgeText: "Premium",
              isActive: true,
              order: 0,
              cta: { show: true, text: "LEARN MORE", link: "#" },
            },
            {
              title: "Transmission Parts",
              description: "Durable components for smooth gear shifting.",
              image: "/images/transmision.jpeg",
              altText: "Durable transmission parts",
              badgeText: "Premium",
              isActive: true,
              order: 1,
              cta: { show: true, text: "LEARN MORE", link: "#" },
            },
            {
              title: "Braking Systems",
              description: "Reliable parts for enhanced safety.",
              image: "/images/brake.jpg",
              altText: "Reliable braking system components",
              badgeText: "Premium",
              isActive: true,
              order: 2,
              cta: { show: true, text: "LEARN MORE", link: "#" },
            },
            {
              title: "Electrical Components",
              description: "Advanced parts for modern vehicles.",
              image: "/images/elec-com-e1740055106227.jpeg",
              altText: "Advanced electrical components",
              badgeText: "Premium",
              isActive: true,
              order: 3,
              cta: { show: true, text: "LEARN MORE", link: "#" },
            },
          ],
        },
      },
    ];

    await prisma.pageSection.createMany({ data: homepageSections });
    console.log("Homepage sections seeded successfully!");
  } else {
    console.log("Homepage sections already exist, skipping...");
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
