import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSocialSettings() {
  try {
    console.log(" Checking Social Media Settings...\n");
    
    const socialSettings = await prisma.settings.findMany({
      where: {
        OR: [
          { key: { contains: 'social' } },
          { key: { contains: 'facebook' } },
          { key: { contains: 'twitter' } },
          { key: { contains: 'instagram' } },
          { key: { contains: 'linkedin' } }
        ]
      },
      select: { key: true, value: true, category: true }
    });

    if (socialSettings.length === 0) {
      console.log(" No social media settings found in database!\n");
      console.log(" You need to add social media URLs in Settings > Contact & Social\n");
    } else {
      console.log(" Found social media settings:\n");
      socialSettings.forEach(setting => {
        const hasValue = setting.value && setting.value.trim().length > 0;
        const status = hasValue ? "" : "";
        console.log(`${status} ${setting.key}: ${hasValue ? setting.value : "(empty)"}`);
      });
    }

    console.log("\n" + "=".repeat(70));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSocialSettings();
