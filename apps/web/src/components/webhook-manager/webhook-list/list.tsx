'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    ListChecks,
    Loader2,
    RefreshCw,
    GithubIcon as GitHubLogoIcon,
    WebhookIcon,
    ChevronUp,
    ChevronDown,
    MoreHorizontal,
} from 'lucide-react'
import { Button } from '@repo/ui/components/shadcn/button'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@repo/ui/components/shadcn/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui/components/shadcn/table'
import { WebhookItem } from './item'
import { Input } from '@repo/ui/components/shadcn/input'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationLink,
    PaginationNext,
} from '@repo/ui/components/shadcn/pagination'
import ItemMoreInfo from './item-more-info'
import { useQuery } from '@tanstack/react-query'
import ItemDeliveriesList from './item-deliveries-list'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { useDebounceState } from '@/hooks/use-debounce-state'
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

interface WebhookLog {
    timestamp: string
    event: string
    body: any
    webhookId?: number
}

interface WebhookListProps {
    webhooks: Webhook[]
    isLoadingWebhooks: boolean
    onRefresh: () => void
    onChange: (owner: string, repo: string) => void
    owner?: string
    repo?: string
    getWebhookDeliveries: (
        webhookId: number
    ) => Promise<
        RestEndpointMethodTypes['repos']['listWebhookDeliveries']['response']['data']
    >
    onDelete: (webhookId: number) => void
}

const ITEMS_PER_PAGE = 5

export function WebhookList({
    webhooks,
    isLoadingWebhooks,
    onRefresh,
    onChange,
    owner,
    repo,
    getWebhookDeliveries,
    onDelete,
}: WebhookListProps) {
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
    const debounceSelectedUser = useDebounceState<string | null>(
        selectedUser,
        1000
    )
    const debounceSelectedRepo = useDebounceState<string | null>(
        selectedRepo,
        1000
    )
    const [expandedWebhook, setExpandedWebhook] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState<{ [key: number]: number }>(
        {}
    )

    const {
        data: expandedWebhookDeliveries,
        isLoading: expandedWebhookDeliveriesIsLoading,
    } = useQuery({
        queryKey: ['webhookDeliveries', expandedWebhook, currentPage],
        queryFn: async () => {
            if (!expandedWebhook) return []
            return getWebhookDeliveries(expandedWebhook)
        },
    })

    useEffect(() => {
        if (owner !== selectedUser) {
            setSelectedUser(owner ?? null)
        }
        if (repo !== selectedRepo) {
            setSelectedRepo(repo ?? null)
        }
    }, [owner, repo])

    const toggleExpanded = (webhookId: number) => {
        setExpandedWebhook((prev) => (prev === webhookId ? null : webhookId))
    }

    const getPageCount = (webhookId: number) => {
        return 2
    }
    console.log({
        owner,
        repo,
        selectedUser,
        selectedRepo,
        debounceSelectedUser,
        debounceSelectedRepo,
    })

    useEffect(() => {
        console.log({
            debounceSelectedUser,
            debounceSelectedRepo,
        })
        if (debounceSelectedUser && debounceSelectedRepo) {
            onChange(debounceSelectedUser, debounceSelectedRepo)
        }
    }, [debounceSelectedUser, debounceSelectedRepo])

    console.log('webhooks', webhooks)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <CardTitle className="flex items-center space-x-2">
                            <ListChecks className="h-5 w-5" />
                            <span>Webhooks Configurés</span>
                        </CardTitle>
                        <CardDescription>
                            Liste des webhooks actifs pour {selectedUser}/
                            {selectedRepo}
                        </CardDescription>
                    </div>
                    <Input
                        placeholder="Propriétaire"
                        value={selectedUser ?? ''}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-32"
                    />
                    <Input
                        placeholder="Repository"
                        value={selectedRepo ?? ''}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        className="w-64"
                    />
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={onRefresh}
                    disabled={
                        isLoadingWebhooks || !selectedUser || !selectedRepo
                    }
                    className="transition-all hover:bg-primary hover:text-primary-foreground"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${isLoadingWebhooks ? 'animate-spin' : ''}`}
                    />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Événements</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!selectedUser || !selectedRepo ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        Veuillez saisir le propriétaire et le
                                        repository
                                    </TableCell>
                                </TableRow>
                            ) : webhooks.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        Aucun webhook configuré
                                    </TableCell>
                                </TableRow>
                            ) : (
                                webhooks.map((webhook) => (
                                    <>
                                        <TableRow
                                            key={webhook.id}
                                            className="group"
                                        >
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleExpanded(
                                                            webhook.id
                                                        )
                                                    }
                                                    className="h-8 w-8"
                                                    key={webhook.id}
                                                >
                                                    {expandedWebhook ===
                                                    webhook.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {webhook.config?.url}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {webhook.events.map(
                                                        (event) => (
                                                            <span
                                                                key={event}
                                                                className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary transition-colors group-hover:bg-primary/20"
                                                            >
                                                                {event}
                                                            </span>
                                                        )
                                                    )}
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Open menu
                                                        </span>
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem asChild
                                                        onClick={() =>
                                                            navigator.clipboard.writeText(
                                                                'test'
                                                            )
                                                        }
                                                    >
                                                        <Button variant="destructive">
                                                            Copy webhook URL
                                                        </Button>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        View customer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        View payment details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableRow>
                                        {expandedWebhook === webhook.id && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="p-0"
                                                >
                                                    <ItemMoreInfo
                                                        webhook={webhook}
                                                    />
                                                    {!expandedWebhookDeliveriesIsLoading &&
                                                    expandedWebhookDeliveries ? (
                                                        <ItemDeliveriesList
                                                            deliveries={
                                                                expandedWebhookDeliveries
                                                            }
                                                        />
                                                    ) : (
                                                        <Loader2 />
                                                    )}
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
