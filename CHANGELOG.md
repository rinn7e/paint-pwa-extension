# Changelog

All notable changes to **Paint PWA** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- **Initial Project Release**: A fully functional browser extension to configure and override web application theme colors dynamically based on the operating system color scheme.
- **OS Theme-Aware Overrides**: Persistent mutation observation to intercept and override HTML meta theme color tags at page start (`document_start`).
- **Domain-Specific Preference Management**: Custom configurations saved per website, allowing users to enable/disable light and dark overrides independently.
- **Theme Preset Selectors**: Curated presets for light themes (Pure, Slate, Gray) and dark themes (Pitch, Midnight, Charcoal) with built-in color preview tiles.
- **Adaptive Popup UI Scaling**: A root font size controller (12px to 32px) in the popup footer to scale all text elements proportionally.
- **Backup & Portability (Export/Import)**: Secure backup functionality to export configurations to a JSON file and restore them with runtime schema validation via `io-ts` codecs.
- **Environment-Specific Builds**: Support for environment configuration targets (`.env.development` and `.env.production`) to customize log stripping, default font sizes, and build date displays.
- **Dev Build Icon Badging**: A custom developer CLI tool (`add-dev-badge-image-editor`) to automatically overlay yellow "DEV" corner badges on development build icons.
- **GNU GPL v3.0 Compliance**: Complete codebase licensing under GNU General Public License v3.0, including license file and source header guards.
