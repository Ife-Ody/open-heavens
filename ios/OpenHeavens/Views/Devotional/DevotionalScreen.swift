import SwiftUI

/// The web's `/[date]` page: Header (date picker + settings) above the post.
struct DevotionalScreen: View {
    @Environment(\.devotionalStore) private var store
    @Environment(AppSettings.self) private var settings

    @State private var dateKey = DateKey.today()
    @State private var devotional: Devotional?
    @State private var showingDatePicker = false
    @State private var showingSettings = false
    /// +1 when moving to a later day, -1 for earlier: the new page enters from that side.
    @State private var direction: CGFloat = 1
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var dateRange: ClosedRange<String>? { store?.dateKeyRange() }

    private var previousKey: String? {
        guard let key = DateKey.adding(days: -1, to: dateKey), let dateRange, dateRange.contains(key) else { return nil }
        return key
    }

    private var nextKey: String? {
        guard let key = DateKey.adding(days: 1, to: dateKey), let dateRange, dateRange.contains(key) else { return nil }
        return key
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    header
                    if let devotional {
                        DevotionalContentView(
                            devotional: devotional,
                            onPrevious: previousKey.map { key in { go(to: key) } },
                            onNext: nextKey.map { key in { go(to: key) } }
                        )
                    } else {
                        emptyPost
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 8)
                .padding(.bottom, 64)
            }
            .id(dateKey)
            .transition(pageTransition)
            .background(Theme.background)
            .simultaneousGesture(swipeGesture)
            .sensoryFeedback(.selection, trigger: dateKey)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: Hymn.self) { hymn in
                HymnDetailView(hymn: hymn)
            }
            .sheet(isPresented: $showingDatePicker) {
                DatePickerSheet(dateKey: $dateKey, range: dateRange)
            }
            .sheet(isPresented: $showingSettings) {
                SettingsSheet()
            }
            .task(id: dateKey) {
                devotional = try? store?.devotional(on: dateKey)
            }
        }
    }

    /// `<Header />`: date picker button on the left, settings cog on the right.
    private var header: some View {
        HStack(spacing: 12) {
            Button {
                showingDatePicker = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.mutedForeground.opacity(0.8))
                    Text(DateKey.longDate(DateKey.date(from: dateKey) ?? .now))
                }
            }
            .buttonStyle(OutlineButtonStyle(horizontalPadding: 12, fontSize: 14))

            Spacer()

            Button {
                showingSettings = true
            } label: {
                Image(systemName: "gearshape")
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.foreground)
            }
            .buttonStyle(OutlineButtonStyle(width: 36, horizontalPadding: 0))
            .accessibilityLabel("Settings")
        }
        .padding(.vertical, 12)
    }

    private var emptyPost: some View {
        VStack(spacing: 8) {
            Text("Could not find the requested post")
                .font(.inter(24, weight: .bold))
                .multilineTextAlignment(.center)
            Button("Go to today's post") { go(to: DateKey.today()) }
                .font(.inter(16))
                .foregroundStyle(Theme.primary)
                .underline()
                .buttonStyle(LinkButtonStyle())
        }
        .frame(maxWidth: .infinity, minHeight: 384)
    }

    /// A horizontal swipe changes the day. Intent is read from where the gesture is *going*
    /// (its projected end point), so a short flick commits just like a long drag.
    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 24, coordinateSpace: .local)
            .onEnded { value in
                let projected = value.predictedEndTranslation
                guard abs(projected.width) > 80, abs(projected.width) > abs(projected.height) * 1.5 else { return }
                if projected.width < 0, let nextKey {
                    go(to: nextKey)
                } else if projected.width > 0, let previousKey {
                    go(to: previousKey)
                }
            }
    }

    /// The incoming day slides in from the direction of travel while the old one blurs out,
    /// so the swap reads as one page moving rather than two overlapping. Reduced motion keeps
    /// only the fade.
    private var pageTransition: AnyTransition {
        if reduceMotion { return .opacity }
        return .asymmetric(
            insertion: .offset(x: 28 * direction).combined(with: .opacity).combined(with: .blur(radius: 4)),
            removal: .offset(x: -16 * direction).combined(with: .opacity).combined(with: .blur(radius: 4))
        )
    }

    private func go(to key: String) {
        direction = key > dateKey ? 1 : -1
        withAnimation(Motion.page) {
            dateKey = key
        }
    }
}
