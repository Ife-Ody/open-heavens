import SwiftUI

/// The web app's bottom dock: Devotional, Bible, Hymns, plus Settings.
struct ContentView: View {
    @Environment(BibleState.self) private var bible
    @State private var selectedTab: AppTab = .devotional
    @State private var showingSettings = false

    /// The Settings item acts as a button: it opens the sheet over whichever tab is showing
    /// instead of switching to a page of its own, so text size and theme are always one tap away.
    private var tabSelection: Binding<AppTab> {
        Binding(
            get: { selectedTab },
            set: { tab in
                if tab == .settings {
                    showingSettings = true
                } else {
                    selectedTab = tab
                }
            }
        )
    }

    var body: some View {
        @Bindable var bible = bible
        TabView(selection: tabSelection) {
            DevotionalScreen()
                .tabItem { Label("Devotional", systemImage: "book") }
                .tag(AppTab.devotional)

            BibleScreen()
                .tabItem { Label("Bible", systemImage: "text.book.closed") }
                .tag(AppTab.bible)

            HymnsScreen()
                .tabItem { Label("Hymns", systemImage: "music.note") }
                .tag(AppTab.hymns)

            // Never shown: selecting it presents the sheet instead (see `tabSelection`).
            Color.clear
                .tabItem { Label("Settings", systemImage: "gearshape") }
                .tag(AppTab.settings)
        }
        .environment(\.selectTab) { selectedTab = $0 }
        .sheet(isPresented: $showingSettings) {
            SettingsSheet()
        }
        .sheet(isPresented: $bible.isSheetPresented) {
            BibleSheet()
        }
        // Scripture references rendered as links inside Text open the Bible sheet, like the
        // web's BibleReference buttons.
        .environment(\.openURL, OpenURLAction { url in
            if let reference = BibleState.reference(from: url) {
                bible.open(reference: reference)
                return .handled
            }
            return .systemAction
        })
    }
}
