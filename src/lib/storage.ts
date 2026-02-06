import { Project, getOverallStatus } from './models';

const STORAGE_KEY = 'biomethane_projects';
const ONBOARDING_KEY = 'biomethane_onboarding_dismissed';

const SEED_DATA: Project[] = [
  {
    id: '1',
    name: 'GreenValley Bio',
    feedstock: 'Livestock Waste',
    location: 'Iowa, USA',
    stages: {
      permitting: { status: 'Approved', updatedAt: '2025-12-01T10:00:00Z', owner: 'ANP', notes: [] },
      injection: { status: 'In progress', updatedAt: '2026-01-15T10:00:00Z', owner: 'Utility', notes: [] },
      financing: { status: 'Not started', updatedAt: '2026-01-15T10:00:00Z', owner: 'Lender', notes: [] },
    },
    overallStatus: 'In progress',
    lastUpdated: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'SugarPower Nord',
    feedstock: 'Sugarcane',
    location: 'Sao Paulo, Brazil',
    stages: {
      permitting: { status: 'Blocked', updatedAt: '2025-11-20T10:00:00Z', owner: 'ANP', notes: [{ id: 'n1', text: 'Stuck in environmental review', timestamp: '2025-11-20T10:00:00Z' }] },
      injection: { status: 'Not started', updatedAt: '2025-11-20T10:00:00Z', owner: 'Utility', notes: [] },
      financing: { status: 'Not started', updatedAt: '2025-11-20T10:00:00Z', owner: 'Lender', notes: [] },
    },
    overallStatus: 'Blocked',
    lastUpdated: '2025-11-20T10:00:00Z',
  },
  {
    id: '3',
    name: 'Landfill Peak Gas',
    feedstock: 'Landfill Gas',
    location: 'California, USA',
    stages: {
      permitting: { status: 'Approved', updatedAt: '2025-10-01T10:00:00Z', owner: 'ANP', notes: [] },
      injection: { status: 'Approved', updatedAt: '2025-12-10T10:00:00Z', owner: 'Utility', notes: [] },
      financing: { status: 'In progress', updatedAt: '2026-02-01T10:00:00Z', owner: 'Lender', notes: [] },
    },
    overallStatus: 'In progress',
    lastUpdated: '2026-02-01T10:00:00Z',
  },
  {
    id: '4',
    name: 'EcoSugarcane Project',
    feedstock: 'Sugarcane',
    location: 'Queensland, Australia',
    stages: {
      permitting: { status: 'Approved', updatedAt: '2025-12-20T10:00:00Z', owner: 'ANP', notes: [] },
      injection: { status: 'Blocked', updatedAt: '2026-01-05T10:00:00Z', owner: 'Utility', notes: [{ id: 'n2', text: 'Utility requires additional pressure testing', timestamp: '2026-01-05T10:00:00Z' }] },
      financing: { status: 'In progress', updatedAt: '2026-01-20T10:00:00Z', owner: 'Lender', notes: [] },
    },
    overallStatus: 'Blocked',
    lastUpdated: '2026-01-20T10:00:00Z',
  },
  {
    id: '5',
    name: 'UrbanWaste Bio',
    feedstock: 'Landfill Gas',
    location: 'London, UK',
    stages: {
      permitting: { status: 'Approved', updatedAt: '2025-09-15T10:00:00Z', owner: 'ANP', notes: [] },
      injection: { status: 'Approved', updatedAt: '2025-11-01T10:00:00Z', owner: 'Utility', notes: [] },
      financing: { status: 'Approved', updatedAt: '2026-01-10T10:00:00Z', owner: 'Lender', notes: [] },
    },
    overallStatus: 'Approved',
    lastUpdated: '2026-01-10T10:00:00Z',
  },
  {
    id: '6',
    name: 'AgriLoop Biogas',
    feedstock: 'Livestock Waste',
    location: 'Bavaria, Germany',
    stages: {
      permitting: { status: 'In progress', updatedAt: '2026-01-30T10:00:00Z', owner: 'ANP', notes: [] },
      injection: { status: 'Not started', updatedAt: '2026-01-30T10:00:00Z', owner: 'Utility', notes: [] },
      financing: { status: 'Blocked', updatedAt: '2026-02-02T10:00:00Z', owner: 'Lender', notes: [{ id: 'n3', text: 'Waiting for subsidy confirmation', timestamp: '2026-02-02T10:00:00Z' }] },
    },
    overallStatus: 'Blocked',
    lastUpdated: '2026-02-02T10:00:00Z',
  },
];

export const loadProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const isOnboardingDismissed = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
};

export const setOnboardingDismissed = (dismissed: boolean) => {
  localStorage.setItem(ONBOARDING_KEY, String(dismissed));
};
