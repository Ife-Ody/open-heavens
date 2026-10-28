import Foundation
import SwiftUI

/// Read-only access to the bundled devotional database.
final class DevotionalStore {
    private let db: SQLiteDatabase

    init(databaseURL: URL) throws {
        db = try SQLiteDatabase(path: databaseURL.path)
    }

    static func loadBundled() -> Result<DevotionalStore, Error> {
        guard let url = Bundle.main.url(forResource: "openheavens", withExtension: "sqlite") else {
            return .failure(SQLiteDatabase.Failure(message: "The devotional database is missing from the app bundle."))
        }
        do {
            return .success(try DevotionalStore(databaseURL: url))
        } catch {
            return .failure(error)
        }
    }

    // MARK: Devotionals

    func devotional(on dateKey: String, audience: Audience = .adult, languageCode: String = "en") throws -> Devotional? {
        let rows = try db.query(
            """
            SELECT d.id, d.date, d.audience, d.biblePlan, d.bibleMemoryVerse, d.bibleText, d.imageUrl, d.hymnId, d.audioUrl,
                   t.languageCode, t.languageName, t.title, t.memoryText, t.bodyHtml, t.pointText, t.pointType
            FROM devotionals d
            JOIN translations t ON t.devotionalId = d.id
            WHERE d.date = ? AND d.audience = ?
            ORDER BY (t.languageCode = ?) DESC, (t.languageCode = 'en') DESC, t.isActive DESC, t.id ASC
            LIMIT 1
            """,
            [.text(dateKey), .text(audience.rawValue), .text(languageCode)]
        )
        guard let row = rows.first, let id = row.int("id") else { return nil }

        let languages = try db.query(
            """
            SELECT languageCode, languageName FROM translations
            WHERE devotionalId = ?
            ORDER BY (languageCode = 'en') DESC, languageCode ASC
            """,
            [.integer(Int64(id))]
        ).compactMap { languageRow -> Language? in
            guard let code = languageRow.string("languageCode") else { return nil }
            return Language(code: code, name: Language.displayName(for: code, fallback: languageRow.string("languageName")))
        }

        let languageCode = row.string("languageCode") ?? "en"
        let translation = DevotionalTranslation(
            language: Language(code: languageCode, name: Language.displayName(for: languageCode, fallback: row.string("languageName"))),
            title: (row.string("title") ?? "Untitled").collapsingWhitespace(),
            memoryText: (row.string("memoryText") ?? "").collapsingWhitespace(),
            bodyHtml: row.string("bodyHtml") ?? "",
            pointText: row.string("pointText")?.collapsingWhitespace(),
            pointType: row.string("pointType")
        )

        return Devotional(
            id: id,
            dateKey: row.string("date") ?? dateKey,
            audience: Audience(rawValue: row.string("audience") ?? "") ?? audience,
            biblePlan: row.string("biblePlan") ?? "",
            memoryVerseReference: row.string("bibleMemoryVerse") ?? "",
            bibleReading: row.string("bibleText") ?? "",
            imageURL: row.string("imageUrl").flatMap(URL.init(string:)),
            hymnId: row.int("hymnId"),
            audioURL: row.string("audioUrl").flatMap(URL.init(string:)),
            translation: translation,
            availableLanguages: languages
        )
    }

    /// The first and last dates that have a devotional for the audience.
    func dateKeyRange(for audience: Audience = .adult) -> ClosedRange<String>? {
        guard let row = try? db.query(
            "SELECT MIN(date) AS first, MAX(date) AS last FROM devotionals WHERE audience = ?",
            [.text(audience.rawValue)]
        ).first, let first = row.string("first"), let last = row.string("last") else { return nil }
        return first...last
    }

    func languages() -> [Language] {
        let rows = (try? db.query(
            """
            SELECT languageCode, MAX(languageName) AS languageName, COUNT(*) AS total
            FROM translations GROUP BY languageCode
            ORDER BY (languageCode = 'en') DESC, total DESC
            """
        )) ?? []
        return rows.compactMap { row in
            guard let code = row.string("languageCode") else { return nil }
            return Language(code: code, name: Language.displayName(for: code, fallback: row.string("languageName")))
        }
    }

    // MARK: Hymns

    func hymns() -> [Hymn] {
        let rows = (try? db.query("SELECT * FROM hymns ORDER BY number ASC, id ASC")) ?? []
        return rows.compactMap(Self.hymn(from:))
    }

    func hymn(id: Int) -> Hymn? {
        let rows = (try? db.query("SELECT * FROM hymns WHERE id = ? LIMIT 1", [.integer(Int64(id))])) ?? []
        return rows.first.flatMap(Self.hymn(from:))
    }

    private static func hymn(from row: SQLiteDatabase.Row) -> Hymn? {
        guard let id = row.int("id"), let title = row.string("title") else { return nil }
        return Hymn(
            id: id,
            number: row.int("number") ?? id,
            title: title.collapsingWhitespace(),
            youtubeURL: row.string("youtubeUrl").flatMap(URL.init(string:)),
            audioURL: row.string("audioUrl").flatMap(URL.init(string:)),
            imageURL: row.string("imageUrl").flatMap(URL.init(string:)),
            lyricsHtml: row.string("lyricsHtml") ?? ""
        )
    }
}

extension String {
    /// Collapses runs of whitespace into single spaces and trims the ends.
    func collapsingWhitespace() -> String {
        split(whereSeparator: { $0.isWhitespace || $0.isNewline }).joined(separator: " ")
    }
}

// MARK: - Environment

private struct DevotionalStoreKey: EnvironmentKey {
    static let defaultValue: DevotionalStore? = nil
}

extension EnvironmentValues {
    var devotionalStore: DevotionalStore? {
        get { self[DevotionalStoreKey.self] }
        set { self[DevotionalStoreKey.self] = newValue }
    }
}
