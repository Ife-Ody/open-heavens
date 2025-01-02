export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Open Heavens App'

export const SHORT_DOMAIN = process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN || 'openheavens.app'

export const HOME_DOMAIN = `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`

export const APP_HOSTNAMES = new Set([`app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`])

export const API_HOSTNAMES = new Set([`api.${process.env.NEXT_PUBLIC_APP_DOMAIN}`, `api-staging.${process.env.NEXT_PUBLIC_APP_DOMAIN}`, `api.${SHORT_DOMAIN}`, 'api.localhost:7300', 'app.preview.openheavens.app'])

export const APP_DOMAIN = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? `https://app.${process.env.NEXT_PUBLIC_APP_DOMAIN}` : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ? 'https://app.preview.openheavens.app' : 'http://localhost:7300'

export const APP_DOMAIN_WITH_NGROK =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? `https://app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
        : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
        ? `https://app.preview.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
        : process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:7300'

export const SYSX_LOGO = 'https://files.openheavens.app/thumb-logo-base-32x32.png'
export const SYSX_WORDMARK = 'https://files.openheavens.app/wordmark.png'
export const SYSX_THUMBNAIL = 'https://files.openheavens.app/thumbnail.png'

export const S3_URL = process.env.STORAGE_BASE_URL as string
