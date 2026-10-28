import Foundation

struct Hymn: Identifiable, Hashable {
    let id: Int
    let number: Int
    let title: String
    let youtubeURL: URL?
    let audioURL: URL?
    let imageURL: URL?
    let lyricsHtml: String

    /// getYouTubeEmbedUrl: the `v=` query value.
    var youtubeVideoID: String? {
        guard let youtubeURL,
              let items = URLComponents(url: youtubeURL, resolvingAgainstBaseURL: false)?.queryItems,
              let id = items.first(where: { $0.name == "v" })?.value, !id.isEmpty else { return nil }
        return id
    }

    var youtubeEmbedURL: URL? {
        youtubeVideoID.flatMap { URL(string: "https://www.youtube.com/embed/\($0)?playsinline=1") }
    }

    var youtubeThumbnailURL: URL? {
        youtubeVideoID.flatMap { URL(string: "https://img.youtube.com/vi/\($0)/hqdefault.jpg") }
    }
}
