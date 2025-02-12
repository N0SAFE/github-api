import { Octokit } from '@octokit/rest'

export function createGitHubClient(accessToken: string) {
    return new Octokit({
        auth: accessToken,
    })
}

export async function createWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    webhookUrl: string
) {
    const octokit = createGitHubClient(accessToken)
    return octokit.repos.createWebhook({
        owner,
        repo,
        config: {
            url: webhookUrl,
            content_type: 'json',
        },
        events: ['push', 'pull_request'],
        active: true,
    })
}

export async function listWebhooks(
    accessToken: string,
    owner: string,
    repo: string
) {
    const octokit = createGitHubClient(accessToken)
    return octokit.repos.listWebhooks({
        owner,
        repo,
    })
}

export async function deleteWebhook(
    accessToken: string,
    owner: string,
    repo: string,
    hookId: number
) {
    const octokit = createGitHubClient(accessToken)
    return octokit.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hookId,
    })
}
