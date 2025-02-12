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
import { WebhookIcon, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface PageProps {
    params: {
        repo: string
        webhook: string
    }
}

export default async function WebhookPage({ params }: PageProps) {
    const { repo, webhook } = params
    const owner = 'N0SAFE' // In a real app, get from session

    // Fetch webhook details and deliveries
    const { webhooks } = await getWebhooks({ owner, repo })
    const webhookData = webhooks.find((w: { id: number }) => w.id.toString() === webhook)
    const deliveries = await getWebhookDeliveries({ owner, repo, webhookId: Number(webhook) })

    if (!webhookData) {
        return <div>Webhook not found</div>
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
                            Last {deliveries.length} webhook delivery attempts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deliveries.map((delivery: { 
                                    id: string; 
                                    status: string; 
                                    event: string; 
                                    duration: number; 
                                    delivered_at: string 
                                }) => (
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