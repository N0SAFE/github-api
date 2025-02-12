import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createWebhook, listWebhooks, deleteWebhook } from '@/lib/github'

export async function GET() {
    const session = await auth()
    if (!session?.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const [owner, repo] = (session.user?.name || '').split('/')
        const webhooks = await listWebhooks(session.accessToken, owner, repo)
        return NextResponse.json(webhooks.data)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status || 500 }
        )
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { owner, repo, webhookUrl } = await request.json()
        const webhook = await createWebhook(
            session.accessToken,
            owner,
            repo,
            webhookUrl
        )
        return NextResponse.json(webhook.data)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status || 500 }
        )
    }
}

export async function DELETE(request: Request) {
    const session = await auth()
    if (!session?.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { owner, repo, hookId } = await request.json()
        await deleteWebhook(session.accessToken, owner, repo, hookId)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status || 500 }
        )
    }
}