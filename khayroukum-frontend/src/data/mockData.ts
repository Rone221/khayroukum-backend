
import { User, Village, Project, Contribution, Notification } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@hydromanager.com',
    role: 'admin',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jean Dupont',
    email: 'jean.dupont@prestataire.com',
    role: 'prestataire',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Marie Martin',
    email: 'marie.martin@donateur.com',
    role: 'donateur',
    createdAt: '2024-01-20T00:00:00Z'
  }
];

export const mockVillages: Village[] = [
  {
    id: '1',
    name: 'Koundara',
    region: 'Boké',
    population: 15000,
    coordinates: { lat: 12.4864, lng: -13.3056 },
    createdBy: '2',
    createdAt: '2024-03-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Dinguiraye',
    region: 'Faranah',
    population: 8500,
    coordinates: { lat: 11.3000, lng: -10.7167 },
    createdBy: '2',
    createdAt: '2024-03-05T00:00:00Z'
  },
  {
    id: '3',
    name: 'Télimélé',
    region: 'Kindia',
    population: 12000,
    coordinates: { lat: 10.9000, lng: -13.0333 },
    createdBy: '2',
    createdAt: '2024-03-10T00:00:00Z'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Forage d\'eau potable - Koundara',
    description: 'Construction d\'un puits artésien avec pompe solaire pour alimenter le village de Koundara. Le projet inclut l\'installation d\'un système de distribution et la formation des habitants à la maintenance.',
    village: mockVillages[0],
    prestataireId: '2',
    prestataireName: 'Jean Dupont',
    targetAmount: 25000,
    currentAmount: 15000,
    status: 'validated',
    category: 'well',
    estimatedDuration: 6,
    documents: [
      {
        id: '1',
        name: 'Étude technique.pdf',
        type: 'technical',
        url: '#',
        uploadedAt: '2024-03-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Devis détaillé.pdf',
        type: 'financial',
        url: '#',
        uploadedAt: '2024-03-01T00:00:00Z'
      }
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Station de traitement - Dinguiraye',
    description: 'Installation d\'une station de traitement d\'eau moderne pour améliorer la qualité de l\'eau distribuée à la population locale.',
    village: mockVillages[1],
    prestataireId: '2',
    prestataireName: 'Jean Dupont',
    targetAmount: 45000,
    currentAmount: 0,
    status: 'pending',
    category: 'treatment',
    estimatedDuration: 8,
    documents: [],
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Réseau de distribution - Télimélé',
    description: 'Mise en place d\'un réseau de distribution d\'eau potable avec bornes fontaines dans tout le village.',
    village: mockVillages[2],
    prestataireId: '2',
    prestataireName: 'Jean Dupont',
    targetAmount: 35000,
    currentAmount: 35000,
    status: 'funded',
    category: 'distribution',
    estimatedDuration: 4,
    documents: [
      {
        id: '3',
        name: 'Plan du réseau.pdf',
        type: 'technical',
        url: '#',
        uploadedAt: '2024-03-05T00:00:00Z'
      }
    ],
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-03-20T00:00:00Z'
  }
];

export const mockContributions: Contribution[] = [
  {
    id: '1',
    donatorId: '3',
    donatorName: 'Marie Martin',
    projectId: '1',
    projectTitle: 'Forage d\'eau potable - Koundara',
    amount: 5000,
    createdAt: '2024-03-15T00:00:00Z',
    status: 'confirmed'
  },
  {
    id: '2',
    donatorId: '3',
    donatorName: 'Marie Martin',
    projectId: '3',
    projectTitle: 'Réseau de distribution - Télimélé',
    amount: 10000,
    createdAt: '2024-03-20T00:00:00Z',
    status: 'confirmed'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Nouveau projet à valider',
    message: 'Le projet "Station de traitement - Dinguiraye" est en attente de validation.',
    type: 'info',
    read: false,
    createdAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    title: 'Projet validé',
    message: 'Votre projet "Forage d\'eau potable - Koundara" a été validé par l\'administration.',
    type: 'success',
    read: true,
    createdAt: '2024-03-08T00:00:00Z'
  },
  {
    id: '3',
    userId: '3',
    title: 'Nouvelle contribution',
    message: 'Votre contribution de 5000€ au projet "Forage d\'eau potable - Koundara" a été confirmée.',
    type: 'success',
    read: false,
    createdAt: '2024-03-15T00:00:00Z'
  }
];
