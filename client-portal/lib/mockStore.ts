export interface StatusUpdatePhoto {
  url: string;
  fileId?: string; // ImageKit file ID if applicable
}

export interface StatusUpdate {
  id: string;
  title: string;
  message: string;
  photos?: (string | StatusUpdatePhoto)[];
  createdAt: number;
}

export interface Project {
  token: string; // Slugified project name (derived from clientLabel)
  clientLabel: string;
  description?: string;
  projectStartDate?: number; // Unix timestamp
  paymentCode?: string; // PIN code for payment access
  projectType?: string[]; // e.g. ["Island Top", "Counter Top"]
  depositPaid: boolean;
  finalPaid: boolean;
  isCompleted?: boolean; // Whether project is completed and moved to past projects
  venmoHandle: string;
  paypalHandle: string;
  createdAt: number;
  statusUpdates?: StatusUpdate[];
}

export interface PastProject {
  id: string;
  projectToken: string; // Reference to original project token
  title: string;
  description?: string;
  projectType?: string[]; // e.g. ["Island Top", "Counter Top"]
  selectedImages: PastProjectImage[]; // Selected images from media gallery
  createdAt: number;
  completedAt: number; // When project was marked as completed
  isFeaturedOnHomePage?: boolean; // Whether to display on home page gallery
}

export interface PastProjectImage {
  url: string;
  fileId?: string; // ImageKit file ID if applicable
  name: string;
  isFeatured: boolean; // Whether to display on main website
}

export interface Feedback {
  id: string;
  projectToken: string;
  projectName: string;
  rating: number;
  comment: string;
  allowTestimonial: boolean;
  isTestimonial: boolean;
  createdAt: number;
  clientName?: string;
  title?: string; // Title/header line for testimonials displayed on home page
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  budget?: string;
  contractorInvolved?: boolean;
  designerInvolved?: boolean;
  additionalDetails?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: number;
}


// In-memory store
const mockProjects = new Map<string, Project>();
const mockFeedback = new Map<string, Feedback>();
const mockContactRequests = new Map<string, ContactRequest>();
const mockPastProjects = new Map<string, PastProject>();

// Import project name utilities
import { slugifyProjectName, normalizeProjectName } from './projectNameUtils';

// Initialize with example projects
function initializeStore() {
  const now = Date.now();
  const secureHandles = getSecurePaymentHandles();
  
  mockProjects.set('custom-walnut-dining-table', {
    token: 'custom-walnut-dining-table',
    clientLabel: 'Custom Walnut Dining Table',
    depositPaid: true,
    finalPaid: false,
    venmoHandle: secureHandles.venmoHandle,
    paypalHandle: secureHandles.paypalHandle,
    createdAt: now - 86400000 * 30, // 30 days ago
  });

  mockProjects.set('kitchen-island-countertop', {
    token: 'kitchen-island-countertop',
    clientLabel: 'Kitchen Island Countertop',
    depositPaid: true,
    finalPaid: true,
    venmoHandle: secureHandles.venmoHandle,
    paypalHandle: secureHandles.paypalHandle,
    createdAt: now - 86400000 * 15, // 15 days ago
  });

  mockProjects.set('live-edge-mantel', {
    token: 'live-edge-mantel',
    clientLabel: 'Live Edge Mantel',
    depositPaid: false,
    finalPaid: false,
    venmoHandle: secureHandles.venmoHandle,
    paypalHandle: secureHandles.paypalHandle,
    createdAt: now - 86400000 * 7, // 7 days ago
  });
}

// Initialize on module load
initializeStore();

import { getSecurePaymentHandles, validatePaymentHandles } from './paymentHandles';

// Store operations
export const store = {
  getProject(token: string): Project | undefined {
    return mockProjects.get(token);
  },

  getAllProjects(): Project[] {
    return Array.from(mockProjects.values()).sort((a, b) => b.createdAt - a.createdAt);
  },

  createProject(data: Omit<Project, 'token' | 'createdAt' | 'venmoHandle' | 'paypalHandle'>): Project {
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
    const existingProjects = Array.from(mockProjects.values());
    const duplicate = existingProjects.find(p => normalizeProjectName(p.clientLabel) === normalizedName);
    
    if (duplicate) {
      throw new Error(`A project with the name "${data.clientLabel}" already exists. Please use a different project name.`);
    }
    
    // Also check if token already exists (in case of slug collision)
    if (mockProjects.has(token)) {
      throw new Error(`A project with a similar name already exists. Please use a different project name.`);
    }
    
    // Enforce secure payment handles - cannot be overridden
    const project: Project = {
      ...data,
      venmoHandle: secureHandles.venmoHandle,
      paypalHandle: secureHandles.paypalHandle,
      token,
      createdAt: Date.now(),
    };
    mockProjects.set(token, project);
    return project;
  },

  updateProject(token: string, updates: Partial<Omit<Project, 'token' | 'createdAt' | 'venmoHandle' | 'paypalHandle'>>): Project | undefined {
    const project = mockProjects.get(token);
    if (!project) return undefined;
    
    // Prevent payment handles from being updated
    const { venmoHandle, paypalHandle, ...safeUpdates } = updates as any;
    
    // Validate if someone tries to update payment handles
    if (venmoHandle !== undefined || paypalHandle !== undefined) {
      validatePaymentHandles(
        venmoHandle || project.venmoHandle,
        paypalHandle || project.paypalHandle
      );
    }
    
    // If clientLabel is being updated, regenerate token and check uniqueness
    let newToken = project.token;
    if (safeUpdates.clientLabel && safeUpdates.clientLabel.trim() !== project.clientLabel.trim()) {
      const newClientLabel = safeUpdates.clientLabel.trim();
      
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
      const existingProjects = Array.from(mockProjects.values()).filter(p => p.token !== token);
      const duplicate = existingProjects.find(p => normalizeProjectName(p.clientLabel) === normalizedName);
      
      if (duplicate) {
        throw new Error(`A project with the name "${newClientLabel}" already exists. Please use a different project name.`);
      }
      
      // Also check if new token already exists (in case of slug collision)
      if (mockProjects.has(newToken) && newToken !== token) {
        throw new Error(`A project with a similar name already exists. Please use a different project name.`);
      }
      
      // Update token in safeUpdates
      safeUpdates.token = newToken;
    }
    
    // Always use secure handles - never update them
    const updated = { 
      ...project, 
      ...safeUpdates,
      venmoHandle: project.venmoHandle, // Keep original secure handle
      paypalHandle: project.paypalHandle, // Keep original secure handle
      token: newToken, // Use new token if clientLabel changed
    };
    
    // If token changed, update the map key
    if (newToken !== token) {
      mockProjects.delete(token);
      mockProjects.set(newToken, updated);
    } else {
      mockProjects.set(token, updated);
    }
    
    return updated;
  },


  // Feedback operations
  getAllFeedback(): Feedback[] {
    return Array.from(mockFeedback.values()).sort((a, b) => b.createdAt - a.createdAt);
  },

  getTestimonials(): Feedback[] {
    return Array.from(mockFeedback.values())
      .filter(f => f.isTestimonial)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  createFeedback(data: Omit<Feedback, 'id' | 'createdAt'>): Feedback {
    const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const feedback: Feedback = {
      ...data,
      id,
      createdAt: Date.now(),
    };
    mockFeedback.set(id, feedback);
    return feedback;
  },

  updateFeedback(id: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt'>>): Feedback | undefined {
    const feedback = mockFeedback.get(id);
    if (!feedback) return undefined;
    
    const updated = { ...feedback, ...updates };
    mockFeedback.set(id, updated);
    return updated;
  },

  deleteFeedback(id: string): boolean {
    return mockFeedback.delete(id);
  },

  // Contact Request operations
  getAllContactRequests(): ContactRequest[] {
    return Array.from(mockContactRequests.values()).sort((a, b) => b.createdAt - a.createdAt);
  },

  createContactRequest(data: Omit<ContactRequest, 'id' | 'createdAt'>): ContactRequest {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request: ContactRequest = {
      ...data,
      id,
      createdAt: Date.now(),
    };
    mockContactRequests.set(id, request);
    return request;
  },

  updateContactRequest(id: string, updates: Partial<Omit<ContactRequest, 'id' | 'createdAt'>>): ContactRequest | undefined {
    const request = mockContactRequests.get(id);
    if (!request) return undefined;
    
    const updated = { ...request, ...updates };
    mockContactRequests.set(id, updated);
    return updated;
  },

  deleteContactRequest(id: string): boolean {
    return mockContactRequests.delete(id);
  },

  // Past Projects operations
  getAllPastProjects(): PastProject[] {
    return Array.from(mockPastProjects.values()).sort((a, b) => b.completedAt - a.completedAt);
  },

  getPastProject(id: string): PastProject | undefined {
    return mockPastProjects.get(id);
  },

  getPastProjectByToken(projectToken: string): PastProject | undefined {
    return Array.from(mockPastProjects.values()).find(p => p.projectToken === projectToken);
  },

  createPastProject(data: Omit<PastProject, 'id' | 'createdAt' | 'completedAt'>): PastProject {
    const id = `past_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pastProject: PastProject = {
      ...data,
      id,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };
    mockPastProjects.set(id, pastProject);
    return pastProject;
  },

  updatePastProject(id: string, updates: Partial<Omit<PastProject, 'id' | 'createdAt' | 'completedAt' | 'projectToken'>>): PastProject | undefined {
    const pastProject = mockPastProjects.get(id);
    if (!pastProject) return undefined;
    
    const updated = { ...pastProject, ...updates };
    mockPastProjects.set(id, updated);
    return updated;
  },

  deletePastProject(id: string): boolean {
    return mockPastProjects.delete(id);
  },

  // Status Update operations
  addStatusUpdate(projectToken: string, update: Omit<StatusUpdate, 'id' | 'createdAt'>): void {
    const project = mockProjects.get(projectToken);
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
    const updated = {
      ...project,
      statusUpdates: [...currentUpdates, newUpdate],
    };

    mockProjects.set(projectToken, updated);
  },

  deleteStatusUpdate(projectToken: string, updateId: string): void {
    const project = mockProjects.get(projectToken);
    if (!project) {
      throw new Error(`Project with token ${projectToken} not found`);
    }

    const currentUpdates = project.statusUpdates || [];
    const updatedUpdates = currentUpdates.filter(u => u.id !== updateId);
    const updated = {
      ...project,
      statusUpdates: updatedUpdates.length > 0 ? updatedUpdates : undefined,
    };

    mockProjects.set(projectToken, updated);
  },
};

// Initialize with example feedback after store is defined
function initializeFeedback() {
  const now = Date.now();
  
  mockFeedback.set('feedback1', {
    id: 'feedback1',
    projectToken: 'DEMO1',
    projectName: 'Custom Walnut Dining Table',
    rating: 5,
    comment: 'The kitchen island Klaus built for us is absolutely stunning. The attention to detail and quality of craftsmanship exceeded our expectations. It\'s the centerpiece of our home.',
    allowTestimonial: true,
    isTestimonial: true,
    clientName: 'Sarah & Michael T.',
    createdAt: now - 86400000 * 10,
  });

  mockFeedback.set('feedback2', {
    id: 'feedback2',
    projectToken: 'DEMO2',
    projectName: 'Kitchen Island Countertop',
    rating: 5,
    comment: 'Working with Jensen Woodworking was a pleasure from start to finish. Klaus helped us choose the perfect wood and finish for our dining table. It\'s beautiful and built to last.',
    allowTestimonial: true,
    isTestimonial: true,
    clientName: 'Jennifer M.',
    createdAt: now - 86400000 * 5,
  });

  mockFeedback.set('feedback3', {
    id: 'feedback3',
    projectToken: 'DEMO1',
    projectName: 'Custom Walnut Dining Table',
    rating: 4,
    comment: 'Great work overall, very happy with the result. The finish could have been slightly smoother but still excellent quality.',
    allowTestimonial: false,
    isTestimonial: false,
    createdAt: now - 86400000 * 2,
  });
}

initializeFeedback();

// Initialize with example contact requests
function initializeContactRequests() {
  const now = Date.now();
  
  mockContactRequests.set('contact1', {
    id: 'contact1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    message: 'I\'m interested in a custom dining table. Could we schedule a consultation?',
    status: 'new',
    createdAt: now - 86400000 * 2,
  });

  mockContactRequests.set('contact2', {
    id: 'contact2',
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    phone: '(555) 987-6543',
    message: 'Looking for a quote on a kitchen island. What\'s your typical timeline?',
    status: 'read',
    createdAt: now - 86400000 * 5,
  });

  mockContactRequests.set('contact3', {
    id: 'contact3',
    name: 'Robert Chen',
    email: 'r.chen@example.com',
    message: 'Do you do custom furniture restoration? I have an antique table that needs work.',
    status: 'replied',
    createdAt: now - 86400000 * 10,
  });
}

initializeContactRequests();
