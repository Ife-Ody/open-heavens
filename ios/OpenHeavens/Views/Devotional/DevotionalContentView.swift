import SwiftUI

/// `<PostTemplate />`: the devotional article, section by section, at the user's font size.
struct DevotionalContentView: View {
    @Environment(AppSettings.self) private var settings
    @Environment(\.devotionalStore) private var store

    let devotional: Devotional
    var onPrevious: (() -> Void)?
    var onNext: (() -> Void)?

    private var fontSize: Double { settings.fontSize }

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            header

            section("Memory Verse") {
                Text(devotional.translation.memoryText)
                    .font(.inter(fontSize, italic: true))
                    .foregroundStyle(Theme.mutedForeground)
                    .lineHeight(fontSize * 1.5, fontSize: fontSize)
                    .padding(.vertical, 12)
                    .padding(.leading, 24)
                    .padding(.trailing, 12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .overlay(alignment: .leading) {
                        Rectangle().fill(Theme.border).frame(width: 2)
                    }
                    .textSelection(.enabled)
                RichTextView(
                    text: RichText(runs: RichText.plain(devotional.memoryVerseReference).runs + [RichText.Run(text: " (KJV)")]),
                    weight: .semibold,
                    color: Theme.primary
                )
            }

            if !devotional.bibleReading.isEmpty {
                section("Read") {
                    RichTextView(text: RichText.plain(devotional.bibleReading), weight: .semibold, color: Theme.primary)
                }
            }

            section("Message") {
                RichTextView(text: RichText.parse(html: devotional.translation.bodyHtml), color: Theme.foreground, lineHeight: 28)
                    .textSelection(.enabled)
            }

            if let heading = devotional.pointHeading, let point = devotional.translation.pointText, !point.isEmpty {
                section(heading) {
                    RichTextView(text: RichText.plain(point), color: Theme.foreground, lineHeight: 28)
                        .textSelection(.enabled)
                }
            }

            if !devotional.biblePlan.isEmpty {
                section("Bible in one Year") {
                    RichTextView(text: RichText.plain(devotional.biblePlan), weight: .semibold, color: Theme.primary)
                }
            }

            if let hymnId = devotional.hymnId, let hymn = store?.hymn(id: hymnId) {
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeading(title: "Hymn")
                    HymnSection(hymn: hymn)
                }
            }

            navigation
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(DateKey.postDate(devotional.date))
                .font(.inter(fontSize, weight: .light))
                .foregroundStyle(Theme.mutedForeground)

            Text(devotional.title)
                .font(.inter(fontSize * 1.5, weight: .semibold))
                .foregroundStyle(Theme.foreground)
                .textSelection(.enabled)

            AuthorDisplay()

            if let audioURL = devotional.audioURL {
                AudioPlayerBar(url: audioURL, title: "Listen to this devotional", subtitle: "Pastor E.A. Adeboye")
            }
        }
    }

    private var navigation: some View {
        HStack {
            Button {
                onPrevious?()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "chevron.left").font(.system(size: 13, weight: .semibold))
                    Text("Previous Day")
                }
            }
            .buttonStyle(SecondaryButtonStyle())
            .webDisabled(onPrevious == nil)

            Spacer()

            Button {
                onNext?()
            } label: {
                HStack(spacing: 8) {
                    Text("Next Day")
                    Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                }
            }
            .buttonStyle(SecondaryButtonStyle())
            .webDisabled(onNext == nil)
        }
        .padding(.top, 24)
    }

    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionHeading(title: title)
            content()
        }
        .accessibilityElement(children: .contain)
    }
}

/// The `<Hymn />` block inside the post: title, YouTube embed, lyrics and links.
private struct HymnSection: View {
    @Environment(AppSettings.self) private var settings
    let hymn: Hymn

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text("Title: \(hymn.title)".uppercased())
                .font(.inter(settings.fontSize, weight: .bold))
                .foregroundStyle(Theme.foreground)

            if let embedURL = hymn.youtubeEmbedURL {
                YouTubeEmbedView(embedURL: embedURL)
                    .aspectRatio(16 / 9, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
            }

            RichTextView(text: RichText.parse(html: hymn.lyricsHtml, tagReferences: false), color: Theme.foreground)

            NavigationLink(value: hymn) {
                Text("Go to Hymn \(hymn.number): \(hymn.title)")
                    .font(.inter(settings.fontSize))
                    .foregroundStyle(Theme.primary)
                    .multilineTextAlignment(.leading)
            }
            .buttonStyle(.plain)

            BrowseAllHymnsLink()
        }
    }
}

/// "Browse all hymns" switches to the Hymns tab via the tab selection in the environment.
private struct BrowseAllHymnsLink: View {
    @Environment(AppSettings.self) private var settings
    @Environment(\.selectTab) private var selectTab

    var body: some View {
        Button("Browse all hymns") { selectTab(.hymns) }
            .font(.inter(settings.fontSize))
            .foregroundStyle(Theme.primary)
            .buttonStyle(.plain)
    }
}
