# Firebase Setup & Deployment Guide

## ✅ Firebase CLI Configuration Complete

Your Firebase project is now properly configured and ready to deploy!

**Active Project:** `sankalp-prerollout`

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| [firebase.json](file:///c:/Users/HAARIO/Desktop/DASH/MY%20WORKS/SANKALP%201.0/SANKALP/firebase.json) | Main Firebase configuration |
| [.firebaserc](file:///c:/Users/HAARIO/Desktop/DASH/MY%20WORKS/SANKALP%201.0/SANKALP/.firebaserc) | Project alias configuration |
| [firestore.rules](file:///c:/Users/HAARIO/Desktop/DASH/MY%20WORKS/SANKALP%201.0/SANKALP/firestore.rules) | Firestore security rules |
| [storage.rules](file:///c:/Users/HAARIO/Desktop/DASH/MY%20WORKS/SANKALP%201.0/SANKALP/storage.rules) | Storage security rules |
| [firestore.indexes.json](file:///c:/Users/HAARIO/Desktop/DASH/MY%20WORKS/SANKALP%201.0/SANKALP/firestore.indexes.json) | Firestore index definitions |

---

## 🚀 Deployment Commands

### Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore
```

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

### Deploy Everything
```bash
firebase deploy
```

### Build & Export for Firebase Hosting
```bash
npm run build
npx next export
firebase deploy --only hosting
```

---

## 🔐 Security Rules Overview

### Firestore Rules ([firestore.rules](file:///c:/Users/HAARIO/Desktop/DASH/MY%20WORKS/SANKALP%201.0/SANKALP/firestore.rules))

The default rules require authentication for all operations. They include:

- **Students Collection**: Users can read their own data, teachers can read/write all
- **Progress Collection**: Authenticated users have full access
- **Default**: All reads/writes require authentication

**⚠️ Important:** Customize these rules based on your specific security requirements!

### Storage Rules ([storage.rules](file:///c:/Users/HAARIO/Desktop/DASH/MY%20WORKS/SANKALP%201.0/SANKALP/storage.rules))

The storage rules include:

- **User Files** (`/users/{userId}/**`): Users can only access their own files
- **Public Assets** (`/public/**`): Anyone can read, admins can write
- **Student Uploads** (`/students/{studentId}/**`): Student and teachers have access

---

## 📋 Next Steps

### 1. Deploy Security Rules (Required)
```bash
# Deploy Firestore and Storage rules
firebase deploy --only firestore,storage
```

This will upload your security rules to Firebase, protecting your database and storage.

### 2. Enable Authentication Methods

Go to [Firebase Console → Authentication](https://console.firebase.google.com/project/sankalp-prerollout/authentication/providers) and enable:
- ✅ Email/Password
- ✅ Google (if using `signInWithGoogle()`)

### 3. Test Your Application
```bash
npm run dev
```

Try using the Firebase helper functions:
```typescript
import { signUpWithEmail, useAuth } from '@/lib/auth';
import { createDocument } from '@/lib/firestore';
```

### 4. Customize Security Rules

Edit `firestore.rules` and `storage.rules` to match your application's needs:
- Define who can read/write each collection
- Add custom validation rules
- Set role-based access control

### 5. (Optional) Set Up Firebase Hosting

If you want to host on Firebase:
```bash
# Build the app
npm run build

# Export static files (if using static export)
npx next export

# Deploy
firebase deploy --only hosting
```

---

## 🛠️ Useful Firebase CLI Commands

```bash
# Check current project
firebase projects:list

# Switch projects (if you have multiple)
firebase use <project-id>

# View deployment history
firebase hosting:channel:list

# Test security rules locally
firebase emulators:start

# View logs
firebase functions:log
```

---

## 🔧 Troubleshooting

### Issue: "Permission denied" errors

**Solution:** Deploy your security rules:
```bash
firebase deploy --only firestore,storage
```

### Issue: Need to switch Firebase project

**Solution:** Update `.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Then run: `firebase use default`

### Issue: Authentication not working

**Solution:** 
1. Check Firebase Console → Authentication → Sign-in methods
2. Ensure Email/Password or Google is enabled
3. Verify environment variables in `.env.local`

---

## ✨ Your Firebase Setup is Complete!

You can now:
- ✅ Use Firebase Authentication (`useAuth`, `signInWithEmail`, etc.)
- ✅ Store data in Firestore (`createDocument`, `getDocuments`, etc.)
- ✅ Upload files to Storage (`uploadUserFile`, etc.)
- ✅ Deploy security rules to production
- ✅ Track analytics (in production builds)

**Quick Deploy:**
```bash
firebase deploy --only firestore,storage
```
