# Specification

## Summary
**Goal:** Fix a false "username already taken" error during signup by normalizing usernames to lowercase on both the frontend and backend.

**Planned changes:**
- Update the backend register function to normalize usernames to lowercase before performing uniqueness checks, ensuring comparisons are case-insensitive.
- Update the signup page frontend to trim and lowercase the username before submitting it to the backend.

**User-visible outcome:** Users can successfully register with a unique username without encountering a false "username already taken" error due to case differences or whitespace.
