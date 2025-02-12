import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui/components/shadcn/select'

// Mock data for N0SAFE user's repositories
const MOCK_REPOSITORIES = [
    { id: 1, name: 'project-1' },
    { id: 2, name: 'awesome-app' },
    { id: 3, name: 'test-repo' },
]

export function RepositorySelector() {
    const router = useRouter()
    const [selectedRepo, setSelectedRepo] = useState<string>('')

    const handleRepoChange = (value: string) => {
        setSelectedRepo(value)
        router.push(`/${value}`)
    }

    return (
        <div className="w-full max-w-sm space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Repository
            </label>
            <Select value={selectedRepo} onValueChange={handleRepoChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                    {MOCK_REPOSITORIES.map((repo) => (
                        <SelectItem key={repo.id} value={repo.name}>
                            {repo.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}