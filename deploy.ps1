# SANKALP Firebase Deployment - PowerShell Version
# Brain Map SSR Fix - Ready for Production

Write-Host "`n🚀 SANKALP Deployment - Brain Map SSR Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Show current branch
Write-Host "📍 Current branch:" -ForegroundColor Yellow
git branch --show-current
Write-Host ""

# Show last 3 commits
Write-Host "📝 Recent commits:" -ForegroundColor Yellow
git log --oneline -3
Write-Host ""

# Check if there are uncommitted changes
Write-Host "🔍 Checking for uncommitted changes..." -ForegroundColor Yellow
$changes = git diff-index --quiet HEAD --
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No uncommitted changes - ready to push!" -ForegroundColor Green
} else {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    Write-Host "To commit these changes, run:" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m `"fix: Brain-map SSR compatibility`"" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue with push anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Push to origin
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push origin debug-and-preroll

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Monitor your Firebase build at:" -ForegroundColor Yellow
    Write-Host "   https://console.firebase.google.com/project/sankalp-prerollout/apphosting" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 After deployment, test at:" -ForegroundColor Yellow
    Write-Host "   https://your-app.web.app/brain-map" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 See DEPLOYMENT_CHECKLIST.md for post-deployment verification steps" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed! Check the error above." -ForegroundColor Red
    exit 1
}
