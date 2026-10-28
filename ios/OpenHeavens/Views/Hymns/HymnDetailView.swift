import SwiftUI

/// The web's `/hymns/[id]` page.
struct HymnDetailView: View {
    @Environment(\.devotionalStore) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var current: Hymn
    @State private var all: [Hymn] = []

    init(hymn: Hymn) {
        _current = State(initialValue: hymn)
    }

    private var index: Int? { all.firstIndex(of: current) }
    private var previous: Hymn? { index.flatMap { $0 > 0 ? all[$0 - 1] : nil } }
    private var next: Hymn? { index.flatMap { $0 + 1 < all.count ? all[$0 + 1] : nil } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header

                if let embedURL = current.youtubeEmbedURL {
                    YouTubeEmbedView(embedURL: embedURL)
                        .aspectRatio(16 / 9, contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusXL, style: .continuous))
                        .shadow(color: .black.opacity(0.15), radius: 12, y: 6)
                } else {
                    Text("Invalid YouTube URL")
                        .font(.inter(16))
                        .frame(maxWidth: .infinity)
                        .aspectRatio(16 / 9, contentMode: .fit)
                        .background(Theme.muted, in: RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
                }

                if let audioURL = current.audioURL {
                    AudioPlayerBar(url: audioURL, title: current.title, subtitle: "Hymn \(current.number) · audio")
                }

                if let youtubeURL = current.youtubeURL {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("YouTube Link:")
                            .font(.inter(18, weight: .semibold))
                            .foregroundStyle(Theme.foreground)
                        Link(youtubeURL.absoluteString, destination: youtubeURL)
                            .font(.inter(16))
                            .foregroundStyle(Theme.primary)
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Lyrics:")
                        .font(.inter(18, weight: .semibold))
                        .foregroundStyle(Theme.foreground)
                    Text(RichText.parse(html: current.lyricsHtml, tagReferences: false).attributedString(size: 16, color: Theme.foreground))
                        .lineHeight(26, fontSize: 16)
                        .textSelection(.enabled)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 24)
            .padding(.bottom, 48)
        }
        .background(Theme.background)
        .toolbar(.hidden, for: .navigationBar)
        .task {
            if all.isEmpty { all = store?.hymns() ?? [] }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 24) {
            HStack(spacing: 8) {
                Button {
                    dismiss()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.left").font(.system(size: 14, weight: .medium))
                        Text("Back to List")
                    }
                    .font(.inter(16))
                    .foregroundStyle(Theme.foreground)
                }
                .buttonStyle(.plain)

                Spacer()

                HStack(spacing: 4) {
                    Button {
                        if let previous { current = previous }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left").font(.system(size: 13, weight: .semibold))
                            Text("Previous")
                        }
                    }
                    .buttonStyle(GhostButtonStyle())
                    .webDisabled(previous == nil)

                    if let index {
                        Text("Hymn \(index + 1) of \(all.count)")
                            .font(.inter(14))
                            .foregroundStyle(Theme.foreground)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Theme.muted, in: RoundedRectangle(cornerRadius: Theme.radiusXL, style: .continuous))
                    }

                    Button {
                        if let next { current = next }
                    } label: {
                        HStack(spacing: 4) {
                            Text("Next")
                            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                        }
                    }
                    .buttonStyle(GhostButtonStyle())
                    .webDisabled(next == nil)
                }
            }

            Text("Hymn #\(current.number): \(current.title)")
                .font(.inter(24, weight: .bold))
                .foregroundStyle(Theme.foreground)
                .textSelection(.enabled)
        }
        .padding(.bottom, 24)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.border).frame(height: 1) }
    }
}
