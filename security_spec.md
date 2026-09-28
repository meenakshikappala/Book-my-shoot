# Security Specification — Atelier Lumière (Book My Photo Shoot)

## 1. Data Invariants

1. **Default-Deny Catch-All**: All paths not explicitly matched in `/databases/{database}/documents` are unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity Enforcement**: Every write operation (`create`, `update`, `delete`) across `/users/{userId}`, `/bookings/{bookingId}`, and `/inquiries/{inquiryId}` strictly requires an authenticated user with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
3. **Path Variable Hardening**: Every single-document target operation (`get`, `create`, `update`, `delete`) validates its path ID using `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **Owner Isolation & PII Protection**: `/users/{userId}` can only be read or mutated by the exact owner (`request.auth.uid == userId`). No blanket `isSignedIn()` reads or list operations are permitted on `/users`.
5. **Relational Existence Check (No Orphaned Writes)**: A `/bookings/{bookingId}` or `/inquiries/{inquiryId}` document can only be created if the parent user profile `/users/$(request.auth.uid)` exists in Firestore.
6. **Secure List Queries (Query Enforcer)**: Listing `/bookings` or `/inquiries` strictly enforces `resource.data.userId == request.auth.uid` on the rule side without delegating filtering to the client.
7. **Action-Based Updates & Terminal State Locking**: `/bookings/{bookingId}` updates must pass `isValidBooking(incoming())`, preserve immutable fields (`userId`, `photographerId`, `createdAt`), originate from a non-terminal state (`existing().status == 'confirmed'`), and match either the `CancelBooking` or `RescheduleBooking` action allowlist via `affectedKeys().hasOnly(...)`.
8. **Temporal Integrity**: `createdAt` must equal `request.time` on `create`, and `updatedAt` must equal `request.time` on `create` and `update`.

## 2. The "Dirty Dozen" Payloads

1. **Unverified Email Spoof (`users/user_1`)**: Authenticated user with `email_verified: false` attempts to create a profile. -> `PERMISSION_DENIED`
2. **Cross-User Profile Read (`users/user_2`)**: `user_1` attempts to `get` `users/user_2`. -> `PERMISSION_DENIED`
3. **Shadow Field Injection on Booking Create (`bookings/book_1`)**: Payload includes all valid fields plus `"isDiscounted": true`. Rejected by `hasOnly()`. -> `PERMISSION_DENIED`
4. **Orphaned Booking Write (`bookings/book_2`)**: User without an existing `/users/{uid}` document attempts to create a booking. Rejected by `exists()`. -> `PERMISSION_DENIED`
5. **Identity Spoofing on Booking Create (`bookings/book_3`)**: `user_1` submits `userId: "user_2"` in booking payload. Rejected by `incoming().userId == request.auth.uid`. -> `PERMISSION_DENIED`
6. **Unbounded String / Denial of Wallet (`bookings/book_4`)**: `notes` field contains a 2,000-character string (exceeding `maxLength: 500`). Rejected by `isValidBooking()`. -> `PERMISSION_DENIED`
7. **Invalid Date Format Poisoning (`bookings/book_5`)**: `shootDate` is `"2026/99/99"` instead of matching `^[0-9]{4}-[0-9]{2}-[0-9]{2}$`. -> `PERMISSION_DENIED`
8. **Terminal State Bypass (`bookings/book_6`)**: User attempts to update a booking whose current `status` is already `'cancelled'` or `'completed'`. -> `PERMISSION_DENIED`
9. **Unauthorized Price Tampering on Update (`bookings/book_7`)**: User attempts to modify `totalPrice` during a reschedule update. Rejected by `affectedKeys().hasOnly(...)`. -> `PERMISSION_DENIED`
10. **Immutable Timestamp Tampering (`bookings/book_8`)**: User attempts to alter `createdAt` during an update or pass a forged client timestamp for `updatedAt`. -> `PERMISSION_DENIED`
11. **Unfiltered Collection Scraping (`bookings`)**: `user_1` executes an unconstrained `list` query across all bookings without filtering `userId == request.auth.uid`. -> `PERMISSION_DENIED`
12. **Malicious Path ID Injection (`bookings/bad..id$$`)**: User attempts to create a document with invalid characters in `bookingId`. Rejected by `isValidId()`. -> `PERMISSION_DENIED`
