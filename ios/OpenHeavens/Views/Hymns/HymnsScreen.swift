import SwiftUI

/// The web's `/hymns` page: "Hymns Directory" with search and a card per hymn.
struct HymnsScreen: View {
    @Environment(\.devotionalStore) private var store
    @State private var hymns: [Hymn] = []
    @State private var query = ""

    private var filtered: [Hymn] {
        let term = query.trimmingCharacters(in: .whitespaces)
        guard !term.isEmpty else { return hymns }
        return hymns.filter { $0.title.localizedCaseInsensitiveContains(term) || String($0.number).contains(term) }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 16) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Hymns Directory")
                                .font(.inter(24, weight: .bold))
                                .foregroundStyle(Theme.foreground)
                            Text("This is the directory of all the hymns available in the Open Heavens App. You can search for hymns by title or number. You can also search for hymns by the lyrics.")
                                .font(.inter(14))
                                .foregroundStyle(Theme.mutedForeground)
                        }
                        SearchInput(text: $query, placeholder: "Search hymns...")
                    }

                    LazyVStack(spacing: 16) {
                        ForEach(filtered) { hymn in
                            NavigationLink(value: hymn) {
                                HymnCard(hymn: hymn)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(16)
                .padding(.bottom, 48)
            }
            .background(Theme.background)
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: Hymn.self) { hymn in
                HymnDetailView(hymn: hymn)
            }
            .task {
                if hymns.isEmpty { hymns = store?.hymns() ?? [] }
            }
        }
    }
}

/// `<HymnCard />`: number, title, truncated lyrics and the video.
private struct HymnCard: View {
    let hymn: Hymn

    private var excerpt: String {
        let text = RichText.parse(html: hymn.lyricsHtml, tagReferences: false).plainText
            .replacingOccurrences(of: "\n", with: " ")
            .collapsingWhitespace()
        return text.count > 160 ? String(text.prefix(160)) + "..." : text
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 2) {
                Text("#\(hymn.number)")
                    .font(.inter(16, weight: .medium))
                    .foregroundStyle(Theme.foreground)
                Text(hymn.title)
                    .font(.inter(18, weight: .semibold))
                    .foregroundStyle(Theme.foreground)
                if !excerpt.isEmpty {
                    Text(excerpt)
                        .font(.inter(14))
                        .foregroundStyle(Theme.mutedForeground)
                        .padding(.top, 6)
                }
            }
            YouTubeThumbnail(url: hymn.youtubeThumbnailURL)
                .frame(height: 224)
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous).stroke(Theme.border, lineWidth: 1))
    }
}
