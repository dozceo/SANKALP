# Student Onboarding Flow Friction Report

## Friction Analysis
This report identifies friction points in the sign-up and onboarding process that may lead to user abandonment or confusion.

### Process Flow
1. **Sign Up**: Email/Password + Role Selection.
2. **Onboarding**: 4-step wizard.
   - **Step 1**: Personal Info (Name, Grade).
   - **Step 2**: Subjects (Toggle buttons).
   - **Step 3**: Goals (Tags) + Study Time (Grid).
   - **Step 4**: Class Code (Input, Optional).

### Friction Points

#### 1. Sign Up Barrier (`/sign-up`)
**Severity: High**
- **Issue**: Requires manual email/password creation. No social login options (Google, GitHub, etc.).
- **Impact**: High drop-off rate for users accustomed to frictionless sign-in.
- **Role Selection**: Users must select "Student" or "Teacher" immediately. This can be confusing if they're unsure.

#### 2. Class Code Confusion (`/onboarding` Step 4)
**Severity: Medium**
- **Issue**: Users are presented with an input for "Class Code". While there is a "Skip" button (ghost variant), the prominence of the input field suggests it is required.
- **Impact**: Students without a code may hesitate, search for one, or abandon the process thinking they cannot proceed.

#### 3. Step Count Fatigue
**Severity: Low**
- **Issue**: The process involves 5 distinct screens (Sign Up + 4 Onboarding Steps) before reaching the core value (Home/Dashboard).
- **Impact**: Minor frustration.

### Recommendations

#### Optimize Sign Up
1. **Implement Social Login**: Add "Sign in with Google" and "Sign in with GitHub" buttons. This significantly reduces friction.
2. **Auto-Detect Role (If possible)**: Or simplify the initial choice.

#### Streamline Onboarding
1. **Combine Steps**: Merge Step 1 (Name/Grade) and Step 3 (Goals/Study Time) if feasible without overcrowding.
2. **Move Class Code**: Remove Step 4 entirely from the initial flow. Instead, add a prominent "Join a Class" call-to-action on the Home Dashboard for students who haven't joined one yet.
   - This removes a barrier for independent learners.
3. **Clarify "Skip"**: If Step 4 must remain, rephrase the primary action to "I don't have a code" or make "Skip" more prominent.

### Expected Outcome
- **Increased Conversion**: Faster sign-up via social login.
- **Reduced Drop-off**: Removing the Class Code step prevents confusion for solo learners.
- **Faster Time-to-Value**: Users reach the dashboard quicker.
