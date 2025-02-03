import { validateEnv } from '#/env'
import { Octokit } from '@octokit/rest'

const env = validateEnv(process.env)

const config = {
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    WEBHOOK_SECRET: 'votre_secret_webhook_local',
    PORT: 3000,
}

const octokit = new Octokit({
    auth: config.GITHUB_TOKEN,
})

// Fonction pour créer le webhook avec l'URL ngrok
async function createWebhook(owner: string, repo: string, webhookUrl: string) {
    try {
        console.log(
            `Création du webhook pour ${owner}/${repo} avec l'URL: ${webhookUrl}`
        )

        const response = await octokit.repos.createWebhook({
            owner,
            repo,
            config: {
                url: webhookUrl,
                content_type: 'json',
                secret: config.WEBHOOK_SECRET,
            },
            events: ['pull_request'],
        })

        console.log('Webhook créé avec succès:', response.data)
        return response.data
    } catch (error) {
        console.error('Erreur lors de la création du webhook:', error)
        throw error
    }
}

export async function POST(request: Request) {
    const { owner, repo, webhookUrl } = (await request.json()) as {
        owner: string
        repo: string
        webhookUrl: string
    }

    if (!owner || !repo || !webhookUrl) {
        return Response.json(
            {
                status: 'error',
                message: 'owner, repo et webhookUrl sont requis',
            },
            { status: 400 }
        )
    }

    try {
        const webhook = await createWebhook(owner, repo, webhookUrl)
        return Response.json({
            status: 'success',
            webhook,
        })
    } catch (error: any) {
        return Response.json(
            {
                status: 'error',
                message: error.message,
            },
            { status: 500 }
        )
    }
}
