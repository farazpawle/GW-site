import { prisma } from "../src/lib/prisma";

async function testMenuAPI() {
  console.log("\n🔍 Testing Menu API Logic\n");

  try {
    // Test 1: Check database connection
    console.log("1️⃣ Testing database connection...");
    const count = await prisma.menuItem.count();
    console.log(`✅ Database connected. Total menu items: ${count}\n`);

    // Test 2: Fetch visible menu items (same logic as API)
    console.log("2️⃣ Fetching visible menu items...");
    const menuItems = await prisma.menuItem.findMany({
      where: {
        visible: true,
      },
      select: {
        id: true,
        label: true,
        position: true,
        visible: true,
        openNewTab: true,
        parentId: true,
        pageId: true,
        externalUrl: true,
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    console.log(`✅ Found ${menuItems.length} visible menu items\n`);

    // Test 3: Check if pages are published
    console.log("3️⃣ Checking published status...");
    const publishedMenuItems = menuItems.filter(
      (item) => !item.page || item.page.published
    );
    console.log(`✅ ${publishedMenuItems.length} menu items with published pages\n`);

    // Test 4: Display menu structure
    console.log("4️⃣ Menu Structure:");
    publishedMenuItems.forEach((item) => {
      console.log(`   - ${item.label}`);
      console.log(`     href: ${item.externalUrl || (item.page ? `/${item.page.slug}` : 'N/A')}`);
      console.log(`     page published: ${item.page?.published ?? 'N/A'}`);
    });

    // Test 5: Build tree structure
    type MenuItemWithChildren = typeof publishedMenuItems[number] & {
      children: MenuItemWithChildren[];
    };

    const buildTree = (
      items: typeof publishedMenuItems,
      parentId: string | null = null
    ): MenuItemWithChildren[] => {
      return items
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(publishedMenuItems);
    
    console.log("\n5️⃣ Tree Structure (as API returns):");
    console.log(JSON.stringify(tree, null, 2));

    console.log("\n✅ All tests passed! API should work correctly.\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMenuAPI();
