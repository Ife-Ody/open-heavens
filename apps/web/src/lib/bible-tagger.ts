interface BibleTaggerConfig {
  element?: string;
  maxNodes?: number;
  newWindow?: boolean;
  version?: string;
  showArticlesLink?: boolean;
  fontSize?: string;
  translation?: string;
  customCSS?: boolean;
  parseAnchors?: boolean;
}

interface BibleVerse {
  bookname: string;
  chapter: string;
  verse: string;
  text: string;
}

export class BibleTagger {
  private element: string = "";
  private maxNodes: number = 500;
  private newWindow: boolean = true;
  private version: string = "kjv";
  private isVisible: boolean = false;
  private currentPassage: string = "";
  private delayTimer: NodeJS.Timeout | null = null;
  private hideTimer: NodeJS.Timeout | null = null;
  private mouseOnDiv: boolean = false;
  private xPos: number = 0;
  private yPos: number = 0;
  private translation: string = "kjv";
  private isTouch: boolean =
    typeof window !== "undefined" &&
    (!!("ontouchstart" in window) || !!("onmsgesturechange" in window));
  private skipRe: string = "^(script|style|textarea|h1|h2|cite|a)$";

  constructor(config?: BibleTaggerConfig) {
    if (config) {
      Object.assign(this, config);
    }
  }

  private getBooks(): string {
    if (this.translation === "kjv") {
      return (
        "Genesis|Gen|Ge|Gn|Exodus|Ex|Exod?|Leviticus|Lev?|Lv|Levit?|Numbers|" +
        "Nu|Nm|Hb|Nmb|Numb?|Deuteronomy|Deut?|De|Dt|Joshua|Josh?|Jsh|Judges|Jdgs?|Judg?|Jd|Ruth|Ru|Rth|" +
        "Samuel|Sam?|Sml|Kings|Kngs?|Kgs|Kin?|Chronicles|Chr?|Chron|Ezra|Ez|" +
        "Nehemiah|Nehem?|Ne|Esther|Esth?|Es|Job|Jb|Psalms?|Psa?|Pss|Psm|Proverbs?|Prov?|Prv|Pr|" +
        "Ecclesiastes|Eccl?|Eccles|Ecc?|Songs?ofSolomon|Song?|So|Songs|Isaiah|Isa|Is|Jeremiah|" +
        "Jer?|Jr|Jerem|Lamentations|Lam|Lament?|Ezekiel|Ezek?|Ezk|Daniel|Dan?|Dn|Hosea|" +
        "Hos?|Joel|Jo|Amos|Am|Obadiah|Obad?|Ob|Jonah|Jon|Jnh|Micah|Mi?c|Nahum|Nah?|" +
        "Habakkuk|Ha?b|Habak|Zephaniah|Ze?ph?|Haggai|Ha?g|Hagg|Zechariah|Zech?|Ze?c|" +
        "Malachi|Malac?|Ma?l|Mat{1,2}hew|Mat?|Matt?|Mt|Mark?|Mrk?|Mk|Luke|Lu?k|Lk|John?|Jhn|Jo|Jn|" +
        "Acts?|Ac|Romans|Rom?|Rm|Corinthians|Cor?|Corin|Galatians|Gal?|Galat|" +
        "Ephesians|Eph|Ephes|Philippians|Phili?|Php|Pp|Colossians|Col?|Colos|" +
        "Thessalonians|Thess?|Th|Timothy|Tim?|Titus|Tts|Tit?|Philemon|Phm?|Philem|Pm|" +
        "Hebrews|Hebr?|James|Jam|Jms?|Jas|Peter|Pete?|Pe|Pt|Jude?|Jd|Ju|Revelations?|Rev?|Revel"
      );
    }
    return "";
  }

  public async getScripture(passage: string): Promise<string> {
    const query = new URLSearchParams({
      passage,
      type: "json",
    });

    try {
      const response = await fetch(`https://labs.bible.org/api/?${query}`);
      const data: BibleVerse[] = await response.json();

      // Format the verses
      return data
        .map(
          (verse) =>
            `${verse.bookname} ${verse.chapter}:${verse.verse} - ${verse.text}`,
        )
        .join("\n");
    } catch (error) {
      console.error("Error fetching scripture:", error);
      return "";
    }
  }

  public tagText(text: string): string {
    const vols = "I+|1st|2nd|3rd|First|Second|Third|1|2|3";
    const books = this.getBooks();
    const verse = "\\d+(:\\d+)?(?:\\s?[-–—&,]\\s?\\d+)*";
    const passage = `((\\d+(\\.:|:)\\d+[-–—]\\d+(\\.:|:)\\d+)|(\\d+(\\.:|:)\\d+[-–—]\\d+)|(\\d+[-–—]\\d+)|(\\d+(\\.:|:)\\d+)|(\\d+))`;
    const book = `((?:(${vols})\\s?)?(${books})\\.?\\s?)`;
    const regex = new RegExp(`\\b${book}${passage}`, "gm");

    return text.replace(regex, (match) => {
      return `<a href="#" class="bible-reference" data-reference="${match}">${match}</a>`;
    });
  }

  public getReferenceRegex(): RegExp {
    const vols = "I+|1st|2nd|3rd|First|Second|Third|1|2|3";
    const books = this.getBooks();
    const verse = "\\d+(:\\d+)?(?:\\s?[-–—&,]\\s?\\d+)*";
    const passage = `((\\d+(\\.:|:)\\d+[-–—]\\d+(\\.:|:)\\d+)|(\\d+(\\.:|:)\\d+[-–—]\\d+)|(\\d+[-–—]\\d+)|(\\d+(\\.:|:)\\d+)|(\\d+))`;
    const book = `((?:(${vols})\\s?)?(${books})\\.?\\s?)`;
    return new RegExp(`\\b${book}${passage}`, "gm");
  }

  public findReferences(text: string): string[] {
    const regex = this.getReferenceRegex();
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
  }
}

export default BibleTagger;
