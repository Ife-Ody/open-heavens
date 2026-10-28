import SwiftUI

enum Appearance: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }
}

/// User preferences, persisted in UserDefaults. Mirrors the web app's settings context
/// (font size 12–32px in steps of 2, default 24px; theme light/dark/system; Bible version).
@Observable
final class AppSettings {
    static let minFontSize: Double = 12
    static let maxFontSize: Double = 32
    static let fontSizeStep: Double = 2
    static let defaultFontSize: Double = 24

    var fontSize: Double {
        didSet { defaults.set(fontSize, forKey: Keys.fontSize) }
    }

    var appearance: Appearance {
        didSet { defaults.set(appearance.rawValue, forKey: Keys.appearance) }
    }

    var bibleVersion: String {
        didSet { defaults.set(bibleVersion, forKey: Keys.bibleVersion) }
    }

    private let defaults: UserDefaults

    private enum Keys {
        static let fontSize = "settings.fontSize"
        static let appearance = "settings.appearance"
        static let bibleVersion = "settings.bibleVersion"
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let stored = defaults.double(forKey: Keys.fontSize)
        // Snap to the web's 2px steps between 12 and 32.
        let snapped = (stored / Self.fontSizeStep).rounded() * Self.fontSizeStep
        fontSize = stored == 0 ? Self.defaultFontSize : min(max(snapped, Self.minFontSize), Self.maxFontSize)
        appearance = Appearance(rawValue: defaults.string(forKey: Keys.appearance) ?? "") ?? .system
        bibleVersion = defaults.string(forKey: Keys.bibleVersion) ?? "kjv"
    }

    func increaseFontSize() {
        fontSize = min(Self.maxFontSize, fontSize + Self.fontSizeStep)
    }

    func decreaseFontSize() {
        fontSize = max(Self.minFontSize, fontSize - Self.fontSizeStep)
    }

    /// Like the web toggle: flips between light and dark based on what is currently shown.
    func toggleTheme(currentScheme: ColorScheme) {
        appearance = currentScheme == .dark ? .light : .dark
    }
}
