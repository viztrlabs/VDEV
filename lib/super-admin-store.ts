/**
 * Super Admin Store - Repository-backed reactive state
 * 
 * Thin reactive wrapper around Repository implementations.
 * Provides optimistic UI updates with background sync.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AdminUser,
  UserRole,
  UserStatus,
  RegionGPUNode,
  FeatureToggle,
  SystemHealthLog,
  RevenueMetric,
} from './super-admin-store-types';

import { INITIAL_USERS } from './super-admin-store-types';

import { createMockRepositoryFactorySync } from './repositories/mock-repositories';
import type { RepositoryFactory } from './repositories';

export interface SuperAdminState {
  // Repository (non-persisted)
  _repository: ReturnType<typeof import('./repositories/mock-repositories').createMockRepositoryFactorySync> | null;
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

// Repository instance (created once)
let repositoryInstance: ReturnType<typeof import('./repositories/mock-repositories').createMockRepositoryFactorySync> | null = null;

function getRepository() {
  if (!repositoryInstance) {
    repositoryInstance = createMockRepositoryFactorySync();
  }
  return repositoryInstance;
}

const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      _repository: null,
      _initialized: false,

      // Initial state (will be replaced on initialize)
      users: INITIAL_USERS,
      selectedUser: null,
      usersLoading: false,
      usersError: null,

      gpuNodes: [],
      gpuLoading: false,

      featureToggles: [],
      togglesLoading: false,

      systemLogs: [],
      logsLoading: false,
      logsError: null,

      revenueHistory: [],
      currentMRR: 0,
      currentARR: 0,
      growthRateMom: 0,
      revenueLoading: false,

      isLiveSimulationActive: false,

      // Initialize from repository
      initialize: async () => {
        if (get()._initialized) return;
        
        const repo = getRepository();
        set({ _repository: repo, usersLoading: true, gpuLoading: true, togglesLoading: true, logsLoading: true, revenueLoading: true });

        try {
          const [users, gpuNodes, featureToggles, systemLogs, revenue] = await Promise.all([
            repo.users.findAll().then((r: { data: AdminUser[] }) => r.data),
            repo.gpu.findAll(),
            repo.featureToggles.findAll(),
            repo.logs.findAll({}).then((r: { data: SystemHealthLog[] }) => r.data),
            repo.revenue.getMonthly(),
          ]);

          const summary = await repo.revenue.getSummary();

          set({
            users,
            gpuNodes,
            featureToggles,
            systemLogs,
            revenueHistory: revenue,
            currentMRR: summary.currentMRR,
            currentARR: summary.currentARR,
            growthRateMom: summary.growthRateMoM,
            _initialized: true,
            usersLoading: false,
            gpuLoading: false,
            togglesLoading: false,
            logsLoading: false,
            revenueLoading: false,
          });
        } catch (error) {
          console.error('Failed to initialize super admin store:', error);
          set({
            usersLoading: false,
            gpuLoading: false,
            togglesLoading: false,
            logsLoading: false,
            revenueLoading: false,
            usersError: error instanceof Error ? error.message : 'Initialization failed',
          });
        }
      },

      // Users & Admins
      addUser: async (user) => {
        const repo = getRepository();
        set({ usersLoading: true, usersError: null });
        try {
          const newUser = await repo.users.create(user);
          set(state => ({ users: [newUser, ...state.users], usersLoading: false }));
        } catch (error) {
          set({ usersLoading: false, usersError: error instanceof Error ? error.message : 'Failed to add user' });
          throw error;
        }
      },

      updateUser: async (id, updates) => {
        const repo = getRepository();
        set({ usersLoading: true, usersError: null });
        try {
          const updated = await repo.users.update(id, updates);
          set(state => ({
            users: state.users.map(u => u.id === id ? updated : u),
            selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
            usersLoading: false,
          }));
        } catch (error) {
          set({ usersLoading: false, usersError: error instanceof Error ? error.message : 'Failed to update user' });
          throw error;
        }
      },

      deleteUser: async (id) => {
        const repo = getRepository();
        set({ usersLoading: true, usersError: null });
        try {
          await repo.users.delete(id);
          set(state => ({
            users: state.users.filter(u => u.id !== id),
            selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
            usersLoading: false,
          }));
        } catch (error) {
          set({ usersLoading: false, usersError: error instanceof Error ? error.message : 'Failed to delete user' });
          throw error;
        }
      },

      changeUserRole: async (id, newRole) => {
        const repo = getRepository();
        set({ usersLoading: true, usersError: null });
        try {
          const updated = await repo.users.changeRole(id, newRole);
          set(state => ({
            users: state.users.map(u => u.id === id ? updated : u),
            selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
            usersLoading: false,
          }));
        } catch (error) {
          set({ usersLoading: false, usersError: error instanceof Error ? error.message : 'Failed to change role' });
          throw error;
        }
      },

      changeUserStatus: async (id, newStatus) => {
        const repo = getRepository();
        set({ usersLoading: true, usersError: null });
        try {
          const updated = await repo.users.changeStatus(id, newStatus);
          set(state => ({
            users: state.users.map(u => u.id === id ? updated : u),
            selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
            usersLoading: false,
          }));
        } catch (error) {
          set({ usersLoading: false, usersError: error instanceof Error ? error.message : 'Failed to change status' });
          throw error;
        }
      },

      setSelectedUser: (user) => set({ selectedUser: user }),

      refreshUsers: async () => {
        const repo = getRepository();
        set({ usersLoading: true, usersError: null });
        try {
          const result = await repo.users.findAll();
          set({ users: result.data, usersLoading: false });
        } catch (error) {
          set({ usersLoading: false, usersError: error instanceof Error ? error.message : 'Failed to refresh users' });
        }
      },

      // GPU Region Telemetry
      updateGPULoad: async (id, updates) => {
        const repo = getRepository();
        try {
          const updated = await repo.gpu.updateLoad(id, updates);
          set(state => ({
            gpuNodes: state.gpuNodes.map(n => n.id === id ? updated : n),
          }));
        } catch (error) {
          console.error('Failed to update GPU load:', error);
        }
      },

      toggleNodeMaintenance: async (id) => {
        const repo = getRepository();
        try {
          const updated = await repo.gpu.toggleMaintenance(id);
          set(state => ({
            gpuNodes: state.gpuNodes.map(n => n.id === id ? updated : n),
          }));
        } catch (error) {
          console.error('Failed to toggle maintenance:', error);
        }
      },

      scaleRegionNodes: async (id, delta) => {
        const repo = getRepository();
        try {
          const updated = await repo.gpu.scaleNodes(id, delta);
          set(state => ({
            gpuNodes: state.gpuNodes.map(n => n.id === id ? updated : n),
          }));
        } catch (error) {
          console.error('Failed to scale nodes:', error);
        }
      },

      restartRegionGPU: async (id) => {
        const repo = getRepository();
        try {
          const updated = await repo.gpu.restart(id);
          set(state => ({
            gpuNodes: state.gpuNodes.map(n => n.id === id ? updated : n),
          }));
        } catch (error) {
          console.error('Failed to restart GPU:', error);
        }
      },

      refreshGPUNodes: async () => {
        const repo = getRepository();
        set({ gpuLoading: true });
        try {
          const nodes = await repo.gpu.findAll();
          set({ gpuNodes: nodes, gpuLoading: false });
        } catch (error) {
          set({ gpuLoading: false });
        }
      },

      // Feature Toggles Switchboard
      toggleFeature: async (key) => {
        const repo = getRepository();
        try {
          const updated = await repo.featureToggles.toggle(key);
          set(state => ({
            featureToggles: state.featureToggles.map(t => t.key === key ? updated : t),
          }));
        } catch (error) {
          console.error('Failed to toggle feature:', error);
        }
      },

      updateFeatureToggle: async (key, updates) => {
        const repo = getRepository();
        try {
          const updated = await repo.featureToggles.update(key, updates);
          set(state => ({
            featureToggles: state.featureToggles.map(t => t.key === key ? updated : t),
          }));
        } catch (error) {
          console.error('Failed to update feature toggle:', error);
        }
      },

      resetFeatureToggles: async () => {
        const repo = getRepository();
        try {
          await repo.featureToggles.reset();
          const toggles = await repo.featureToggles.findAll();
          set({ featureToggles: toggles });
        } catch (error) {
          console.error('Failed to reset feature toggles:', error);
        }
      },

      refreshFeatureToggles: async () => {
        const repo = getRepository();
        set({ togglesLoading: true });
        try {
          const toggles = await repo.featureToggles.findAll();
          set({ featureToggles: toggles, togglesLoading: false });
        } catch (error) {
          set({ togglesLoading: false });
        }
      },

      // System Health & Logs
      addLog: async (log) => {
        const repo = getRepository();
        try {
          const newLog = await repo.logs.add(log);
          set(state => ({
            systemLogs: [newLog, ...state.systemLogs].slice(0, 1000),
          }));
        } catch (error) {
          console.error('Failed to add log:', error);
        }
      },

      clearLogs: async () => {
        const repo = getRepository();
        try {
          await repo.logs.clear();
          set({ systemLogs: [] });
        } catch (error) {
          console.error('Failed to clear logs:', error);
        }
      },

      refreshLogs: async () => {
        const repo = getRepository();
        set({ logsLoading: true, logsError: null });
        try {
          const result = await repo.logs.findAll({});
          set({ systemLogs: result.data, logsLoading: false });
        } catch (error) {
          set({ logsLoading: false, logsError: error instanceof Error ? error.message : 'Failed to refresh logs' });
        }
      },

      // Revenue & Analytics
      refreshRevenue: async () => {
        const repo = getRepository();
        set({ revenueLoading: true });
        try {
          const [revenue, summary] = await Promise.all([
            repo.revenue.getMonthly(),
            repo.revenue.getSummary(),
          ]);
          set({
            revenueHistory: revenue,
            currentMRR: summary.currentMRR,
            currentARR: summary.currentARR,
            growthRateMom: summary.growthRateMoM,
            revenueLoading: false,
          });
        } catch (error) {
          set({ revenueLoading: false });
        }
      },

      // Global Simulator Mode
      toggleLiveSimulation: () => set(state => ({
        isLiveSimulationActive: !state.isLiveSimulationActive,
      })),

      // Reset all to defaults
      resetAllSuperAdminData: async () => {
        const repo = getRepository();
        try {
          await Promise.all([
            repo.featureToggles.reset(),
            repo.logs.clear(),
          ]);
          await get().initialize();
        } catch (error) {
          console.error('Failed to reset all data:', error);
        }
      },
    }),
    {
      name: 'viztr-super-admin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist UI state, not repository or loading states
        isLiveSimulationActive: state.isLiveSimulationActive,
      }),
    }
  )
);

// For backward compatibility - re-export types and constants
export type { AdminUser, UserRole, UserStatus, RegionGPUNode, FeatureToggle, SystemHealthLog, RevenueMetric } from './super-admin-store-types';
export { INITIAL_USERS, INITIAL_GPU_NODES, INITIAL_FEATURE_TOGGLES, INITIAL_SYSTEM_LOGS } from './super-admin-store-types';
export { useSuperAdminStore };