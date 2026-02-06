export type StageStatus = 'Not started' | 'In progress' | 'Blocked' | 'Approved';

export type StageOwner = 'ANP' | 'Utility' | 'Lender' | 'Operator';

export interface Stage {
  status: StageStatus;
  updatedAt: string; // ISO date
  owner: StageOwner;
  notes: { id: string; text: string; timestamp: string }[];
}

export type FeedstockType = 'Landfill Gas' | 'Sugarcane' | 'Livestock Waste' | 'Other';

export interface Project {
  id: string;
  name: string;
  feedstock: FeedstockType;
  location?: string;
  stages: {
    permitting: Stage;
    injection: Stage;
    financing: Stage;
  };
  overallStatus: StageStatus;
  lastUpdated: string;
}

export const STAGE_NAMES = {
  permitting: 'Permitting (ANP)',
  injection: 'Injection Approval (Utilities)',
  financing: 'Financing (Lenders)',
} as const;

export type StageKey = keyof Project['stages'];

export const getOverallStatus = (stages: Project['stages']): StageStatus => {
  const statuses = Object.values(stages).map((s) => s.status);
  if (statuses.includes('Blocked')) return 'Blocked';
  if (statuses.every((s) => s === 'Approved')) return 'Approved';
  if (statuses.every((s) => s === 'Not started')) return 'Not started';
  return 'In progress';
};

export const getWhoMustActNext = (project: Project): StageOwner => {
  if (project.stages.permitting.status === 'Blocked' || project.stages.permitting.status === 'In progress') {
    return 'ANP';
  }
  if (project.stages.injection.status === 'Blocked' || project.stages.injection.status === 'In progress') {
    return 'Utility';
  }
  if (project.stages.financing.status === 'Blocked' || project.stages.financing.status === 'In progress') {
    return 'Lender';
  }
  if (Object.values(project.stages).every(s => s.status === 'Approved')) {
    return 'Operator';
  }
  return 'Operator';
};

export const getNextActionSuggestion = (stageKey: StageKey, status: StageStatus): string => {
  switch (stageKey) {
    case 'permitting':
      if (status === 'Blocked') return 'Request status update from ANP; attach required documents checklist.';
      if (status === 'In progress') return 'Confirm review timeline and missing items.';
      break;
    case 'injection':
      if (status === 'Blocked') return 'Schedule injection feasibility review; confirm gas quality specs.';
      if (status === 'In progress') return 'Provide gas flow projections and technical specs.';
      break;
    case 'financing':
      if (status === 'Blocked') return 'Submit updated capex + risk mitigation; request term sheet timeline.';
      if (status === 'In progress') return 'Prepare due diligence package for lender review.';
      break;
  }
  if (status === 'Approved') return 'Proceed to next stage.';
  if (status === 'Not started') return 'Initiate application process.';
  return 'Review stage requirements.';
};
