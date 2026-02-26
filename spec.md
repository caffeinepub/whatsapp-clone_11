# Specification

## Summary
**Goal:** Build a WhatsApp-inspired messaging app (ChatConnect) with user registration, login, and username-based search.

**Planned changes:**
- Backend: single Motoko actor with user account storage (unique username + hashed password), register function, authenticate function (returns session token), and username prefix search query
- Signup screen: username + password form with validation, inline error messages, redirects to main app on success
- Login screen: username + password form, persists session in localStorage, redirects to main app on success
- Main/home screen (auth-protected): search bar that queries backend by username prefix and displays matching users in a list; clicking a result opens a placeholder chat/profile view
- Dark-themed UI with deep charcoal background, teal/green accents, card-based user list, and consistent typography across all screens

**User-visible outcome:** Users can sign up and log in with a username and password, remain logged in across page reloads, and search for other users by username from the main screen.
