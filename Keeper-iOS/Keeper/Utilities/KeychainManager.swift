import Foundation
import Security

/// Thread-safe wrapper around the iOS Keychain for storing small sensitive strings
/// (tokens, API keys) scoped to this device only.
final class KeychainManager {
    static let shared = KeychainManager()
    private init() {}

    // MARK: - Write

    /// Saves (or overwrites) a UTF-8 string value under the given key.
    /// The item is accessible only while the device is unlocked and is
    /// never migrated to a new device via iCloud backup.
    func save(_ value: String, for key: String) {
        guard let data = value.data(using: .utf8) else { return }

        let query: [String: Any] = [
            kSecClass as String:             kSecClassGenericPassword,
            kSecAttrAccount as String:       key,
            kSecValueData as String:         data,
            kSecAttrAccessible as String:    kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        // Delete any existing item before inserting to avoid duplicate errors.
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    // MARK: - Read

    /// Returns the stored string for `key`, or `nil` if no item exists.
    func retrieve(_ key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String:  true,
            kSecMatchLimit as String:  kSecMatchLimitOne
        ]

        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Delete

    /// Removes the Keychain item for the given key. No-op if the item does not exist.
    func delete(_ key: String) {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }

    /// Removes all Keeper-managed auth tokens from the Keychain.
    /// Call this during sign-out to ensure no credentials are left behind.
    func deleteAll() {
        [
            Constants.Keychain.supabaseAccessToken,
            Constants.Keychain.supabaseRefreshToken,
            Constants.Keychain.plaidAccessToken
        ].forEach { delete($0) }
    }
}
