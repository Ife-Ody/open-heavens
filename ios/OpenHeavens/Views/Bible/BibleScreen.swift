import SwiftUI

/// The web's `/bible` page: the reader in a tab.
struct BibleScreen: View {
    var body: some View {
        NavigationStack {
            BibleReaderView(showsCloseButton: false)
                .background(Theme.background)
                .toolbar(.hidden, for: .navigationBar)
        }
    }
}

/// The web's BibleDialog (a 95%-height drawer on mobile), opened by tapping a reference.
struct BibleSheet: View {
    var body: some View {
        BibleReaderView(showsCloseButton: true)
            .background(Theme.background)
            .presentationDetents([.fraction(0.95)])
            .presentationDragIndicator(.visible)
            .presentationBackground(Theme.background)
            .followsAppearance()
    }
}
