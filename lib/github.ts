export interface GitHubIssue {
  title: string
  body: string
  labels: string[]
  assignees?: string[]
}

export interface AssetIssueData {
  assetUrl: string
  assetTitle: string
  issueType: "broken" | "contribution" | "edit"
  description: string
  userEmail?: string
  additionalData?: any
}

export interface RepoInfo {
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  updated_at: string
}

const GITHUB_API_BASE = "https://api.github.com"
const REPO_OWNER = "krzemienski"
const REPO_NAME = "test-video-assets"

class GitHubAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async createIssue(issue: GitHubIssue): Promise<any> {
    return this.request(`/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: "POST",
      body: JSON.stringify(issue),
    })
  }

  async getRepoInfo(): Promise<RepoInfo> {
    return this.request(`/repos/${REPO_OWNER}/${REPO_NAME}`)
  }

  async addIssueComment(issueNumber: number, comment: string): Promise<any> {
    return this.request(`/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: comment }),
    })
  }

  async triggerClaudeCodeSDK(issueData: AssetIssueData): Promise<any> {
    // Create a workflow dispatch event to trigger Claude Code SDK
    return this.request(`/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
      method: "POST",
      body: JSON.stringify({
        event_type: "claude-code-investigation",
        client_payload: {
          issue_type: issueData.issueType,
          asset_url: issueData.assetUrl,
          asset_title: issueData.assetTitle,
          description: issueData.description,
          timestamp: new Date().toISOString(),
        },
      }),
    })
  }
}

export function createAssetIssue(data: AssetIssueData): GitHubIssue {
  const { assetUrl, assetTitle, issueType, description, userEmail } = data

  let title: string
  let labels: string[]
  let body: string

  switch (issueType) {
    case "broken":
      title = `🚨 Broken Asset: ${assetTitle}`
      labels = ["bug", "broken-asset", "needs-investigation"]
      body = `## Broken Asset Report

**Asset URL:** ${assetUrl}
**Asset Title:** ${assetTitle}
**Reported by:** ${userEmail || "Anonymous user"}
**Report Date:** ${new Date().toISOString()}

### Issue Description
${description}

### Automated Actions
- [ ] Verify asset accessibility
- [ ] Check for alternative sources
- [ ] Update asset status in database
- [ ] Remove if permanently broken

### Claude Code SDK Investigation
This issue will be automatically investigated by Claude Code SDK to determine the asset status and recommend appropriate actions.

---
*This issue was automatically created from the Video Test Assets Portal*`
      break

    case "contribution":
      title = `✨ New Asset Contribution: ${assetTitle}`
      labels = ["enhancement", "new-asset", "contribution"]
      body = `## New Asset Contribution

**Asset URL:** ${assetUrl}
**Asset Title:** ${assetTitle}
**Contributed by:** ${userEmail || "Anonymous user"}
**Contribution Date:** ${new Date().toISOString()}

### Asset Details
${description}

### Review Checklist
- [ ] Verify asset accessibility
- [ ] Test playback compatibility
- [ ] Extract technical metadata
- [ ] Add to asset database
- [ ] Update documentation

### Claude Code SDK Processing
This contribution will be automatically processed by Claude Code SDK to validate the asset and extract metadata.

---
*This contribution was submitted through the Video Test Assets Portal*`
      break

    case "edit":
      title = `📝 Asset Edit Request: ${assetTitle}`
      labels = ["enhancement", "asset-update", "edit-request"]
      body = `## Asset Edit Request

**Asset URL:** ${assetUrl}
**Asset Title:** ${assetTitle}
**Requested by:** ${userEmail || "Anonymous user"}
**Request Date:** ${new Date().toISOString()}

### Requested Changes
${description}

### Review Process
- [ ] Validate requested changes
- [ ] Update asset metadata
- [ ] Verify technical accuracy
- [ ] Update database records

### Claude Code SDK Review
This edit request will be reviewed by Claude Code SDK to ensure accuracy and implement approved changes.

---
*This edit request was submitted through the Video Test Assets Portal*`
      break

    default:
      throw new Error(`Unknown issue type: ${issueType}`)
  }

  return { title, body, labels }
}

export default GitHubAPI
