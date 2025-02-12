'use client'

import { useState } from 'react'
import { GithubIcon as GitHubLogoIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ConfigurationForm } from '@/components/webhook-manager/form'
import { WebhookList } from '@/components/webhook-manager/webhook-list/list'
import {
    getWebhooks,
    createWebhook as _createWebhook,
    getWebhookDeliveries,
    toggleWebhookActive,
} from './actions/github'
import { deleteWebhook as deleteWebhookAction } from './actions/github'

interface Webhook {
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

export default function Home() {
    const [owner] = useState('N0SAFE')
    const [repo, setRepo] = useState('')

    const {
        data: webhooks = [],
        isLoading: isLoadingWebhooks,
        refetch: refetchWebhooks,
    } = useQuery<Webhook[]>({
        queryKey: ['webhooks', owner, repo],
        queryFn: async () => {
            if (!repo) return []
            return getWebhooks({
                owner,
                repo,
            }).then((data) => data.webhooks)
        },
        enabled: Boolean(repo),
    })

    const createWebhook = useMutation({
        mutationFn: async ({
            owner,
            repo,
            webhookUrl,
        }: {
            owner: string
            repo: string
            webhookUrl: string
        }) => {
            try {
                await _createWebhook({
                    owner,
                    repo,
                    webhookUrl,
                })

                toast.success('Serveur webhook démarré avec succès!')
                refetchWebhooks()
            } catch (error) {
                toast.error('Erreur lors du démarrage du serveur webhook')
                console.error(error)
            }
        },
    })

    const deleteWebhook = useMutation({
        mutationFn: async (webhookId: number) => {
            try {
                await deleteWebhookAction({
                    owner,
                    repo,
                    webhookId,
                })
                toast.success('Webhook supprimé avec succès!')
                refetchWebhooks()
            } catch (error) {
                toast.error('Erreur lors de la suppression du webhook')
                console.error(error)
            }
        },
    })

    const toggleWebhook = useMutation({
        mutationFn: async ({ webhookId, active }: { webhookId: number; active: boolean }) => {
            try {
                await toggleWebhookActive({
                    owner,
                    repo,
                    webhookId,
                    active,
                })
                toast.success(active ? 'Webhook activé' : 'Webhook désactivé')
                refetchWebhooks()
            } catch (error) {
                toast.error('Erreur lors de la modification du webhook')
                console.error(error)
            }
        },
    })

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col items-center justify-center space-y-4">
                    <div className="flex items-center space-x-3">
                        <GitHubLogoIcon className="h-10 w-10" />
                        <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent dark:from-gray-100 dark:to-gray-400">
                            GitHub Webhook Manager
                        </h1>
                    </div>
                    <p className="max-w-xl text-center text-gray-600 dark:text-gray-400">
                        Gérez facilement vos webhooks GitHub et surveillez leurs
                        activités en temps réel
                    </p>
                </div>

                <div className="mx-auto max-w-5xl space-y-8">
                    <ConfigurationForm
                        onWebhooksUpdate={refetchWebhooks}
                        createWebhook={({ owner, repo, webhookUrl }) =>
                            createWebhook.mutateAsync({
                                owner,
                                repo,
                                webhookUrl,
                            })
                        }
                    />

                    <WebhookList
                        webhooks={webhooks}
                        isLoadingWebhooks={isLoadingWebhooks}
                        onRefresh={refetchWebhooks}
                        onChange={(_owner, repo) => {
                            setRepo(repo)
                        }}
                        onDelete={(webhookId) => deleteWebhook.mutate(webhookId)}
                        onToggleActive={(webhookId, active) => 
                            toggleWebhook.mutate({ webhookId, active })
                        }
                        getWebhookDeliveries={(webhookId) =>
                            getWebhookDeliveries({
                                owner,
                                repo,
                                webhookId,
                            })
                        }
                        repo={repo}
                    />
                </div>
            </div>
        </div>
    )
}
