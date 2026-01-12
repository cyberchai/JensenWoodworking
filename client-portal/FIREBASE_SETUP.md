# Firebase Integration Setup

This project is now integrated with Firebase for data persistence and media storage.

## Configuration

Firebase configuration is stored in `lib/firebase.ts`. The configuration uses environment variables with fallback to hardcoded values for development.

### Environment Variables (Optional)

Create a `.env.local` file in the `client-portal` directory with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Note:** These values are safe to expose in client-side code. They're already configured in the codebase.

## Switching Between Mock and Firebase Store

The project uses a store abstraction layer in `lib/store.ts`. To switch between the mock store and Firebase:

1. Open `lib/store.ts`
2. Change `USE_FIREBASE` to `true` for Firebase or `false` for mock store:

```typescript
const USE_FIREBASE = true; // Set to false to use mock store
```

## Firebase Collections

The following Firestore collections are used:

- **`projects`** - Stores project data (token as document ID)
- **`feedback`** - Stores client feedback
- **`contactRequests`** - Stores contact form submissions

## Firebase Storage

Media files are stored in Firebase Storage with the following structure:

- **Project photos:** `projects/{projectToken}/updates/{updateId}/{timestamp}_{filename}`
- **General media:** `projects/{projectToken}/{timestamp}_{filename}`

## Firestore Security Rules

You'll need to set up Firestore security rules in the Firebase Console. Example rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projects - read for clients, write for admin
    match /projects/{projectId} {
      allow read: if true; // Anyone can read with project token
      allow write: if request.auth != null; // Only authenticated admins
    }
    
    // Feedback - read for admin, write for anyone
    match /feedback/{feedbackId} {
      allow read: if request.auth != null;
      allow create: if true; // Anyone can submit feedback
      allow update, delete: if request.auth != null;
    }
    
    // Contact Requests - admin only
    match /contactRequests/{requestId} {
      allow read, write: if request.auth != null;
      allow create: if true; // Anyone can submit contact requests
    }
  }
}
```

## Storage Security Rules

Set up Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{projectId}/{allPaths=**} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null; // Only authenticated admins
    }
  }
}
```

## Next Steps

1. **Set up Firebase Authentication** (if you want admin authentication)
2. **Configure Security Rules** in Firebase Console
3. **Test the integration** by creating a project and checking Firestore
4. **Migrate existing data** from mock store if needed

## Troubleshooting

- **"Firebase not initialized"**: Make sure Firebase is properly installed (`npm install firebase`)
- **Permission errors**: Check Firestore and Storage security rules
- **Async errors**: All store methods are now async - make sure components use `await`

