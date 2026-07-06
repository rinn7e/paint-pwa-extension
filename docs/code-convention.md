# Paint PWA Code Convention

This document describes the code design principles and style conventions that must be adhered to in this project.

## 1. Font Size Constraints
- **Minimum Font Size:** The minimum allowable font size class in styling is `text-[0.625rem]` (`10px` equivalent).
- **Unit Standard:** Use relative `rem` units (e.g. `text-[0.625rem]`, `text-xs`) for all text dimensions to ensure they scale dynamically when the user adjusts the font size setting. Do NOT use absolute pixel units (`px`) for styling text.

## 2. UI View Conventions
- **View Naming:** Composable view rendering functions (plain functions returning TSX, not full React components) must end with the `View` suffix instead of beginning with `render` (e.g., `headerView`, `footerView`, `domainSubheaderView`).

## 3. Reducer Logic & Modularity
- **Logic Modularization:** Update reducer switch loops must delegate their logic to small, pure, testable sub-updater helper functions (e.g., `handleSetFontSize`, `handleToggleDarkEnabled`, etc.).
- **Unit Testing:** All logic state transition paths must be thoroughly covered by unit tests using Vitest (inside the `test/` directory).
