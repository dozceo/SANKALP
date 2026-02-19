# Engineering Audit Report

## 1. Dead Code & Unused Component Detection
**Objective**: Identify unused components and utilities to reduce bundle size and cognitive load.
**Findings**:
- **Unused UI Components**: The following Shadcn UI components are present but never imported in the application:
    - `src/components/ui/accordion.tsx`
    - `src/components/ui/alert.tsx` (Note: `alert-dialog.tsx` IS used)
    - `src/components/ui/calendar.tsx`
    - `src/components/ui/carousel.tsx`
    - `src/components/ui/collapsible.tsx`
    - `src/components/ui/menubar.tsx`
    - `src/components/ui/slider.tsx`
- **Unused Development Artifacts**:
    - `src/ml/training/`: Directory contains offline Python training scripts (`train_mastery_model.py`, `generate_data.py`) which are not used in the production Next.js application.
    - `src/ai/dev.ts`: Development-only entry point for Genkit, not used in production build.

## 2. Next.js App Router Parallel Route Usage Validation
**Objective**: Audit routing structure for correctness.
**Findings**:
- No parallel routes (`@folder`) or intercepting routes (`(.)folder`) are currently implemented.
- Route Groups (`(auth)`, `(main)`) are correctly configured with dedicated `layout.tsx` files that properly render children.
- Routing structure appears stable and follows standard Next.js conventions.

## 3. Firebase SDK Version Compatibility Check
**Objective**: Detect incompatible SDK versions.
**Findings**:
- **Versions**:
    - `firebase`: `^11.10.0` (Client SDK)
    - `firebase-admin`: `^13.6.0` (Server SDK)
- **Compatibility**:
    - The project correctly separates client (`src/lib/firebase.ts`) and server (`src/lib/firebase-admin.ts`) initialization.
    - `firebase-admin` usages follow the modular import pattern (`firebase-admin/app`, `firebase-admin/firestore`) which is correct for v10+.
    - **Note**: `firebase-admin` v13 is a major update. While syntax seems correct, verification of specific API behavior (especially Authentication and Messaging) in a runtime environment is recommended, as major versions may introduce subtle breaking changes not visible in static analysis.

## 4. Genkit Dev Server Security Exposure Assessment
**Objective**: Audit `src/ai/dev.ts` for security risks.
**Findings**:
- **Risk Level**: **High** (if exposed).
- **Analysis**:
    - The file `src/ai/dev.ts` initializes Genkit flows without any authentication or environment guards.
    - It loads environment variables from `.env.local` but does not enforce `NODE_ENV=development`.
    - **Recommendation**: Ensure this file is strictly excluded from production builds and never executed in a production environment. Add a runtime check `if (process.env.NODE_ENV === 'production') { throw new Error(...) }` to prevent accidental startup.
