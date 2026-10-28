import SwiftUI

@main
struct OpenHeavensApp: App {
    @State private var settings = AppSettings()
    @State private var bibleState: BibleState
    private let devotionalStore = DevotionalStore.loadBundled()
    private let bibleStore = BibleStore.loadBundled()

    init() {
        let bible = BibleStore.loadBundled()
        _bibleState = State(initialValue: BibleState(store: try? bible.get()))
    }

    var body: some Scene {
        WindowGroup {
            Group {
                switch devotionalStore {
                case .success(let store):
                    ContentView()
                        .environment(\.devotionalStore, store)
                        .environment(\.bibleStore, try? bibleStore.get())
                case .failure(let error):
                    ContentUnavailableView(
                        "Devotionals Unavailable",
                        systemImage: "exclamationmark.triangle",
                        description: Text(error.localizedDescription)
                    )
                }
            }
            .environment(settings)
            .environment(bibleState)
            .tint(Theme.primary)
            .preferredColorScheme(settings.appearance.colorScheme)
        }
    }
}
