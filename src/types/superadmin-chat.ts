export type SuperAdminRole = "user" | "agent";

export type SuperAdminMetadata = {
  type: string;
  component?: string;
  props?: Record<string, unknown>;
  data?: AdminComponentData;
};

export type AdminComponentData = {
  analyticsData?: any;
  reportsData?: any;
  conversationsData?: any;
  feedbackData?: any;
  tasksData?: any;
  personalityData?: any;
  schedulerData?: any;
  feedbackFormData?: any;
  systemHealthData?: any;
  grantsData?: any;
  dailyUsersData?: any;
  githubMetricsData?: any;
  projectRankingData?: { rankings?: any[] };
  builderValidationData?: { builders?: any[] };
  projectProgressData?: { projects?: any[] };
  [key: string]: any;
};

export type SuperAdminChatMessage = {
  id: string;
  role: SuperAdminRole;
  content: string;
  isThinking?: boolean;
  metadata?: SuperAdminMetadata;
  [key: string]: unknown;
};
