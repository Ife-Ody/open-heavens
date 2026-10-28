import SwiftUI

/// The book → chapter popover from the web's BibleHeader.
struct BookChapterPicker: View {
    enum Mode {
        case bookAndChapter
        case chapterOnly
    }

    let mode: Mode

    @Environment(BibleState.self) private var bible
    @Environment(\.dismiss) private var dismiss
    @State private var step: Step = .book
    @State private var selectedBook: BibleStore.Book?

    private enum Step { case book, chapter }

    private var book: BibleStore.Book { selectedBook ?? bible.book }

    var body: some View {
        VStack(spacing: 0) {
            selectorHeader
            Rectangle().fill(Theme.border).frame(height: 1)
            if step == .book {
                bookList
            } else {
                chapterGrid
            }
        }
        .background(Theme.background)
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .presentationBackground(Theme.background)
        .onAppear {
            step = mode == .bookAndChapter ? .book : .chapter
            selectedBook = bible.book
        }
    }

    private var selectorHeader: some View {
        HStack {
            ZStack {
                if step == .chapter && mode == .bookAndChapter {
                    Button {
                        step = .book
                    } label: {
                        Image(systemName: "arrow.left")
                            .font(.system(size: 15))
                            .foregroundStyle(Theme.mutedForeground)
                            .frame(width: 40, height: 48)
                    }
                    .accessibilityLabel("Back to books")
                }
            }
            .frame(width: 40)

            Spacer()
            Text(step == .book ? "BOOK" : "CHAPTER")
                .font(.inter(14, weight: .semibold))
                .tracking(1)
                .foregroundStyle(Theme.foreground)
            Spacer()

            Button("CANCEL") { dismiss() }
                .font(.inter(14, weight: .medium))
                .foregroundStyle(Theme.mutedForeground)
                .frame(height: 48)
                .padding(.horizontal, 12)
        }
        .padding(.top, 12)
        .background(Theme.muted.opacity(0.4))
    }

    private var bookList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(bible.store?.books ?? []) { candidate in
                        Button {
                            selectedBook = candidate
                            step = .chapter
                        } label: {
                            Text(candidate.name)
                                .font(.inter(14))
                                .foregroundStyle(Theme.foreground)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(candidate == book ? Theme.secondary.opacity(0.6) : .clear)
                        }
                        .buttonStyle(CellButtonStyle())
                        .id(candidate.number)
                        Rectangle().fill(Theme.border).frame(height: 1)
                    }
                }
            }
            .onAppear { proxy.scrollTo(book.number, anchor: .center) }
        }
    }

    private var chapterGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 0), count: 5)
        return ScrollView {
            LazyVGrid(columns: columns, spacing: 0) {
                ForEach(1...max(book.chapters, 1), id: \.self) { chapter in
                    Button {
                        bible.show(book: book, chapter: chapter)
                        dismiss()
                    } label: {
                        Text("\(chapter)")
                            .font(.inter(18))
                            .foregroundStyle(Theme.foreground)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(chapter == bible.chapter && book == bible.book ? Theme.secondary.opacity(0.6) : .clear)
                            .overlay(alignment: .trailing) { Rectangle().fill(Theme.border).frame(width: 1) }
                            .overlay(alignment: .bottom) { Rectangle().fill(Theme.border).frame(height: 1) }
                    }
                    .buttonStyle(CellButtonStyle())
                }
            }
            .overlay(alignment: .top) { Rectangle().fill(Theme.border).frame(height: 1) }
            .overlay(alignment: .leading) { Rectangle().fill(Theme.border).frame(width: 1) }
        }
    }
}

/// Grid cells and list rows: instant background highlight on touch-down.
private struct CellButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(configuration.isPressed ? Theme.secondary : .clear)
    }
}
