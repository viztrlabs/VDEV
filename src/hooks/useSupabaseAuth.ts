"""
React hook for Supabase authentication management.
Provides authentication state and methods for user management.
"""

import { useState, useEffect, useCallback } from 'react'
import { 
  Session, 
  User,
  AuthError,
  SignUpResponse,
  SignInResponse,
  Subscription
} from '@supabase/supabase-js'
import { AuthService } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: string
  organization_id?: string
  preferences?: any
  created_at: string
  updated_at: string
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  language: string
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
  }
}

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  preferences: UserPreferences | null
  organization: {
    id: string
    name: string
    role: string
  } | null
  loading: boolean
  error: string | null
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    preferences: null,
    organization: null,
    loading: true,
    error: null
  })
  
  const authService = new AuthService()
  
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const session = await authService.getSession()
        const user = session?.user || null
        
        if (user) {
          // Fetch user profile
          const profile = await fetchUserProfile(user.id)
          const preferences = await fetchUserPreferences(user.id)
          const organization = await fetchUserOrganization(user.id)
          
          setAuthState({
            user,
            session,
            profile,
            preferences,
            organization,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            preferences: null,
            organization: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error'
        }))
      }
    }
    
    initializeAuth()
    
    // Subscribe to auth state changes
    const { data: authListener } = authService.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user
          const profile = await fetchUserProfile(user.id)
          const preferences = await fetchUserPreferences(user.id)
          const organization = await fetchUserOrganization(user.id)
          
          setAuthState({
            user,
            session,
            profile,
            preferences,
            organization,
            loading: false,
            error: null
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            profile: null,
            preferences: null,
            organization: null,
            loading: false,
            error: null
          })
        }
      }
    )
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
  
  // Helper functions
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await authService.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }
  
  const fetchUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
    try {
      const { data, error } = await authService.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return null
    }
  }
  
  const fetchUserOrganization = async (userId: string) => {
    try {
      const { data, error } = await authService.supabase
        .from('organization_members')
        .select('organizations(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
      
      if (error) throw error
      return data?.organizations || null
    } catch (error) {
      console.error('Error fetching user organization:', error)
      return null
    }
  }
  
  // Auth methods
  const signUp = async (email: string, password: string, userData: any) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await authService.signUp(email, password, userData)
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null
      }))
      
      return result
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      }))
      throw error
    }
  }
  
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await authService.signIn(email, password)
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null
      }))
      
      return result
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }))
      throw error
    }
  }
  
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      await authService.signOut()
      
      setAuthState({
        user: null,
        session: null,
        profile: null,
        preferences: null,
        organization: null,
        loading: false,
        error: null
      })
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }))
      throw error
    }
  }
  
  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email)
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }
  
  const updateProfile = async (updates: any) => {
    if (!authState.user?.id) throw new Error('No user logged in')
    
    try {
      const updatedProfile = await authService.updateUserProfile(authState.user.id, updates)
      
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile,
        loading: false,
        error: null
      }))
      
      return updatedProfile
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Profile update failed'
      }))
      throw error
    }
  }
  
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!authState.user?.id) throw new Error('No user logged in')
    
    try {
      const { data, error } = await authService.supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authState.user.id)
        .select()
        .single()
      
      if (error) throw error
      
      setAuthState(prev => ({
        ...prev,
        preferences: data,
        loading: false,
        error: null
      }))
      
      return data
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Preferences update failed'
      }))
      throw error
    }
  }
  
  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!authState.user?.id) return false
    
    return await authService.hasPermission(authState.user.id, resource, action)
  }
  
  // Computed properties
  const isAuthenticated = !!authState.user
  const isAdmin = authState.profile?.role === 'admin'
  const isLoading = authState.loading
  
  return {
    // State
    ...authState,
    
    // Methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    updatePreferences,
    hasPermission,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isLoading,
    
    // Utilities
    clearError: () => setAuthState(prev => ({ ...prev, error: null }))
  }
}