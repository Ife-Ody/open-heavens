import Foundation

/// Devotionals are keyed by calendar day as "yyyy-MM-dd" in the device's local calendar.
enum DateKey {
    private static let keyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    private static func formatter(_ format: String) -> DateFormatter {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US")
        formatter.dateFormat = format
        return formatter
    }

    private static let ordinal: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.locale = Locale(identifier: "en_US")
        formatter.numberStyle = .ordinal
        return formatter
    }()

    static func string(from date: Date) -> String { keyFormatter.string(from: date) }
    static func date(from key: String) -> Date? { keyFormatter.date(from: key) }
    static func today() -> String { string(from: .now) }

    static func adding(days: Int, to key: String) -> String? {
        guard let date = date(from: key),
              let shifted = Calendar.current.date(byAdding: .day, value: days, to: date) else { return nil }
        return string(from: shifted)
    }

    /// date-fns `PPP`, e.g. "October 28th, 2026" (the header date picker).
    static func longDate(_ date: Date) -> String {
        let day = Calendar.current.component(.day, from: date)
        let ordinalDay = ordinal.string(from: NSNumber(value: day)) ?? String(day)
        return "\(formatter("MMMM").string(from: date)) \(ordinalDay), \(formatter("yyyy").string(from: date))"
    }

    /// date-fns `PP`, e.g. "Oct 28, 2026".
    static func mediumDate(_ date: Date) -> String {
        formatter("MMM d, yyyy").string(from: date)
    }

    /// date-fns `EEEE, d MMM yyyy`, e.g. "Wednesday, 28 Oct 2026" (the post header).
    static func postDate(_ date: Date) -> String {
        formatter("EEEE, d MMM yyyy").string(from: date)
    }
}
