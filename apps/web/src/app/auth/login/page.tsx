'use client'

import Link from 'next/link'
import { Metadata } from 'next'
import GitHubSignInButton from '@/components/auth/github-sign-in-button'

import { Button } from '@repo/ui/components/shadcn/button'
import { Input } from '@repo/ui/components/shadcn/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@repo/ui/components/shadcn/form'
import { Alert, AlertDescription } from '@repo/ui/components/shadcn/alert'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import redirect from '@/actions/redirect'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Spinner } from '@repo/ui/components/atomics/atoms/Icon'
import { signIn } from '@/lib/auth/actions'
import { loginSchema } from './schema'

// export const metadata: Metadata = {
//     title: 'Login',
//     description: 'Login to your account',
// }

const LoginPage: React.FC = () => {
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string>('')

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (
        values: z.infer<typeof loginSchema>
    ): Promise<void> => {
        setIsLoading(true)
        const res = await signIn('credentials', { ...values, redirect: false })
        if (res?.error) {
            setError(res?.error)
            setIsLoading(false)
        } else {
            redirect(searchParams.get('callbackUrl') ?? '/')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="mx-auto w-full max-w-sm space-y-6 rounded-lg p-6 shadow-lg">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Login</h1>
                    <p className="text-gray-500">Choose your login method</p>
                </div>
                <div className="space-y-4">
                    <GitHubSignInButton />
                </div>
            </div>
        </div>
    )
}

export default LoginPage
