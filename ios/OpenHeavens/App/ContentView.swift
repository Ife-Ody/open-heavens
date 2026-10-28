import SwiftUI

/// The three destinations of the web app's bottom dock: Devotional, Bible, Hymns.
struct ContentView: View {
    @Environment(BibleState.self) private var bible
    @State private var selectedTab: AppTab = .devotional

    var body: some View {
        @Bindable var bible = bible
        TabView(selection: $selectedTab) {
            DevotionalScreen()
                .tabItem { Label("Devotional", systemImage: "book") }
                .tag(AppTab.devotional)

            BibleScreen()
                .tabItem { Label("Bible", systemImage: "text.book.closed") }
                .tag(AppTab.bible)

            HymnsScreen()
                .tabItem { Label("Hymns", systemImage: "music.note") }
                .tag(AppTab.hymns)
        }
        .environment(\.selectTab) { selectedTab = $0 }
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
