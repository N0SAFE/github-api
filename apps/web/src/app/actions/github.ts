'use server'
import { validateEnv } from '#/env'
import { Octokit } from '@octokit/rest'
import crypto from 'crypto'

const env = validateEnv(process.env)

const config = {
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    WEBHOOK_SECRET: 'votre_secret_webhook_local',
}

const octokit = new Octokit({
    auth: config.GITHUB_TOKEN,
})

// Fonction de vérification de signature avec log pour debug
function verifyWebhookSignature(request: Request, data: any) {
    const signature = request.headers.get('x-hub-signature-256')
    console.log('Signature reçue:', signature)

    if (!signature) {
        console.log('Aucune signature trouvée dans les headers')
        return false
    }

    const hmac = crypto
        .createHmac('sha256', config.WEBHOOK_SECRET)
        .update(JSON.stringify(data))
        .digest('hex')

    const expectedSignature = `sha256=${hmac}`
    console.log('Signature attendue:', expectedSignature)

    return signature === expectedSignature
}

// Fonction pour créer le webhook avec l'URL ngrok
async function _createWebhook(owner: string, repo: string, webhookUrl: string) {
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

export async function createWebhook({
    owner,
    repo,
    webhookUrl,
}: {
    owner: string
    repo: string
    webhookUrl: string
}) {
    'use server'

    console.log('Création du webhook pour:', owner, repo, webhookUrl)
    if (!owner || !repo || !webhookUrl) {
        throw new Error('owner, repo et webhookUrl sont requis', {
            cause: new Error('Paramètres manquants'),
        })
    }

    try {
        const webhook = await _createWebhook(owner, repo, webhookUrl)
        return {
            status: 'success',
            webhook,
        }
    } catch (error: any) {
        throw new Error('Erreur lors de la création du webhook', {
            cause: error,
        })
    }
}

export async function getWebhooks({
    owner,
    repo,
}: {
    owner: string
    repo: string
}) {
    try {
        const { data: webhooks } = await octokit.repos.listWebhooks({
            owner,
            repo,
        })

        // Formatage de la réponse pour ne renvoyer que les informations utiles
        const formattedWebhooks = webhooks.map((webhook) => ({
            url: webhook.url,
            id: webhook.id,
            name: webhook.name,
            active: webhook.active,
            events: webhook.events,
            config: {
                url: webhook.config.url,
                content_type: webhook.config.content_type,
                insecure_ssl: webhook.config.insecure_ssl,
            },
            created_at: webhook.created_at,
            updated_at: webhook.updated_at,
        }))

        // Ajout de statistiques basiques
        const stats = {
            total: webhooks.length,
            active: webhooks.filter((w) => w.active).length,
            inactive: webhooks.filter((w) => !w.active).length,
        }

        return {
            stats,
            webhooks: formattedWebhooks,
        }
    } catch (error: any) {
        console.error('Erreur lors de la récupération des webhooks:', error)

        // Gestion des erreurs spécifiques
        if (error.status === 404) {
            throw new Error(
                "[Non trouvé] Le repository ${owner}/${repo} n'existe pas ou n'est pas accessible",
                {
                    cause: error,
                }
            )
        }

        if (error.status === 401) {
            throw new Error(
                '[Non autorisé] Token GitHub invalide ou manquant',
                {
                    cause: error,
                }
            )
        }

        if (error.status === 403) {
            throw new Error(
                '[Accès interdit] Permissions insuffisantes pour accéder à ce repository',
                {
                    cause: error,
                }
            )
        }

        // Erreur générique
        throw new Error('[Erreur serveur]', {
            cause: error,
        })
    }
}

export async function getWebhookDeliveries({
    owner,
    repo,
    webhookId,
}: {
    owner: string
    repo: string
    webhookId: number
}) {
    return octokit.repos
        .listWebhookDeliveries({
            hook_id: webhookId,
            owner,
            repo,
        })
        .then(({ data }) => data)
}
