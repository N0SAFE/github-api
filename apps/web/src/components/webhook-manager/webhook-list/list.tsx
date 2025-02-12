'use client'

import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, ChevronDown, ChevronRight, MoreVertical, ExternalLink, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    Card,
    CardHeader,
    CardContent,
} from '@repo/ui/components/shadcn/card'
import { Button } from '@repo/ui/components/shadcn/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui/components/shadcn/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui/components/shadcn/select'
import { useQuery } from '@tanstack/react-query'
import { getRepositories } from '@/app/actions/github'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui/components/shadcn/dropdown-menu'

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

interface WebhookListProps {
    webhooks: Webhook[]
    isLoadingWebhooks: boolean
    onRefresh: () => void
    onChange: (owner: string, repo: string) => void
    repo?: string
    onDelete: (webhookId: number) => void
    onToggleActive: (webhookId: number, active: boolean) => void
    getWebhookDeliveries?: (webhookId: number) => Promise<any>
}

export function WebhookList({
    webhooks,
    isLoadingWebhooks,
    onRefresh,
    onChange,
    repo,
    onDelete,
    onToggleActive,
}: WebhookListProps) {
    const router = useRouter()
    const [selectedUser] = useState('N0SAFE')
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const [expandedWebhook, setExpandedWebhook] = useState<number | null>(null)

    const { data: repositories = [], isLoading: isLoadingRepos } = useQuery({
        queryKey: ['repositories', selectedUser],
        queryFn: getRepositories,
        staleTime: 300000, // Cache for 5 minutes
    })

    useEffect(() => {
        if (repo !== selectedRepo) {
            setSelectedRepo(repo ?? null)
        }
    }, [repo, selectedRepo])

    const handleRepoChange = (newRepo: string) => {
        setSelectedRepo(newRepo)
        onChange(selectedUser, newRepo)
    }

    const toggleExpanded = (webhookId: number) => {
        setExpandedWebhook((prev) => (prev === webhookId ? null : webhookId))
    }

    const navigateToWebhook = (webhookId: number) => {
        if (repo) {
            router.push(`/${repo}/${webhookId}`)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span>Webhooks Configurés</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Select
                            value={selectedRepo ?? ''}
                            onValueChange={handleRepoChange}
                            disabled={isLoadingRepos}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un repository" />
                            </SelectTrigger>
                            <SelectContent>
                                {repositories.map((repo) => (
                                    <SelectItem key={repo.id} value={repo.name}>
                                        {repo.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onRefresh}
                            disabled={isLoadingWebhooks}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    isLoadingWebhooks ? 'animate-spin' : ''
                                }`}
                            />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Events</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingWebhooks ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center"
                                    >
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : webhooks.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        Aucun webhook configuré
                                    </TableCell>
                                </TableRow>
                            ) : (
                                webhooks.map((webhook) => (
                                    <>
                                        <TableRow key={webhook.id} className="group">
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleExpanded(webhook.id)
                                                    }
                                                    className="h-8 w-8"
                                                >
                                                    {isLoadingWebhooks ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        expandedWebhook === webhook.id ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {webhook.config?.url}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {webhook.events.map((event) => (
                                                        <span
                                                            key={event}
                                                            className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary transition-colors group-hover:bg-primary/20"
                                                        >
                                                            {event}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                                        webhook.active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100'
                                                    }`}
                                                >
                                                    <span
                                                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                                            webhook.active
                                                                ? 'bg-green-500'
                                                                : 'bg-red-500'
                                                        }`}
                                                    />
                                                    {webhook.active
                                                        ? 'Actif'
                                                        : 'Inactif'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">
                                                                Open menu
                                                            </span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigateToWebhook(
                                                                    webhook.id
                                                                )
                                                            }
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Voir les détails
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onToggleActive(webhook.id, !webhook.active)}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="mr-2 h-4 w-4 p-0"
                                                            >
                                                                {webhook.active ? (
                                                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                                                ) : (
                                                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                                                )}
                                                            </Button>
                                                            {webhook.active ? 'Désactiver' : 'Activer'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() =>
                                                                onDelete(webhook.id)
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Supprimer le webhook
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        {expandedWebhook === webhook.id && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="bg-muted/50">
                                                    <div className="space-y-2 p-2">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="font-semibold">ID:</span>{' '}
                                                                <span className="font-mono">{webhook.id}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Content Type:</span>{' '}
                                                                <span className="font-mono">{webhook.config?.content_type || 'N/A'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">SSL Verification:</span>{' '}
                                                                <span className="font-mono">
                                                                    {webhook.config?.insecure_ssl === '0' ? 'Enabled' : 'Disabled'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Status:</span>{' '}
                                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                                                    webhook.active
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100'
                                                                }`}>
                                                                    {webhook.active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
