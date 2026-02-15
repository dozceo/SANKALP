# Client-Side Bundle Size Analysis Report

**Date:** 2025-05-23
**Scope:** `src/app/`, `src/components/`
**Method:** Next.js Production Build Analysis

## Executive Summary

The application has several large pages exceeding 200kB initial load (JS), with some reaching over 300kB (`/rewards`). The shared main bundle is ~102kB, which is reasonable, but specific feature chunks are heavy.

## Key Findings

### 1. Large Pages (First Load JS)
| Page | Size | Notes |
| :--- | :---: | :--- |
| `/rewards` | **332 kB** | Largest page. likely due to charts/visualizations. |
| `/teacher/classes` | **283 kB** | Heavy teacher dashboard components. |
| `/quiz` | **279 kB** | Quiz engine and potentially complex UI state. |
| `/home` | **267 kB** | Dashboard home. |
| `/planner` | **260 kB** | Planner tools. |

### 2. Large Chunks (Raw Size)
Analysis of `.next/static/chunks`:
-   `2270-...js`: **354 kB** - Likely a large library bundle (possibly `firebase` or `react-force-graph-2d` + `three.js`).
-   `1554-...js`: **172 kB**
-   `4bd1...js`: **170 kB**
-   `1255-...js`: **168 kB**

### 3. Dependencies Analysis (Inferred)
Based on `package.json` and page sizes:
-   **`react-force-graph-2d`**: This library (and its `three.js` dependency) is extremely heavy. It is likely included in the graph-related chunks. It is already dynamically imported in some places, but check if it's leaking into the main bundle or shared chunks.
-   **`firebase`**: The full Firebase SDK can be large. Ensure only necessary modules are imported (e.g., `getFirestore` vs `firebase/firestore`).
-   **`recharts`**: Used for charts. Often large if not tree-shaken correctly.
-   **`lucide-react`**: Icon library. If imported as `import * as Icons`, it pulls everything. Ensure named imports `import { Icon } from 'lucide-react'` are used (Next.js/Webpack usually handles this, but worth checking).

## Recommendations

1.  **Lazy Load Heavy Components:**
    -   **Graph Components:** Ensure `InteractiveGraph` and `PersonalKnowledgeGraph` are *always* imported via `next/dynamic` with `{ ssr: false }`.
    -   **Charts:** Lazy load `Recharts` components in `/rewards` and `/home`.
    -   **Modals/Dialogs:** Defer loading of heavy interactive modals (e.g., in `/teacher/classes`) until the user interacts.

2.  **Code Splitting:**
    -   Review `/rewards` page. It is significantly larger than others. Break it down into smaller components and lazy load the less critical ones (e.g., "History" tab vs "Current Status").

3.  **Firebase Optimization:**
    -   Verify that Firebase imports are modular (`import { getAuth } from 'firebase/auth'`) and not side-effect imports (`import 'firebase/auth'`).

4.  **Bundle Analyzer (Action Item):**
    -   For a deeper dive, configure `@next/bundle-analyzer` in a local dev branch to visualize exactly which modules are inside the 354kB chunk.
