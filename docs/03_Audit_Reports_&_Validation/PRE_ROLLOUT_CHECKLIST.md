# Pre-Rollout Checklist

Complete this checklist before deploying SANKALP to production.

---

## 1. Database Setup ✅

### Firebase Configuration

- [ ] **Verify Firebase project is created**
  ```bash
  firebase projects:list
  # Should show: sankalp-prerollout
  ```

- [ ] **Enable required Firebase services**
  - [ ] Authentication (Email/Password, Google)
  - [ ] Firestore Database
  - [ ] Cloud Storage (for file uploads)
  - [ ] Analytics (optional but recommended)

- [ ] **Set up Firestore collections**
  - [ ] `students` - User profiles
  - [ ] `quizResults` - Quiz attempts
  - [ ] `mlPredictions` - Cached ML scores
  - [ ] `adkDecisions` - AI decision audit trail
  - [ ] `teacherInterventions` - Teacher alerts

- [ ] **Configure Firestore security rules**
  ```bash
  firebase deploy --only firestore:rules
  ```

- [ ] **Create Firestore indexes**
  ```bash
  firebase deploy --only firestore:indexes
  ```

- [ ] **Test database connection**
  - [ ] Run seed script to populate test data
  - [ ] Query data from Firebase Console
  - [ ] Verify API can read/write

---

## 2. Environment Variables 🔐

### Development (`.env.local`)

- [ ] **Verify all keys are present:**
  ```env
  # Firebase Client (Frontend)
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  
  # Firebase Admin (Backend)
  FIREBASE_PROJECT_ID=
  FIREBASE_PRIVATE_KEY=
  FIREBASE_CLIENT_EMAIL=
  
  # AI APIs
  GEMINI_API_KEY=
  ```

### Production

- [ ] **Add environment variables to hosting platform**
  - For Vercel: Settings → Environment Variables
  - For Firebase Hosting: Functions config
  - For other platforms: Follow their documentation

- [ ] **Rotate any exposed API keys** (check git history!)

- [ ] **Verify `env.txt` is deleted or moved to `.gitignore`**

---

## 3. Remove Mock Data 🧹

- [ ] **Replace mock data in API routes**
  - [ ] `src/app/api/intelligence/student/route.ts`
    - Replace hardcoded `studentHistory` with Firestore query
  - [ ] Any other API routes using mock data

- [ ] **Test with real data**
  - [ ] Create test student account
  - [ ] Complete a quiz
  - [ ] Verify data appears in dashboard

- [ ] **Remove hardcoded student IDs**
  - Search for: `"demo_student"`, `"test_user"`
  - Replace with: `auth.currentUser.uid`

---

## 4. Authentication 🔒

- [ ] **Complete login page**
  - [ ] `src/app/(auth)/login/page.tsx`
  - [ ] Email/password login working
  - [ ] Google OAuth (optional)
  - [ ] Error handling for wrong credentials

- [ ] **Complete signup page**
  - [ ] `src/app/(auth)/signup/page.tsx`
  - [ ] Create user in Firebase Auth
  - [ ] Create user document in Firestore
  - [ ] Redirect to onboarding/home

- [ ] **Add middleware protection**
  - [ ] `src/middleware.ts` exists
  - [ ] Protects `/home`, `/dashboard`, `/quiz`
  - [ ] Redirects to `/login` if not authenticated

- [ ] **Test authentication flow**
  - [ ] Sign up → Creates account
  - [ ] Login → Access granted
  - [ ] Logout → Redirects to login
  - [ ] Protected routes → Require auth

---

## 5. Security Audit 🛡️

- [ ] **Verify secrets are not exposed**
  - [ ] Search codebase for API keys
  - [ ] Check `.gitignore` includes `.env.local`
  - [ ] Verify no secrets in client-side code

- [ ] **Check Firestore security rules**
  ```javascript
  // Students can only read/write their own data
  match /students/{studentId} {
    allow read, write: if request.auth.uid == studentId;
  }
  ```

- [ ] **Validate user input**
  - [ ] All forms use Zod validation
  - [ ] Quiz submissions check for cheating (time, attempts)

- [ ] **Add rate limiting** (optional but recommended)
  - Consider: Upstash Rate Limit or Vercel Rate Limiting

---

## 6. Code Quality ✨

- [ ] **Run linter**
  ```bash
  npm run lint
  # Fix all errors and warnings
  ```

- [ ] **Type check**
  ```bash
  npx tsc --noEmit
  # Ensure no TypeScript errors
  ```

- [ ] **Test build process**
  ```bash
  npm run build
  # Should complete without errors
  ```

- [ ] **Remove debug code**
  - [ ] Remove `console.log()` statements
  - [ ] Remove commented-out code
  - [ ] Remove unused imports

---

## 7. Testing 🧪

### Manual Testing

- [ ] **Core user flows**
  - [ ] Sign up → Onboarding → Home
  - [ ] Take a quiz → See results
  - [ ] View intelligence dashboard
  - [ ] Use revision planner
  - [ ] Chat with AI tutor

- [ ] **Error scenarios**
  - [ ] Wrong login credentials
  - [ ] Network failure during quiz
  - [ ] Expired session
  - [ ] Invalid quiz answers

### Performance

- [ ] **Test with real data volume**
  - [ ] 100+ quiz results per student
  - [ ] Multiple concurrent users
  - [ ] Large AI responses

- [ ] **Check page load times**
  - [ ] Home page < 2 seconds
  - [ ] Quiz loads < 1 second
  - [ ] AI responses < 5 seconds

---

## 8. ML System Verification 🤖

- [ ] **Verify Python environment**
  ```bash
  cd src/ml/training
  pip install -r requirements.txt
  python --version  # Should be 3.8+
  ```

- [ ] **Train/verify ML model**
  ```bash
  python generate_data.py
  python train_mastery_model.py
  # Verify: src/ml/models/mastery_model.pkl exists
  ```

- [ ] **Test ML inference**
  - [ ] API can call Python script
  - [ ] Predictions return valid probabilities (0-1)
  - [ ] Handles missing data gracefully

- [ ] **Monitor ML accuracy**
  - [ ] Set up logging for predictions
  - [ ] Create dashboard to track accuracy over time

---

## 9. Deployment ☁️

### Choose Platform

- [ ] **Vercel (Recommended)**
  ```bash
  npm install -g vercel
  vercel login
  vercel --prod
  ```

- [ ] **Firebase Hosting + Functions**
  ```bash
  firebase deploy
  ```

- [ ] **Other (AWS, Railway, etc.)**

### Deploy Checklist

- [ ] **Build succeeds locally**
  ```bash
  npm run build
  npm start  # Test production build locally
  ```

- [ ] **Environment variables set on platform**

- [ ] **Custom domain configured** (if applicable)

- [ ] **SSL/HTTPS enabled**

- [ ] **Test deployed URL**
  - [ ] Can create account
  - [ ] Can login
  - [ ] All features work

---

## 10. Monitoring & Analytics 📊

- [ ] **Set up error tracking**
  - Options: Sentry, LogRocket, Vercel Analytics

- [ ] **Enable Firebase Analytics**
  - Track: Quiz completions, page views, user retention

- [ ] **Monitor API usage**
  - Track Gemini API calls (to avoid quota)
  - Monitor database reads/writes

- [ ] **Set up alerts**
  - Email notification for errors
  - Alert if API quota exceeded

---

## 11. Documentation 📚

- [ ] **Update README.md**
  - [ ] Current tech stack
  - [ ] Setup instructions
  - [ ] Deployment guide

- [ ] **Create user documentation**
  - [ ] How to sign up
  - [ ] How to use features
  - [ ] FAQs

- [ ] **Create admin guide**
  - [ ] How to view analytics
  - [ ] How to manage users
  - [ ] How to debug issues

---

## 12. Legal & Compliance ⚖️

- [ ] **Privacy Policy** (if collecting user data)

- [ ] **Terms of Service**

- [ ] **GDPR compliance** (if serving EU users)
  - [ ] User data export
  - [ ] Account deletion

- [ ] **Cookie consent** (if using analytics)

---

## Final Launch Checklist 🚀

- [ ] All above items completed
- [ ] Production URL tested end-to-end
- [ ] Team has access credentials
- [ ] Backup plan in case of issues
- [ ] Celebration prepared! 🎉

---

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error logs every hour
- [ ] Check user registration rate
- [ ] Verify database writes are succeeding
- [ ] Monitor API quota usage
- [ ] Test from different devices/browsers
- [ ] Respond to user feedback

---

## Need Help?

Refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - How the code works
- [DATABASE.md](./DATABASE.md) - Database integration
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [README.md](./README.md) - General overview

**Good luck with the pre-rollout! 🎓**
