import SwiftUI

/// The web's SettingsDrawer as a native sheet: text size with a live preview and a stepped
/// slider, and a three-way appearance switch (light / dark / system).
struct SettingsSheet: View {
    @Environment(AppSettings.self) private var settings
    @State private var contentHeight: CGFloat = 440

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Settings")
                .font(.inter(20, weight: .semibold))
                .foregroundStyle(Theme.foreground)
                .padding(.top, 24)
                .padding(.horizontal, 4)

            SettingsGroup(title: "Text size", value: "\(Int(settings.fontSize)) px") {
                FontSizePreview()
                FontSizeSlider()
            }

            SettingsGroup(title: "Appearance") {
                AppearancePicker()
            }
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        // Size the sheet to its content so it opens at exactly the height it needs.
        .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { contentHeight = $0 }
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Theme.background)
        .presentationDetents([.height(contentHeight)])
        .presentationDragIndicator(.visible)
        .presentationBackground(Theme.background)
        .followsAppearance()
    }
}

/// A card with an uppercase caption, an optional live value on the right, and its controls.
private struct SettingsGroup<Content: View>: View {
    let title: String
    var value: String? = nil
    @ViewBuilder let content: Content

    @Environment(AppSettings.self) private var settings

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline) {
                Text(title.uppercased())
                    .font(.inter(12, weight: .semibold))
                    .tracking(0.6)
                    .foregroundStyle(Theme.mutedForeground)
                Spacer()
                if let value {
                    Text(value)
                        .font(.inter(13, weight: .medium))
                        .monospacedDigit()
                        .foregroundStyle(Theme.foreground)
                        .contentTransition(.numericText(value: settings.fontSize))
                        .animation(Motion.state, value: settings.fontSize)
                }
            }
            content
        }
        .padding(16)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous).stroke(Theme.border, lineWidth: 1))
    }
}

/// A line of scripture rendered at the chosen size, so the number means something.
private struct FontSizePreview: View {
    @Environment(AppSettings.self) private var settings

    var body: some View {
        let size = settings.fontSize
        Text("The Lord is my shepherd; I shall not want.")
            .font(.inter(size))
            .foregroundStyle(Theme.foreground)
            .lineHeight(size * 1.5, fontSize: size)
            .lineLimit(2)
            .contentTransition(.interpolate)
            .animation(Motion.state, value: size)
            // Reserve two lines at the largest size so the sheet never jumps as the size changes.
            .frame(maxWidth: .infinity, minHeight: AppSettings.maxFontSize * 1.5 * 2, alignment: .leading)
    }
}

/// A− | slider | A+. The slider steps through the web's 2px sizes; the letters tap to either end.
private struct FontSizeSlider: View {
    @Environment(AppSettings.self) private var settings

    var body: some View {
        HStack(spacing: 10) {
            Button {
                withAnimation(Motion.state) { settings.decreaseFontSize() }
            } label: {
                Text("A")
                    .font(.inter(13, weight: .medium))
                    .foregroundStyle(Theme.mutedForeground)
            }
            .buttonStyle(GhostButtonStyle(size: 32))
            .webDisabled(settings.fontSize <= AppSettings.minFontSize)
            .accessibilityLabel("Smaller text")

            Slider(
                value: Binding(get: { settings.fontSize }, set: { settings.fontSize = $0 }),
                in: AppSettings.minFontSize...AppSettings.maxFontSize,
                step: AppSettings.fontSizeStep
            )
            .tint(Theme.primary)
            .accessibilityLabel("Text size")
            .accessibilityValue("\(Int(settings.fontSize)) points")

            Button {
                withAnimation(Motion.state) { settings.increaseFontSize() }
            } label: {
                Text("A")
                    .font(.inter(21, weight: .medium))
                    .foregroundStyle(Theme.mutedForeground)
            }
            .buttonStyle(GhostButtonStyle(size: 32))
            .webDisabled(settings.fontSize >= AppSettings.maxFontSize)
            .accessibilityLabel("Larger text")
        }
        .sensoryFeedback(.selection, trigger: settings.fontSize)
    }
}

/// Light / Dark / System as a segmented switch. It reads the saved preference rather than the
/// colour scheme currently on screen, so the selection always matches what the user picked
/// and can be changed again without reopening the sheet.
private struct AppearancePicker: View {
    @Environment(AppSettings.self) private var settings
    @Namespace private var thumb

    var body: some View {
        HStack(spacing: 2) {
            ForEach(Appearance.allCases) { option in
                let selected = settings.appearance == option
                Button {
                    // Ease the dark/light swap rather than cutting; abrupt brightness jumps are jarring.
                    withAnimation(.easeInOut(duration: 0.3)) {
                        settings.appearance = option
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: option.symbol)
                            .font(.system(size: 13, weight: .medium))
                        Text(option.title)
                            .font(.inter(14, weight: .medium))
                    }
                    .foregroundStyle(selected ? Theme.foreground : Theme.mutedForeground)
                    .frame(maxWidth: .infinity)
                    .frame(height: 36)
                    .background {
                        if selected {
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .fill(Theme.elevated)
                                .overlay(RoundedRectangle(cornerRadius: 8, style: .continuous).stroke(Theme.foreground.opacity(0.06), lineWidth: 1))
                                .shadow(color: .black.opacity(0.08), radius: 2, y: 1)
                                .matchedGeometryEffect(id: "thumb", in: thumb)
                        }
                    }
                    .contentShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                .buttonStyle(SegmentButtonStyle())
                .accessibilityAddTraits(selected ? .isSelected : [])
            }
        }
        .padding(3)
        .background(Theme.secondary, in: RoundedRectangle(cornerRadius: 11, style: .continuous))
        .sensoryFeedback(.selection, trigger: settings.appearance)
    }
}

/// Segments dim on touch-down; the thumb does the rest.
private struct SegmentButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.7 : 1)
            .animation(Motion.press, value: configuration.isPressed)
    }
}
