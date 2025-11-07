# Fix all admin API routes to use checkAdmin() instead of requireAdmin()
# This prevents the "Unexpected token '<'" error caused by redirect() in API routes

Write-Host "🔧 Fixing admin API authentication..." -ForegroundColor Cyan

$files = @(
    "src\app\api\admin\users\[userId]\route.ts",
    "src\app\api\admin\users\[userId]\role\route.ts",
    "src\app\api\admin\users\route.ts",
    "src\app\api\admin\users\bulk-role\route.ts",
    "src\app\api\admin\parts\[id]\oem-numbers\[oemId]\route.ts",
    "src\app\api\admin\parts\[id]\oem-numbers\route.ts",
    "src\app\api\admin\parts\[id]\cross-references\[refId]\route.ts",
    "src\app\api\admin\parts\[id]\cross-references\route.ts",
    "src\app\api\admin\parts\[id]\vehicle-compatibility\route.ts",
    "src\app\api\admin\parts\[id]\vehicle-compatibility\[compatId]\route.ts",
    "src\app\api\admin\parts\route.ts",
    "src\app\api\admin\parts\bulk\route.ts",
    "src\app\api\admin\upload\route.ts",
    "src\app\api\admin\products\top-viewed\route.ts",
    "src\app\api\admin\products\template\route.ts",
    "src\app\api\admin\products\needs-attention\route.ts",
    "src\app\api\admin\products\import\vehicle-compatibility\validate\route.ts",
    "src\app\api\admin\products\import\vehicle-compatibility\execute\route.ts",
    "src\app\api\admin\products\import\validate\route.ts",
    "src\app\api\admin\products\import\oem-numbers\validate\route.ts",
    "src\app\api\admin\products\import\oem-numbers\execute\route.ts",
    "src\app\api\admin\products\import\execute\route.ts",
    "src\app\api\admin\products\import\cross-reference\validate\route.ts",
    "src\app\api\admin\products\import\cross-reference\execute\route.ts",
    "src\app\api\admin\products\export\vehicle-compatibility\route.ts",
    "src\app\api\admin\products\export\route.ts",
    "src\app\api\admin\products\export\oem-numbers\route.ts",
    "src\app\api\admin\products\export\cross-reference\route.ts",
    "src\app\api\admin\messages\route.ts",
    "src\app\api\admin\messages\dashboard\route.ts",
    "src\app\api\admin\messages\[id]\route.ts",
    "src\app\api\admin\media\proxy\route.ts",
    "src\app\api\admin\media\buckets\route.ts",
    "src\app\api\admin\media\files\route.ts",
    "src\app\api\admin\media\files\[key]\route.ts",
    "src\app\api\admin\collections\preview\route.ts",
    "src\app\api\admin\collections\filter-options\route.ts",
    "src\app\api\admin\categories\[id]\route.ts",
    "src\app\api\admin\categories\route.ts"
)

$fixedCount = 0
$errorCount = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    try {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Check if file uses requireAdmin
        if ($content -match "requireAdmin") {
            Write-Host "📝 Fixing: $file" -ForegroundColor Yellow
            
            # Replace import statement
            $content = $content -replace "import \{ requireAdmin \} from '@/lib/auth';", "import { checkAdmin } from '@/lib/auth';"
            
            # Replace await requireAdmin() with checkAdmin pattern
            $content = $content -replace "await requireAdmin\(\);", @"
const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
"@
            
            # Replace const currentUser = await requireAdmin(); pattern
            $content = $content -replace "const currentUser = await requireAdmin\(\);", @"
const currentUser = await checkAdmin();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
"@
            
            # Save the file
            Set-Content $fullPath -Value $content -Encoding UTF8 -NoNewline
            $fixedCount++
            Write-Host "✅ Fixed: $file" -ForegroundColor Green
        }
        else {
            Write-Host "⏭️  Skipped (no requireAdmin): $file" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Error fixing $file : $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Fixed: $fixedCount files" -ForegroundColor Green
Write-Host "  ❌ Errors: $errorCount files" -ForegroundColor Red
Write-Host "`n🎉 Done! Please restart your Next.js dev server." -ForegroundColor Green
