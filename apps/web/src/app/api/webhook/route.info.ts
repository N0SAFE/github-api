import { z } from 'zod'

export const Route = {
    name: 'ApiWebhook',
    params: z.object({}),
}

export const GET = {
    result: z.object({}),
}
