# 🔧 Firebase IAM Service Account Fix

## 🚨 Issue

**Error**: `SetIamPolicy` fails because the Firebase Admin SDK service account doesn't exist:
```
firebase-adminsdk-fbsvc@sankalp-prerollout.iam.gserviceaccount.com
```

**Impact**: 
- Firebase Admin SDK fails
- Auth breaks silently
- Deployment errors
- Cloud Run ↔ Firebase integrations fail

---

## ✅ Solution: Let Firebase Recreate It (Recommended)

### Step 1: Verify Current State

Check if service account exists:
```bash
gcloud iam service-accounts list --project=sankalp-prerollout
```

**Expected**: You should see `firebase-adminsdk-fbsvc@...` and `service-934191983030@gcp-sa-firebase.iam.gserviceaccount.com`

If missing → proceed to Step 2.

---

### Step 2: Enable Required Firebase APIs

Ensure these APIs are enabled:
```bash
gcloud services enable firebase.googleapis.com --project=sankalp-prerollout
gcloud services enable identitytoolkit.googleapis.com --project=sankalp-prerollout
gcloud services enable cloudresourcemanager.googleapis.com --project=sankalp-prerollout
gcloud services enable iamcredentials.googleapis.com --project=sankalp-prerollout
```

---

### Step 3: Re-initialize Firebase

From project root:
```bash
# Re-run Firebase initialization
firebase init
```

Or force deploy to trigger service account creation:
```bash
firebase deploy --only firestore:rules
```

Firebase will automatically:
1. Create `firebase-adminsdk-fbsvc@...` service account
2. Assign correct IAM roles
3. Configure permissions

---

## 🛠️ Alternative: Manual Service Account Creation

**Use only if automatic method fails.**

### Create the service account:
```bash
gcloud iam service-accounts create firebase-adminsdk-fbsvc \
  --project=sankalp-prerollout \
  --display-name="Firebase Admin SDK Service Account"
```

### Assign required roles:
```bash
# Firebase SDK Admin role
gcloud projects add-iam-policy-binding sankalp-prerollout \
  --member="serviceAccount:firebase-adminsdk-fbsvc@sankalp-prerollout.iam.gserviceaccount.com" \
  --role="roles/firebase.sdkAdminServiceAgent"

# Token creator role
gcloud projects add-iam-policy-binding sankalp-prerollout \
  --member="serviceAccount:firebase-adminsdk-fbsvc@sankalp-prerollout.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"

# Firebase admin role
gcloud projects add-iam-policy-binding sankalp-prerollout \
  --member="serviceAccount:firebase-adminsdk-fbsvc@sankalp-prerollout.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"
```

---

## ✅ Verification

After fixing, verify:

1. **Service account exists**:
   ```bash
   gcloud iam service-accounts list --project=sankalp-prerollout | grep firebase-adminsdk
   ```

2. **Has correct roles**:
   ```bash
   gcloud projects get-iam-policy sankalp-prerollout \
     --flatten="bindings[].members" \
     --filter="bindings.members:firebase-adminsdk-fbsvc@sankalp-prerollout.iam.gserviceaccount.com"
   ```

3. **Firebase deploy works**:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🔍 Why This Happened

Common causes:
- Firebase was partially initialized then interrupted
- Project was deleted/recreated
- Someone manually deleted the service account
- Firebase services enabled before IAM synced

---

## 📝 Next Steps After Fix

Once fixed, you should be able to:
- ✅ Deploy Firestore rules without errors
- ✅ Use Firebase Admin SDK server-side
- ✅ Run Cloud Functions
- ✅ Deploy to Firebase Hosting

---

## 🚨 Important Notes

- **DO NOT** delete this service account manually
- It's auto-managed by Firebase
- Required for all server-side Firebase operations
- Without it, Admin SDK calls will fail silently

---

*Last updated: 2026-01-31*
