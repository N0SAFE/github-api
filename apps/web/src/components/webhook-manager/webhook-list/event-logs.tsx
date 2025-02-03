'use client'

import { Loader2 } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui/components/shadcn/table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@repo/ui/components/shadcn/pagination'

interface WebhookLog {
    timestamp: string
    event: string
    body: any
}

interface WebhookEventLogsProps {
    logs: WebhookLog[]
    isLoading: boolean
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function WebhookEventLogs({
    logs,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
}: WebhookEventLogsProps) {
    return (
        <div className="bg-muted/50 p-4">
            <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold">
                    Historique des événements
                </h4>
            </div>
            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Événement</TableHead>
                            <TableHead>Détails</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="py-8 text-center"
                                >
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="py-4 text-center text-muted-foreground"
                                >
                                    Aucun événement enregistré
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(
                                            log.timestamp
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                            {log.event}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <pre className="overflow-x-auto rounded-md bg-muted/50 p-2 text-xs">
                                            {JSON.stringify(log.body, null, 2)}
                                        </pre>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        onPageChange(currentPage - 1)
                                    }
                                    // disabled={currentPage === 1}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        onClick={() => onPageChange(i + 1)}
                                        isActive={currentPage === i + 1}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        onPageChange(currentPage + 1)
                                    }
                                    // disabled={currentPage === totalPages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
