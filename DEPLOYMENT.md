# Deployment Setup Guide

## Automatic Deployment with GitHub Actions

This project is configured to automatically deploy to Vercel when changes are pushed to the `main` branch.

### Required GitHub Secrets

To enable automatic deployments, you need to set the following secrets in your GitHub repository settings:

1. **Go to your repository on GitHub**
2. **Navigate to Settings → Secrets and variables → Actions**
3. **Add the following secrets:**

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `VERCEL_TOKEN` | Your Vercel personal access token | [Create at vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `team_P4dd5GzFfduh4dNaooKMXKQl` | From `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `prj_2QKyDXMHqC0g0RLFQtQXv2Uhgcfo` | From `.vercel/project.json` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jeyldoypdkgsrfdhdcmm.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase dashboard |

### How to Create a Vercel Token

1. Go to [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a name like "GitHub Actions"
4. Set expiration (recommended: 1 year)
5. Select scope: "Full Account" (or limit to specific projects)
6. Click "Create"
7. Copy the token immediately (you won't see it again!)

### Deployment Workflow

The GitHub Action will:
1. **Trigger on**: Every push to `main` branch
2. **Build**: Create production build with npm
3. **Deploy**: Push to Vercel production environment
4. **Notify**: Comment on the commit with deployment status

### Manual Deployment

You can also trigger a deployment manually:
1. Go to Actions tab in your GitHub repository
2. Select "Deploy to Vercel" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### Local Deployment

To deploy from your local machine:
```bash
npm run deploy
```

Or for preview deployments:
```bash
npm run deploy:preview
```

## Environment Variables

The project uses the following environment variables:

### Public (Client-side)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Private (Server-side)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- `SUPABASE_ANON_KEY` - Supabase anonymous key

These are already configured in your Vercel project settings.

## Troubleshooting

### Build Fails with Peer Dependency Errors
The project uses React 19 which may cause peer dependency conflicts. The `.npmrc` file includes `legacy-peer-deps=true` to handle this.

### Assets Not Loading
Check that the CSV file URL in `/app/api/process-assets/route.ts` is accessible and the crypto fix is applied (using Node.js crypto instead of window.crypto).

### Deployment Fails
1. Verify all GitHub secrets are set correctly
2. Check that the Vercel token hasn't expired
3. Ensure the project IDs match your Vercel project
4. Review the GitHub Actions logs for specific errors

## Project Structure

```
.github/workflows/
├── deploy-vercel.yml    # Auto-deployment to Vercel
├── claude.yml           # Claude Code integration
└── claude-code-review.yml # Code review automation

.vercel/
└── project.json         # Contains project and org IDs

vercel.json             # Vercel configuration
.npmrc                  # npm configuration (legacy peer deps)
```