import SwiftUI

/// The web's BibleCommandSearch: type "gen", "gen 1" or "gen 1:3" to jump to a book,
/// chapter or verse.
struct BibleSearchSheet: View {
    @Environment(BibleState.self) private var bible
    @Environment(AppSettings.self) private var settings
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""
    @FocusState private var focused: Bool

    private enum Results {
        case books([BibleStore.Book])
        case chapters(BibleStore.Book, [Int])
        case verses(BibleStore.Book, Int, [BibleStore.Verse])
        case empty
    }

    private var placeholder: String {
        switch parsed {
        case .verses(let book, let chapter, _): return "Enter verse number (e.g., \(book.name) \(chapter):1)..."
        case .chapters(let book, _): return "Enter chapter number (e.g., \(book.name) 1)..."
        default: return "Search for a book (e.g., 'gen' for Genesis)..."
        }
    }

    private var parsed: Results {
        guard let store = bible.store else { return .empty }
        let text = query.trimmingCharacters(in: .whitespaces)
        let bookPart = text.prefix { !$0.isNumber || text.first == $0 && $0.isNumber }
        // Allow a leading "1"/"2"/"3" for numbered books.
        let parts = splitBookAndRest(text)
        if text.isEmpty { return .books(store.books) }

        let matching = store.books.filter { BookNames.lookupKey($0.name).hasPrefix(parts.book) || aliasesMatch($0, parts.book) }
        guard let book = store.book(named: parts.book) ?? matching.first else {
            _ = bookPart
            return .empty
        }
        if parts.rest.isEmpty {
            return matching.count > 1 && !parts.endsWithSpace ? .books(matching) : .chapters(book, Array(1...book.chapters))
        }
        let numbers = parts.rest.split(separator: ":", omittingEmptySubsequences: false)
        let chapterText = numbers[0].trimmingCharacters(in: .whitespaces)
        if numbers.count == 1 {
            let chapters = (1...book.chapters).filter { String($0).hasPrefix(chapterText) }
            return chapters.isEmpty ? .empty : .chapters(book, chapters)
        }
        let chapter = min(max(Int(chapterText) ?? 1, 1), book.chapters)
        let verseText = numbers[1].trimmingCharacters(in: .whitespaces)
        let verses = store.verses(version: settings.bibleVersion, book: book, chapter: chapter)
            .filter { verseText.isEmpty || String($0.verse).hasPrefix(verseText) }
        return .verses(book, chapter, verses)
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass").foregroundStyle(Theme.mutedForeground)
                TextField(placeholder, text: $query)
                    .font(.inter(16))
                    .foregroundStyle(Theme.foreground)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .focused($focused)
                    .submitLabel(.go)
                    .onSubmit { submit() }
            }
            .padding(12)
            Rectangle().fill(Theme.border).frame(height: 1)

            ScrollView {
                LazyVStack(alignment: .leading, spacing: 0) {
                    switch parsed {
                    case .books(let books):
                        groupHeading("Books")
                        ForEach(books) { book in
                            row(book.name) { query = "\(book.name) " }
                        }
                    case .chapters(let book, let chapters):
                        groupHeading("Chapters in \(book.name)")
                        ForEach(chapters, id: \.self) { chapter in
                            row("\(book.name) \(chapter)") { select(book: book, chapter: chapter) }
                        }
                    case .verses(let book, let chapter, let verses):
                        groupHeading("Chapter")
                        row("\(book.name) \(chapter)", subtitle: "View entire chapter") { select(book: book, chapter: chapter) }
                        groupHeading("Verses in \(book.name) \(chapter)")
                        ForEach(verses) { verse in
                            row("\(book.name) \(chapter):\(verse.verse)", subtitle: verse.text) {
                                select(book: book, chapter: chapter, verse: verse.verse)
                            }
                        }
                    case .empty:
                        Text("No results found.")
                            .font(.inter(14))
                            .foregroundStyle(Theme.mutedForeground)
                            .frame(maxWidth: .infinity)
                            .padding(24)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .background(Theme.background)
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .presentationBackground(Theme.background)
        .followsAppearance()
        .task {
            try? await Task.sleep(for: .milliseconds(350))
            focused = true
        }
    }

    private func groupHeading(_ title: String) -> some View {
        Text(title)
            .font(.inter(12, weight: .medium))
            .foregroundStyle(Theme.mutedForeground)
            .padding(.horizontal, 12)
            .padding(.top, 10)
            .padding(.bottom, 4)
    }

    private func row(_ title: String, subtitle: String? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.inter(14)).foregroundStyle(Theme.foreground)
                if let subtitle {
                    Text(subtitle).font(.inter(14)).foregroundStyle(Theme.mutedForeground).lineLimit(3)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .contentShape(Rectangle())
        }
        .buttonStyle(GhostButtonStyle(size: 0))
    }

    private func select(book: BibleStore.Book, chapter: Int, verse: Int? = nil) {
        bible.show(book: book, chapter: chapter, verses: verse.map { [$0] } ?? [])
        dismiss()
    }

    private func submit() {
        switch parsed {
        case .books(let books): if let first = books.first { query = "\(first.name) " }
        case .chapters(let book, let chapters): if let first = chapters.first { select(book: book, chapter: first) }
        case .verses(let book, let chapter, let verses): select(book: book, chapter: chapter, verse: verses.count == 1 ? verses[0].verse : nil)
        case .empty: break
        }
    }

    private func aliasesMatch(_ book: BibleStore.Book, _ prefix: String) -> Bool {
        !prefix.isEmpty && BookNames.canonical(prefix) == book.name
    }

    /// Splits "1 cor 13:4" into book "1 cor" and rest "13:4".
    private func splitBookAndRest(_ text: String) -> (book: String, rest: String, endsWithSpace: Bool) {
        var characters = Array(text)
        var bookEnd = 0
        if let first = characters.first, first.isNumber {
            bookEnd = 1
            while bookEnd < characters.count, characters[bookEnd] == " " { bookEnd += 1 }
        }
        while bookEnd < characters.count, !characters[bookEnd].isNumber { bookEnd += 1 }
        let book = String(characters[..<bookEnd]).trimmingCharacters(in: .whitespaces).lowercased()
        let rest = String(characters[bookEnd...]).trimmingCharacters(in: .whitespaces)
        characters = []
        return (book, rest, text.hasSuffix(" "))
    }
}
