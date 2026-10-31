import SwiftUI
import WebKit

// MARK: - Buttons (packages/ui button variants)

/// `variant="outline"`: border, background, rounded-md, text-sm font-medium.
struct OutlineButtonStyle: ButtonStyle {
    var height: CGFloat = 36
    /// Fixed width for icon buttons (`size="icon"`).
    var width: CGFloat? = nil
    var horizontalPadding: CGFloat = 16
    var radius: CGFloat = Theme.radiusMD
    var fontSize: CGFloat = 14

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.inter(fontSize, weight: .medium))
            .foregroundStyle(Theme.foreground)
            .padding(.horizontal, horizontalPadding)
            .frame(width: width)
            .frame(minHeight: height)
            .background(configuration.isPressed ? Theme.secondary : Theme.background, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).stroke(Theme.border, lineWidth: 1))
            .contentShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .pressScale(configuration.isPressed)
    }
}

extension View {
    /// Instant, subtle press feedback (scale 0.97, 120ms ease-out) so controls feel heard on touch-down.
    func pressScale(_ isPressed: Bool, amount: CGFloat = 0.97) -> some View {
        scaleEffect(isPressed ? amount : 1)
            .animation(Motion.press, value: isPressed)
    }
}

/// Card-style pressable (hymn cards): the card itself dims and settles under the finger.
struct CardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(configuration.isPressed ? Theme.secondary : Theme.card, in: RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous).stroke(Theme.border, lineWidth: 1))
            .pressScale(configuration.isPressed, amount: 0.985)
    }
}

/// Inline text links ("Go to Hymn", "Browse all hymns"): dim on press like a tapped web link.
struct LinkButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.6 : 1)
            .animation(Motion.press, value: configuration.isPressed)
    }
}

/// `variant="secondary"`: bg-secondary, rounded-md, text-sm font-medium.
struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.inter(14, weight: .medium))
            .foregroundStyle(Theme.foreground)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Theme.secondary.opacity(configuration.isPressed ? 0.8 : 1), in: RoundedRectangle(cornerRadius: Theme.radiusMD, style: .continuous))
            .pressScale(configuration.isPressed)
    }
}

/// `variant="ghost"`: no chrome until pressed.
struct GhostButtonStyle: ButtonStyle {
    var size: CGFloat = 36

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.inter(14, weight: .medium))
            .frame(minWidth: size, minHeight: size)
            .background(configuration.isPressed ? Theme.secondary : .clear, in: RoundedRectangle(cornerRadius: Theme.radiusMD, style: .continuous))
            .contentShape(RoundedRectangle(cornerRadius: Theme.radiusMD, style: .continuous))
            .pressScale(configuration.isPressed)
    }
}

/// `variant="default"`: bg-primary text-primary-foreground.
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.inter(14, weight: .medium))
            .foregroundStyle(Theme.primaryForeground)
            .padding(.horizontal, 16)
            .frame(minHeight: 36)
            .background(Theme.primary.opacity(configuration.isPressed ? 0.9 : 1), in: RoundedRectangle(cornerRadius: Theme.radiusMD, style: .continuous))
            .pressScale(configuration.isPressed)
    }
}

extension View {
    /// Disabled buttons on the web are `opacity-50`.
    func webDisabled(_ disabled: Bool) -> some View {
        self.disabled(disabled).opacity(disabled ? 0.5 : 1)
    }
}

// MARK: - Text

/// Rich text at the user's font size, with tappable scripture references.
struct RichTextView: View {
    @Environment(AppSettings.self) private var settings
    let text: RichText
    var weight: Font.Weight = .regular
    var color: Color? = nil
    var lineHeight: CGFloat? = nil

    var body: some View {
        let size = settings.fontSize
        Text(text.attributedString(size: size, weight: weight, color: color))
            .lineHeight(lineHeight ?? size * 1.5, fontSize: size)
            .tint(Theme.primary)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// `<h2 class="text-[fontSize+2px] font-bold uppercase">`
struct SectionHeading: View {
    @Environment(AppSettings.self) private var settings
    let title: String

    var body: some View {
        Text(title.uppercased())
            .font(.inter(settings.fontSize + 2, weight: .bold))
            .foregroundStyle(Theme.foreground)
            .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Author (packages/ui user-display)

struct AuthorDisplay: View {
    var body: some View {
        HStack(spacing: 12) {
            Image("Author")
                .resizable()
                .scaledToFill()
                .frame(width: 32, height: 32)
                .clipShape(Circle())
                .overlay(alignment: .topTrailing) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(Theme.primary)
                        .background(Theme.background, in: Circle().inset(by: 1))
                        .offset(x: 5, y: -5)
                }
            VStack(alignment: .leading, spacing: 0) {
                Text("Pastor E.A. Adeboye")
                    .font(.inter(14, weight: .medium))
                    .foregroundStyle(Theme.foreground)
                Text("eaadeboye.com")
                    .font(.inter(12))
                    .foregroundStyle(Theme.mutedForeground)
            }
        }
    }
}

// MARK: - YouTube

/// The web app's `<iframe src="https://www.youtube.com/embed/...">`.
struct YouTubeEmbedView: UIViewRepresentable {
    let embedURL: URL

    final class Coordinator {
        var loadedURL: URL?
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        context.coordinator.loadedURL = embedURL
        load(into: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        if context.coordinator.loadedURL != embedURL {
            context.coordinator.loadedURL = embedURL
            load(into: webView)
        }
    }

    /// The page the web app embeds from; YouTube needs a real referrer or it refuses the player
    /// (error 152/153 without one).
    private static let embedOrigin = URL(string: "https://openheavens.app/hymns")!

    private func load(into webView: WKWebView) {
        let html = """
        <!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>html,body{margin:0;background:#000;height:100%;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style>
        </head><body><iframe src="\(embedURL.absoluteString)" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="origin"></iframe></body></html>
        """
        webView.loadHTMLString(html, baseURL: Self.embedOrigin)
    }
}

/// A YouTube thumbnail with a play badge, used in lists instead of embedding many players.
struct YouTubeThumbnail: View {
    let url: URL?

    var body: some View {
        ZStack {
            Color.black
            if let url {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    ProgressView().tint(.white)
                }
            }
            Image(systemName: "play.circle.fill")
                .font(.system(size: 44))
                .foregroundStyle(.white.opacity(0.9))
                .shadow(radius: 6)
        }
        .clipped()
    }
}

// MARK: - Search input (packages/ui input)

struct SearchInput: View {
    @Binding var text: String
    var placeholder: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 14))
                .foregroundStyle(Theme.foreground.opacity(0.5))
            TextField(placeholder, text: $text)
                .font(.inter(16))
                .foregroundStyle(Theme.foreground)
                .autocorrectionDisabled()
            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(Theme.mutedForeground)
                }
            }
        }
        .padding(.horizontal, 8)
        .frame(height: 36)
        .background(Theme.background, in: RoundedRectangle(cornerRadius: Theme.radiusMD, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Theme.radiusMD, style: .continuous).stroke(Theme.border, lineWidth: 1))
    }
}

// MARK: - Sheets

/// A sheet is hosted outside the root view hierarchy, so the root's `preferredColorScheme`
/// is applied once when it opens and never again. Re-applying the saved appearance inside the
/// sheet keeps it in step when the theme changes while it is up.
private struct FollowsAppearance: ViewModifier {
    @Environment(AppSettings.self) private var settings

    func body(content: Content) -> some View {
        content.preferredColorScheme(settings.appearance.colorScheme)
    }
}

extension View {
    func followsAppearance() -> some View { modifier(FollowsAppearance()) }
}

// MARK: - Transitions

private struct BlurModifier: ViewModifier {
    let radius: CGFloat
    func body(content: Content) -> some View { content.blur(radius: radius) }
}

extension AnyTransition {
    /// A light blur during a crossfade blends the two states into one apparent object.
    static func blur(radius: CGFloat) -> AnyTransition {
        .modifier(active: BlurModifier(radius: radius), identity: BlurModifier(radius: 0))
    }
}

// MARK: - Navigation

/// UIKit disables the edge swipe-back gesture once the navigation bar is hidden, which every
/// screen here does. Placed in the background of a pushed screen, this hands the gesture a
/// delegate that lets it begin whenever there is something to pop back to.
struct SwipeBackEnabler: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> Controller { Controller() }
    func updateUIViewController(_ controller: Controller, context: Context) {}

    final class Controller: UIViewController {
        override func viewWillAppear(_ animated: Bool) {
            super.viewWillAppear(animated)
            enableSwipeBack()
        }

        override func viewDidAppear(_ animated: Bool) {
            super.viewDidAppear(animated)
            enableSwipeBack()
        }

        private func enableSwipeBack() {
            guard let navigationController, let gesture = navigationController.interactivePopGestureRecognizer else { return }
            gesture.delegate = SwipeBackDelegate.shared(for: navigationController)
            gesture.isEnabled = true
        }
    }
}

/// Lives as long as its navigation controller, so the gesture keeps a delegate after the screen
/// that installed it is popped (a nil delegate would let the gesture fire on the root screen).
private final class SwipeBackDelegate: NSObject, UIGestureRecognizerDelegate {
    private static var associatedKey: UInt8 = 0
    private weak var navigationController: UINavigationController?

    static func shared(for navigationController: UINavigationController) -> SwipeBackDelegate {
        if let existing = objc_getAssociatedObject(navigationController, &associatedKey) as? SwipeBackDelegate {
            return existing
        }
        let delegate = SwipeBackDelegate()
        delegate.navigationController = navigationController
        objc_setAssociatedObject(navigationController, &associatedKey, delegate, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        return delegate
    }

    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        (navigationController?.viewControllers.count ?? 0) > 1
    }
}
