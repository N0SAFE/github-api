'use client'

import { useState, useEffect } from 'react'
import { Button } from '@repo/ui/components/shadcn/button'
import { Input } from '@repo/ui/components/shadcn/input'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@repo/ui/components/shadcn/card'
import {
    GithubIcon as GitHubLogoIcon,
    WebhookIcon,
    RefreshCw,
    Trash2,
    ChevronUp,
    ChevronDown,
    Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui/components/shadcn/table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@repo/ui/components/shadcn/pagination'
import { getApiWebhook } from '@/routes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ConfigurationForm } from '@/components/webhook-manager/form'
import { WebhookList } from '@/components/webhook-manager/webhook-list/list'
import {
    getWebhooks,
    createWebhook as _createWebhook,
    getWebhookDeliveries,
} from './actions/github'

interface WebhookLog {
    timestamp: string
    event: string
    body: any
}

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

const ITEMS_PER_PAGE = 5

export default function Home() {
    const [owner, setOwner] = useState('')
    const [repo, setRepo] = useState('')
    const [webhookUrl, setWebhookUrl] = useState('')
    const [expandedWebhook, setExpandedWebhook] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState<Record<number, number>>({})

    // // Query for webhook logs
    // const {
    //     data: logs = [],
    //     isLoading: isLoadingLogs,
    //     refetch: refetchLogs,
    // } = useQuery({
    //     queryKey: ['webhookLogs', expandedWebhook, currentPage],
    //     queryFn: async () => {
    //         // return getApiWebhookOwnerRepo({
    //         //     owner,
    //         //     repo,
    //         // })
    //         return []
    //     },
    //     refetchInterval: 30000, // Refetch every 30 seconds
    // })

    // Query for webhooks list
    const {
        data: webhooks = [],
        isLoading: isLoadingWebhooks,
        refetch: refetchWebhooks,
    } = useQuery<Webhook[]>({
        queryKey: ['webhooks', owner, repo],
        queryFn: async () => {
            console.log('owner', owner)
            if (!owner || !repo) return []
            return getWebhooks({
                owner,
                repo,
            }).then((data) => data.webhooks)
        },
        enabled: Boolean(owner && repo), // Only run query if owner and repo are provided
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
                refetchWebhooks() // Rafraîchir la liste des webhooks
            } catch (error) {
                toast.error('Erreur lors du démarrage du serveur webhook')
                console.error(error)
            }
        },
    })

    const toggleWebhook = (webhookId: number) => {
        setExpandedWebhook(expandedWebhook === webhookId ? null : webhookId)
        if (!currentPage[webhookId]) {
            setCurrentPage((prev) => ({ ...prev, [webhookId]: 1 }))
        }
    }

    const getWebhookLogs = (webhookId: number) => {
        // return logs.filter((log) => log.webhookId === webhookId)
        return []
    }

    const getPaginatedLogs = (webhookId: number) => {
        const webhookLogs = getWebhookLogs(webhookId)
        const page = currentPage[webhookId] || 1
        const start = (page - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        return webhookLogs.slice(start, end)
    }

    const getPageCount = (webhookId: number) => {
        const webhookLogs = getWebhookLogs(webhookId)
        return Math.ceil(webhookLogs.length / ITEMS_PER_PAGE)
    }

    console.log(webhooks)

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
                        onChange={(owner, repo) => {
                            console.log('onChange', owner, repo)
                            setOwner(owner)
                            setRepo(repo)
                        }}
                        getWebhookDeliveries={(webhookId) =>
                            getWebhookDeliveries({
                                owner,
                                repo,
                                webhookId,
                            })
                        }
                        repo={repo}
                        owner={owner}
                    />
                </div>
            </div>
        </div>
    )
}
