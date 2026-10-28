import Foundation
import Observation

/// App-wide Bible navigation state, like the web's BibleProvider context: the current
/// book/chapter/verse selection, shared by the Bible tab and the Bible sheet that opens
/// when a scripture reference is tapped.
@MainActor
@Observable
final class BibleState {
    let store: BibleStore?

    var isSheetPresented = false
    var book: BibleStore.Book
    var chapter: Int
    var selectedVerses: [Int] = []

    init(store: BibleStore?) {
        self.store = store
        book = store?.books.first ?? BibleStore.Book(number: 1, name: "Genesis", testament: "OT", chapters: 50)
        chapter = 1
    }

    var maxChapter: Int { book.chapters }

    func show(book: BibleStore.Book, chapter: Int, verses: [Int] = []) {
        self.book = book
        self.chapter = min(max(chapter, 1), book.chapters)
        selectedVerses = verses
    }

    func previousChapter() {
        guard chapter > 1 else { return }
        chapter -= 1
        selectedVerses = []
    }

    func nextChapter() {
        guard chapter < maxChapter else { return }
        chapter += 1
        selectedVerses = []
    }

    func showFullChapter() {
        selectedVerses = []
    }

    /// Opens the Bible sheet at a reference such as "John 3:16-18" (the web's BibleReference click).
    @discardableResult
    func open(reference: String) -> Bool {
        guard let parsed = BibleReferences.parse(reference),
              let book = store?.book(named: parsed.book) else { return false }
        show(book: book, chapter: parsed.startChapter, verses: parsed.verseSelection)
        isSheetPresented = true
        return true
    }

    func verses(version: String) -> [BibleStore.Verse] {
        store?.verses(version: version, book: book, chapter: chapter, selection: selectedVerses) ?? []
    }

    // MARK: Reference links inside rich text

    nonisolated static let linkScheme = "openheavens"

    nonisolated static func url(for reference: String) -> URL? {
        var components = URLComponents()
        components.scheme = linkScheme
        components.host = "bible"
        components.queryItems = [URLQueryItem(name: "ref", value: reference)]
        return components.url
    }

    nonisolated static func reference(from url: URL) -> String? {
        guard url.scheme == linkScheme, url.host == "bible" else { return nil }
        return URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?.first { $0.name == "ref" }?.value
    }
}
