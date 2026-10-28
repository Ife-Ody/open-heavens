import AVFoundation
import Foundation
import Observation

/// Streams the hymn and devotional audio. One shared player so only one track plays at a time.
@MainActor
@Observable
final class AudioPlayer {
    static let shared = AudioPlayer()

    private(set) var currentURL: URL?
    private(set) var isPlaying = false
    private(set) var isLoading = false
    private(set) var currentTime: TimeInterval = 0
    private(set) var duration: TimeInterval = 0
    private(set) var failed = false

    private var player: AVPlayer?
    private var timeObserver: Any?
    private var endObserver: NSObjectProtocol?
    private var statusObservation: NSKeyValueObservation?

    private init() {}

    func isCurrent(_ url: URL) -> Bool { currentURL == url }

    func toggle(_ url: URL) {
        if currentURL == url {
            isPlaying ? pause() : resume()
        } else {
            play(url)
        }
    }

    func play(_ url: URL) {
        stop()

        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, mode: .spokenAudio)
        try? session.setActive(true)

        let item = AVPlayerItem(url: url)
        let player = AVPlayer(playerItem: item)
        self.player = player
        currentURL = url
        currentTime = 0
        duration = 0
        failed = false
        isLoading = true

        timeObserver = player.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 600),
            queue: .main
        ) { [weak self] time in
            Task { @MainActor in
                guard let self, self.player === player else { return }
                self.currentTime = time.seconds.isFinite ? time.seconds : 0
                if let seconds = player.currentItem?.duration.seconds, seconds.isFinite {
                    self.duration = seconds
                }
            }
        }

        endObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: item,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                guard let self, self.player === player else { return }
                self.isPlaying = false
                self.currentTime = 0
                player.seek(to: .zero)
            }
        }

        statusObservation = item.observe(\.status, options: [.new]) { [weak self] item, _ in
            Task { @MainActor in
                guard let self, self.player === player else { return }
                self.isLoading = item.status == .unknown
                if item.status == .failed {
                    self.failed = true
                    self.isPlaying = false
                }
            }
        }

        player.play()
        isPlaying = true
    }

    func pause() {
        player?.pause()
        isPlaying = false
    }

    func resume() {
        guard player != nil else { return }
        player?.play()
        isPlaying = true
    }

    func seek(to seconds: TimeInterval) {
        guard let player else { return }
        let target = CMTime(seconds: max(0, min(seconds, duration)), preferredTimescale: 600)
        player.seek(to: target, toleranceBefore: .zero, toleranceAfter: .zero)
        currentTime = target.seconds
    }

    func stop() {
        if let player, let timeObserver {
            player.removeTimeObserver(timeObserver)
        }
        if let endObserver {
            NotificationCenter.default.removeObserver(endObserver)
        }
        statusObservation?.invalidate()
        statusObservation = nil
        timeObserver = nil
        endObserver = nil
        player?.pause()
        player = nil
        currentURL = nil
        isPlaying = false
        isLoading = false
        currentTime = 0
        duration = 0
    }
}
