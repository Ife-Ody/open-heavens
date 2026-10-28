import Foundation
import SwiftUI

/// Read-only access to the bundled Bible database (KJV, NET and ASV, as on the web).
final class BibleStore {
    struct Version: Identifiable, Hashable {
        let code: String
        let name: String
        let shortName: String
        var id: String { code }
    }

    struct Book: Identifiable, Hashable {
        let number: Int
        let name: String
        let testament: String
        let chapters: Int
        var id: Int { number }
    }

    struct Verse: Identifiable, Hashable {
        let book: Book
        let chapter: Int
        let verse: Int
        let text: String
        var id: String { "\(book.number)-\(chapter)-\(verse)" }
        var reference: String { "\(book.name) \(chapter):\(verse)" }
    }

    private let db: SQLiteDatabase
    let versions: [Version]
    let books: [Book]
    private let booksByName: [String: Book]

    init(databaseURL: URL) throws {
        db = try SQLiteDatabase(path: databaseURL.path)
        versions = try db.query("SELECT code, name, shortName FROM versions ORDER BY rowid").compactMap { row in
            guard let code = row.string("code") else { return nil }
            return Version(code: code, name: row.string("name") ?? code, shortName: row.string("shortName") ?? code.uppercased())
        }
        books = try db.query("SELECT number, name, testament, chapters FROM books ORDER BY number").compactMap { row in
            guard let number = row.int("number"), let name = row.string("name") else { return nil }
            return Book(number: number, name: name, testament: row.string("testament") ?? "", chapters: row.int("chapters") ?? 1)
        }
        booksByName = Dictionary(uniqueKeysWithValues: books.map { ($0.name, $0) })
    }

    static func loadBundled() -> Result<BibleStore, Error> {
        guard let url = Bundle.main.url(forResource: "bible", withExtension: "sqlite") else {
            return .failure(SQLiteDatabase.Failure(message: "The Bible database is missing from the app bundle."))
        }
        do {
            return .success(try BibleStore(databaseURL: url))
        } catch {
            return .failure(error)
        }
    }

    func version(code: String) -> Version? {
        versions.first { $0.code == code } ?? versions.first
    }

    /// Looks a book up by any name or abbreviation.
    func book(named name: String) -> Book? {
        booksByName[BookNames.canonical(name)]
    }

    func book(number: Int) -> Book? {
        books.first { $0.number == number }
    }

    func verses(version: String, book: Book, chapter: Int, selection: [Int] = []) -> [Verse] {
        let rows = (try? db.query(
            "SELECT verse, text FROM verses WHERE version = ? AND book = ? AND chapter = ? ORDER BY verse",
            [.text(version), .integer(Int64(book.number)), .integer(Int64(chapter))]
        )) ?? []
        let all = rows.compactMap { row -> Verse? in
            guard let verse = row.int("verse"), let text = row.string("text") else { return nil }
            return Verse(book: book, chapter: chapter, verse: verse, text: text)
        }
        guard !selection.isEmpty else { return all }
        let wanted = Set(selection)
        return all.filter { wanted.contains($0.verse) }
    }

    func maxVerse(version: String, book: Book, chapter: Int) -> Int {
        let row = try? db.query(
            "SELECT MAX(verse) AS last FROM verses WHERE version = ? AND book = ? AND chapter = ?",
            [.text(version), .integer(Int64(book.number)), .integer(Int64(chapter))]
        ).first
        return row?.int("last") ?? 1
    }
}

private struct BibleStoreKey: EnvironmentKey {
    static let defaultValue: BibleStore? = nil
}

extension EnvironmentValues {
    var bibleStore: BibleStore? {
        get { self[BibleStoreKey.self] }
        set { self[BibleStoreKey.self] = newValue }
    }
}
