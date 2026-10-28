import Foundation

/// A Swift port of the web app's `bible-utils.ts` / `@repo/bible` reference handling:
/// finding scripture references in text, parsing them, and normalising book names.
enum BibleReferences {
    // MARK: Detection (getBibleReferenceRegex)

    private static let booksPattern = #"Genesis|Gen|Ge|Gn|Exodus|Ex|Exod?|Leviticus|Lev?|Lv|Levit?|Numbers|Nu|Nm|Hb|Nmb|Numb?|Deuteronomy|Deut?|De|Dt|Joshua|Josh?|Jsh|Judges|Jdgs?|Judg?|Jug|Jd|Ruth|Rut|Ru|Rth|(?:1|2|First|Second)\s*Samuel|Sam?|Sml|(?:1|2|First|Second)\s*Kings|Kngs?|Kgs|Kin?|(?:1|2|First|Second)\s*Chronicles|(?:1|2)\s*Chro|Chr?|Chron|Ezra|Ez|Nehemiah|Nehem?|Ne|Esther|Esth?|Es|Job|Jb|Psalms?|Psalm|Psam|Psa?|Pss|Psm|Proverbs?|Prov?|Prv|Pr|Ecclesiastes|Eccl?|Eccles|Ecc?|Song\s*of\s*Solomon|Songs?\s*of\s*Solomon|Song?|So|Songs|Isaiah|Isai|Isa|Is|Jeremiah|Jer?|Jr|Jerem|Lamentations|Lamentation|Lam|Lament?|Ezekiel|Ezek?|Ezk|Eze|Daniel|Dan?|Dn|Hosea|Hos?|Joel|Jo|Amos|Amo|Am|Obadiah|Obad?|Ob|Jonah|Jon|Jnh|Micah|Mi?c|Nahum|Nah?|Habakkuk|Ha?b|Habak|Zephaniah|Ze?ph?|Haggai|Ha?g|Hagg|Zechariah|Zech?|Ze?c|Malachi|Malac?|Ma?l|Mat{1,2}hew|Mat?|Matt?|Mt|Mark?|Mar|Mrk?|Mk|Luke|Lu?k|Lk|John?|Jhn|Jo|Jn|Acts?|Act|Ac|Romans|Rom?|Rm|(?:1|2|First|Second)\s*Corinthians|Cor?|Corin|Galatians|Gal?|Galat|Ephesians|Eph|Ephes|Philippians|Phi|Phili?|Php|Pp|Colossians|Col?|Colos|(?:1|2|First|Second)\s*Thessalonians|Thess?|Th|(?:1|2|First|Second)\s*Timothy|Tim?|Titus|Tts|Tit?|Philemon|Phm?|Philem|Pm|Hebrews|Hebr?|James|Jam|Jms?|Jas|(?:1|2|First|Second)\s*Peter|Pete?|Pe|Pt|(?:1|2|3|First|Second|Third)\s*John?|Jhn|Jo|Jn|Jude?|Jd|Ju|Revelations?|Revelation|Rev?|Revel"#
    private static let volumePrefixes = #"I+|1st|2nd|3rd|First|Second|Third|1|2|3"#
    private static let versePattern = #"\d+(?:[:;]\d+(?:(?:\s*[-–—]\s*\d+(?:[:;]\d+)?)|(?:\s*,\s*(?:\d+(?:[:;]\d+)?(?:\s*[-–—]\s*\d+)?))*)?)?"#

    static let referenceRegex: NSRegularExpression = {
        let pattern = #"\b(?:(?:"# + volumePrefixes + #")\s?)?(?:"# + booksPattern + #")\.?\s?"# + versePattern + #"\b"#
        return try! NSRegularExpression(pattern: pattern, options: [.caseInsensitive])
    }()

    /// Ranges of scripture references found in `text`.
    static func references(in text: String) -> [Range<String.Index>] {
        let nsRange = NSRange(text.startIndex..., in: text)
        return referenceRegex.matches(in: text, range: nsRange).compactMap { Range($0.range, in: text) }
    }

    // MARK: Parsing (parseBibleReference)

    struct Parsed: Hashable {
        var book: String
        var startChapter: Int
        var endChapter: Int
        var startVerse: Int?
        var endVerse: Int?
        var selectedVerses: [Int]?

        /// The verse numbers a tap should highlight (extractSelectedVerses); empty for whole chapters.
        var verseSelection: [Int] {
            if let selectedVerses { return selectedVerses }
            guard let startVerse, let endVerse, startVerse <= endVerse else { return [] }
            return Array(startVerse...endVerse)
        }
    }

    private static func regex(_ pattern: String, _ options: NSRegularExpression.Options = []) -> NSRegularExpression {
        try! NSRegularExpression(pattern: pattern, options: options)
    }

    private static let spaces = regex(#"\s+"#)
    private static let bookPunctuation = regex(#"([A-Za-z])\.\s*(\d)"#)
    private static let compactReference = regex(#"^((?:\d+\s*)?[A-Za-z]+(?:\s+(?:of|and|the|[A-Za-z]+))*)(\d)"#, [.caseInsensitive])
    private static let semicolonVerse = regex(#"(\d)\s*;\s*(\d)"#)
    private static let bookAndPassage = regex(#"^((?:\d+\s*)?[A-Za-z]+(?:(?:\s+(?:of|and|the|[A-Za-z]+))*)?)\s+(.+)$"#, [.caseInsensitive])
    private static let dashes = CharacterSet(charactersIn: "-–—")

    static func parse(_ reference: String) -> Parsed? {
        var text = reference.trimmingCharacters(in: .whitespacesAndNewlines)
        text = spaces.stringByReplacingMatches(in: text, range: NSRange(text.startIndex..., in: text), withTemplate: " ")
        text = bookPunctuation.stringByReplacingMatches(in: text, range: NSRange(text.startIndex..., in: text), withTemplate: "$1 $2")
        text = compactReference.stringByReplacingMatches(in: text, range: NSRange(text.startIndex..., in: text), withTemplate: "$1 $2")
        text = semicolonVerse.stringByReplacingMatches(in: text, range: NSRange(text.startIndex..., in: text), withTemplate: "$1:$2")

        guard let match = bookAndPassage.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)),
              let bookRange = Range(match.range(at: 1), in: text),
              let passageRange = Range(match.range(at: 2), in: text) else { return nil }

        let book = BookNames.canonical(String(text[bookRange]))
        let passage = String(text[passageRange])

        func number(_ value: Substring) -> Int? { Int(value.trimmingCharacters(in: .whitespaces)) }
        func hasDash(_ value: Substring) -> Bool { value.unicodeScalars.contains { dashes.contains($0) } }
        func splitDash(_ value: Substring) -> [Substring] { value.split(maxSplits: 1, whereSeparator: { $0.unicodeScalars.allSatisfy(dashes.contains) }) }

        // Comma-separated verses, e.g. "3:16, 18, 20-22"
        if passage.contains(",") {
            var verses: [Int] = []
            var mainChapter: Int?
            for part in passage.split(separator: ",").map({ $0.trimmingCharacters(in: .whitespaces)[...] }) {
                if part.contains(":") {
                    let pieces = part.split(separator: ":", maxSplits: 1)
                    guard pieces.count == 2, let chapter = number(pieces[0]) else { continue }
                    if mainChapter == nil { mainChapter = chapter }
                    let verseText = pieces[1]
                    if hasDash(verseText) {
                        let bounds = splitDash(verseText)
                        if bounds.count == 2, let start = number(bounds[0]), let end = number(bounds[1]), start <= end {
                            verses.append(contentsOf: start...end)
                        }
                    } else if let verse = number(verseText) {
                        verses.append(verse)
                    }
                } else if hasDash(part) {
                    let bounds = splitDash(part)
                    if bounds.count == 2, let start = number(bounds[0]), let end = number(bounds[1]), mainChapter != nil, start <= end {
                        verses.append(contentsOf: start...end)
                    }
                } else if let verse = number(part), mainChapter != nil {
                    verses.append(verse)
                }
            }
            if let mainChapter, !verses.isEmpty {
                return Parsed(book: book, startChapter: mainChapter, endChapter: mainChapter,
                              startVerse: verses.min(), endVerse: verses.max(), selectedVerses: verses)
            }
        }

        if hasDash(passage[...]) {
            let bounds = splitDash(passage[...])
            guard bounds.count == 2 else { return nil }
            let start = bounds[0], end = bounds[1]
            if start.contains(":") && !end.contains(":") {
                // "20:1-30"
                let pieces = start.split(separator: ":", maxSplits: 1)
                guard pieces.count == 2, let chapter = number(pieces[0]), let startVerse = number(pieces[1]), let endVerse = number(end) else { return nil }
                return Parsed(book: book, startChapter: chapter, endChapter: chapter, startVerse: startVerse, endVerse: endVerse)
            } else if start.contains(":") || end.contains(":") {
                // "32:1-35:10"
                let startPieces = start.split(separator: ":", maxSplits: 1)
                guard startPieces.count == 2, let startChapter = number(startPieces[0]), let startVerse = number(startPieces[1]) else { return nil }
                let endChapter: Int, endVerse: Int
                if end.contains(":") {
                    let endPieces = end.split(separator: ":", maxSplits: 1)
                    guard endPieces.count == 2, let chapter = number(endPieces[0]), let verse = number(endPieces[1]) else { return nil }
                    endChapter = chapter
                    endVerse = verse
                } else {
                    guard let verse = number(end) else { return nil }
                    endChapter = startChapter
                    endVerse = verse
                }
                return Parsed(book: book, startChapter: startChapter, endChapter: endChapter, startVerse: startVerse, endVerse: endVerse)
            } else {
                // "32-35"
                guard let startChapter = number(start), let endChapter = number(end) else { return nil }
                return Parsed(book: book, startChapter: startChapter, endChapter: endChapter)
            }
        }

        if passage.contains(":") {
            let pieces = passage.split(separator: ":", maxSplits: 1)
            guard pieces.count == 2, let chapter = number(pieces[0]) else { return nil }
            let verseText = pieces[1]
            if hasDash(verseText) {
                let bounds = splitDash(verseText)
                guard bounds.count == 2, let startVerse = number(bounds[0]), let endVerse = number(bounds[1]) else { return nil }
                return Parsed(book: book, startChapter: chapter, endChapter: chapter, startVerse: startVerse, endVerse: endVerse)
            }
            guard let verse = number(verseText) else { return nil }
            return Parsed(book: book, startChapter: chapter, endChapter: chapter, startVerse: verse, endVerse: verse)
        }

        guard let chapter = number(passage[...]) else { return nil }
        return Parsed(book: book, startChapter: chapter, endChapter: chapter)
    }
}

/// Canonical Bible book names and their aliases (`@repo/bible` createBookAliasMap + bible-utils BOOK_NAME_MAP).
enum BookNames {
    static let canonicalOrder: [String] = [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
        "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
        "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark",
        "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
        "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
        "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
    ]

    private static let aliases: [String: [String]] = [
        "Genesis": ["gen", "ge", "gn"],
        "Exodus": ["exo", "exod", "ex"],
        "Leviticus": ["lev", "levit", "lv", "le"],
        "Numbers": ["num", "numb", "nu", "nm", "nmb", "hb"],
        "Deuteronomy": ["deut", "deu", "dt", "de"],
        "Joshua": ["josh", "jos", "jsh"],
        "Judges": ["judg", "jdg", "jdgs", "jug", "jud", "jd"],
        "Ruth": ["rth", "rut", "ru"],
        "1 Samuel": ["1 sam", "1sam", "1 sa", "1sa", "1samuel", "first samuel"],
        "2 Samuel": ["2 sam", "2sam", "2 sa", "2sa", "2samuel", "second samuel"],
        "1 Kings": ["1 kings", "1kings", "1 kgs", "1kgs", "1 ki", "1ki"],
        "2 Kings": ["2 kings", "2kings", "2 kgs", "2kgs", "2 ki", "2ki"],
        "1 Chronicles": ["1 chronicles", "1chronicles", "1 chr", "1chr", "1 chro", "1chro"],
        "2 Chronicles": ["2 chronicles", "2chronicles", "2 chr", "2chr", "2 chro", "2chro"],
        "Ezra": ["ezr", "ez"],
        "Nehemiah": ["neh", "nehem", "ne"],
        "Esther": ["esth", "est", "es"],
        "Job": ["jb"],
        "Psalms": ["ps", "psa", "psalm", "psalms", "psm", "pss", "psam"],
        "Proverbs": ["prov", "pro", "prv", "pr"],
        "Ecclesiastes": ["eccl", "ecc", "eccles"],
        "Song of Solomon": ["song", "songs", "song of songs", "sos", "canticles"],
        "Isaiah": ["isa", "isai", "is"],
        "Jeremiah": ["jer", "jr", "jerem"],
        "Lamentations": ["lam", "lamentation"],
        "Ezekiel": ["ezek", "ezk", "eze"],
        "Daniel": ["dan", "dn"],
        "Hosea": ["hos", "ho"],
        "Joel": ["joe", "jl"],
        "Amos": ["amo", "am"],
        "Obadiah": ["obad", "ob"],
        "Jonah": ["jon", "jnh"],
        "Micah": ["mic", "mi"],
        "Nahum": ["nah", "na"],
        "Habakkuk": ["hab"],
        "Zephaniah": ["zeph", "zep", "zp"],
        "Haggai": ["hag", "hg"],
        "Zechariah": ["zech", "zec", "zc"],
        "Malachi": ["mal", "ml"],
        "Matthew": ["matt", "mat", "mt"],
        "Mark": ["mrk", "mar", "mk", "mr"],
        "Luke": ["luk", "lk", "lu"],
        "John": ["jhn", "joh", "jn"],
        "Acts": ["act", "ac"],
        "Romans": ["rom", "rm", "ro"],
        "1 Corinthians": ["1 cor", "1cor", "1 co", "1co", "1corinthians"],
        "2 Corinthians": ["2 cor", "2cor", "2 co", "2co", "2corinthians"],
        "Galatians": ["gal", "galat", "ga"],
        "Ephesians": ["eph", "ephes", "ep"],
        "Philippians": ["phil", "php", "phl", "phi"],
        "Colossians": ["col", "colos"],
        "1 Thessalonians": ["1 thess", "1thess", "1 thes", "1thes", "1 th"],
        "2 Thessalonians": ["2 thess", "2thess", "2 thes", "2thes", "2 th"],
        "1 Timothy": ["1 tim", "1tim", "1 ti", "1ti"],
        "2 Timothy": ["2 tim", "2tim", "2 ti", "2ti"],
        "Titus": ["tit", "tts", "ti"],
        "Philemon": ["phm", "philem", "pm"],
        "Hebrews": ["heb", "hebr"],
        "James": ["jam", "jas", "jms"],
        "1 Peter": ["1 pet", "1pet", "1 pe", "1pe", "1 pt", "1pt"],
        "2 Peter": ["2 pet", "2pet", "2 pe", "2pe", "2 pt", "2pt"],
        "1 John": ["1 john", "1john", "1 jn", "1jn", "1 jhn", "1jhn", "1joh"],
        "2 John": ["2 john", "2john", "2 jn", "2jn", "2 jhn", "2jhn", "2joh"],
        "3 John": ["3 john", "3john", "3 jn", "3jn", "3 jhn", "3jhn", "3joh"],
        "Jude": ["jd", "ju"],
        "Revelation": ["rev", "revelations", "revelation", "rv", "apocalypse"],
    ]

    private static let aliasMap: [String: String] = {
        var map: [String: String] = [:]
        for name in canonicalOrder {
            map[lookupKey(name)] = name
            for alias in aliases[name] ?? [] {
                map[lookupKey(alias)] = name
            }
        }
        return map
    }()

    private static let ordinalPrefixes: [(NSRegularExpression, String)] = [
        (try! NSRegularExpression(pattern: #"^(first|1st|i)\b\.?"#, options: [.caseInsensitive]), "1"),
        (try! NSRegularExpression(pattern: #"^(second|2nd|ii)\b\.?"#, options: [.caseInsensitive]), "2"),
        (try! NSRegularExpression(pattern: #"^(third|3rd|iii)\b\.?"#, options: [.caseInsensitive]), "3"),
    ]
    private static let compactNumber = try! NSRegularExpression(pattern: #"^([123])([a-z])"#, options: [.caseInsensitive])
    private static let whitespace = try! NSRegularExpression(pattern: #"\s+"#)

    /// normalizeBookLookupKey
    static func lookupKey(_ book: String) -> String {
        var key = book.precomposedStringWithCompatibilityMapping.trimmingCharacters(in: .whitespacesAndNewlines)
        for (regex, replacement) in ordinalPrefixes {
            key = regex.stringByReplacingMatches(in: key, range: NSRange(key.startIndex..., in: key), withTemplate: replacement)
        }
        key = key.replacingOccurrences(of: ".", with: " ")
        key = compactNumber.stringByReplacingMatches(in: key, range: NSRange(key.startIndex..., in: key), withTemplate: "$1 $2")
        key = whitespace.stringByReplacingMatches(in: key, range: NSRange(key.startIndex..., in: key), withTemplate: " ")
        return key.trimmingCharacters(in: .whitespaces).lowercased()
    }

    /// The canonical name for a book name or abbreviation, e.g. "1 cor" -> "1 Corinthians".
    static func canonical(_ book: String) -> String {
        let key = lookupKey(book)
        if let name = aliasMap[key] { return name }
        if let first = key.first, "123".contains(first) {
            let rest = key.dropFirst().trimmingCharacters(in: .whitespaces)
            return "\(first) \(titleCase(rest))"
        }
        return titleCase(key)
    }

    static func number(of canonicalName: String) -> Int? {
        canonicalOrder.firstIndex(of: canonicalName).map { $0 + 1 }
    }

    private static func titleCase(_ value: String) -> String {
        value.split(separator: " ").map { $0.prefix(1).uppercased() + $0.dropFirst() }.joined(separator: " ")
    }
}
