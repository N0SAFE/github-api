'use client'

import { useState } from 'react'
import { WebhookIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@repo/ui/components/shadcn/button'
import { Input } from '@repo/ui/components/shadcn/input'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@repo/ui/components/shadcn/card'

interface ConfigurationFormProps {
    onWebhooksUpdate: () => void
    createWebhook: ({
        owner,
        repo,
        webhookUrl,
    }: {
        owner: string
        repo: string
        webhookUrl: string
    }) => Promise<void>
}

export function ConfigurationForm({
    onWebhooksUpdate,
    createWebhook,
}: ConfigurationFormProps) {
    const [owner, setOwner] = useState('')
    const [repo, setRepo] = useState('')
    const [webhookUrl, setWebhookUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const triggerGitHubAction = async () => {
        if (!owner || !repo || !webhookUrl) {
            toast.error('Veuillez remplir tous les champs')
            return
        }

        setIsLoading(true)
        try {
            const data = await createWebhook({
                owner,
                repo,
                webhookUrl,
            })

            toast.success('Serveur webhook démarré avec succès!')
            onWebhooksUpdate()
        } catch (error) {
            toast.error('Erreur lors du démarrage du serveur webhook')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <WebhookIcon className="h-5 w-5" />
                    <span>Configuration</span>
                </CardTitle>
                <CardDescription>
                    Configurez un nouveau webhook pour votre repository GitHub
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Propriétaire
                        </label>
                        <Input
                            placeholder="ex: octocat"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Repository
                        </label>
                        <Input
                            placeholder="ex: hello-world"
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        URL du Webhook
                    </label>
                    <Input
                        placeholder="https://your-webhook-url.com/webhook"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <Button
                    className="group relative w-full overflow-hidden"
                    onClick={triggerGitHubAction}
                    disabled={isLoading || !owner || !repo || !webhookUrl}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <WebhookIcon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                    )}
                    {isLoading
                        ? 'Démarrage en cours...'
                        : 'Démarrer le Serveur Webhook'}
                </Button>
            </CardContent>
        </Card>
    )
}
