import SwiftUI

/// Text with bold/italic runs and tappable scripture references, parsed from the simple HTML
/// used by the devotionals and hymns (`<p>`, `<br>`, `<b>`, `<strong>`, `<i>`, `<em>`,
/// `<ol>`, `<ul>`, `<li>` and entities). Mirrors the web's html-react-parser + BibleTagger.
struct RichText: Hashable {
    struct Run: Hashable {
        var text: String
        var bold = false
        var italic = false
        /// Set when this run is a scripture reference such as "John 3:16".
        var reference: String? = nil
    }

    var runs: [Run]

    var plainText: String { runs.map(\.text).joined() }
    var isEmpty: Bool { plainText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

    /// Parses HTML; with `tagReferences` every scripture reference becomes its own tappable run.
    static func parse(html: String, tagReferences: Bool = true) -> RichText {
        var parser = HTMLTextParser()
        let text = parser.parse(html)
        return tagReferences ? text.taggingReferences() : text
    }

    static func plain(_ text: String, tagReferences: Bool = true) -> RichText {
        let rich = RichText(runs: [Run(text: text)])
        return tagReferences ? rich.taggingReferences() : rich
    }

    func taggingReferences() -> RichText {
        var result: [Run] = []
        for run in runs {
            guard run.reference == nil else { result.append(run); continue }
            var cursor = run.text.startIndex
            for range in BibleReferences.references(in: run.text) {
                if range.lowerBound > cursor {
                    result.append(Run(text: String(run.text[cursor..<range.lowerBound]), bold: run.bold, italic: run.italic))
                }
                let reference = String(run.text[range])
                result.append(Run(text: reference, bold: run.bold, italic: run.italic, reference: reference))
                cursor = range.upperBound
            }
            if cursor < run.text.endIndex {
                result.append(Run(text: String(run.text[cursor...]), bold: run.bold, italic: run.italic))
            }
        }
        return RichText(runs: result)
    }

    /// Renders the runs in Inter at `size`. References are links in the primary colour.
    func attributedString(size: Double, weight: Font.Weight = .regular, color: Color? = nil) -> AttributedString {
        var result = AttributedString()
        for run in runs {
            var piece = AttributedString(run.text)
            piece.font = .inter(size, weight: run.bold ? .bold : weight, italic: run.italic)
            if let reference = run.reference {
                piece.link = BibleState.url(for: reference)
                piece.foregroundColor = Theme.primary
            } else if let color {
                piece.foregroundColor = color
            }
            result.append(piece)
        }
        return result
    }
}

private struct HTMLTextParser {
    private var runs: [RichText.Run] = []
    private var current = ""
    private var emitted = ""
    private var bold = 0
    private var italic = 0
    private var lists: [(ordered: Bool, index: Int)] = []

    mutating func parse(_ html: String) -> RichText {
        let scalars = Array(html.unicodeScalars)
        var index = 0

        while index < scalars.count {
            let scalar = scalars[index]
            if scalar == "<", let close = scalars[index...].firstIndex(of: ">") {
                let tag = String(String.UnicodeScalarView(scalars[(index + 1)..<close]))
                if tag.hasPrefix("!--"), let end = findSequence("-->", in: scalars, from: index) {
                    index = end
                    continue
                }
                handle(tag: tag)
                index = close + 1
            } else if scalar == "&", let semicolon = scalars[index...].prefix(12).firstIndex(of: ";") {
                let entity = String(String.UnicodeScalarView(scalars[(index + 1)..<semicolon]))
                if let decoded = Self.decode(entity: entity) {
                    appendText(decoded)
                    index = semicolon + 1
                } else {
                    appendText("&")
                    index += 1
                }
            } else {
                appendText(String(scalar))
                index += 1
            }
        }

        flush()
        trimTrailingWhitespace(includingNewlines: true)
        return RichText(runs: runs.filter { !$0.text.isEmpty })
    }

    private func findSequence(_ sequence: String, in scalars: [Unicode.Scalar], from start: Int) -> Int? {
        let needle = Array(sequence.unicodeScalars)
        var index = start
        while index + needle.count <= scalars.count {
            if Array(scalars[index..<(index + needle.count)]) == needle {
                return index + needle.count
            }
            index += 1
        }
        return nil
    }

    private mutating func handle(tag rawTag: String) {
        let isClosing = rawTag.hasPrefix("/")
        let body = isClosing ? rawTag.dropFirst() : Substring(rawTag)
        let name = body.prefix { !$0.isWhitespace && $0 != "/" }.lowercased()

        switch name {
        case "p", "div", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "section", "article":
            ensureBreak(2)
        case "br":
            trimTrailingWhitespace(includingNewlines: false)
            appendRaw("\n")
        case "ol", "ul":
            if isClosing {
                if !lists.isEmpty { lists.removeLast() }
                ensureBreak(lists.isEmpty ? 2 : 1)
            } else {
                ensureBreak(lists.isEmpty ? 2 : 1)
                lists.append((ordered: name == "ol", index: 0))
            }
        case "li":
            ensureBreak(1)
            if !isClosing {
                if let last = lists.last, last.ordered {
                    lists[lists.count - 1].index += 1
                    appendRaw("\(lists[lists.count - 1].index). ")
                } else {
                    appendRaw("• ")
                }
            }
        case "b", "strong":
            flush()
            bold = max(0, bold + (isClosing ? -1 : 1))
        case "i", "em":
            flush()
            italic = max(0, italic + (isClosing ? -1 : 1))
        default:
            break
        }
    }

    private mutating func appendText(_ text: String) {
        for character in text {
            if character.isWhitespace || character.isNewline || character == "\u{00A0}" {
                if let last = emitted.last, !(last.isWhitespace || last.isNewline) {
                    appendRaw(" ")
                }
            } else {
                appendRaw(String(character))
            }
        }
    }

    private mutating func appendRaw(_ text: String) {
        current += text
        emitted += text
    }

    private mutating func flush() {
        guard !current.isEmpty else { return }
        runs.append(RichText.Run(text: current, bold: bold > 0, italic: italic > 0))
        current = ""
    }

    private mutating func ensureBreak(_ count: Int) {
        trimTrailingWhitespace(includingNewlines: false)
        guard !emitted.isEmpty else { return }
        var trailing = 0
        for character in emitted.reversed() {
            if character == "\n" { trailing += 1 } else { break }
        }
        if trailing < count {
            appendRaw(String(repeating: "\n", count: count - trailing))
        }
    }

    private mutating func trimTrailingWhitespace(includingNewlines: Bool) {
        func shouldTrim(_ character: Character) -> Bool {
            includingNewlines ? (character.isWhitespace || character.isNewline) : (character == " ")
        }
        while let last = emitted.last, shouldTrim(last) {
            emitted.removeLast()
            if !current.isEmpty {
                current.removeLast()
            } else if !runs.isEmpty {
                runs[runs.count - 1].text.removeLast()
                if runs[runs.count - 1].text.isEmpty { runs.removeLast() }
            }
        }
    }

    private static let namedEntities: [String: String] = [
        "nbsp": " ", "amp": "&", "lt": "<", "gt": ">", "quot": "\"", "apos": "'",
        "rsquo": "\u{2019}", "lsquo": "\u{2018}", "rdquo": "\u{201D}", "ldquo": "\u{201C}",
        "hellip": "\u{2026}", "mdash": "\u{2014}", "ndash": "\u{2013}", "copy": "\u{00A9}",
    ]

    private static func decode(entity: String) -> String? {
        if entity.hasPrefix("#x") || entity.hasPrefix("#X") {
            return UInt32(entity.dropFirst(2), radix: 16).flatMap(Unicode.Scalar.init).map { String(Character($0)) }
        }
        if entity.hasPrefix("#") {
            return UInt32(entity.dropFirst()).flatMap(Unicode.Scalar.init).map { String(Character($0)) }
        }
        return namedEntities[entity]
    }
}
