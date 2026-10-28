import SwiftUI

/// `<BibleReader />`: header (version, book, chapter), the verses, and prev/next chapter.
struct BibleReaderView: View {
    @Environment(BibleState.self) private var bible
    @Environment(AppSettings.self) private var settings
    @Environment(\.dismiss) private var dismiss

    var showsCloseButton: Bool

    @State private var showingBookPicker = false
    @State private var showingChapterPicker = false
    @State private var showingSearch = false

    var body: some View {
        VStack(spacing: 0) {
            header
                .padding(.horizontal, 8)
                .padding(.vertical, 8)
            Rectangle().fill(Theme.border).frame(height: 1)
            ScrollViewReader { proxy in
                ScrollView {
                    body_
                        .padding(.horizontal, 24)
                        .padding(.vertical, 16)
                        .id("top")
                }
                .onChange(of: bible.chapter) { _, _ in proxy.scrollTo("top", anchor: .top) }
                .onChange(of: bible.book) { _, _ in proxy.scrollTo("top", anchor: .top) }
            }
            footer
                .padding(.horizontal, 12)
                .padding(.vertical, 12)
        }
        .sheet(isPresented: $showingBookPicker) {
            BookChapterPicker(mode: .bookAndChapter)
        }
        .sheet(isPresented: $showingChapterPicker) {
            BookChapterPicker(mode: .chapterOnly)
        }
        .sheet(isPresented: $showingSearch) {
            BibleSearchSheet()
        }
    }

    // MARK: Header

    private var header: some View {
        HStack(spacing: 4) {
            HStack(spacing: 0) {
                Menu {
                    Picker("Version", selection: Binding(get: { settings.bibleVersion }, set: { settings.bibleVersion = $0 })) {
                        ForEach(bible.store?.versions ?? []) { version in
                            Text(version.shortName).tag(version.code)
                        }
                    }
                } label: {
                    HStack(spacing: 6) {
                        Text(settings.bibleVersion.uppercased())
                        Image(systemName: "chevron.down").font(.system(size: 11)).opacity(0.5)
                    }
                    .font(.inter(14))
                    .foregroundStyle(Theme.foreground)
                    .padding(.horizontal, 10)
                    .frame(width: 80, height: 32)
                }
                .background(Theme.background)
                .overlay(
                    UnevenRoundedRectangle(topLeadingRadius: Theme.radiusMD, bottomLeadingRadius: Theme.radiusMD)
                        .stroke(Theme.border, lineWidth: 1)
                )

                Button {
                    showingBookPicker = true
                } label: {
                    HStack {
                        Text(bible.book.name).lineLimit(1)
                        Spacer(minLength: 4)
                        Image(systemName: "chevron.down").font(.system(size: 11)).opacity(0.5)
                    }
                    .font(.inter(14))
                    .foregroundStyle(Theme.foreground)
                    .padding(.horizontal, 10)
                    .frame(width: 150, height: 32)
                }
                .background(Theme.background)
                .overlay(
                    UnevenRoundedRectangle(bottomTrailingRadius: Theme.radiusMD, topTrailingRadius: Theme.radiusMD)
                        .stroke(Theme.border, lineWidth: 1)
                )
            }

            Button {
                showingChapterPicker = true
            } label: {
                HStack {
                    Text("\(bible.chapter)")
                    Spacer(minLength: 4)
                    Image(systemName: "chevron.down").font(.system(size: 11)).opacity(0.5)
                }
                .font(.inter(14))
                .foregroundStyle(Theme.foreground)
                .padding(.horizontal, 10)
                .frame(width: 72, height: 32)
            }
            .background(Theme.background)
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusMD, style: .continuous).stroke(Theme.border, lineWidth: 1))

            Spacer(minLength: 0)

            Button {
                showingSearch = true
            } label: {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.mutedForeground)
            }
            .buttonStyle(GhostButtonStyle(size: 32))
            .accessibilityLabel("Search the Bible")

            if showsCloseButton {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.foreground)
                }
                .buttonStyle(GhostButtonStyle(size: 32))
                .accessibilityLabel("Close")
            }
        }
    }

    // MARK: Body

    private var body_: some View {
        let verses = bible.verses(version: settings.bibleVersion)
        let size = settings.fontSize
        return VStack(alignment: .leading, spacing: 16) {
            Text("\(bible.book.name) \(bible.chapter)")
                .font(.inter(24, weight: .bold))
                .foregroundStyle(Theme.foreground)

            ForEach(verses) { verse in
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("\(verse.verse)")
                        .font(.inter(14))
                        .foregroundStyle(Theme.mutedForeground)
                    Text(verse.text)
                        .font(.inter(size))
                        .foregroundStyle(Theme.foreground)
                        .lineHeight(size * 1.5, fontSize: size)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .textSelection(.enabled)
            }

            if verses.isEmpty {
                Text("No verses found for \(bible.book.name) \(bible.chapter).")
                    .font(.inter(size))
                    .foregroundStyle(Theme.mutedForeground)
            }

            if !bible.selectedVerses.isEmpty {
                Button("show full chapter") { bible.showFullChapter() }
                    .buttonStyle(OutlineButtonStyle(radius: 18))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: Footer

    private var footer: some View {
        HStack {
            Button {
                bible.previousChapter()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "chevron.left").font(.system(size: 12, weight: .semibold))
                    Text("Previous Chapter")
                }
            }
            .buttonStyle(OutlineButtonStyle(height: 32, horizontalPadding: 12, radius: 16))
            .webDisabled(bible.chapter <= 1)

            Spacer()

            Button {
                bible.nextChapter()
            } label: {
                HStack(spacing: 8) {
                    Text("Next Chapter")
                    Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold))
                }
            }
            .buttonStyle(OutlineButtonStyle(height: 32, horizontalPadding: 12, radius: 16))
            .webDisabled(bible.chapter >= bible.maxChapter)
        }
    }
}
