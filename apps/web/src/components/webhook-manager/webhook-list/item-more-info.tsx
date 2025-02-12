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
                    Détails du Webhook
                </h4>
            </div>
            <div className="grid gap-4 rounded-md border bg-background p-4">
                <div className="grid gap-2">
                    <div className="flex justify-between">
                        <span className="font-medium">ID:</span>
                        <span className="font-mono">{webhook.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">URL:</span>
                        <span className="font-mono max-w-[60%] truncate">
                            {webhook.config?.url || webhook.url}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Type de contenu:</span>
                        <span>{webhook.config?.content_type || 'Non défini'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">SSL:</span>
                        <span>
                            {webhook.config?.insecure_ssl ? 'Non sécurisé' : 'Sécurisé'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className={`${webhook.active ? 'text-green-600' : 'text-red-600'}`}>
                            {webhook.active ? 'Actif' : 'Inactif'}
                        </span>
                    </div>
                </div>
                <div>
                    <span className="font-medium">Événements configurés:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {webhook.events.map((event) => (
                            <span
                                key={event}
                                className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                            >
                                {event}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
