// Comprehensive list of Bible book names and their abbreviations
export const BIBLE_BOOKS_PATTERN =
  "Genesis|Gen|Ge|Gn|Exodus|Ex|Exod?|Leviticus|Lev?|Lv|Levit?|Numbers|" +
  "Nu|Nm|Hb|Nmb|Numb?|Deuteronomy|Deut?|De|Dt|Joshua|Josh?|Jsh|Judges|Jdgs?|Judg?|Jd|Ruth|Ru|Rth|" +
  "(?:1|2|First|Second)\\s*Samuel|Sam?|Sml|(?:1|2|First|Second)\\s*Kings|Kngs?|Kgs|Kin?|" +
  "(?:1|2|First|Second)\\s*Chronicles|Chr?|Chron|Ezra|Ez|" +
  "Nehemiah|Nehem?|Ne|Esther|Esth?|Es|Job|Jb|Psalms?|Psa?|Pss|Psm|Proverbs?|Prov?|Prv|Pr|" +
  "Ecclesiastes|Eccl?|Eccles|Ecc?|Song\\s*of\\s*Solomon|Songs?\\s*of\\s*Solomon|Song?|So|Songs|Isaiah|Isa|Is|Jeremiah|" +
  "Jer?|Jr|Jerem|Lamentations|Lam|Lament?|Ezekiel|Ezek?|Ezk|Daniel|Dan?|Dn|Hosea|" +
  "Hos?|Joel|Jo|Amos|Am|Obadiah|Obad?|Ob|Jonah|Jon|Jnh|Micah|Mi?c|Nahum|Nah?|" +
  "Habakkuk|Ha?b|Habak|Zephaniah|Ze?ph?|Haggai|Ha?g|Hagg|Zechariah|Zech?|Ze?c|" +
  "Malachi|Malac?|Ma?l|Mat{1,2}hew|Mat?|Matt?|Mt|Mark?|Mrk?|Mk|Luke|Lu?k|Lk|John?|Jhn|Jo|Jn|" +
  "Acts?|Ac|Romans|Rom?|Rm|" +
  "(?:1|2|First|Second)\\s*Corinthians|Cor?|Corin|Galatians|Gal?|Galat|" +
  "Ephesians|Eph|Ephes|Philippians|Phili?|Php|Pp|Colossians|Col?|Colos|" +
  "(?:1|2|First|Second)\\s*Thessalonians|Thess?|Th|(?:1|2|First|Second)\\s*Timothy|Tim?|Titus|Tts|Tit?|Philemon|Phm?|Philem|Pm|" +
  "Hebrews|Hebr?|James|Jam|Jms?|Jas|(?:1|2|First|Second)\\s*Peter|Pete?|Pe|Pt|" +
  "(?:1|2|3|First|Second|Third)\\s*John?|Jhn|Jo|Jn|Jude?|Jd|Ju|Revelations?|Rev?|Revel";

// A map of book name variants to their canonical names
export const BOOK_NAME_MAP: Record<string, string> = {
  // Old Testament
  gen: "Genesis",
  ge: "Genesis",
  gn: "Genesis",
  ex: "Exodus",
  exod: "Exodus",
  exo: "Exodus",
  lev: "Leviticus",
  le: "Leviticus",
  lv: "Leviticus",
  levit: "Leviticus",
  num: "Numbers",
  nu: "Numbers",
  nm: "Numbers",
  hb: "Numbers",
  nmb: "Numbers",
  numb: "Numbers",
  deut: "Deuteronomy",
  deu: "Deuteronomy",
  de: "Deuteronomy",
  dt: "Deuteronomy",
  josh: "Joshua",
  jos: "Joshua",
  jsh: "Joshua",
  jdgs: "Judges",
  judg: "Judges",
  jdg: "Judges",
  jd: "Judges",
  ru: "Ruth",
  rth: "Ruth",
  "1 sam": "1 Samuel",
  "1 sa": "1 Samuel",
  "1 samuel": "1 Samuel",
  "first samuel": "1 Samuel",
  "1sam": "1 Samuel",
  "1sa": "1 Samuel",
  "2 sam": "2 Samuel",
  "2 sa": "2 Samuel",
  "2 samuel": "2 Samuel",
  "second samuel": "2 Samuel",
  "2sam": "2 Samuel",
  "2sa": "2 Samuel",
  // ... add more mappings as needed
};

/**
 * Parse a Bible reference string into its component parts
 * @param reference A Bible reference string like "John 3:16" or "Psalm 119:105-110"
 * @returns An object containing the parsed reference parts or null if parsing failed
 */
export function parseBibleReference(reference: string) {
  try {
    if (!reference) return null;

    // Normalize spaces - replace multiple spaces with a single space
    reference = reference.trim().replace(/\s+/g, " ");

    // Step 1: Split the reference into book and passage
    // This regex will match book names with numbers (like "1 Corinthians") and spaces
    const bookPattern = new RegExp(
      `^((?:\\d+\\s+)?[A-Za-z]+(?:\\s+(?:of|and|the|[A-Za-z]+))*?)\\s+(\\d+(?:.+)?)$`,
      "i",
    );
    const matches = reference.match(bookPattern);

    if (!matches) {
      console.error("Failed to match book pattern for:", reference);
      return null;
    }

    const [_, book, passage] = matches;
    if (!book || !passage) return null;

    // Normalize the book name
    const normalizedBook = normalizeBookName(book);

    // Now parse the passage part...
    // (rest of the parsing logic from BibleReference component)

    return {
      book: normalizedBook,
      // Add other parsed components here
    };
  } catch (error) {
    console.error("Error parsing reference:", error, "Reference:", reference);
    return null;
  }
}

/**
 * Normalize a Bible book name to its canonical form
 * @param bookName A Bible book name or abbreviation
 * @returns The canonical book name
 */
export function normalizeBookName(bookName: string): string {
  // Convert to lowercase, trim, and normalize spaces for consistent matching
  const normalizedName = bookName.toLowerCase().trim().replace(/\s+/g, " ");

  // Check if it's in our map of variants
  if (BOOK_NAME_MAP[normalizedName]) {
    return BOOK_NAME_MAP[normalizedName];
  }

  // If not in the map, use some basic rules to normalize
  // Handle numbered books like "1 john" -> "1 John"
  if (/^\d\s*[a-z]/.test(normalizedName)) {
    const [num, ...nameParts] = normalizedName.split(/\s+/);
    const name = nameParts.join(" ");
    // Capitalize first letter of the name part
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    return `${num} ${capitalizedName}`;
  }

  // For other cases, just capitalize the first letter of each word
  return normalizedName
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extracts all Bible references from a block of text
 * @param text Text that may contain Bible references
 * @returns Array of Bible reference strings
 */
export function extractBibleReferences(text: string): string[] {
  // Create a pattern that looks for Bible references
  // This is a simplified version, you'll want to enhance it
  const referencePattern = new RegExp(
    `(${BIBLE_BOOKS_PATTERN})\\s+(\\d+)(?::(\\d+)(?:\\s*[-–—]\\s*(\\d+))?)?`,
    "gi",
  );

  const matches = text.matchAll(referencePattern);
  const references: string[] = [];

  for (const match of matches) {
    references.push(match[0]);
  }

  return references;
}
