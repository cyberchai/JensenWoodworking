# Payment Handle Security

## Overview

Payment handles (Venmo and PayPal) are **hardcoded and cannot be modified** through the UI or API. This document explains the security measures in place.

## Secure Payment Handles

- **Venmo Handle:** `@Klaus-Jensen`
- **PayPal Handle:** `@Klausduxbury`

These handles are defined in `lib/paymentHandles.ts` and are enforced at multiple layers.

## Security Layers

### 1. **Store Layer Protection**

Both `mockStore.ts` and `firebaseStore.ts` enforce secure handles:

- **`createProject()`**: Automatically sets secure handles, ignoring any values passed from the UI
- **`updateProject()`**: Explicitly prevents payment handles from being updated
- **`docToProject()`**: Always uses secure handles when reading from Firestore, ignoring stored values

### 2. **Type Safety**

The TypeScript types exclude payment handles from the `createProject` and `updateProject` parameters:

```typescript
createProject(data: Omit<Project, 'token' | 'createdAt' | 'venmoHandle' | 'paypalHandle'>)
```

This prevents accidental passing of payment handles.

### 3. **Validation Functions**

`lib/paymentHandles.ts` provides:
- `getSecurePaymentHandles()`: Returns the secure handles
- `validatePaymentHandles()`: Throws an error if handles don't match secure values

### 4. **Firestore Security Rules**

Add these rules to your Firestore security rules to prevent modification:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      // Prevent payment handles from being written
      allow create: if request.resource.data.venmoHandle == '@Klaus-Jensen' 
                 && request.resource.data.paypalHandle == '@Klausduxbury';
      
      allow update: if !('venmoHandle' in request.resource.data.diff(resource.data).affectedKeys())
                 && !('paypalHandle' in request.resource.data.diff(resource.data).affectedKeys());
      
      allow read: if true;
    }
  }
}
```

## Attack Vectors Prevented

1. **UI Manipulation**: Payment handle inputs removed from the form
2. **API Tampering**: Store layer ignores payment handles in update requests
3. **Direct Firestore Access**: Security rules prevent modification
4. **Client-Side Code Injection**: Handles are hardcoded in server-side store logic
5. **Data Corruption**: `docToProject()` always uses secure handles, even if corrupted data exists

## Additional Security Recommendations

1. **Environment Variables**: For maximum security, move handles to server-side environment variables
2. **Backend API**: Create a backend API endpoint for project creation (Next.js API routes)
3. **Authentication**: Require admin authentication before allowing project creation
4. **Audit Logging**: Log all project creation/update attempts

## Testing Security

To verify security:

1. Try to pass payment handles in `createProject()` - they will be ignored
2. Try to update payment handles via `updateProject()` - update will be rejected
3. Check Firestore - payment handles should always be the secure values
4. Inspect network requests - payment handles should never be sent from the UI

## Important Notes

- Payment handles are **hardcoded in client-side code** for this implementation
- For production with higher security requirements, consider:
  - Moving handles to environment variables
  - Using a backend API to enforce handles server-side
  - Implementing server-side validation

