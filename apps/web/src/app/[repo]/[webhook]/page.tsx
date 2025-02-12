'use client'
import { getWebhooks, getWebhookDeliveries } from '@/app/actions/github'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@repo/ui/components/shadcn/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui/components/shadcn/table'
import { Button } from '@repo/ui/components/shadcn/button'
import { WebhookIcon, ArrowLeft, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { use, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/shadcn/select'
import { useQuery } from '@tanstack/react-query'

interface PageProps {
    params: Promise<{
        repo: string
        webhook: string
    }>
}

interface Delivery {
    id: number
    guid: string
    delivered_at: string
    redelivery: boolean
    duration: number
    status: string
    status_code: number
    event: string
    action: string | null
    installation_id: number | null
    repository_id: number | null
    throttled_at: string | null | undefined
}

type SortField = 'delivered_at' | 'duration' | 'status' | 'event'
type SortOrder = 'asc' | 'desc'

export default function WebhookPage({ params }: PageProps) {
    const { repo, webhook } = use(params)
    const owner = 'N0SAFE' // In a real app, get from session
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [eventFilter, setEventFilter] = useState<string>('all')
    const [sortField, setSortField] = useState<SortField>('delivered_at')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    const { data: webhookData } = useQuery({
        queryKey: ['webhook', owner, repo, webhook],
        queryFn: async () => {
            const { webhooks } = await getWebhooks({ owner, repo })
            return webhooks.find((w: { id: number }) => w.id.toString() === webhook)
        }
    })

    const { data: deliveries = [] } = useQuery({
        queryKey: ['webhook-deliveries', owner, repo, webhook],
        queryFn: () => getWebhookDeliveries({ owner, repo, webhookId: Number(webhook) })
    })

    if (!webhookData) {
        return <div>Webhook not found</div>
    }

    const uniqueEvents = Array.from(new Set(deliveries.map(d => d.event)))

    const filteredAndSortedDeliveries = [...deliveries]
        .filter((delivery) => {
            if (statusFilter !== 'all' && delivery.status !== statusFilter) {
                return false;
            }
            if (eventFilter !== 'all' && delivery.event !== eventFilter) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'delivered_at':
                    comparison = new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime();
                    break;
                case 'duration':
                    comparison = b.duration - a.duration;
                    break;
                case 'status':
                    comparison = b.status.localeCompare(a.status);
                    break;
                case 'event':
                    comparison = (b.event || '').localeCompare(a.event || '');
                    break;
                default:
                    comparison = 0;
            }
            
            return sortOrder === 'desc' ? comparison : -comparison;
        });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('desc')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="outline" asChild>
                    <Link href={`/${repo}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Webhooks
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">
                    Webhook Details
                </h1>
            </div>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WebhookIcon className="h-5 w-5" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">URL</dt>
                                <dd className="mt-1 text-sm">{webhookData.config?.url}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1 text-sm">{webhookData.active ? 'Active' : 'Inactive'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Content Type</dt>
                                <dd className="mt-1 text-sm">{webhookData.config?.content_type || 'application/json'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Events</dt>
                                <dd className="mt-1 text-sm">{webhookData.events.join(', ')}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Deliveries</CardTitle>
                        <CardDescription>
                            Last {filteredAndSortedDeliveries.length} webhook delivery attempts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="failure">Failure</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={eventFilter} onValueChange={setEventFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Events</SelectItem>
                                    {uniqueEvents.map((event) => (
                                        <SelectItem key={event} value={event}>
                                            {event}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleSort('status')}
                                            className="h-8 text-xs font-medium"
                                        >
                                            Status
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleSort('event')}
                                            className="h-8 text-xs font-medium"
                                        >
                                            Event
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleSort('delivered_at')}
                                            className="h-8 text-xs font-medium"
                                        >
                                            Time
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => handleSort('duration')}
                                            className="h-8 text-xs font-medium"
                                        >
                                            Duration
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedDeliveries.map((delivery: Delivery) => (
                                    <TableRow key={delivery.id}>
                                        <TableCell>
                                            <span className="flex items-center gap-2">
                                                {delivery.status === 'success' ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                {delivery.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{delivery.event}</TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(delivery.delivered_at), { addSuffix: true })}</TableCell>
                                        <TableCell>{delivery.duration}ms</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}