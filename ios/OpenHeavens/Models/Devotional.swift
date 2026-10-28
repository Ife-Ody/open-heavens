import Foundation

enum Audience: String, CaseIterable, Identifiable {
    case adult
    case teen

    var id: String { rawValue }

    var title: String {
        switch self {
        case .adult: return "Open Heavens"
        case .teen: return "Teens"
        }
    }
}

struct Language: Identifiable, Hashable {
    let code: String
    let name: String

    var id: String { code }

    static func displayName(for code: String, fallback: String? = nil) -> String {
        if let fallback, !fallback.isEmpty { return fallback }
        return Locale.current.localizedString(forLanguageCode: code)?.capitalized ?? code.uppercased()
    }
}

struct DevotionalTranslation: Hashable {
    let language: Language
    let title: String
    let memoryText: String
    let bodyHtml: String
    let pointText: String?
    let pointType: String?
}

struct Devotional: Identifiable, Hashable {
    let id: Int
    let dateKey: String
    let audience: Audience
    let biblePlan: String
    let memoryVerseReference: String
    let bibleReading: String
    let imageURL: URL?
    let hymnId: Int?
    let audioURL: URL?
    let translation: DevotionalTranslation
    let availableLanguages: [Language]

    var date: Date { DateKey.date(from: dateKey) ?? .now }
    var title: String { translation.title }

    /// The point header without its trailing colon, e.g. "Key Point:" -> "Key Point".
    var pointHeading: String? {
        guard let type = translation.pointType?.trimmingCharacters(in: .whitespacesAndNewlines), !type.isEmpty else { return nil }
        return type.hasSuffix(":") ? String(type.dropLast()) : type
    }
}
