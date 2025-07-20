
export type UserRole = 'administrateur' | 'prestataire' | 'donateur';

export interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: UserRole;
  email_verified_at?: string;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Village {
  id: string;
  name: string;
  region: string;
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdBy: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  village: Village;
  prestataireId: string;
  prestataireName: string;
  targetAmount: number;
  currentAmount: number;
  status: 'pending' | 'validated' | 'funded' | 'in_progress' | 'completed' | 'rejected';
  category: 'well' | 'pump' | 'distribution' | 'treatment';
  estimatedDuration: number; // in months
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'technical' | 'financial' | 'authorization';
  url: string;
  uploadedAt: string;
}

export interface Contribution {
  id: string;
  donatorId: string;
  donatorName: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'refunded';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
