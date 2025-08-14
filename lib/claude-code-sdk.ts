export interface AssetValidationResult {
  url: string
  accessible: boolean
  responseTime?: number
  statusCode?: number
  error?: string
  recommendations: string[]
}

export interface ContributionProcessingResult {
  action: "add" | "edit" | "remove"
  asset: any
  validation: AssetValidationResult
  approved: boolean
  reason: string
}

export interface GitHubWorkflowTrigger {
  workflow: string
  inputs: Record<string, any>
}

export class ClaudeCodeSDK {
  private static instance: ClaudeCodeSDK

  static getInstance(): ClaudeCodeSDK {
    if (!ClaudeCodeSDK.instance) {
      ClaudeCodeSDK.instance = new ClaudeCodeSDK()
    }
    return ClaudeCodeSDK.instance
  }

  async triggerAssetInvestigation(issueData: {
    issueNumber: number
    asset: any
    reportType: string
    description: string
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch("/api/github/trigger-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow: "claude-investigate-asset.yml",
          inputs: {
            issue_number: issueData.issueNumber.toString(),
            asset_url: issueData.asset.url,
            asset_id: issueData.asset.id,
            report_type: issueData.reportType,
            description: issueData.description,
          },
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to trigger investigation",
      }
    }
  }

  async triggerContributionProcessing(contributionData: {
    issueNumber: number
    action: "add" | "edit"
    asset: any
    contributor: string
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch("/api/github/trigger-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow: "claude-process-contribution.yml",
          inputs: {
            issue_number: contributionData.issueNumber.toString(),
            action: contributionData.action,
            asset_data: JSON.stringify(contributionData.asset),
            contributor: contributionData.contributor,
          },
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to trigger contribution processing",
      }
    }
  }

  async triggerBatchValidation(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch("/api/github/trigger-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow: "claude-validate-assets.yml",
          inputs: {
            validation_type: "full_database",
            timestamp: new Date().toISOString(),
          },
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to trigger batch validation",
      }
    }
  }
}

export const claudeCodeSDK = ClaudeCodeSDK.getInstance()
