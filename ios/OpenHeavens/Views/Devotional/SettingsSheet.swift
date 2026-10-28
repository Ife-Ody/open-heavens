import SwiftUI

/// The web's SettingsDrawer: "Change Settings" with the font-size selector and theme toggle.
struct SettingsSheet: View {
    @Environment(AppSettings.self) private var settings
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            Capsule()
                .fill(Theme.mutedForeground.opacity(0.4))
                .frame(width: 100, height: 4)
                .padding(.top, 16)

            Text("Change Settings")
                .font(.inter(18, weight: .semibold))
                .foregroundStyle(Theme.foreground)
                .padding(.top, 16)

            VStack(spacing: 8) {
                Text("Font Size").font(.inter(16)).foregroundStyle(Theme.foreground)
                FontSizeSelector()
            }
            .padding(.vertical, 24)

            VStack(spacing: 8) {
                Text("Theme").font(.inter(16)).foregroundStyle(Theme.foreground)
                ThemeToggle()
            }
            .padding(.vertical, 24)

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity)
        .background(Theme.background)
        .presentationDetents([.height(340)])
        .presentationDragIndicator(.hidden)
        .presentationBackground(Theme.background)
    }
}

/// `<FontsizeSelector />`: A- | 24px | A+
struct FontSizeSelector: View {
    @Environment(AppSettings.self) private var settings

    var body: some View {
        HStack(spacing: 12) {
            Button {
                settings.decreaseFontSize()
            } label: {
                Text("A").font(.inter(12, weight: .medium))
            }
            .buttonStyle(OutlineButtonStyle(width: 36, horizontalPadding: 0))
            .webDisabled(settings.fontSize <= AppSettings.minFontSize)
            .accessibilityLabel("Smaller text")

            Text("\(Int(settings.fontSize))px")
                .font(.inter(18))
                .foregroundStyle(Theme.foreground)
                .frame(minWidth: 48)

            Button {
                settings.increaseFontSize()
            } label: {
                Text("A").font(.inter(20, weight: .medium))
            }
            .buttonStyle(OutlineButtonStyle(width: 36, horizontalPadding: 0))
            .webDisabled(settings.fontSize >= AppSettings.maxFontSize)
            .accessibilityLabel("Larger text")
        }
    }
}

/// `<ThemeToggle />`: sun in light mode, moon in dark mode; tapping flips the theme.
struct ThemeToggle: View {
    @Environment(AppSettings.self) private var settings
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Button {
            settings.toggleTheme(currentScheme: colorScheme)
        } label: {
            Image(systemName: colorScheme == .dark ? "moon" : "sun.max")
                .font(.system(size: 16))
                .foregroundStyle(Theme.mutedForeground)
        }
        .buttonStyle(GhostButtonStyle())
        .accessibilityLabel("Toggle theme")
    }
}
