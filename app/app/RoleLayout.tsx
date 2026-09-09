'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getNavigationForRole, UserRole } from '@/lib/rbac';
import {
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Bell,
  Search,
  Sparkles,
  Box,
  Building2,
  Shield,
  UserCheck,
  FolderOpen,
  Database,
  CreditCard,
  BarChart3,
  FileText,
  Gift,
  Activity,
  ShieldAlert,
  Plug,
  Target,
  CheckCircle,
  Calendar,
  HelpCircle,
  Receipt,
  Users,
  Image,
  Globe,
  PenTool,
  Share2,
  Plus,
  Layers,
  File,
  MessageSquare,
} from 'lucide-react';

// Sidebar Persistence Constants
const SIDEBAR_STORAGE_KEY = 'viztr_sidebar_state';
const SIDEBAR_STORAGE_VERSION = '2.0';

interface PersistentSidebarState {
  isOpen: boolean;
  lastPath: string;
  role: UserRole;
  timestamp: number;
  version: string;
}

interface RoleLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

// Role-based color mapping
const roleColors: Record<UserRole, string> = {
  super_admin: 'purple',
  admin: 'blue',
  user: 'emerald',
  client: 'amber',
};

// Role-based label mapping
const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  user: 'User',
  client: 'Client',
};

// Icon mapping for navigation items
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FolderOpen,
  Plus,
  File,
  Box,
  Image,
  Globe,
  Sparkles,
  PenTool,
  Share2,
  Users,
  Activity,
  CreditCard,
  Settings: Shield, // Using Shield as Settings alternative
  Building2,
  UserCheck,
  Database,
  BarChart3,
  FileText,
  Gift,
  ShieldAlert,
  Plug,
  Target,
  CheckCircle,
  Calendar,
  HelpCircle,
  Receipt,
  MessageSquare,
  Search,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Shield,
  Layers,
};

export default function RoleLayout({
  children,
  role,
}: RoleLayoutProps) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ===== PERSISTENT STATE MANAGEMENT =====
  
  // Generate storage key for current role
  const getStorageKey = useCallback((userRole: UserRole) => {
    return `${SIDEBAR_STORAGE_KEY}_${userRole}`;
  }, []);

  // Save state to localStorage
  const saveSidebarState = useCallback((state: PersistentSidebarState) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(getStorageKey(role), serializedState);
      
      // Also save global state for cross-tab sync
      localStorage.setItem(SIDEBAR_STORAGE_KEY, serializedState);
      
      console.log('✅ Sidebar state saved:', state);
    } catch (error) {
      console.error('❌ Failed to save sidebar state:', error);
    }
  }, [getStorageKey, role]);

  // Load state from localStorage
  const loadSidebarState = useCallback((): PersistentSidebarState | null => {
    try {
      let savedState: string | null = null;
      
      // Try role-specific first, then fallback to global
      savedState = localStorage.getItem(getStorageKey(role)) || 
                   localStorage.getItem(SIDEBAR_STORAGE_KEY);
      
      if (!savedState) return null;
      
      const parsedState: PersistentSidebarState = JSON.parse(savedState);
      
      // Validate version and structure
      if (parsedState.version !== SIDEBAR_STORAGE_VERSION) {
        console.warn('⚠️ Outdated sidebar state version, resetting');
        return null;
      }
      
      // Validate role match
      if (parsedState.role !== role) {
        console.warn('⚠️ Role mismatch, using current role');
        return null;
      }
      
      // Check if state is recent (within 24 hours)
      const isExpired = Date.now() - parsedState.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        console.warn('⚠️ Sidebar state expired, resetting');
        return null;
      }
      
      console.log('✅ Sidebar state loaded:', parsedState);
      return parsedState;
      
    } catch (error) {
      console.error('❌ Failed to load sidebar state:', error);
      return null;
    }
  }, [getStorageKey, role]);

  // Compute initial state
  const getInitialSidebarState = useCallback((): boolean => {
    const savedState = loadSidebarState();
    
    if (!savedState) {
      return false; // Default closed
    }
    
    // Open sidebar if:
    // 1. It was previously open, OR
    // 2. We're on the same path where it was open, OR
    // 3. It's within the last hour (frequent toggles)
    return savedState.isOpen || 
           savedState.lastPath === pathname ||
           (Date.now() - savedState.timestamp < 60 * 60 * 1000);
  }, [loadSidebarState, pathname]);

  // Save state on change
  useEffect(() => {
    if (!isInitialized) return; // Skip on initial mount
    
    const newState: PersistentSidebarState = {
      isOpen: sidebarOpen,
      lastPath: pathname,
      role,
      timestamp: Date.now(),
      version: SIDEBAR_STORAGE_VERSION,
    };
    
    saveSidebarState(newState);
  }, [sidebarOpen, pathname, role, saveSidebarState, isInitialized]);

  // Initialize state from storage
  useEffect(() => {
    const initialState = getInitialSidebarState();
    setSidebarOpen(initialState);
    setIsInitialized(true);
  }, [getInitialSidebarState]);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === getStorageKey(role) || event.key === SIDEBAR_STORAGE_KEY) {
        const newState = loadSidebarState();
        if (newState && newState.role === role) {
          setSidebarOpen(newState.isOpen);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getStorageKey, role, loadSidebarState]);

  // ===== SIDEBAR ACTIONS WITH PERSISTENCE =====
  
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const newState = !prev;
      
      // Immediately save for responsive UI
      const tempState: PersistentSidebarState = {
        isOpen: newState,
        lastPath: pathname,
        role,
        timestamp: Date.now(),
        version: SIDEBAR_STORAGE_VERSION,
      };
      saveSidebarState(tempState);
      
      return newState;
    });
  }, [pathname, role, saveSidebarState]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    const saveState: PersistentSidebarState = {
      isOpen: true,
      lastPath: pathname,
      role,
      timestamp: Date.now(),
      version: SIDEBAR_STORAGE_VERSION,
    };
    saveSidebarState(saveState);
  }, [pathname, role, saveSidebarState]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    const saveState: PersistentSidebarState = {
      isOpen: false,
      lastPath: pathname,
      role,
      timestamp: Date.now(),
      version: SIDEBAR_STORAGE_VERSION,
    };
    saveSidebarState(saveState);
  }, [pathname, role, saveSidebarState]);

  // ===== UTILITY FUNCTIONS =====
  
  const clearSidebarState = useCallback(() => {
    localStorage.removeItem(getStorageKey(role));
    localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    setSidebarOpen(false);
  }, [getStorageKey, role]);

  const debugSidebarState = useCallback(() => {
    const savedState = loadSidebarState();
    console.log('🐛 Sidebar Debug Info:', {
      savedState,
      currentOpen: sidebarOpen,
      pathname,
      role,
      storageKey: getStorageKey(role),
    });
  }, [loadSidebarState, sidebarOpen, pathname, role, getStorageKey]);

  // ===== HEADER/FOOTER HIDING LOGIC =====
  
  const hideHeaderAndFooter = true; // Set to false to show them

  return (
    <div className={`min-h-screen bg-zinc-950 text-white`}>      {/* Debug button - remove in production */}
      <button
        onClick={debugSidebarState}
        className="fixed top-4 right-4 z-50 bg-zinc-800 text-white px-3 py-1 rounded text-xs"
        style={{ display: 'none' }} /* Hide in production */
      >
        Debug Sidebar
      </button>

      {/* Mobile sidebar backdrop */}
      {!hideHeaderAndFooter && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!hideHeaderAndFooter && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex flex-col h-full">
            {/* Logo & Role */}
            <div className="p-5 border-b border-zinc-800">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-${roleColors[role]}-500/20`}>
                  <Sparkles className={`w-6 h-6 text-${roleColors[role]}-400`} />
                </div>
                <span className="text-xl font-bold font-display">VizTR</span>
              </Link>
              <div className={`px-3 py-1.5 rounded-lg bg-${roleColors[role]}-500/20 border border-${roleColors[role]}-500/30 text-${roleColors[role]}-400 text-xs font-bold uppercase tracking-wider text-center`}>
                {roleLabels[role]}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                      ? `bg-${roleColors[role]}-500/15 text-${roleColors[role]}-400 border border-${roleColors[role]}-500/30`
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)} // Close sidebar on mobile navigation
                  >
                    {item.icon && iconMap[item.icon] && (
                      <span className="w-5 h-5 flex items-center justify-center">
                        {React.createElement(iconMap[item.icon], { className: 'w-5 h-5' })}
                      </span>
                    )}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-zinc-800">
              <Link
                href="/creator/3d-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all"
                onClick={() => setSidebarOpen(false)}
              >
                <Box className="w-4 h-4" />
                Open 3D Editor
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className={`${!hideHeaderAndFooter ? 'lg:pl-64' : ''} dashboard-main-content`}>        {/* Top Bar - only show if header/footer not hidden */}
        {!hideHeaderAndFooter && (
          <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
            <div className="flex items-center justify-between h-16 px-6">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Search */}
              <div className="flex-1 max-w-md lg:max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                </button>

                <div className="relative">
                  <button
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className={`w-8 h-8 rounded-full bg-${roleColors[role]}-500/20 flex items-center justify-center`}>
                      <User className={`w-4 h-4 text-${roleColors[role]}-400`} />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold">{roleLabels[role] + ' User'}</p>
                      <p className={`text-xs text-${roleColors[role]}-400`}>{roleLabels[role]}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg py-2 z-50">
                        <div className="px-4 py-3 border-b border-zinc-800">
                          <p className="text-sm font-semibold">{roleLabels[role] + ' User'}</p>
                          <p className="text-xs text-zinc-500">{role + '@viztr.com'}</p>
                        </div>
                        <Link
                          href={`/app/${role === 'super_admin' ? 'super-admin' : role}/settings`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href={`/app/${role === 'super_admin' ? 'super-admin' : role}/billing`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="w-4 h-4 flex items-center justify-center">💳</span>
                          Billing
                        </Link>
                        <Link
                          href={`/app/${role === 'super_admin' ? 'super-admin' : role}/settings`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="w-4 h-4 flex items-center justify-center">⚙️</span>
                          Settings
                        </Link>
                        <div className="border-t border-zinc-800 my-2" />
                        <button
                          onClick={() => signOut({ callbackUrl: '/login' })}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-zinc-800 w-full cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={`p-6 ${!hideHeaderAndFooter ? 'pt-20' : ''}`}>          {children}
        </main>
      </div>
    </div>
  );
}