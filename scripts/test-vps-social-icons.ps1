# PowerShell script to test social icons on VPS via SSH
# Run from Windows: .\scripts\test-vps-social-icons.ps1

Write-Host "🔍 Testing Social Icons on VPS" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host ""

$VPS_HOST = "root@147.93.105.118"
$SSH_KEY = "C:\Users\Faraz\.ssh\mcp_rsa"
$PROJECT_DIR = "/opt/GarritWulf/app"

# Test 1: Check database directly
Write-Host "📊 Test 1: Checking database on VPS..." -ForegroundColor Yellow
Write-Host "-" * 70

$dbCheck = @"
docker exec GW-postgres psql -U garritwulf_user -d garritwulf_db -c \"SELECT key, value FROM \\\"Settings\\\" WHERE key LIKE 'social_%' ORDER BY key;\"
"@

ssh -i $SSH_KEY $VPS_HOST $dbCheck

Write-Host ""
Write-Host "=" * 70
Write-Host ""

# Test 2: Check if container is running
Write-Host "🐳 Test 2: Checking Docker container status..." -ForegroundColor Yellow
Write-Host "-" * 70

ssh -i $SSH_KEY $VPS_HOST "docker ps | grep GW-nextjs"

Write-Host ""
Write-Host "=" * 70
Write-Host ""

# Test 3: Check recent logs for errors
Write-Host "📜 Test 3: Checking container logs for errors..." -ForegroundColor Yellow
Write-Host "-" * 70

ssh -i $SSH_KEY $VPS_HOST "docker logs GW-nextjs --tail 30 2>&1 | grep -i 'error\|settings\|social'"

Write-Host ""
Write-Host "=" * 70
Write-Host ""

# Test 4: Test the live website HTML
Write-Host "🌐 Test 4: Checking live website HTML..." -ForegroundColor Yellow
Write-Host "-" * 70

$html = Invoke-WebRequest -Uri "https://garritwulf.com" -UseBasicParsing

if ($html.Content -match 'facebook.com/garritwulf') {
    Write-Host "✅ Facebook icon found in HTML" -ForegroundColor Green
} else {
    Write-Host "❌ Facebook icon NOT in HTML" -ForegroundColor Red
}

if ($html.Content -match 'twitter.com/garritwulf') {
    Write-Host "✅ Twitter icon found in HTML" -ForegroundColor Green
} else {
    Write-Host "❌ Twitter icon NOT in HTML" -ForegroundColor Red
}

if ($html.Content -match 'instagram.com/garritwulf') {
    Write-Host "✅ Instagram icon found in HTML" -ForegroundColor Green
} else {
    Write-Host "❌ Instagram icon NOT in HTML" -ForegroundColor Red
}

if ($html.Content -match 'linkedin.com/company/garritwulf') {
    Write-Host "✅ LinkedIn icon found in HTML" -ForegroundColor Green
} else {
    Write-Host "❌ LinkedIn icon NOT in HTML" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 70
Write-Host ""

# Test 5: Option to restart container
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "-" * 70
Write-Host "If icons are missing, likely cause: Cache issue"
Write-Host ""
Write-Host "To fix, run on VPS:"
Write-Host "  docker restart GW-nextjs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or run the full diagnostic script:"
Write-Host "  bash $PROJECT_DIR/scripts/fix-social-icons-vps.sh" -ForegroundColor Yellow
Write-Host ""
