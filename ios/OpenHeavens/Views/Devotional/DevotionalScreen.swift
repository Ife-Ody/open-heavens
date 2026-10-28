import SwiftUI

/// The web's `/[date]` page: Header (date picker + settings) above the post.
struct DevotionalScreen: View {
    @Environment(\.devotionalStore) private var store
    @Environment(AppSettings.self) private var settings

    @State private var dateKey = DateKey.today()
    @State private var devotional: Devotional?
    @State private var showingDatePicker = false
    @State private var showingSettings = false

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
            .background(Theme.background)
            .simultaneousGesture(swipeGesture)
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
        }
        .frame(maxWidth: .infinity, minHeight: 384)
    }

    private var swipeGesture: some Gesture {
        DragGesture(minimumDistance: 40, coordinateSpace: .local)
            .onEnded { value in
                guard abs(value.translation.width) > abs(value.translation.height) * 2 else { return }
                if value.translation.width < 0, let nextKey {
                    go(to: nextKey)
                } else if value.translation.width > 0, let previousKey {
                    go(to: previousKey)
                }
            }
    }

    private func go(to key: String) {
        withAnimation(.easeInOut(duration: 0.2)) {
            dateKey = key
        }
    }
}
