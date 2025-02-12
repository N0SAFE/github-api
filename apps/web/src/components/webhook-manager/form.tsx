'use client'

import { useState } from 'react'
import { WebhookIcon } from 'lucide-react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui/components/shadcn/select'
import { useQuery } from '@tanstack/react-query'
import { getRepositories } from '@/app/actions/github'

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
    const [repo, setRepo] = useState('')
    const [webhookUrl, setWebhookUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { data: repositories = [], isLoading: isLoadingRepos } = useQuery({
        queryKey: ['repositories', 'N0SAFE'],
        queryFn: getRepositories,
        staleTime: 300000, // Cache for 5 minutes
    })

    const handleRepoChange = (newRepo: string) => {
        setRepo(newRepo)
        onWebhooksUpdate() // Trigger webhook refresh when repository changes
    }

    const triggerGitHubAction = async () => {
        if (!repo || !webhookUrl) {
            toast.error('Veuillez remplir tous les champs')
            return
        }

        setIsLoading(true)
        try {
            await createWebhook({
                owner: 'N0SAFE',
                repo,
                webhookUrl,
            })
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
                        <label className="text-sm font-medium">Repository</label>
                        <Select
                            value={repo}
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
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">URL du Webhook</label>
                        <Input
                            placeholder="https://example.com/webhook"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="transition-all focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
                <Button
                    onClick={triggerGitHubAction}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Configuration...' : 'Configurer le Webhook'}
                </Button>
            </CardContent>
        </Card>
    )
}
