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
                .padding(.leading, 8)
                .padding(.trailing, 8)
                // Inside the sheet the top corners are rounded and the grabber sits above the
                // controls, so the bar starts a little lower than it does at the top of a tab.
                .padding(.top, showsCloseButton ? 10 : 2)
                .padding(.bottom, 2)
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
                .sensoryFeedback(.selection, trigger: bible.chapter)
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

    /// Version | Book | Chapter as one flat bar: no outer border (the sheet's own rounded
    /// corners would never match a bordered button's radius), only hairlines between controls.
    private var header: some View {
        HStack(spacing: 0) {
            Menu {
                Picker("Version", selection: Binding(get: { settings.bibleVersion }, set: { settings.bibleVersion = $0 })) {
                    ForEach(bible.store?.versions ?? []) { version in
                        Text(version.shortName).tag(version.code)
                    }
                }
            } label: {
                headerLabel(settings.bibleVersion.uppercased())
            }
            .buttonStyle(HeaderControlStyle())

            headerDivider

            Button {
                showingBookPicker = true
            } label: {
                headerLabel(bible.book.name)
            }
            .buttonStyle(HeaderControlStyle())

            headerDivider

            Button {
                showingChapterPicker = true
            } label: {
                headerLabel("\(bible.chapter)")
            }
            .buttonStyle(HeaderControlStyle())

            Spacer(minLength: 4)

            Button {
                showingSearch = true
            } label: {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 15))
                    .foregroundStyle(Theme.mutedForeground)
            }
            .buttonStyle(GhostButtonStyle(size: 36))
            .accessibilityLabel("Search the Bible")

            if showsCloseButton {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.foreground)
                }
                .buttonStyle(GhostButtonStyle(size: 36))
                .accessibilityLabel("Close")
            }
        }
        .frame(height: 44)
    }

    private func headerLabel(_ text: String) -> some View {
        HStack(spacing: 6) {
            Text(text).lineLimit(1)
            Image(systemName: "chevron.down")
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(Theme.mutedForeground)
        }
        .font(.inter(15, weight: .medium))
        .foregroundStyle(Theme.foreground)
        .padding(.horizontal, 12)
        .frame(height: 36)
        .contentShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var headerDivider: some View {
        Rectangle().fill(Theme.border).frame(width: 1, height: 18)
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

/// The version/book/chapter controls: a soft highlight on press, no scaling (they sit flush in a bar).
private struct HeaderControlStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(configuration.isPressed ? Theme.secondary : .clear, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            .animation(Motion.press, value: configuration.isPressed)
    }
}
