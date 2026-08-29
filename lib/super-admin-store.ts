import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT';
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
  // Users & Admins
  users: AdminUser[];
  selectedUser: AdminUser | null;
  addUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  changeUserRole: (id: string, newRole: UserRole) => void;
  changeUserStatus: (id: string, newStatus: UserStatus) => void;
  setSelectedUser: (user: AdminUser | null) => void;

  // GPU Region Telemetry
  gpuNodes: RegionGPUNode[];
  updateGPULoad: (id: string, updates: Partial<RegionGPUNode>) => void;
  toggleNodeMaintenance: (id: string) => void;
  scaleRegionNodes: (id: string, delta: number) => void;
  restartRegionGPU: (id: string) => void;

  // Feature Toggles Switchboard
  featureToggles: FeatureToggle[];
  toggleFeature: (key: string) => void;
  updateFeatureToggle: (key: string, updates: Partial<FeatureToggle>) => void;
  resetFeatureToggles: () => void;

  // System Health & Logs
  systemLogs: SystemHealthLog[];
  addLog: (log: Omit<SystemHealthLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;

  // Revenue & Analytics
  revenueHistory: RevenueMetric[];
  currentMRR: number;
  currentARR: number;
  growthRateMom: number;

  // Global Simulator Mode for Live Telemetry
  isLiveSimulationActive: boolean;
  toggleLiveSimulation: () => void;
  
  // Reset all to defaults
  resetAllSuperAdminData: () => void;
}

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-001',
    name: 'Alexander Sterling',
    email: 'alex.sterling@viztr.studio',
    role: 'SUPER_ADMIN',
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
    role: 'ADMIN',
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
    role: 'CLIENT',
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
    role: 'USER',
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
    role: 'CLIENT',
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
    role: 'ADMIN',
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
    role: 'CLIENT',
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
    role: 'USER',
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

const INITIAL_GPU_NODES: RegionGPUNode[] = [
  {
    id: 'gpu-us-east',
    regionCode: 'us-east-1',
    regionName: 'US East (N. Virginia)',
    flagEmoji: '🇺🇸',
    gpuModel: 'NVIDIA A10G Tensor Core (24GB VRAM)',
    instanceType: 'AWS g5.4xlarge Dedicated Fleet',
    totalNodes: 8,
    activeNodes: 7,
    activeSessions: 19,
    maxSessions: 28,
    loadPercentage: 68,
    vramUsedGB: 114.2,
    vramTotalGB: 168.0,
    avgLatencyMs: 18.4,
    avgFps: 60.0,
    temperatureC: 62,
    status: 'healthy'
  },
  {
    id: 'gpu-eu-west',
    regionCode: 'eu-central-1',
    regionName: 'EU Central (Frankfurt)',
    flagEmoji: '🇩🇪',
    gpuModel: 'NVIDIA RTX 6000 Ada (48GB VRAM)',
    instanceType: 'Hetzner Dedicated RTX Bare-Metal',
    totalNodes: 6,
    activeNodes: 6,
    activeSessions: 22,
    maxSessions: 24,
    loadPercentage: 89,
    vramUsedGB: 256.8,
    vramTotalGB: 288.0,
    avgLatencyMs: 24.1,
    avgFps: 59.8,
    temperatureC: 68,
    status: 'warning'
  },
  {
    id: 'gpu-me-south',
    regionCode: 'me-central-1',
    regionName: 'Middle East (Dubai Cluster)',
    flagEmoji: '🇦🇪',
    gpuModel: 'NVIDIA L40S Ultra Cluster (48GB VRAM)',
    instanceType: 'CoreWeave Spatial Cluster',
    totalNodes: 4,
    activeNodes: 4,
    activeSessions: 9,
    maxSessions: 16,
    loadPercentage: 56,
    vramUsedGB: 107.5,
    vramTotalGB: 192.0,
    avgLatencyMs: 21.6,
    avgFps: 60.0,
    temperatureC: 59,
    status: 'healthy'
  },
  {
    id: 'gpu-ap-east',
    regionCode: 'ap-northeast-1',
    regionName: 'Asia Pacific (Tokyo)',
    flagEmoji: '🇯🇵',
    gpuModel: 'NVIDIA RTX 4090 Enterprise (24GB VRAM)',
    instanceType: 'Sakura Cloud GPU Farm',
    totalNodes: 4,
    activeNodes: 3,
    activeSessions: 6,
    maxSessions: 12,
    loadPercentage: 42,
    vramUsedGB: 40.3,
    vramTotalGB: 96.0,
    avgLatencyMs: 34.8,
    avgFps: 59.5,
    temperatureC: 54,
    status: 'healthy'
  },
  {
    id: 'gpu-us-west',
    regionCode: 'us-west-2',
    regionName: 'US West (Oregon)',
    flagEmoji: '🇺🇸',
    gpuModel: 'NVIDIA A100 SXM4 (80GB VRAM)',
    instanceType: 'Lambda Labs Hyperplane',
    totalNodes: 3,
    activeNodes: 2,
    activeSessions: 5,
    maxSessions: 12,
    loadPercentage: 35,
    vramUsedGB: 84.0,
    vramTotalGB: 240.0,
    avgLatencyMs: 29.2,
    avgFps: 60.0,
    temperatureC: 51,
    status: 'healthy'
  }
];

const INITIAL_FEATURE_TOGGLES: FeatureToggle[] = [
  {
    id: 'ft-webxr',
    key: 'ENABLE_WEBXR_VIEWER',
    name: 'WebXR Spatial VR/AR Engine',
    description: 'Enables WebXR device API, Meta Quest 3 & Apple Vision Pro native immersive headset passthrough.',
    category: 'xr',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: 'Alexander Sterling',
    lastModifiedAt: '2025-08-20T10:00:00Z'
  },
  {
    id: 'ft-pixel-streaming',
    key: 'ENABLE_PIXEL_STREAMING',
    name: 'Unreal Engine 5.4 Pixel Streaming',
    description: 'Routes WebRTC video/audio streams directly from global cloud GPU clusters to client web browsers.',
    category: 'rendering',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: 'Alexander Sterling',
    lastModifiedAt: '2025-08-21T14:30:00Z'
  },
  {
    id: 'ft-ai-upscaler',
    key: 'ENABLE_GEMINI_TEXTURE_ENHANCER',
    name: 'Gemini AI Spatial Texture Enhancer',
    description: 'Uses Google Gemini Vision API to auto-tag, upscale 4K architectural textures, and generate floorplan annotations.',
    category: 'ai',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: 'Damon Morales',
    lastModifiedAt: '2025-08-15T09:12:00Z'
  },
  {
    id: 'ft-multi-cloud-sync',
    key: 'ENABLE_MULTI_CLOUD_STORAGE',
    name: 'Multi-Cloud Storage Replication (S3 + R2 + Drive)',
    description: 'Automatically replicates uploaded 8K renders and GLB models to AWS S3, Cloudflare R2, and Google Drive.',
    category: 'storage',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: 'Elena Rostova',
    lastModifiedAt: '2025-08-18T16:00:00Z'
  },
  {
    id: 'ft-public-booking',
    key: 'ENABLE_GOOGLE_MEET_AUTOMATION',
    name: 'Google Meet Studio Consultation Auto-Booking',
    description: 'Allows prospective VIP clients to schedule architectural consultations with instant calendar invites.',
    category: 'core',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: 'Elena Rostova',
    lastModifiedAt: '2025-08-22T11:45:00Z'
  },
  {
    id: 'ft-2fa-enforce',
    key: 'ENFORCE_2FA_ADMINS',
    name: 'Enforce Mandatory 2FA for Admins',
    description: 'Requires TOTP Authenticator or WebAuthn hardware key for all Super Admin and Studio Admin logins.',
    category: 'security',
    enabled: true,
    requiresRestart: true,
    environment: 'production',
    lastModifiedBy: 'Alexander Sterling',
    lastModifiedAt: '2025-07-30T08:00:00Z'
  },
  {
    id: 'ft-maintenance-mode',
    key: 'ENABLE_MAINTENANCE_MODE',
    name: 'Global Studio Maintenance Mode',
    description: 'Displays a high-end maintenance banner for all public viewers while keeping Super Admin portal operational.',
    category: 'core',
    enabled: false,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: 'Alexander Sterling',
    lastModifiedAt: '2025-08-01T00:00:00Z'
  },
  {
    id: 'ft-draco-compression',
    key: 'ENABLE_DRACO_AUTO_COMPRESSION',
    name: 'Draco 3D Mesh Auto-Compression on Upload',
    description: 'Compresses GLB models by up to 85% geometry size during admin and client file uploads.',
    category: 'rendering',
    enabled: true,
    requiresRestart: false,
    environment: 'all',
    lastModifiedBy: 'Kenji Takahashi',
    lastModifiedAt: '2025-08-12T13:20:00Z'
  }
];

const INITIAL_SYSTEM_LOGS: SystemHealthLog[] = [
  {
    id: 'log-001',
    timestamp: '2025-08-27T07:44:12Z',
    level: 'info',
    service: 'SignalingServer:us-east',
    message: 'WebRTC PeerConnection established successfully for session sess-8820-apex.',
    region: 'us-east-1',
    ip: '198.51.100.44'
  },
  {
    id: 'log-002',
    timestamp: '2025-08-27T07:38:05Z',
    level: 'warn',
    service: 'GPUNodeMonitor:eu-central',
    message: 'Frankfurt RTX 6000 Ada pool load reached 89% capacity. Autoscaling node warm-up dispatched.',
    region: 'eu-central-1',
    details: 'Queue count: 3 pending sessions. Thermal load 68°C within safe envelope.'
  },
  {
    id: 'log-003',
    timestamp: '2025-08-27T07:22:50Z',
    level: 'info',
    service: 'StorageGateway:R2',
    message: 'Replication completed for apex-master-hero-8k.tiff (248.5 MB) to Cloudflare R2 bucket viztr-renders-cdn.',
    region: 'global-cdn'
  },
  {
    id: 'log-004',
    timestamp: '2025-08-27T06:55:18Z',
    level: 'error',
    service: 'AuthManager:OAuth',
    message: 'Rate limit threshold reached on Google Workspace OAuth token refresh for service account sync.',
    details: 'Handled with exponential backoff. Resumed after 1400ms retry delay.',
    ip: '172.56.21.90'
  },
  {
    id: 'log-005',
    timestamp: '2025-08-27T06:14:02Z',
    level: 'info',
    service: 'DracoMeshPipeline',
    message: 'Model nordic-monolith-hull.glb successfully optimized from 48.2MB down to 14.1MB (70.7% compression ratio).',
    details: 'Vertices: 482,000 | Triangles: 890,200 | Textures: 4K PBR packed.'
  },
  {
    id: 'log-006',
    timestamp: '2025-08-27T05:30:41Z',
    level: 'info',
    service: 'BillingWebhook:Stripe',
    message: 'Invoice inv_891280 paid in full ($28,500.00 USD) by Vance Luxury Towers LLC for Stage 4 Completion.',
    details: 'Project: VIZTR-882 (The Apex Tower).'
  }
];

const INITIAL_REVENUE_HISTORY: RevenueMetric[] = [
  {
    month: 'Mar 2025',
    mrr: 94000,
    oneOffCommissions: 62000,
    gpuStreamingRevenue: 14500,
    vrLicenses: 17500,
    total: 188000,
    expenses: 42000,
    netMargin: 146000
  },
  {
    month: 'Apr 2025',
    mrr: 108000,
    oneOffCommissions: 78000,
    gpuStreamingRevenue: 18200,
    vrLicenses: 19800,
    total: 224000,
    expenses: 48000,
    netMargin: 176000
  },
  {
    month: 'May 2025',
    mrr: 121000,
    oneOffCommissions: 85000,
    gpuStreamingRevenue: 22400,
    vrLicenses: 23600,
    total: 252000,
    expenses: 54000,
    netMargin: 198000
  },
  {
    month: 'Jun 2025',
    mrr: 132000,
    oneOffCommissions: 92000,
    gpuStreamingRevenue: 26800,
    vrLicenses: 27200,
    total: 278000,
    expenses: 59000,
    netMargin: 219000
  },
  {
    month: 'Jul 2025',
    mrr: 142000,
    oneOffCommissions: 110000,
    gpuStreamingRevenue: 31500,
    vrLicenses: 29500,
    total: 313000,
    expenses: 65000,
    netMargin: 248000
  },
  {
    month: 'Aug 2025',
    mrr: 156500,
    oneOffCommissions: 128000,
    gpuStreamingRevenue: 38200,
    vrLicenses: 34300,
    total: 357000,
    expenses: 71000,
    netMargin: 286000
  }
];

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,
      selectedUser: null,
      gpuNodes: INITIAL_GPU_NODES,
      featureToggles: INITIAL_FEATURE_TOGGLES,
      systemLogs: INITIAL_SYSTEM_LOGS,
      revenueHistory: INITIAL_REVENUE_HISTORY,
      currentMRR: 156500,
      currentARR: 1878000,
      growthRateMom: 24.8,
      isLiveSimulationActive: true,

      addUser: (userData) => {
        const newUser: AdminUser = {
          ...userData,
          id: `usr-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          users: [newUser, ...state.users],
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'info',
              service: 'UserManager',
              message: `Super Admin created user "${newUser.name}" with role [${newUser.role}].`,
              details: `Email: ${newUser.email} | Dept: ${newUser.department}`
            },
            ...state.systemLogs
          ]
        }));
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'info',
              service: 'UserManager',
              message: `User ${id} record updated by Super Admin.`,
              details: JSON.stringify(updates)
            },
            ...state.systemLogs
          ]
        }));
      },

      deleteUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'warn',
              service: 'UserManager',
              message: `User ${user?.name || id} (${user?.email}) was permanently deleted by Super Admin.`
            },
            ...state.systemLogs
          ]
        }));
      },

      changeUserRole: (id, newRole) => {
        const user = get().users.find((u) => u.id === id);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'info',
              service: 'RBAC:RoleGovernance',
              message: `Role for ${user?.name || id} changed from [${user?.role}] to [${newRole}].`
            },
            ...state.systemLogs
          ]
        }));
      },

      changeUserStatus: (id, newStatus) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
        }));
      },

      setSelectedUser: (user) => set({ selectedUser: user }),

      updateGPULoad: (id, updates) => {
        set((state) => ({
          gpuNodes: state.gpuNodes.map((node) => (node.id === id ? { ...node, ...updates } : node))
        }));
      },

      toggleNodeMaintenance: (id) => {
        set((state) => ({
          gpuNodes: state.gpuNodes.map((node) => {
            if (node.id === id) {
              const isMaint = node.status === 'maintenance';
              return {
                ...node,
                status: isMaint ? 'healthy' : 'maintenance',
                activeSessions: isMaint ? 5 : 0,
                loadPercentage: isMaint ? 35 : 0
              };
            }
            return node;
          }),
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'warn',
              service: 'GPUClusterManager',
              message: `Node ${id} maintenance state toggled.`
            },
            ...state.systemLogs
          ]
        }));
      },

      scaleRegionNodes: (id, delta) => {
        set((state) => ({
          gpuNodes: state.gpuNodes.map((node) => {
            if (node.id === id) {
              const newTotal = Math.max(1, Math.min(20, node.totalNodes + delta));
              const newActive = Math.min(newTotal, node.activeNodes + (delta > 0 ? 1 : -1));
              const newMaxSessions = newTotal * 4;
              return {
                ...node,
                totalNodes: newTotal,
                activeNodes: Math.max(1, newActive),
                maxSessions: newMaxSessions
              };
            }
            return node;
          }),
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'info',
              service: 'GPUAutoscaler',
              message: `Region ${id} node capacity scaled by ${delta > 0 ? '+' : ''}${delta}.`
            },
            ...state.systemLogs
          ]
        }));
      },

      restartRegionGPU: (id) => {
        set((state) => ({
          gpuNodes: state.gpuNodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                activeSessions: 0,
                loadPercentage: 10,
                temperatureC: 45,
                status: 'healthy'
              };
            }
            return node;
          }),
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'critical',
              service: 'GPUClusterManager',
              message: `Emergency warm restart triggered for GPU cluster [${id}]. All WebRTC sessions gracefully migrated.`
            },
            ...state.systemLogs
          ]
        }));
      },

      toggleFeature: (key) => {
        const toggle = get().featureToggles.find((t) => t.key === key);
        const newState = !toggle?.enabled;
        set((state) => ({
          featureToggles: state.featureToggles.map((t) =>
            t.key === key
              ? {
                  ...t,
                  enabled: newState,
                  lastModifiedBy: 'Super Admin',
                  lastModifiedAt: new Date().toISOString()
                }
              : t
          ),
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              level: 'warn',
              service: 'FeatureSwitchboard',
              message: `Feature flag "${key}" was toggled to [${newState ? 'ENABLED' : 'DISABLED'}].`
            },
            ...state.systemLogs
          ]
        }));
      },

      updateFeatureToggle: (key, updates) => {
        set((state) => ({
          featureToggles: state.featureToggles.map((t) =>
            t.key === key ? { ...t, ...updates, lastModifiedAt: new Date().toISOString() } : t
          )
        }));
      },

      resetFeatureToggles: () => {
        set({ featureToggles: INITIAL_FEATURE_TOGGLES });
      },

      addLog: (logData) => {
        const newLog: SystemHealthLog = {
          ...logData,
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString()
        };
        set((state) => ({
          systemLogs: [newLog, ...state.systemLogs.slice(0, 199)]
        }));
      },

      clearLogs: () => {
        set({ systemLogs: [] });
      },

      toggleLiveSimulation: () => {
        set((state) => ({ isLiveSimulationActive: !state.isLiveSimulationActive }));
      },

      resetAllSuperAdminData: () => {
        set({
          users: INITIAL_USERS,
          selectedUser: null,
          gpuNodes: INITIAL_GPU_NODES,
          featureToggles: INITIAL_FEATURE_TOGGLES,
          systemLogs: INITIAL_SYSTEM_LOGS,
          revenueHistory: INITIAL_REVENUE_HISTORY,
          currentMRR: 156500,
          currentARR: 1878000,
          growthRateMom: 24.8
        });
      }
    }),
    {
      name: 'viztr-super-admin-store-v1'
    }
  )
);
