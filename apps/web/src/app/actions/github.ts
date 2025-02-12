'use server'

import { Octokit } from '@octokit/rest'

if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is required')
}

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

// Ensure required environment variables are present

if (!process.env.GITHUB_USER) {
    throw new Error('GITHUB_USER is required')
}

// Move interfaces to types file if needed later
export interface Webhook {
    id: number
    url: string
    config?: {
        url?: string
        content_type?: string
        insecure_ssl?: string | number
    }
    events: string[]
    active: boolean
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
     'use server'
    try {
        const { data: deliveries } = await octokit.repos.listWebhookDeliveries({
            owner,
            repo,
            hook_id: webhookId,
        })
        return deliveries
    } catch (error) {
        console.error('Error fetching webhook deliveries:', error)
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
    try {
        const { data: webhook } = await octokit.repos.createWebhook({
            owner,
            repo,
            config: {
                url: webhookUrl,
                content_type: 'json',
                secret: 'process.env.WEBHOOK_SECRET',
            },
            events: ['pull_request'],
        })
        return webhook
    } catch (error) {
        console.error('Error creating webhook:', error)
        throw error
    }
}

export async function getWebhooks({
    owner,
    repo,
}: {
    owner: string
    repo: string
}) {
     'use server'
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

export async function deleteWebhook({
    owner,
    repo,
    webhookId,
}: {
    owner: string
    repo: string
    webhookId: number
}) {
     'use server'
    try {
        console.log('Suppression du webhook:', owner, repo, webhookId)
        const response = await octokit.repos.deleteWebhook({
            owner,
            repo,
            hook_id: webhookId,
        })

        console.log('Webhook supprimé avec succès:', response.data)
        return response.data
    } catch (error) {
        console.error('Erreur lors de la suppression du webhook:', error)
        throw error
    }
}

export async function getRepositories() {
     'use server'
    try {
        const { data: repos } = await octokit.repos.listForUser({
            username: process.env.GITHUB_USER as string,
            sort: 'updated',
            per_page: 100
        });
        
        return repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description
        }));
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

export async function toggleWebhookActive({
    owner,
    repo,
    webhookId,
    active,
}: {
    owner: string
    repo: string
    webhookId: number
    active: boolean
}) {
    'use server'
    try {
        const { data: webhook } = await octokit.repos.updateWebhook({
            owner,
            repo,
            hook_id: webhookId,
            active,
        })
        return webhook
    } catch (error) {
        console.error('Error toggling webhook:', error)
        throw error
    }
}