import { create } from 'zustand';
import {
  getNotificationPermission,
  requestNotificationPermission,
  dispatchDesktopNotification,
  NotificationPermissionStatus,
} from './notifications';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT';
  avatar?: string;
  projectId?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'status_change' | 'milestone_ready' | 'system';
  projectId?: string;
  projectName?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface AppState {
  // User Auth State
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  logout: () => void;

  // Active Lightbox / Gallery Viewer
  lightboxOpen: boolean;
  lightboxItems: Array<{ url: string; title: string; type: 'image' | 'video' | '360'; caption?: string }>;
  lightboxIndex: number;
  openLightbox: (items: Array<{ url: string; title: string; type: 'image' | 'video' | '360'; caption?: string }>, index?: number) => void;
  closeLightbox: () => void;
  setLightboxIndex: (index: number) => void;

  // 360 Panorama Viewer Modal
  panoramaModalOpen: boolean;
  activePanoramaUrl: string;
  activePanoramaTitle: string;
  activePanoramaHotspots: any[];
  openPanorama: (url: string, title: string, hotspots?: any[]) => void;
  closePanorama: () => void;

  // 3D / WebXR Model Viewer Modal
  modelViewerOpen: boolean;
  activeModelUrl: string;
  activeModelTitle: string;
  openModelViewer: (url: string, title: string) => void;
  closeModelViewer: () => void;

  // Pixel Streaming Demo Simulator
  pixelStreamModalOpen: boolean;
  openPixelStream: () => void;
  closePixelStream: () => void;

  // Global Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  // Desktop & Real-Time Notifications Settings
  desktopNotificationsEnabled: boolean;
  soundAlertsEnabled: boolean;
  notifyStatusChanges: boolean;
  notifyMilestoneReady: boolean;
  notificationPermission: NotificationPermissionStatus;
  notificationsList: InAppNotification[];

  toggleDesktopNotifications: () => Promise<boolean>;
  setDesktopNotifications: (enabled: boolean) => void;
  setSoundAlerts: (enabled: boolean) => void;
  setNotifyStatusChanges: (enabled: boolean) => void;
  setNotifyMilestoneReady: (enabled: boolean) => void;
  checkNotificationPermission: () => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  dispatchAlert: (params: {
    title: string;
    message: string;
    type: 'status_change' | 'milestone_ready' | 'system';
    projectId?: string;
    projectName?: string;
    actionUrl?: string;
  }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),

  lightboxOpen: false,
  lightboxItems: [],
  lightboxIndex: 0,
  openLightbox: (items, index = 0) => set({ lightboxOpen: true, lightboxItems: items, lightboxIndex: index }),
  closeLightbox: () => set({ lightboxOpen: false }),
  setLightboxIndex: (index) => set({ lightboxIndex: index }),

  panoramaModalOpen: false,
  activePanoramaUrl: '',
  activePanoramaTitle: '',
  activePanoramaHotspots: [],
  openPanorama: (url, title, hotspots = []) =>
    set({ panoramaModalOpen: true, activePanoramaUrl: url, activePanoramaTitle: title, activePanoramaHotspots: hotspots }),
  closePanorama: () => set({ panoramaModalOpen: false }),

  modelViewerOpen: false,
  activeModelUrl: '',
  activeModelTitle: '',
  openModelViewer: (url, title) => set({ modelViewerOpen: true, activeModelUrl: url, activeModelTitle: title }),
  closeModelViewer: () => set({ modelViewerOpen: false }),

  pixelStreamModalOpen: false,
  openPixelStream: () => set({ pixelStreamModalOpen: true }),
  closePixelStream: () => set({ pixelStreamModalOpen: false }),

  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set({ toast: null });
    }, 4000);
  },
  hideToast: () => set({ toast: null }),

  // Notification Defaults
  desktopNotificationsEnabled: true,
  soundAlertsEnabled: true,
  notifyStatusChanges: true,
  notifyMilestoneReady: true,
  notificationPermission: 'default',
  notificationsList: [
    {
      id: 'notif-1',
      title: 'Milestone Deliverable Ready',
      message: '8K Exterior Master Hero TIFF (240 MB) is now available for download.',
      type: 'milestone_ready',
      projectId: 'VIZTR-882',
      projectName: 'The Apex Tower',
      timestamp: '15 minutes ago',
      read: false,
      actionUrl: '/client-dashboard',
    },
    {
      id: 'notif-2',
      title: 'Project Status Updated',
      message: 'The Apex Tower advanced to Stage 5: Client Review (75% completed).',
      type: 'status_change',
      projectId: 'VIZTR-882',
      projectName: 'The Apex Tower',
      timestamp: '2 hours ago',
      read: false,
      actionUrl: '/client-dashboard',
    },
  ],

  checkNotificationPermission: () => {
    const perm = getNotificationPermission();
    set({ notificationPermission: perm });
  },

  toggleDesktopNotifications: async () => {
    const current = get().desktopNotificationsEnabled;
    if (!current) {
      // User is enabling desktop notifications
      const perm = await requestNotificationPermission();
      set({
        desktopNotificationsEnabled: perm === 'granted',
        notificationPermission: perm,
      });
      if (perm === 'granted') {
        get().showToast('Real-time desktop notifications activated!', 'success');
        dispatchDesktopNotification({
          title: 'VizTR Real-Time Alerts Activated',
          body: 'You will now receive instant desktop notifications for project updates and downloadable deliverables.',
          sound: get().soundAlertsEnabled,
        });
        return true;
      } else if (perm === 'denied') {
        get().showToast('Notifications blocked by your browser settings. Please enable them in site permissions.', 'error');
        return false;
      }
      return false;
    } else {
      // User is disabling
      set({ desktopNotificationsEnabled: false });
      get().showToast('Desktop notifications paused.', 'info');
      return false;
    }
  },

  setDesktopNotifications: (enabled) => set({ desktopNotificationsEnabled: enabled }),
  setSoundAlerts: (enabled) => set({ soundAlertsEnabled: enabled }),
  setNotifyStatusChanges: (enabled) => set({ notifyStatusChanges: enabled }),
  setNotifyMilestoneReady: (enabled) => set({ notifyMilestoneReady: enabled }),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notificationsList: state.notificationsList.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearAllNotifications: () => set({ notificationsList: [] }),

  dispatchAlert: ({ title, message, type, projectId, projectName, actionUrl }) => {
    const state = get();

    // Check type filters
    if (type === 'status_change' && !state.notifyStatusChanges) return;
    if (type === 'milestone_ready' && !state.notifyMilestoneReady) return;

    // Add to in-app notification list
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      projectId,
      projectName,
      timestamp: 'Just now',
      read: false,
      actionUrl,
    };

    set((s) => ({
      notificationsList: [newNotif, ...s.notificationsList.slice(0, 19)],
    }));

    // Trigger Desktop Notification if enabled
    if (state.desktopNotificationsEnabled) {
      dispatchDesktopNotification({
        title,
        body: message,
        sound: state.soundAlertsEnabled,
        url: actionUrl,
      });
    }

    // Also trigger in-app toast
    state.showToast(`${title}: ${message}`, 'success');
  },
}));
