export type ProjectStatus = 
  | 'quote'
  | 'approved'
  | 'in_progress'
  | 'quality_check'
  | 'completed'
  | 'delivered';

export interface Project {
  token: string;
  clientLabel: string;
  status: ProjectStatus;
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

const statusOrder: ProjectStatus[] = [
  'quote',
  'approved',
  'in_progress',
  'quality_check',
  'completed',
  'delivered'
];

// In-memory store
const mockProjects = new Map<string, Project>();
const mockFeedback = new Map<string, Feedback>();

// Helper function to generate random token
export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Initialize with example projects
function initializeStore() {
  const now = Date.now();
  
  mockProjects.set('DEMO1', {
    token: 'DEMO1',
    clientLabel: 'Custom Walnut Dining Table',
    status: 'in_progress',
    depositPaid: true,
    finalPaid: false,
    venmoHandle: 'jensenwoodworking',
    paypalHandle: 'jensenwoodworking',
    createdAt: now - 86400000 * 30, // 30 days ago
  });

  mockProjects.set('DEMO2', {
    token: 'DEMO2',
    clientLabel: 'Kitchen Island Countertop',
    status: 'quality_check',
    depositPaid: true,
    finalPaid: true,
    venmoHandle: 'jensenwoodworking',
    paypalHandle: 'jensenwoodworking',
    createdAt: now - 86400000 * 15, // 15 days ago
  });

  const randomToken = generateToken();
  mockProjects.set(randomToken, {
    token: randomToken,
    clientLabel: 'Live Edge Mantel',
    status: 'approved',
    depositPaid: false,
    finalPaid: false,
    venmoHandle: 'jensenwoodworking',
    paypalHandle: 'jensenwoodworking',
    createdAt: now - 86400000 * 7, // 7 days ago
  });
}

// Initialize on module load
initializeStore();

// Store operations
export const store = {
  getProject(token: string): Project | undefined {
    return mockProjects.get(token);
  },

  getAllProjects(): Project[] {
    return Array.from(mockProjects.values()).sort((a, b) => b.createdAt - a.createdAt);
  },

  createProject(data: Omit<Project, 'token' | 'createdAt'>): Project {
    const token = generateToken();
    const project: Project = {
      ...data,
      token,
      createdAt: Date.now(),
    };
    mockProjects.set(token, project);
    return project;
  },

  updateProject(token: string, updates: Partial<Omit<Project, 'token' | 'createdAt'>>): Project | undefined {
    const project = mockProjects.get(token);
    if (!project) return undefined;
    
    const updated = { ...project, ...updates };
    mockProjects.set(token, updated);
    return updated;
  },

  getStatusOrder(): ProjectStatus[] {
    return statusOrder;
  },

  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      quote: 'Quote Sent',
      approved: 'Approved',
      in_progress: 'In Progress',
      quality_check: 'Quality Check',
      completed: 'Completed',
      delivered: 'Delivered',
    };
    return labels[status];
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

