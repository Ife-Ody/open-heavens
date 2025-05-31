'use client'

import { Input } from '@repo/ui/components/input'
import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchHeader() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

    const debouncedSearch = useDebouncedCallback(
        useCallback(
            (value: string) => {
                const params = new URLSearchParams(searchParams.toString())
                if (value) {
                    params.set('q', value)
                } else {
                    params.delete('q')
                }
                router.push(`/hymns?${params.toString()}`)
            },
            [router, searchParams]
        ),
        300 // 300ms delay
    )

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        debouncedSearch(value)
    }

    return (
        <div className="w-full relative">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 shrink-0 opacity-50" />
            <Input
                type="text"
                placeholder="Search hymns..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 text-base border pl-8"
            />
        </div>
    )
}
