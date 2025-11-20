import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function diagnoseSocialSettings() {
  try {
    console.log(" DIAGNOSTIC: Social Media Settings\n");
    console.log("=".repeat(70));
    
    // 1. Check raw database values
    console.log("\n Step 1: Raw Database Values");
    console.log("-".repeat(70));
    
    const socialKeys = [
      "social_facebook",
      "social_twitter", 
      "social_instagram",
      "social_linkedin"
    ];
    
    for (const key of socialKeys) {
      const setting = await prisma.settings.findUnique({
        where: { key },
        select: { key: true, value: true, category: true }
      });
      
      if (setting) {
        console.log(` ${key}:`);
        console.log(`   Value: "${setting.value}"`);
        console.log(`   Category: ${setting.category}`);
        console.log(`   Length: ${setting.value?.length || 0} chars`);
        console.log(`   Empty? ${!setting.value || setting.value.trim() === ""}`);
      } else {
        console.log(` ${key}: NOT FOUND IN DATABASE`);
      }
      console.log();
    }
    
    // 2. Check all CONTACT category settings
    console.log("=".repeat(70));
    console.log("\n Step 2: All CONTACT Category Settings");
    console.log("-".repeat(70));
    
    const contactSettings = await prisma.settings.findMany({
      where: { category: "CONTACT" },
      orderBy: { key: "asc" }
    });
    
    console.log(`Found ${contactSettings.length} CONTACT settings:\n`);
    contactSettings.forEach((s: { key: string; value: string | null }) => {
      console.log(`${s.key}: "${s.value}"`);
    });
    
    // 3. Recommendations
    console.log("\n" + "=".repeat(70));
    console.log("\n Next Steps:");
    console.log("-".repeat(70));
    console.log("If values are in database but not showing on VPS:");
    console.log("  1. Cache issue  Wait 60 seconds or restart app");
    console.log("  2. Props not passed  Check layout.tsx server logs");
    console.log("  3. Environment issue  Check DATABASE_URL on VPS");
    console.log("\nIf values are empty in database:");
    console.log("   Need to populate via admin settings page");
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error(" Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

diagnoseSocialSettings();
