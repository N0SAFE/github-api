import { getWebhooks } from '@/app/actions/github'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@repo/ui/components/shadcn/card'
import { Button } from '@repo/ui/components/shadcn/button'
import { WebhookIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: {
        repo: string
    }
}

export default async function RepoPage({ params }: PageProps) {
    const { repo } = params
    // In a real app, we would get the owner from the session
    const owner = 'N0SAFE'
    
    // Fetch webhooks for this repository
    const { webhooks } = await getWebhooks({ owner, repo })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-8 text-3xl font-bold">
                Webhooks for {owner}/{repo}
            </h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {webhooks.map((webhook) => (
                    <Card key={webhook.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <WebhookIcon className="h-5 w-5" />
                                Webhook {webhook.id}
                            </CardTitle>
                            <CardDescription>
                                {webhook.config?.url || 'No URL configured'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    Status: {webhook.active ? 'Active' : 'Inactive'}
                                </p>
                                <p className="text-sm">
                                    Events: {webhook.events.join(', ')}
                                </p>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full mt-4"
                                >
                                    <Link href={`/${repo}/${webhook.id}`}>
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}