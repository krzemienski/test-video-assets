#!/bin/bash

# Setup script for GitHub secrets
# This script uses GitHub CLI to set up all required secrets

echo "🔧 Setting up GitHub Secrets for test-video-assets"
echo "=================================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it with: sudo apt install gh"
    echo "Or visit: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Get Vercel token from local auth file
VERCEL_TOKEN=$(cat ~/.local/share/com.vercel.cli/auth.json 2>/dev/null | jq -r '.token')
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Vercel token not found. Please login to Vercel CLI first: npx vercel login"
    exit 1
fi

# Read values from .env.local
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Set repository
REPO="krzemienski/test-video-assets"

echo "📝 Setting up secrets for repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local name=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo "⚠️  Skipping $name (no value provided)"
        return
    fi
    
    echo "$value" | gh secret set "$name" --repo="$REPO"
    if [ $? -eq 0 ]; then
        echo "✅ $name set successfully"
    else
        echo "❌ Failed to set $name"
    fi
}

echo "Setting secrets..."
echo ""

# Set Vercel secrets
set_secret "VERCEL_TOKEN" "$VERCEL_TOKEN"
set_secret "VERCEL_ORG_ID" "team_P4dd5GzFfduh4dNaooKMXKQl"
set_secret "VERCEL_PROJECT_ID" "prj_2QKyDXMHqC0g0RLFQtQXv2Uhgcfo"

# Set Supabase secrets
set_secret "NEXT_PUBLIC_SUPABASE_URL" "https://jeyldoypdkgsrfdhdcmm.supabase.co"
set_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "You can test the secrets by running the workflow:"
echo "gh workflow run test-secrets.yml --repo=$REPO"
echo ""
echo "Or check them manually at:"
echo "https://github.com/$REPO/settings/secrets/actions"