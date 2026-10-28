#!/usr/bin/env python3
"""Builds the SQLite databases bundled with the iOS app from the web app's data.

  openheavens.sqlite  devotionals, translations and hymns (from the web SQLite DB + hymns.json)
  bible.sqlite        KJV, NET and ASV verses (from packages/bible/src/en/*.json, the same
                      versions the web Bible reader uses)

Usage: ios/scripts/build-database.py
"""
import json
import os
import sqlite3

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SOURCE_DB = os.path.join(ROOT, "apps/web/src/lib/SQLite/openheavens.db")
HYMNS_JSON = os.path.join(ROOT, "apps/web/src/content/hymns.json")
BIBLE_DIR = os.path.join(ROOT, "packages/bible/src/en")
OUT_DIR = os.path.join(ROOT, "ios/OpenHeavens/Resources")
BIBLE_VERSIONS = ["kjv", "net", "asv"]


def fresh(path):
    for suffix in ("", "-journal", "-wal", "-shm"):
        if os.path.exists(path + suffix):
            os.remove(path + suffix)
    return sqlite3.connect(path)


def build_devotionals():
    out_path = os.path.join(OUT_DIR, "openheavens.sqlite")
    out = fresh(out_path)
    out.executescript(
        """
        CREATE TABLE devotionals (
          id INTEGER PRIMARY KEY,
          date TEXT NOT NULL,
          audience TEXT NOT NULL,
          biblePlan TEXT,
          bibleMemoryVerse TEXT,
          bibleText TEXT,
          imageUrl TEXT,
          hymnId INTEGER,
          audioUrl TEXT
        );
        CREATE TABLE translations (
          id INTEGER PRIMARY KEY,
          devotionalId INTEGER NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
          languageCode TEXT NOT NULL,
          languageName TEXT,
          title TEXT,
          memoryText TEXT,
          bodyHtml TEXT,
          pointText TEXT,
          pointType TEXT,
          isActive INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE hymns (
          id INTEGER PRIMARY KEY,
          number INTEGER NOT NULL,
          title TEXT NOT NULL,
          youtubeUrl TEXT,
          audioUrl TEXT,
          imageUrl TEXT,
          lyricsHtml TEXT
        );
        """
    )

    # Open read-only and immutable so the web DB's -wal/-shm sidecar files are left untouched.
    src = sqlite3.connect(f"file:{SOURCE_DB}?mode=ro&immutable=1", uri=True)
    src.row_factory = sqlite3.Row

    # Hymns: the web app's hymns.json (YouTube + lyrics) merged with the audio_items MP3s.
    with open(HYMNS_JSON) as f:
        json_hymns = {h["id"]: h for h in json.load(f)["hymns"]}
    audio_hymns = {
        r["id"]: r
        for r in src.execute("SELECT id, artist, title, url, imageUrl, lyrics FROM audio_items WHERE type = 'hymn'")
    }
    for hymn_id in sorted(set(json_hymns) | set(audio_hymns)):
        j = json_hymns.get(hymn_id)
        a = audio_hymns.get(hymn_id)
        number = j["hymn_number"] if j else int(str(a["artist"]).replace("Hymn ", ""))
        title = (j["title"] if j else a["title"]).strip()
        lyrics = j["lyrics"] if j and j.get("lyrics") else (a["lyrics"] if a else None)
        out.execute(
            "INSERT INTO hymns (id, number, title, youtubeUrl, audioUrl, imageUrl, lyricsHtml) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (hymn_id, number, title, j["hymn_url"] if j else None, a["url"] if a else None, a["imageUrl"] if a else None, lyrics),
        )
    hymn_ids = {hymn_id for hymn_id in set(json_hymns) | set(audio_hymns)}

    for d in src.execute("SELECT * FROM devotionals ORDER BY id"):
        audio = src.execute(
            """
            SELECT a.url FROM devotional_translations t
            JOIN audio_items a ON a.id = t.audioId AND a.type = 'devotional'
            WHERE t.devotionalId = ?
            ORDER BY t.languageCode = 'en' DESC, t.isActive DESC, t.id LIMIT 1
            """,
            (d["id"],),
        ).fetchone()
        out.execute(
            "INSERT INTO devotionals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                d["id"], d["date"], d["audience"], d["biblePlan"], d["bibleMemoryVerse"], d["bibleText"], d["imageUrl"],
                d["hymnAudioId"] if d["hymnAudioId"] in hymn_ids else None,
                audio["url"] if audio else None,
            ),
        )

    for t in src.execute("SELECT * FROM devotional_translations ORDER BY id"):
        out.execute(
            "INSERT INTO translations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                t["id"], t["devotionalId"], t["languageCode"], t["languageName"], t["title"], t["memoryText"],
                t["devotionalHtml"], t["pointText"], t["pointType"], t["isActive"] or 0,
            ),
        )

    out.executescript(
        """
        CREATE UNIQUE INDEX idx_devotionals_date_audience ON devotionals(date, audience);
        CREATE UNIQUE INDEX idx_translations_devotional_language ON translations(devotionalId, languageCode);
        CREATE INDEX idx_hymns_number ON hymns(number);
        """
    )
    out.commit()
    out.execute("VACUUM")
    out.close()
    report(out_path, ["devotionals", "translations", "hymns"])


def build_bible():
    out_path = os.path.join(OUT_DIR, "bible.sqlite")
    out = fresh(out_path)
    out.executescript(
        """
        CREATE TABLE versions (
          code TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          shortName TEXT NOT NULL,
          copyright TEXT
        );
        CREATE TABLE books (
          number INTEGER PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          testament TEXT NOT NULL,
          chapters INTEGER NOT NULL
        );
        CREATE TABLE verses (
          version TEXT NOT NULL,
          book INTEGER NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          text TEXT NOT NULL,
          PRIMARY KEY (version, book, chapter, verse)
        ) WITHOUT ROWID;
        """
    )

    books = {}
    for code in BIBLE_VERSIONS:
        with open(os.path.join(BIBLE_DIR, f"{code}.json")) as f:
            data = json.load(f)
        meta = data["metadata"]
        out.execute(
            "INSERT INTO versions VALUES (?, ?, ?, ?)",
            (code, meta.get("name") or code.upper(), meta.get("shortname") or code.upper(), meta.get("copyright_statement")),
        )
        out.executemany(
            "INSERT OR IGNORE INTO verses VALUES (?, ?, ?, ?, ?)",
            ((code, v["book"], v["chapter"], v["verse"], v["text"].strip()) for v in data["verses"]),
        )
        for v in data["verses"]:
            entry = books.setdefault(v["book"], {"name": v["book_name"], "chapters": 0})
            entry["chapters"] = max(entry["chapters"], v["chapter"])

    for number, entry in sorted(books.items()):
        out.execute(
            "INSERT INTO books VALUES (?, ?, ?, ?)",
            (number, entry["name"], "OT" if number <= 39 else "NT", entry["chapters"]),
        )

    out.commit()
    out.execute("VACUUM")
    out.close()
    report(out_path, ["versions", "books", "verses"])


def report(path, tables):
    size = os.path.getsize(path) / 1024 / 1024
    db = sqlite3.connect(path)
    counts = ", ".join(f"{t}: {db.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]}" for t in tables)
    print(f"Wrote {os.path.relpath(path, ROOT)} ({size:.1f} MB) — {counts}")


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    build_devotionals()
    build_bible()
