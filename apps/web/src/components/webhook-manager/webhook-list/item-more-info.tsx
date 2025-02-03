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

export default function ItemMoreInfo({ webhook }: { webhook: Webhook }) {
    return (
        <div className="bg-muted/50 p-4">
            <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold">
                    Informations supplémentaires
                </h4>
            </div>
            <div className="rounded-md border bg-background">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="text-sm font-semibold">URL</h5>
                            <p className="text-sm">{webhook.url}</p>
                        </div>
                        <div>
                            <h5 className="text-sm font-semibold">Événements</h5>
                            <p className="text-sm">
                                {webhook.events.join(', ')}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h5 className="text-sm font-semibold">Configuration</h5>
                        <div className="flex items-center mt-2">
                            <p className="text-sm">URL: </p>
                            <p className="text-sm ml-1">
                                {webhook.config?.url || 'Non défini'}
                            </p>
                        </div>
                        <div className="flex items-center mt-2">
                            <p className="text-sm">Type de contenu: </p>
                            <p className="text-sm ml-1">
                                {webhook.config?.content_type || 'Non défini'}
                            </p>
                        </div>
                        <div className="flex items-center mt-2">
                            <p className="text-sm">SSL non sécurisé: </p>
                            <p className="text-sm ml-1">
                                {webhook.config?.insecure_ssl || 'Non défini'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
