export interface StatusUpdate {
  id: string;
  title: string;
  message: string;
  photos: string[]; // Array of photo URLs (up to 3)
  createdAt: number;
}

export interface Project {
  token: string;
  clientLabel: string;
  description?: string;
  projectStartDate?: number; // Unix timestamp
  projectTokenCode?: string; // User-provided optional token code
  paymentCode?: string; // PIN code for payment access
  statusUpdates: StatusUpdate[];
  depositPaid: boolean;
  finalPaid: boolean;
  venmoHandle: string;
  paypalHandle: string;
  createdAt: number;
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
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: number;
}


// In-memory store
const mockProjects = new Map<string, Project>();
const mockFeedback = new Map<string, Feedback>();
const mockContactRequests = new Map<string, ContactRequest>();

// Import secure token generator
import { generateSecureToken, validateTokenFormat, normalizeToken } from './tokenGenerator';

// Legacy function for backward compatibility - now uses secure token generator
export function generateToken(): string {
  return generateSecureToken();
}

// Initialize with example projects
function initializeStore() {
  const now = Date.now();
  const secureHandles = getSecurePaymentHandles();
  
  mockProjects.set('DEMO1', {
    token: 'DEMO1',
    clientLabel: 'Custom Walnut Dining Table',
    statusUpdates: [
      {
        id: 'update1',
        title: 'Project Started',
        message: 'We\'ve begun work on your custom walnut dining table. The wood has been selected and we\'re starting the initial cuts.',
        photos: [],
        createdAt: now - 86400000 * 25,
      },
      {
        id: 'update2',
        title: 'Progress Update',
        message: 'The table top has been shaped and sanded. We\'re now working on the base structure.',
        photos: [],
        createdAt: now - 86400000 * 15,
      },
      {
        id: 'update3',
        title: 'Quality Check',
        message: 'The table is nearly complete. We\'re doing a final quality check and applying the finish.',
        photos: [],
        createdAt: now - 86400000 * 5,
      },
    ],
    depositPaid: true,
    finalPaid: false,
    venmoHandle: secureHandles.venmoHandle,
    paypalHandle: secureHandles.paypalHandle,
    createdAt: now - 86400000 * 30, // 30 days ago
  });

  mockProjects.set('DEMO2', {
    token: 'DEMO2',
    clientLabel: 'Kitchen Island Countertop',
    statusUpdates: [
      {
        id: 'update4',
        title: 'Quote Approved',
        message: 'Thank you for approving the quote. We\'ll begin work on your kitchen island countertop next week.',
        photos: [],
        createdAt: now - 86400000 * 20,
      },
      {
        id: 'update5',
        title: 'Material Selection',
        message: 'We\'ve selected the perfect slab for your countertop. Photos coming soon!',
        photos: [],
        createdAt: now - 86400000 * 12,
      },
      {
        id: 'update6',
        title: 'Installation Scheduled',
        message: 'Your countertop is ready! We\'ve scheduled installation for next week.',
        photos: [],
        createdAt: now - 86400000 * 3,
      },
    ],
    depositPaid: true,
    finalPaid: true,
    venmoHandle: secureHandles.venmoHandle,
    paypalHandle: secureHandles.paypalHandle,
    createdAt: now - 86400000 * 15, // 15 days ago
  });

  const randomToken = generateToken();
  mockProjects.set(randomToken, {
    token: randomToken,
    clientLabel: 'Live Edge Mantel',
    statusUpdates: [
      {
        id: 'update7',
        title: 'Project Approved',
        message: 'Your live edge mantel project has been approved. We\'ll begin sourcing materials this week.',
        photos: [],
        createdAt: now - 86400000 * 5,
      },
    ],
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
      if (mockProjects.has(token)) {
        throw new Error(`Token "${token}" already exists. Please use a different token code.`);
      }
    } else {
      // Auto-generated token: ensure uniqueness
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        token = generateSecureToken();
        attempts++;
        
        // If we've tried too many times, throw an error
        if (attempts >= maxAttempts) {
          throw new Error('Unable to generate unique token after multiple attempts. Please try again.');
        }
      } while (mockProjects.has(token));
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
    
    // Always use secure handles - never update them
    // Note: projectTokenCode cannot be updated after creation (token is the ID)
    const updated = { 
      ...project, 
      ...safeUpdates,
      venmoHandle: project.venmoHandle, // Keep original secure handle
      paypalHandle: project.paypalHandle, // Keep original secure handle
      token: project.token, // Token cannot be changed
    };
    mockProjects.set(token, updated);
    return updated;
  },

  addStatusUpdate(token: string, update: Omit<StatusUpdate, 'id' | 'createdAt'>): StatusUpdate | undefined {
    const project = mockProjects.get(token);
    if (!project) return undefined;
    
    // Ensure photos array is limited to 3
    const photos = (update.photos || []).slice(0, 3);
    
    const statusUpdate: StatusUpdate = {
      ...update,
      photos,
      id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    
    const updated = {
      ...project,
      statusUpdates: [...project.statusUpdates, statusUpdate].sort((a, b) => b.createdAt - a.createdAt),
    };
    
    mockProjects.set(token, updated);
    return statusUpdate;
  },

  deleteStatusUpdate(token: string, updateId: string): boolean {
    const project = mockProjects.get(token);
    if (!project) return false;
    
    const updated = {
      ...project,
      statusUpdates: project.statusUpdates.filter(u => u.id !== updateId),
    };
    
    mockProjects.set(token, updated);
    return true;
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
