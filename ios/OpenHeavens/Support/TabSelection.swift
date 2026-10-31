import SwiftUI

enum AppTab: Hashable {
    case devotional
    case bible
    case hymns
    /// Not a page: opens the settings sheet over the current tab.
    case settings
}

private struct SelectTabKey: EnvironmentKey {
    static let defaultValue: (AppTab) -> Void = { _ in }
}

extension EnvironmentValues {
    /// Switches the root tab bar, e.g. "Browse all hymns" inside a devotional.
    var selectTab: (AppTab) -> Void {
        get { self[SelectTabKey.self] }
        set { self[SelectTabKey.self] = newValue }
    }
}
