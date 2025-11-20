#!/bin/bash

# Script to diagnose and fix social icons missing on VPS
# Run this on the VPS as: bash scripts/fix-social-icons-vps.sh

echo "🔍 Social Icons Diagnostic & Fix Script"
echo "========================================"
echo ""

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from project root (/opt/GarritWulf/app)"
    exit 1
fi

echo "✅ In project directory"
echo ""

# Step 2: Create diagnostic script
echo "📝 Creating diagnostic script..."
cat > /tmp/check-social-db.ts << 'EOFSCRIPT'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSocialSettings() {
  try {
    console.log("\n🔍 Checking Social Media Settings in Database\n");
    
    const socialKeys = [
      "social_facebook",
      "social_twitter", 
      "social_instagram",
      "social_linkedin"
    ];
    
    let allPresent = true;
    
    for (const key of socialKeys) {
      const setting = await prisma.settings.findUnique({
        where: { key },
        select: { key: true, value: true }
      });
      
      if (setting && setting.value && setting.value.trim() !== "") {
        console.log(`✅ ${key}: ${setting.value}`);
      } else {
        console.log(`❌ ${key}: MISSING OR EMPTY`);
        allPresent = false;
      }
    }
    
    await prisma.$disconnect();
    
    if (!allPresent) {
      console.log("\n⚠️  Some social media URLs are missing!");
      console.log("Please add them via Admin Settings page.");
      process.exit(1);
    }
    
    console.log("\n✅ All social media URLs present in database");
    
  } catch (error) {
    console.error("❌ Database error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkSocialSettings();
EOFSCRIPT

# Step 3: Run the diagnostic
echo "🔍 Step 1: Checking database..."
npx tsx /tmp/check-social-db.ts
DB_CHECK=$?

if [ $DB_CHECK -ne 0 ]; then
    echo ""
    echo "❌ Database check failed. Please add social URLs via admin panel first."
    exit 1
fi

echo ""
echo "========================================"
echo ""

# Step 4: Restart the Next.js container to clear cache
echo "🔄 Step 2: Restarting container to clear cache..."
docker restart GW-nextjs

if [ $? -eq 0 ]; then
    echo "✅ Container restarted successfully"
    echo ""
    echo "⏳ Waiting 10 seconds for container to be ready..."
    sleep 10
else
    echo "❌ Failed to restart container"
    exit 1
fi

echo ""
echo "========================================"
echo ""

# Step 5: Test the settings API endpoint
echo "🔍 Step 3: Testing settings retrieval..."
echo ""
echo "Checking CONTACT settings via API..."

RESPONSE=$(curl -s http://localhost:3000/api/admin/settings?category=CONTACT 2>&1)
CURL_EXIT=$?

if [ $CURL_EXIT -ne 0 ]; then
    echo "⚠️  API not ready yet, waiting 5 more seconds..."
    sleep 5
    RESPONSE=$(curl -s http://localhost:3000/api/admin/settings?category=CONTACT)
fi

echo "$RESPONSE" | grep -q "social_facebook"
if [ $? -eq 0 ]; then
    echo "✅ Settings API working"
    echo ""
    echo "Social URLs from API:"
    echo "$RESPONSE" | grep -o '"social_[^"]*":"[^"]*"' || echo "$RESPONSE"
else
    echo "⚠️  Settings API response:"
    echo "$RESPONSE"
fi

echo ""
echo "========================================"
echo ""

# Step 6: Check the actual webpage
echo "🌐 Step 4: Testing homepage HTML..."
HTML=$(curl -s https://garritwulf.com 2>&1)

# Check for social icons in HTML
echo "$HTML" | grep -q "facebook.com/garritwulf"
if [ $? -eq 0 ]; then
    echo "✅ Facebook icon found in HTML"
else
    echo "❌ Facebook icon NOT in HTML"
fi

echo "$HTML" | grep -q "twitter.com/garritwulf"
if [ $? -eq 0 ]; then
    echo "✅ Twitter icon found in HTML"
else
    echo "❌ Twitter icon NOT in HTML"
fi

echo "$HTML" | grep -q "instagram.com/garritwulf"
if [ $? -eq 0 ]; then
    echo "✅ Instagram icon found in HTML"
else
    echo "❌ Instagram icon NOT in HTML"
fi

echo "$HTML" | grep -q "linkedin.com/company/garritwulf"
if [ $? -eq 0 ]; then
    echo "✅ LinkedIn icon found in HTML"
else
    echo "❌ LinkedIn icon NOT in HTML"
fi

echo ""
echo "========================================"
echo ""
echo "✅ Diagnostic complete!"
echo ""
echo "📋 Summary:"
echo "  - If social icons now appear → Cache was the issue (fixed by restart)"
echo "  - If still missing → Check Docker logs: docker logs GW-nextjs --tail 50"
echo "  - If API shows empty values → Database connection issue"
echo ""
echo "🔍 Check live site: https://garritwulf.com"
