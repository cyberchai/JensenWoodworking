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
import { Project, Feedback, ContactRequest, PastProject, StatusUpdate, StatusUpdatePhoto } from './mockStore';
import { getSecurePaymentHandles, validatePaymentHandles } from './paymentHandles';
import { slugifyProjectName, normalizeProjectName } from './projectNameUtils';

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


// Convert Firestore document to Project
const docToProject = (docSnap: QueryDocumentSnapshot<DocumentData>): Project => {
  const data = docSnap.data();
  const secureHandles = getSecurePaymentHandles();
  
  // Convert statusUpdates array if it exists
  const statusUpdates: StatusUpdate[] = data.statusUpdates 
    ? data.statusUpdates.map((update: any) => ({
        id: update.id || `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: update.title,
        message: update.message,
        photos: update.photos || [],
        createdAt: update.createdAt ? timestampToNumber(update.createdAt) : Date.now(),
      }))
    : [];
  
  // Always use secure handles - ignore any values stored in Firestore
  return {
    token: docSnap.id,
    clientLabel: data.clientLabel,
    description: data.description,
    projectStartDate: data.projectStartDate ? timestampToNumber(data.projectStartDate) : undefined,
    paymentCode: data.paymentCode,
    depositPaid: data.depositPaid || false,
    finalPaid: data.finalPaid || false,
    isCompleted: data.isCompleted || false,
    venmoHandle: secureHandles.venmoHandle, // Enforce secure handle
    paypalHandle: secureHandles.paypalHandle, // Enforce secure handle
    createdAt: timestampToNumber(data.createdAt),
    statusUpdates: statusUpdates.length > 0 ? statusUpdates : undefined,
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
    title: data.title || undefined,
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
    const secureHandles = getSecurePaymentHandles();
    
    // Validate clientLabel is provided
    if (!data.clientLabel || !data.clientLabel.trim()) {
      throw new Error('Project name (clientLabel) is required.');
    }
    
    // Generate token from clientLabel using slugification
    const token = slugifyProjectName(data.clientLabel.trim());
    
    // Validate that slugification produced a valid token
    if (!token || token.length === 0) {
      throw new Error('Project name must contain at least one alphanumeric character.');
    }
    
    // Check for uniqueness (case-insensitive)
    const normalizedName = normalizeProjectName(data.clientLabel.trim());
    const allProjects = await this.getAllProjects();
    const duplicate = allProjects.find(p => normalizeProjectName(p.clientLabel) === normalizedName);
    
    if (duplicate) {
      throw new Error(`A project with the name "${data.clientLabel}" already exists. Please use a different project name.`);
    }
    
    // Also check if token already exists (in case of slug collision)
    const existing = await this.getProject(token);
    if (existing) {
      throw new Error(`A project with a similar name already exists. Please use a different project name.`);
    }
    
    // Enforce secure payment handles - cannot be overridden
    const projectData: any = {
      clientLabel: data.clientLabel,
      venmoHandle: secureHandles.venmoHandle,
      paypalHandle: secureHandles.paypalHandle,
      createdAt: numberToTimestamp(Date.now()),
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
      const currentProject = await this.getProject(token);
      if (!currentProject) return undefined;
      
      // If clientLabel is being updated, regenerate token and check uniqueness
      let newToken = token;
      if (updates.clientLabel && updates.clientLabel.trim() !== currentProject.clientLabel.trim()) {
        const newClientLabel = updates.clientLabel.trim();
        
        // Validate new name
        if (!newClientLabel || newClientLabel.length === 0) {
          throw new Error('Project name cannot be empty.');
        }
        
        // Generate new token
        newToken = slugifyProjectName(newClientLabel);
        
        // Validate that slugification produced a valid token
        if (!newToken || newToken.length === 0) {
          throw new Error('Project name must contain at least one alphanumeric character.');
        }
        
        // Check for uniqueness (case-insensitive) - exclude current project
        const normalizedName = normalizeProjectName(newClientLabel);
        const allProjects = await this.getAllProjects();
        const duplicate = allProjects.find(p => p.token !== token && normalizeProjectName(p.clientLabel) === normalizedName);
        
        if (duplicate) {
          throw new Error(`A project with the name "${newClientLabel}" already exists. Please use a different project name.`);
        }
        
        // Also check if new token already exists (in case of slug collision)
        if (newToken !== token) {
          const existing = await this.getProject(newToken);
          if (existing) {
            throw new Error(`A project with a similar name already exists. Please use a different project name.`);
          }
        }
      }
      
      const docRef = doc(db, PROJECTS_COLLECTION, token);
      const updateData: any = {};
      
      // Only allow safe fields to be updated
      if (updates.clientLabel !== undefined) updateData.clientLabel = updates.clientLabel;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.projectStartDate !== undefined) {
        updateData.projectStartDate = numberToTimestamp(updates.projectStartDate);
      }
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
      if (updates.depositPaid !== undefined) updateData.depositPaid = updates.depositPaid;
      if (updates.finalPaid !== undefined) updateData.finalPaid = updates.finalPaid;
      if (updates.isCompleted !== undefined) updateData.isCompleted = updates.isCompleted;
      
      // Prevent payment handles from being updated
      // If someone tries to update them, validate and reject
      const unsafeUpdates = updates as any;
      if (unsafeUpdates.venmoHandle !== undefined || unsafeUpdates.paypalHandle !== undefined) {
        validatePaymentHandles(
          unsafeUpdates.venmoHandle || currentProject.venmoHandle,
          unsafeUpdates.paypalHandle || currentProject.paypalHandle
        );
        // Even if validation passes, we don't update these fields
        throw new Error('Payment handles cannot be modified');
      }
      
      // If token changed, we need to create a new document and delete the old one
      if (newToken !== token) {
        // Get current project data
        const currentDoc = await getDoc(docRef);
        const currentData = currentDoc.data();
        
        // Create new document with new token
        const newDocRef = doc(db, PROJECTS_COLLECTION, newToken);
        const newProjectData: any = {
          ...currentData,
          ...updateData,
          clientLabel: updates.clientLabel || currentProject.clientLabel,
        };
        await setDoc(newDocRef, newProjectData);
        
        // Delete old document
        await deleteDoc(docRef);
        
        // Return updated project
        return await this.getProject(newToken);
      } else {
        // Token didn't change, just update normally
        await updateDoc(docRef, updateData);
        return await this.getProject(token);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
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
    
    // Only include title if it's provided
    if (data.title && data.title.trim()) {
      feedbackData.title = data.title.trim();
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

  // Status Update operations
  async addStatusUpdate(projectToken: string, update: Omit<StatusUpdate, 'id' | 'createdAt'>): Promise<void> {
    try {
      const project = await this.getProject(projectToken);
      if (!project) {
        throw new Error(`Project with token ${projectToken} not found`);
      }

      const newUpdate: StatusUpdate = {
        id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: update.title,
        message: update.message,
        photos: update.photos || [],
        createdAt: Date.now(),
      };

      const currentUpdates = project.statusUpdates || [];
      const updatedUpdates = [...currentUpdates, newUpdate];

      const docRef = doc(db, PROJECTS_COLLECTION, projectToken);
      const updateData: any = {
        statusUpdates: updatedUpdates.map(u => ({
          id: u.id,
          title: u.title,
          message: u.message,
          photos: u.photos,
          createdAt: numberToTimestamp(u.createdAt),
        })),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error adding status update:', error);
      throw error;
    }
  },

  async deleteStatusUpdate(projectToken: string, updateId: string): Promise<void> {
    try {
      const project = await this.getProject(projectToken);
      if (!project) {
        throw new Error(`Project with token ${projectToken} not found`);
      }

      const currentUpdates = project.statusUpdates || [];
      const updatedUpdates = currentUpdates.filter(u => u.id !== updateId);

      const docRef = doc(db, PROJECTS_COLLECTION, projectToken);
      const updateData: any = {
        statusUpdates: updatedUpdates.length > 0
          ? updatedUpdates.map(u => ({
              id: u.id,
              title: u.title,
              message: u.message,
              photos: u.photos,
              createdAt: numberToTimestamp(u.createdAt),
            }))
          : deleteField(),
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error deleting status update:', error);
      throw error;
    }
  },
};

