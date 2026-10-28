import SwiftUI

/// Play/pause control with a scrubber for a streamed MP3.
struct AudioPlayerBar: View {
    let url: URL
    let title: String
    let subtitle: String

    @State private var player = AudioPlayer.shared
    @State private var scrubValue: Double = 0
    @State private var isScrubbing = false

    private var isCurrent: Bool { player.isCurrent(url) }
    private var isPlaying: Bool { isCurrent && player.isPlaying }
    private var progress: Double { isCurrent ? player.currentTime : 0 }
    private var duration: Double { isCurrent ? player.duration : 0 }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 12) {
                Button {
                    player.toggle(url)
                } label: {
                    ZStack {
                        Circle().fill(Theme.primary)
                        if isCurrent && player.isLoading && !player.failed {
                            ProgressView().tint(Theme.primaryForeground)
                        } else {
                            Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(Theme.primaryForeground)
                                .offset(x: isPlaying ? 0 : 1)
                                .contentTransition(.symbolEffect(.replace))
                        }
                    }
                    .frame(width: 40, height: 40)
                }
                .buttonStyle(PressableIconStyle())
                .sensoryFeedback(.impact(weight: .light), trigger: isPlaying)
                .accessibilityLabel(isPlaying ? "Pause" : "Play")

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.inter(14, weight: .medium))
                        .foregroundStyle(Theme.foreground)
                        .lineLimit(1)
                    Text(isCurrent && player.failed ? "Could not load audio" : subtitle)
                        .font(.inter(12))
                        .foregroundStyle(isCurrent && player.failed ? .red : Theme.mutedForeground)
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
            }

            if isCurrent && duration > 0 {
                VStack(spacing: 2) {
                    // Entered via transition below so the bar grows in rather than popping.
                    Slider(
                        value: Binding(
                            get: { isScrubbing ? scrubValue : progress },
                            set: { scrubValue = $0 }
                        ),
                        in: 0...max(duration, 1)
                    ) { editing in
                        isScrubbing = editing
                        if !editing { player.seek(to: scrubValue) }
                    }
                    .tint(Theme.primary)
                    HStack {
                        Text(Self.format(isScrubbing ? scrubValue : progress))
                        Spacer()
                        Text(Self.format(duration))
                    }
                    .font(.inter(12))
                    .monospacedDigit()
                    .foregroundStyle(Theme.mutedForeground)
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .animation(Motion.state, value: isCurrent && duration > 0)
        .padding(12)
        .background(Theme.muted, in: RoundedRectangle(cornerRadius: Theme.radiusLG, style: .continuous))
    }

    private static func format(_ seconds: Double) -> String {
        let total = Int(seconds.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}

/// Round icon buttons: scale on press, nothing else.
private struct PressableIconStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.pressScale(configuration.isPressed, amount: 0.92)
    }
}
