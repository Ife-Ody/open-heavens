export type Post = {
    id?: number
    date: string
    title: string
    read: string
    memorizeText: string
    memorizeVerse: string
    bodyText: string
    pointText: string | null
    pointHeader: string | null
    bibleInOneYear: string
    status?: string | null
    review_title?: string | null
    review_image?: string | null
    review_link?: string | null
    hymn_id?: number
    created_at?: string | null
    updated_at?: string | null
    deleted_at?: string | null
}
