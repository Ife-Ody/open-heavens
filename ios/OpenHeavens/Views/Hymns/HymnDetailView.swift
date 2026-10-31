import SwiftUI

/// The web's `/hymns/[id]` page.
struct HymnDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppSettings.self) private var settings
    let hymn: Hymn

    /// Body copy follows the font size setting like the devotional does; headings scale with it.
    private var fontSize: Double { settings.fontSize }
    private var labelSize: Double { fontSize + 2 }
    private var titleSize: Double { fontSize * 1.5 }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header

                if let embedURL = hymn.youtubeEmbedURL {
                    YouTubeEmbedView(embedURL: embedURL)
                        .aspectRatio(16 / 9, contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.radiusXL, style: .continuous))
                        .shadow(color: .black.opacity(0.15), radius: 12, y: 6)
                } else {
                    Text("Invalid YouTube URL")
                        .font(.inter(fontSize))
                        .frame(maxWidth: .infinity)
                        .aspectRatio(16 / 9, contentMode: .fit)
                        .background(Theme.muted, in: RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
                }

                if let audioURL = hymn.audioURL {
                    AudioPlayerBar(url: audioURL, title: hymn.title, subtitle: "Hymn \(hymn.number) · audio")
                }

                if let youtubeURL = hymn.youtubeURL {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("YouTube Link:")
                            .font(.inter(labelSize, weight: .semibold))
                            .foregroundStyle(Theme.foreground)
                        Link(youtubeURL.absoluteString, destination: youtubeURL)
                            .font(.inter(fontSize))
                            .foregroundStyle(Theme.primary)
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Lyrics:")
                        .font(.inter(labelSize, weight: .semibold))
                        .foregroundStyle(Theme.foreground)
                    RichTextView(text: RichText.parse(html: hymn.lyricsHtml, tagReferences: false), color: Theme.foreground)
                        .textSelection(.enabled)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 24)
            .padding(.bottom, 48)
        }
        .background(Theme.background)
        .toolbar(.hidden, for: .navigationBar)
        .background(SwipeBackEnabler())
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 24) {
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
            .buttonStyle(LinkButtonStyle())

            Text("Hymn #\(hymn.number): \(hymn.title)")
                .font(.inter(titleSize, weight: .bold))
                .opticalTracking(for: titleSize)
                .lineHeight(titleSize * 1.25, fontSize: titleSize)
                .foregroundStyle(Theme.foreground)
                .textSelection(.enabled)
        }
        .padding(.bottom, 24)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.border).frame(height: 1) }
    }
}
