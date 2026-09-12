/**
 * Super Admin Store Types - Shared type definitions
 * 
 * Single source of truth for all Super Admin types.
 */

export type UserRole = 'super_admin' | 'admin' | 'user' | 'client';
export type UserStatus = 'active' | 'invited' | 'suspended' | 'inactive';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  department: string;
  assignedProjectsCount: number;
  lastLogin: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  permissionsOverride?: string[];
  phone?: string;
  company?: string;
}

export interface RegionGPUNode {
  id: string;
  regionCode: string;
  regionName: string;
  flagEmoji: string;
  gpuModel: string;
  instanceType: string;
  totalNodes: number;
  activeNodes: number;
  activeSessions: number;
  maxSessions: number;
  loadPercentage: number;
  vramUsedGB: number;
  vramTotalGB: number;
  avgLatencyMs: number;
  avgFps: number;
  temperatureC: number;
  status: 'healthy' | 'warning' | 'degraded' | 'maintenance';
}

export interface FeatureToggle {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'core' | 'rendering' | 'xr' | 'ai' | 'security' | 'storage';
  enabled: boolean;
  requiresRestart: boolean;
  environment: 'all' | 'production' | 'staging';
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface SystemHealthLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  service: string;
  message: string;
  details?: string;
  region?: string;
  ip?: string;
}

export interface RevenueMetric {
  month: string;
  mrr: number;
  oneOffCommissions: number;
  gpuStreamingRevenue: number;
  vrLicenses: number;
  total: number;
  expenses: number;
  netMargin: number;
}

export interface SuperAdminState {
  // Repository (non-persisted)
  _repository: any;
  _initialized: boolean;

  // Users & Admins
  users: AdminUser[];
  selectedUser: AdminUser | null;
  usersLoading: boolean;
  usersError: string | null;
  addUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, newRole: UserRole) => Promise<void>;
  changeUserStatus: (id: string, newStatus: UserStatus) => Promise<void>;
  setSelectedUser: (user: AdminUser | null) => void;
  refreshUsers: () => Promise<void>;

  // GPU Region Telemetry
  gpuNodes: RegionGPUNode[];
  gpuLoading: boolean;
  updateGPULoad: (id: string, updates: Partial<RegionGPUNode>) => Promise<void>;
  toggleNodeMaintenance: (id: string) => Promise<void>;
  scaleRegionNodes: (id: string, delta: number) => Promise<void>;
  restartRegionGPU: (id: string) => Promise<void>;
  refreshGPUNodes: () => Promise<void>;

  // Feature Toggles Switchboard
  featureToggles: FeatureToggle[];
  togglesLoading: boolean;
  toggleFeature: (key: string) => Promise<void>;
  updateFeatureToggle: (key: string, updates: Partial<FeatureToggle>) => Promise<void>;
  resetFeatureToggles: () => Promise<void>;
  refreshFeatureToggles: () => Promise<void>;

  // System Health & Logs
  systemLogs: SystemHealthLog[];
  logsLoading: boolean;
  logsError: string | null;
  addLog: (log: Omit<SystemHealthLog, 'id' | 'timestamp'>) => Promise<void>;
  clearLogs: () => Promise<void>;
  refreshLogs: () => Promise<void>;

  // Revenue & Analytics
  revenueHistory: RevenueMetric[];
  currentMRR: number;
  currentARR: number;
  growthRateMom: number;
  revenueLoading: boolean;
  refreshRevenue: () => Promise<void>;

  // Global Simulator Mode for Live Telemetry
  isLiveSimulationActive: boolean;
  toggleLiveSimulation: () => void;

  // Initialization
  initialize: () => Promise<void>;
  resetAllSuperAdminData: () => Promise<void>;
}

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-001',
    name: 'Alexander Sterling',
    email: 'alex.sterling@viztr.studio',
    role: 'super_admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Executive / Spatial Tech Lead',
    assignedProjectsCount: 14,
    lastLogin: '2 minutes ago',
    twoFactorEnabled: true,
    createdAt: '2025-01-10T08:00:00Z',
    phone: '+1 (555) 234-8901',
    company: 'VizTR Studio HQ'
  },
  {
    id: 'usr-002',
    name: 'Elena Rostova',
    email: 'elena.rostova@viztr.studio',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Principal ArchViz Director',
    assignedProjectsCount: 8,
    lastLogin: '1 hour ago',
    twoFactorEnabled: true,
    createdAt: '2025-02-14T10:15:00Z',
    phone: '+1 (555) 890-1234',
    company: 'VizTR Studio Europe'
  },
  {
    id: 'usr-003',
    name: 'Marcus Vance',
    email: 'm.vance@vancerealty.ae',
    role: 'client',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'VIP Client / Investor',
    assignedProjectsCount: 2,
    lastLogin: 'Yesterday',
    twoFactorEnabled: false,
    createdAt: '2025-03-01T12:00:00Z',
    phone: '+971 50 123 4567',
    company: 'Vance Luxury Towers Dubai'
  },
  {
    id: 'usr-004',
    name: 'Kenji Takahashi',
    email: 'kenji.takahashi@viztr.studio',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Lead Unreal 5.4 Engineer',
    assignedProjectsCount: 5,
    lastLogin: '3 hours ago',
    twoFactorEnabled: true,
    createdAt: '2025-03-12T09:30:00Z',
    phone: '+81 3 5555 0192',
    company: 'VizTR Tokyo Tech Lab'
  },
  {
    id: 'usr-005',
    name: 'Sophia Lindqvist',
    email: 'sophia@nordicarchitects.se',
    role: 'client',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Managing Partner',
    assignedProjectsCount: 1,
    lastLogin: '4 days ago',
    twoFactorEnabled: true,
    createdAt: '2025-04-05T14:20:00Z',
    phone: '+46 8 123 456',
    company: 'Nordic Monolith Architects'
  },
  {
    id: 'usr-006',
    name: 'Damon Morales',
    email: 'damon.morales@viztr.studio',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    department: 'Pixel Streaming Infrastructure Lead',
    assignedProjectsCount: 6,
    lastLogin: '30 minutes ago',
    twoFactorEnabled: true,
    createdAt: '2025-04-18T11:00:00Z',
    phone: '+1 (555) 777-9922',
    company: 'VizTR Cloud Operations'
  },
  {
    id: 'usr-007',
    name: 'Julian Croft',
    email: 'j.croft@solariumholdings.co.uk',
    role: 'client',
    status: 'invited',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    department: 'Chief Investment Officer',
    assignedProjectsCount: 1,
    lastLogin: 'Never (Invite Pending)',
    twoFactorEnabled: false,
    createdAt: '2025-05-20T16:45:00Z',
    phone: '+44 20 7946 0912',
    company: 'Solarium Developments London'
  },
  {
    id: 'usr-008',
    name: 'Chloe Zhang',
    email: 'chloe.zhang@viztr.studio',
    role: 'user',
    status: 'suspended',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Junior 3D Modeler & Texturing',
    assignedProjectsCount: 0,
    lastLogin: '2 weeks ago',
    twoFactorEnabled: false,
    createdAt: '2025-06-01T10:00:00Z',
    phone: '+1 (555) 444-1234',
    company: 'Contractor Hub'
  }
];

export const INITIAL_GPU_NODES: RegionGPUNode[] = [];
export const INITIAL_FEATURE_TOGGLES: FeatureToggle[] = [];
export const INITIAL_SYSTEM_LOGS: SystemHealthLog[] = [];