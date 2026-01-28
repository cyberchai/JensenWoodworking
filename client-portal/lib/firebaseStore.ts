import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  deleteField,
  query, 
  orderBy, 
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Project, Feedback, ContactRequest, StatusUpdate, PastProject, StatusUpdatePhoto } from './mockStore';
import { getSecurePaymentHandles, validatePaymentHandles } from './paymentHandles';
import { generateSecureToken, validateTokenFormat, normalizeToken } from './tokenGenerator';

// Helper to convert Firestore timestamp to number
const timestampToNumber = (timestamp: Timestamp | number): number => {
  if (typeof timestamp === 'number') return timestamp;
  return timestamp.toMillis();
};

// Helper to convert number to Firestore timestamp
const numberToTimestamp = (num: number): Timestamp => {
  return Timestamp.fromMillis(num);
};

// Projects collection
const PROJECTS_COLLECTION = 'projects';
const FEEDBACK_COLLECTION = 'feedback';
const CONTACT_REQUESTS_COLLECTION = 'contactRequests';
const PAST_PROJECTS_COLLECTION = 'pastProjects';

// Generate random token
export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Convert Firestore document to Project
const docToProject = (docSnap: QueryDocumentSnapshot<DocumentData>): Project => {
  const data = docSnap.data();
  const secureHandles = getSecurePaymentHandles();
  
  // Always use secure handles - ignore any values stored in Firestore
  return {
    token: docSnap.id,
    clientLabel: data.clientLabel,
    description: data.description,
    projectStartDate: data.projectStartDate ? timestampToNumber(data.projectStartDate) : undefined,
    projectTokenCode: data.projectTokenCode,
    paymentCode: data.paymentCode,
    statusUpdates: data.statusUpdates || [],
    depositPaid: data.depositPaid || false,
    finalPaid: data.finalPaid || false,
    isCompleted: data.isCompleted || false,
    venmoHandle: secureHandles.venmoHandle, // Enforce secure handle
    paypalHandle: secureHandles.paypalHandle, // Enforce secure handle
    createdAt: timestampToNumber(data.createdAt),
  };
};

// Convert Firestore document to Feedback
const docToFeedback = (docSnap: QueryDocumentSnapshot<DocumentData>): Feedback => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    projectToken: data.projectToken,
    projectName: data.projectName,
    rating: data.rating,
    comment: data.comment,
    allowTestimonial: data.allowTestimonial || false,
    isTestimonial: data.isTestimonial || false,
    createdAt: timestampToNumber(data.createdAt),
    clientName: data.clientName,
  };
};

// Convert Firestore document to ContactRequest
const docToContactRequest = (docSnap: QueryDocumentSnapshot<DocumentData>): ContactRequest => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    message: data.message,
    budget: data.budget || undefined,
    contractorInvolved: data.contractorInvolved || undefined,
    designerInvolved: data.designerInvolved || undefined,
    additionalDetails: data.additionalDetails || undefined,
    status: data.status || 'new',
    createdAt: timestampToNumber(data.createdAt),
  };
};

// Convert Firestore document to PastProject
const docToPastProject = (docSnap: QueryDocumentSnapshot<DocumentData>): PastProject => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    projectToken: data.projectToken,
    title: data.title,
    description: data.description,
    selectedImages: data.selectedImages || [],
    createdAt: timestampToNumber(data.createdAt),
    completedAt: timestampToNumber(data.completedAt),
    isFeaturedOnHomePage: data.isFeaturedOnHomePage || false,
  };
};

export const firebaseStore = {
  // Project operations
  async getProject(token: string): Promise<Project | undefined> {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, token);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docToProject(docSnap as QueryDocumentSnapshot<DocumentData>);
      }
      return undefined;
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  },

  async getAllProjects(): Promise<Project[]> {
    try {
      const q = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => docToProject(doc as QueryDocumentSnapshot<DocumentData>));
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  },

  async createProject(data: Omit<Project, 'token' | 'createdAt' | 'venmoHandle' | 'paypalHandle'>): Promise<Project> {
    let token: string;
    const secureHandles = getSecurePaymentHandles();
    
    // Handle user-provided token vs auto-generated
    if (data.projectTokenCode?.trim()) {
      // User-provided token: validate format and check for duplicates
      token = normalizeToken(data.projectTokenCode.trim());
      
      // Validate token format
      if (!validateTokenFormat(token)) {
        throw new Error(`Invalid token format. Token must match format: JW-XXXX-XXXX-XXXX (where X is alphanumeric)`);
      }
      
      // Check for duplicate
      const existing = await this.getProject(token);
      if (existing) {
        throw new Error(`Token "${token}" already exists. Please use a different token code.`);
      }
    } else {
      // Auto-generated token: ensure uniqueness
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        token = generateSecureToken();
        attempts++;
        
        // Check if token exists in Firestore
        const existing = await this.getProject(token);
        if (!existing) {
          break; // Token is unique, exit loop
        }
        
        // If we've tried too many times, throw an error
        if (attempts >= maxAttempts) {
          throw new Error('Unable to generate unique token after multiple attempts. Please try again.');
        }
      } while (true);
    }
    
    // Enforce secure payment handles - cannot be overridden
    const projectData: any = {
      clientLabel: data.clientLabel,
      venmoHandle: secureHandles.venmoHandle,
      paypalHandle: secureHandles.paypalHandle,
      createdAt: numberToTimestamp(Date.now()),
      statusUpdates: data.statusUpdates || [],
      depositPaid: data.depositPaid || false,
      finalPaid: data.finalPaid || false,
      isCompleted: data.isCompleted || false,
    };
    
    // Only include optional fields if they have values (Firestore doesn't allow undefined)
    if (data.description && data.description.trim()) {
      projectData.description = data.description.trim();
    }
    
    if (data.projectStartDate) {
      projectData.projectStartDate = numberToTimestamp(data.projectStartDate);
    }
    
    // Only include projectTokenCode if it was provided and not empty (not undefined)
    if (data.projectTokenCode && data.projectTokenCode.trim()) {
      projectData.projectTokenCode = data.projectTokenCode.trim();
    }
    
    // Only include paymentCode if it was provided and not empty (not undefined)
    if ((data as any).paymentCode && (data as any).paymentCode.trim()) {
      projectData.paymentCode = (data as any).paymentCode.trim();
    }
    
    const docRef = doc(db, PROJECTS_COLLECTION, token);
    await setDoc(docRef, projectData);
    
    return {
      ...data,
      paymentCode: (data as any).paymentCode,
      venmoHandle: secureHandles.venmoHandle,
      paypalHandle: secureHandles.paypalHandle,
      token,
      createdAt: Date.now(),
    };
  },

  async updateProject(token: string, updates: Partial<Omit<Project, 'token' | 'createdAt' | 'venmoHandle' | 'paypalHandle'>>): Promise<Project | undefined> {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, token);
      const updateData: any = {};
      
      // Only allow safe fields to be updated
      if (updates.clientLabel !== undefined) updateData.clientLabel = updates.clientLabel;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.projectStartDate !== undefined) {
        updateData.projectStartDate = numberToTimestamp(updates.projectStartDate);
      }
      if (updates.projectTokenCode !== undefined) updateData.projectTokenCode = updates.projectTokenCode;
      // Handle paymentCode: if undefined or empty string, delete the field; otherwise save the trimmed value
      if ((updates as any).paymentCode !== undefined) {
        const paymentCodeValue = (updates as any).paymentCode;
        if (paymentCodeValue === null || paymentCodeValue === undefined || (typeof paymentCodeValue === 'string' && paymentCodeValue.trim() === '')) {
          // Delete the field if it's null, undefined, or empty string
          updateData.paymentCode = deleteField();
        } else {
          // Save the trimmed value
          updateData.paymentCode = typeof paymentCodeValue === 'string' ? paymentCodeValue.trim() : paymentCodeValue;
        }
      }
      if (updates.statusUpdates !== undefined) updateData.statusUpdates = updates.statusUpdates;
      if (updates.depositPaid !== undefined) updateData.depositPaid = updates.depositPaid;
      if (updates.finalPaid !== undefined) updateData.finalPaid = updates.finalPaid;
      if (updates.isCompleted !== undefined) updateData.isCompleted = updates.isCompleted;
      
      // Prevent payment handles from being updated
      // If someone tries to update them, validate and reject
      const unsafeUpdates = updates as any;
      if (unsafeUpdates.venmoHandle !== undefined || unsafeUpdates.paypalHandle !== undefined) {
        const currentProject = await this.getProject(token);
        if (currentProject) {
          validatePaymentHandles(
            unsafeUpdates.venmoHandle || currentProject.venmoHandle,
            unsafeUpdates.paypalHandle || currentProject.paypalHandle
          );
        }
        // Even if validation passes, we don't update these fields
        throw new Error('Payment handles cannot be modified');
      }
      
      await updateDoc(docRef, updateData);
      
      const updated = await this.getProject(token);
      return updated;
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  },

  async addStatusUpdate(token: string, update: Omit<StatusUpdate, 'id' | 'createdAt'>): Promise<StatusUpdate | undefined> {
    try {
      const project = await this.getProject(token);
      if (!project) return undefined;
      
      const photos = (update.photos || []).slice(0, 3);
      const statusUpdate: StatusUpdate = {
        ...update,
        photos,
        id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };
      
      const updatedStatusUpdates = [...project.statusUpdates, statusUpdate].sort((a, b) => b.createdAt - a.createdAt);
      await this.updateProject(token, { statusUpdates: updatedStatusUpdates });
      
      return statusUpdate;
    } catch (error) {
      console.error('Error adding status update:', error);
      return undefined;
    }
  },

  async deleteStatusUpdate(token: string, updateId: string): Promise<boolean> {
    try {
      const project = await this.getProject(token);
      if (!project) return false;
      
      const updatedStatusUpdates = project.statusUpdates.filter(u => u.id !== updateId);
      await this.updateProject(token, { statusUpdates: updatedStatusUpdates });
      
      return true;
    } catch (error) {
      console.error('Error deleting status update:', error);
      return false;
    }
  },

  // Feedback operations
  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const q = query(collection(db, FEEDBACK_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => docToFeedback(doc as QueryDocumentSnapshot<DocumentData>));
    } catch (error) {
      console.error('Error getting feedback:', error);
      return [];
    }
  },

  async getTestimonials(): Promise<Feedback[]> {
    try {
      const q = query(collection(db, FEEDBACK_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => docToFeedback(doc as QueryDocumentSnapshot<DocumentData>))
        .filter(f => f.isTestimonial);
    } catch (error) {
      console.error('Error getting testimonials:', error);
      return [];
    }
  },

  async createFeedback(data: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const feedbackData: any = {
      projectToken: data.projectToken,
      projectName: data.projectName,
      rating: data.rating,
      comment: data.comment,
      allowTestimonial: data.allowTestimonial,
      isTestimonial: data.isTestimonial,
      createdAt: numberToTimestamp(Date.now()),
    };
    
    // Only include clientName if it's provided
    if (data.clientName && data.clientName.trim()) {
      feedbackData.clientName = data.clientName.trim();
    }
    
    const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), feedbackData);
    
    return {
      ...data,
      id: docRef.id,
      createdAt: Date.now(),
    };
  },

  async updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt'>>): Promise<Feedback | undefined> {
    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, id);
      await updateDoc(docRef, updates);
      
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return docToFeedback(updatedDoc as QueryDocumentSnapshot<DocumentData>);
      }
      return undefined;
    } catch (error) {
      console.error('Error updating feedback:', error);
      return undefined;
    }
  },

  async deleteFeedback(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return false;
    }
  },

  // Contact Request operations
  async getAllContactRequests(): Promise<ContactRequest[]> {
    try {
      const q = query(collection(db, CONTACT_REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => docToContactRequest(doc as QueryDocumentSnapshot<DocumentData>));
    } catch (error) {
      console.error('Error getting contact requests:', error);
      return [];
    }
  },

  async createContactRequest(data: Omit<ContactRequest, 'id' | 'createdAt'>): Promise<ContactRequest> {
    const requestData: any = {
      name: data.name,
      email: data.email,
      message: data.message,
      status: 'new',
      createdAt: numberToTimestamp(Date.now()),
    };
    
    // Only include optional fields if they're provided
    if (data.phone && data.phone.trim()) {
      requestData.phone = data.phone.trim();
    }
    
    if (data.budget && data.budget.trim()) {
      requestData.budget = data.budget.trim();
    }
    
    if (data.contractorInvolved !== undefined) {
      requestData.contractorInvolved = data.contractorInvolved;
    }
    
    if (data.designerInvolved !== undefined) {
      requestData.designerInvolved = data.designerInvolved;
    }
    
    if (data.additionalDetails && data.additionalDetails.trim()) {
      requestData.additionalDetails = data.additionalDetails.trim();
    }
    
    const docRef = await addDoc(collection(db, CONTACT_REQUESTS_COLLECTION), requestData);
    
    return {
      ...data,
      id: docRef.id,
      createdAt: Date.now(),
    };
  },

  async updateContactRequest(id: string, updates: Partial<Omit<ContactRequest, 'id' | 'createdAt'>>): Promise<ContactRequest | undefined> {
    try {
      const docRef = doc(db, CONTACT_REQUESTS_COLLECTION, id);
      await updateDoc(docRef, updates);
      
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return docToContactRequest(updatedDoc as QueryDocumentSnapshot<DocumentData>);
      }
      return undefined;
    } catch (error) {
      console.error('Error updating contact request:', error);
      return undefined;
    }
  },

  async deleteContactRequest(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, CONTACT_REQUESTS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting contact request:', error);
      return false;
    }
  },

  // Storage operations
  async uploadPhoto(file: File, projectToken: string, updateId?: string): Promise<string> {
    try {
      const fileName = updateId 
        ? `projects/${projectToken}/updates/${updateId}/${Date.now()}_${file.name}`
        : `projects/${projectToken}/${Date.now()}_${file.name}`;
      
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  async deletePhoto(url: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  },

  // Past Projects operations
  async getAllPastProjects(): Promise<PastProject[]> {
    try {
      const q = query(collection(db, PAST_PROJECTS_COLLECTION), orderBy('completedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => docToPastProject(doc as QueryDocumentSnapshot<DocumentData>));
    } catch (error) {
      console.error('Error getting past projects:', error);
      return [];
    }
  },

  async getPastProject(id: string): Promise<PastProject | undefined> {
    try {
      const docRef = doc(db, PAST_PROJECTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docToPastProject(docSnap as QueryDocumentSnapshot<DocumentData>);
      }
      return undefined;
    } catch (error) {
      console.error('Error getting past project:', error);
      return undefined;
    }
  },

  async getPastProjectByToken(projectToken: string): Promise<PastProject | undefined> {
    try {
      const q = query(collection(db, PAST_PROJECTS_COLLECTION), orderBy('completedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const pastProject = querySnapshot.docs
        .map(doc => docToPastProject(doc as QueryDocumentSnapshot<DocumentData>))
        .find(p => p.projectToken === projectToken);
      return pastProject;
    } catch (error) {
      console.error('Error getting past project by token:', error);
      return undefined;
    }
  },

  async createPastProject(data: Omit<PastProject, 'id' | 'createdAt' | 'completedAt'>): Promise<PastProject> {
    const pastProjectData: any = {
      projectToken: data.projectToken,
      title: data.title,
      selectedImages: data.selectedImages || [],
      createdAt: numberToTimestamp(Date.now()),
      completedAt: numberToTimestamp(Date.now()),
      isFeaturedOnHomePage: data.isFeaturedOnHomePage || false,
    };
    
    if (data.description && data.description.trim()) {
      pastProjectData.description = data.description.trim();
    }
    
    const docRef = await addDoc(collection(db, PAST_PROJECTS_COLLECTION), pastProjectData);
    
    return {
      ...data,
      id: docRef.id,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };
  },

  async updatePastProject(id: string, updates: Partial<Omit<PastProject, 'id' | 'createdAt' | 'completedAt' | 'projectToken'>>): Promise<PastProject | undefined> {
    try {
      const docRef = doc(db, PAST_PROJECTS_COLLECTION, id);
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) {
        if (updates.description === null || updates.description === undefined || (typeof updates.description === 'string' && updates.description.trim() === '')) {
          updateData.description = deleteField();
        } else {
          updateData.description = typeof updates.description === 'string' ? updates.description.trim() : updates.description;
        }
      }
      if (updates.selectedImages !== undefined) updateData.selectedImages = updates.selectedImages;
      if (updates.isFeaturedOnHomePage !== undefined) updateData.isFeaturedOnHomePage = updates.isFeaturedOnHomePage;
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      if (updatedDoc.exists()) {
        return docToPastProject(updatedDoc as QueryDocumentSnapshot<DocumentData>);
      }
      return undefined;
    } catch (error) {
      console.error('Error updating past project:', error);
      return undefined;
    }
  },

  async deletePastProject(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, PAST_PROJECTS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting past project:', error);
      return false;
    }
  },
};

