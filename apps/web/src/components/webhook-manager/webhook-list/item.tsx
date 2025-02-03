'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@repo/ui/components/shadcn/button'
import { TableCell, TableRow } from '@repo/ui/components/shadcn/table'
import { WebhookEventLogs } from './event-logs'

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
}

const ITEMS_PER_PAGE = 5

interface WebhookItemProps {
    webhook: Webhook
    logs: WebhookLog[]
    isLoading: boolean
    isExpanded: boolean
    onToggle: () => void
}

export function WebhookItem({
    webhook,
    logs,
    isLoading,
    isExpanded,
    onToggle,
}: WebhookItemProps) {
    const [currentPage, setCurrentPage] = useState(1)

    const paginatedLogs = logs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE)

    return (
        <>
            <TableRow className="group">
                <TableCell>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-8 w-8"
                    >
                        {isExpanded ? (
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
                                webhook.active ? 'bg-green-500' : 'bg-red-500'
                            }`}
                        />
                        {webhook.active ? 'Actif' : 'Inactif'}
                    </span>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={4} className="p-0">
                        <WebhookEventLogs
                            logs={paginatedLogs}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
