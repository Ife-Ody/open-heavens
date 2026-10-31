import SwiftUI

/// The header's date picker popover: a calendar plus "Go to Today".
struct DatePickerSheet: View {
    @Binding var dateKey: String
    let range: ClosedRange<String>?

    @Environment(\.dismiss) private var dismiss
    @State private var selection: Date = .now

    private var dateBounds: ClosedRange<Date> {
        let lower = range.flatMap { DateKey.date(from: $0.lowerBound) } ?? .distantPast
        let upper = range.flatMap { DateKey.date(from: $0.upperBound) } ?? .distantFuture
        return lower...max(lower, upper)
    }

    var body: some View {
        VStack(spacing: 8) {
            DatePicker("Devotional date", selection: $selection, in: dateBounds, displayedComponents: .date)
                .datePickerStyle(.graphical)
                .labelsHidden()
                .tint(Theme.primary)
                .onChange(of: selection) { _, newValue in
                    let key = DateKey.string(from: newValue)
                    guard key != dateKey else { return }
                    dateKey = key
                    dismiss()
                }

            Button("Go to Today: \(DateKey.mediumDate(.now))") {
                dateKey = DateKey.today()
                dismiss()
            }
            .buttonStyle(OutlineButtonStyle(height: 32, horizontalPadding: 12))

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 8)
        .padding(.top, 24)
        .background(Theme.background)
        .presentationDetents([.height(480)])
        .presentationDragIndicator(.visible)
        .presentationBackground(Theme.background)
        .followsAppearance()
        .onAppear { selection = DateKey.date(from: dateKey) ?? .now }
    }
}
