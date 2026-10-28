import Foundation
import SQLite3

/// A minimal, read-only wrapper around the system SQLite library.
final class SQLiteDatabase {
    struct Failure: Error, CustomStringConvertible {
        let message: String
        var description: String { message }
    }

    enum Value {
        case null
        case integer(Int64)
        case real(Double)
        case text(String)
    }

    struct Row {
        fileprivate let columns: [String: Value]

        func string(_ name: String) -> String? {
            switch columns[name] {
            case .text(let value)?: return value
            case .integer(let value)?: return String(value)
            case .real(let value)?: return String(value)
            default: return nil
            }
        }

        func int(_ name: String) -> Int? {
            switch columns[name] {
            case .integer(let value)?: return Int(value)
            case .real(let value)?: return Int(value)
            case .text(let value)?: return Int(value)
            default: return nil
            }
        }

        func bool(_ name: String) -> Bool {
            (int(name) ?? 0) != 0
        }
    }

    private let handle: OpaquePointer
    private let queue = DispatchQueue(label: "com.ifeody.openheavens.sqlite")

    init(path: String) throws {
        var handle: OpaquePointer?
        let flags = SQLITE_OPEN_READONLY | SQLITE_OPEN_NOMUTEX
        let result = sqlite3_open_v2(path, &handle, flags, nil)
        guard result == SQLITE_OK, let handle else {
            let message = handle.map { String(cString: sqlite3_errmsg($0)) } ?? "Unable to open database"
            if let handle { sqlite3_close(handle) }
            throw Failure(message: message)
        }
        self.handle = handle
    }

    deinit {
        sqlite3_close(handle)
    }

    func query(_ sql: String, _ bindings: [Value] = []) throws -> [Row] {
        try queue.sync {
            var statement: OpaquePointer?
            guard sqlite3_prepare_v2(handle, sql, -1, &statement, nil) == SQLITE_OK, let statement else {
                throw Failure(message: String(cString: sqlite3_errmsg(handle)))
            }
            defer { sqlite3_finalize(statement) }

            let transient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
            for (index, value) in bindings.enumerated() {
                let position = Int32(index + 1)
                switch value {
                case .null: sqlite3_bind_null(statement, position)
                case .integer(let number): sqlite3_bind_int64(statement, position, number)
                case .real(let number): sqlite3_bind_double(statement, position, number)
                case .text(let text): sqlite3_bind_text(statement, position, text, -1, transient)
                }
            }

            let columnCount = Int(sqlite3_column_count(statement))
            let names = (0..<columnCount).map { String(cString: sqlite3_column_name(statement, Int32($0))) }
            var rows: [Row] = []

            while true {
                let step = sqlite3_step(statement)
                if step == SQLITE_ROW {
                    var columns: [String: Value] = [:]
                    for index in 0..<columnCount {
                        let column = Int32(index)
                        switch sqlite3_column_type(statement, column) {
                        case SQLITE_INTEGER:
                            columns[names[index]] = .integer(sqlite3_column_int64(statement, column))
                        case SQLITE_FLOAT:
                            columns[names[index]] = .real(sqlite3_column_double(statement, column))
                        case SQLITE_TEXT:
                            columns[names[index]] = .text(String(cString: sqlite3_column_text(statement, column)))
                        default:
                            columns[names[index]] = .null
                        }
                    }
                    rows.append(Row(columns: columns))
                } else if step == SQLITE_DONE {
                    break
                } else {
                    throw Failure(message: String(cString: sqlite3_errmsg(handle)))
                }
            }
            return rows
        }
    }
}
