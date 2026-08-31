# Security Specification

## 1. Data Invariants
- **Users**: A user document at `/users/{userId}` can only be read by any authenticated user for public profile preview or by the user themselves/admin. Sensitive fields (like full reading history) can be read/written by the owner (`request.auth.uid == userId`) or admin. Role escalations are restricted.
- **Stories**:
  - Published stories (`status == 'published'`) can be read by anyone (public).
  - Pending/Draft/Rejected stories can only be read by their creator (`authorId == request.auth.uid`) or an admin.
  - Creators can create stories with their own `authorId == request.auth.uid`.
  - Creators can update their own stories (content, draft state, etc.), but cannot approve their own story from pending to published if an admin review workflow is enforced, or can toggle if creator self-publishing is enabled. Readers can increment views or likes. Admins can update any field (e.g. status, rejectionReason).
  - Deletion is restricted to the story author or admin.
- **Reports**: Any authenticated user (or visitor) can create a moderation report. Only admins can read or update reports.
- **Contacts**: Any user can submit a contact inquiry. Only admins can read or manage contact submissions.

## 2. The Dirty Dozen Attack Vectors
1. Spoofed Author: Creating a story with `authorId: 'victim_user'` while signed in as `attacker`.
2. Admin Impersonation: Setting user `role: 'admin'` or writing directly to `/admins/{uid}`.
3. Unauthenticated Read of Unapproved Stories: Reading draft or rejected stories without ownership.
4. Unauthorized Story Tampering: User B updating User A's chapter text or deleting User A's story.
5. Large Payload Injection (Denial of Wallet): Injecting >1MB junk data strings into title, id, or description.
6. Malicious ID Path Poisoning: Using invalid special characters or oversized strings as document IDs.
7. Shadow Field Injection: Adding arbitrary unexpected top-level fields to bypass schema checks.
8. Report Interception: Non-admin users listing or reading other users' reports or contact submissions.
9. Like Manipulation: Non-authenticated arbitrary bulk wipe of story likes.
10. Unverified Email Admin Bypass: Calling admin functions with an unverified email address.
11. State Transition Bypass: Bypassing required status schemas.
12. Blanket List Scraping: Querying `/users` or `/reports` without proper ownership filters.
