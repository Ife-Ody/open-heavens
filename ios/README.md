# Open Heavens for iOS

A native SwiftUI port of the Open Heavens web app. It keeps the web app's design decisions: the Inter typeface, the same colour tokens (blue primary, light/dark palettes from `globals.css`), the same page layouts and spacing, the header date picker and settings drawer (font size 12–32px, theme toggle), and the Devotional / Bible / Hymns navigation.

## Features

- Devotional reader (`/[date]`): memory verse, reading, message, key point, Bible-in-one-year and the day's hymn, with Previous/Next day and a calendar picker (2023–2026)
- Every scripture reference in a devotional is tappable and opens the Bible at that passage with the verses selected, like the web's Bible dialog
- Bible tab: KJV, NET and ASV readers with book/chapter pickers, verse selection, Previous/Next chapter, and the "gen 1:3" style search
- Hymns Directory with search, YouTube embed per hymn, lyrics, and Previous/Next hymn
- Settings drawer: font size (A- / 24px / A+) and light/dark theme toggle

Devotionals, hymns and all three Bible versions are bundled, so everything but video/audio works offline.

## Requirements

- Xcode 16 or newer, iOS 17.0+
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`) to regenerate the project

## Getting started

```sh
cd ios
xcodegen generate
open OpenHeavens.xcodeproj
```

`OpenHeavens.xcodeproj` is generated from `project.yml`; edit the YAML rather than the project file.

## Data

Both databases in `OpenHeavens/Resources/` are built from the web app's data by:

```sh
ios/scripts/build-database.py
```

| File | Source | Contents |
| --- | --- | --- |
| `openheavens.sqlite` (~9 MB) | `apps/web/src/lib/SQLite/openheavens.db` + `apps/web/src/content/hymns.json` | devotionals, translations, hymns |
| `bible.sqlite` (~14 MB) | `packages/bible/src/en/{kjv,net,asv}.json` | the three Bible versions the web reader uses |

Rebuild and commit them after the web data changes.

## Layout

```
ios/
├── project.yml                 # XcodeGen spec (registers the Inter fonts)
├── scripts/build-database.py   # builds the bundled SQLite databases
└── OpenHeavens/
    ├── App/                    # entry point, tab bar, Bible sheet routing
    ├── Database/               # SQLite wrapper, DevotionalStore, BibleStore
    ├── Models/                 # Devotional, Hymn
    ├── Support/                # Theme (web colour tokens + Inter), settings,
    │                           # HTML→rich text, Bible reference parser, audio player
    ├── Views/                  # Devotional, Bible, Hymns, shared components
    └── Resources/              # openheavens.sqlite, bible.sqlite, Fonts/
```
