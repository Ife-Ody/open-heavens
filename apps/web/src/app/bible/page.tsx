import { KeyboardShortcutProvider } from '@/lib/hooks/use-keyboard-shortcut'
import { constructMetadata } from '@repo/utils'
import { BibleCommandSearch } from './components/bible-command-search'
import { BibleReader } from './components/bible-reader'

export const metadata = constructMetadata({
    title: 'Open Heavens App - Bible',
    description: 'Read the Bible online with the Open Heavens App. You can search the scriptures easily and read different bible version',
})

export default async function BiblePage() {
    return (
        <KeyboardShortcutProvider>
            <BibleCommandSearch />
            <BibleReader />
        </KeyboardShortcutProvider>
    )
}
