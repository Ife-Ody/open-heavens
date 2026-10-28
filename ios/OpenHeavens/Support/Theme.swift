import SwiftUI
import UIKit

/// The web app's design tokens (packages/ui/src/styles/globals.css), converted from oklch to sRGB.
enum Theme {
    static let background = dynamic(light: 0xF7F7F7, dark: 0x0C0C0C)
    static let foreground = dynamic(light: 0x050505, dark: 0xE9E9E9)
    static let card = dynamic(light: 0xFFFFFF, dark: 0x0A0A0A)
    static let primary = dynamic(light: 0x0049C1, dark: 0x0074FF)
    static let primaryForeground = dynamic(light: 0xFFFFFF, dark: 0x171717)
    /// `--secondary`, `--muted` and `--accent` share the same value on the web.
    static let secondary = dynamic(light: 0xF5F5F5, dark: 0x262626)
    static let muted = secondary
    static let mutedForeground = dynamic(light: 0x575757, dark: 0xA1A1A1)
    static let border = dynamic(light: 0xE5E5E5, dark: 0x262626)
    /// `selection:bg-orange-400` / `dark:selection:bg-orange-900/50`
    static let selection = dynamic(light: 0xFB923C, dark: 0x7C2D12)

    /// `--radius: 0.75rem`; Tailwind's rounded-md / rounded-lg / rounded-xl derive from it.
    static let radius: CGFloat = 12
    static let radiusMD: CGFloat = 10
    static let radiusLG: CGFloat = 12
    static let radiusXL: CGFloat = 16

    private static func dynamic(light: UInt32, dark: UInt32) -> Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light)
        })
    }
}

private extension UIColor {
    convenience init(hex: UInt32) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}

/// Inter, the typeface the web app loads through next/font.
enum InterFont {
    static func name(weight: Font.Weight, italic: Bool) -> String {
        let base: String
        switch weight {
        case .ultraLight, .thin, .light: base = "Inter-Light"
        case .medium: base = "Inter-Medium"
        case .semibold: base = "Inter-SemiBold"
        case .bold, .heavy, .black: base = "Inter-Bold"
        default: base = "Inter-Regular"
        }
        guard italic else { return base }
        switch base {
        case "Inter-Medium": return "Inter-MediumItalic"
        case "Inter-SemiBold": return "Inter-SemiBoldItalic"
        case "Inter-Bold": return "Inter-BoldItalic"
        default: return "Inter-Italic"
        }
    }
}

extension Font {
    static func inter(_ size: CGFloat, weight: Font.Weight = .regular, italic: Bool = false) -> Font {
        .custom(InterFont.name(weight: weight, italic: italic), size: size)
    }

    // Tailwind's text-* scale.
    static let textXS = inter(12)
    static let textSM = inter(14)
    static let textBase = inter(16)
    static let textLG = inter(18)
    static let textXL = inter(20)
    static let text2XL = inter(24)
}

extension View {
    /// Approximates a CSS line-height for Inter at the given size (Inter's natural leading is ~1.21×).
    func lineHeight(_ lineHeight: CGFloat, fontSize: CGFloat) -> some View {
        lineSpacing(max(0, lineHeight - fontSize * 1.21))
    }
}
