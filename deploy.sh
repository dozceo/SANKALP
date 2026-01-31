#!/bin/bash
# SANKALP Firebase Deployment Script
# Brain Map SSR Fix - Ready for Production

echo "🚀 SANKALP Deployment - Brain Map SSR Fix"
echo "=========================================="
echo ""

# Show current branch
echo "📍 Current branch:"
git branch --show-current
echo ""

# Show last 3 commits
echo "📝 Recent commits:"
git log --oneline -3
echo ""

# Check if there are uncommitted changes
echo "🔍 Checking for uncommitted changes..."
if git diff-index --quiet HEAD --; then
    echo "✅ No uncommitted changes - ready to push!"
else
    echo "⚠️  You have uncommitted changes. Review them:"
    git status --short
    echo ""
    echo "To commit these changes, run:"
    echo "  git add ."
    echo "  git commit -m \"fix: Brain-map SSR compatibility\""
    echo ""
    read -p "Continue with push anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Push to origin
echo ""
echo "🚀 Pushing to GitHub..."
git push origin debug-and-preroll

echo ""
echo "✅ Push complete!"
echo ""
echo "📊 Monitor your Firebase build at:"
echo "   https://console.firebase.google.com/project/sankalp-prerollout/apphosting"
echo ""
echo "🧪 After deployment, test at:"
echo "   https://your-app.web.app/brain-map"
echo ""
echo "📚 See DEPLOYMENT_CHECKLIST.md for post-deployment verification steps"
