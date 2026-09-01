"""
Supabase integration service for authentication, database management, and real-time sync.
This service provides unified interface for all Supabase operations across the application.
"""

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for browser)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-client-info': 'immersive-viewer/@1.0.0',
    },
  },
})

// Server-side Supabase client (for Next.js server components)
export const supabaseServer = createServerClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    get(name: string) {
      return cookies().get(name)?.value
    },
    set(name: string, value: string, options: any) {
      cookies().set({ name, value, ...options })
    },
    delete(name: string) {
      cookies().delete(name)
    },
  },
})

// Admin client for server-side operations (requires service role key)
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'x-client-info': 'immersive-admin/@1.0.0',
    },
  },
})

// Authentication service
export class AuthService {
  private supabase;
  
  constructor() {
    this.supabase = supabaseClient
  }
  
  // Sign up with email/password and create user profile
  async signUp(email: string, password: string, userData: any) {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (authError) throw authError
      
      if (authData.user) {
        // Create user profile in database
        const { data: profile, error: profileError } = await this.supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              full_name: userData.full_name || null,
              avatar_url: userData.avatar_url || null,
              role: userData.role || 'viewer',
              organization_id: userData.organization_id || null,
              preferences: userData.preferences || {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single()
        
        if (profileError) throw profileError
        
        // Create user preferences
        await this.createUserPreferences(authData.user.id)
        
        // Create organization membership if needed
        if (userData.organization_id) {
          await this.createOrganizationMember(
            authData.user.id,
            userData.organization_id,
            userData.role || 'viewer'
          )
        }
        
        return { user: authData.user, profile }
      }
      
      return null
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }
  
  // Sign in with email/password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }
  
  // Sign out
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }
  
  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }
  
  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }
  
  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }
  
  // Update user profile
  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Update user profile error:', error)
      throw error
    }
  }
  
  // Check role-based permissions
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      // Get user role
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('role, organization_id')
        .eq('id', userId)
        .single()
      
      if (profileError) throw profileError
      
      // Get role permissions
      const { data: roleData, error: roleError } = await this.supabase
        .from('role_permissions')
        .select('permissions')
        .eq('role', profile.role)
        .single()
      
      if (roleError) throw roleError
      
      const permissions = roleData.permissions || []
      const permission = `${resource}:${action}`
      
      // Check if user has specific permission
      return permissions.includes(permission) || profile.role === 'admin'
    } catch (error) {
      console.error('Has permission error:', error)
      return false
    }
  }
  
  // Create organization member
  private async createOrganizationMember(userId: string, organizationId: string, role: string) {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .insert([
          {
            user_id: userId,
            organization_id: organizationId,
            role: role,
            joined_at: new Date().toISOString(),
            status: 'active'
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Create organization member error:', error)
      throw error
    }
  }
  
  // Create user preferences
  private async createUserPreferences(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .insert([
          {
            user_id: userId,
            theme: 'dark',
            notifications: true,
            language: 'en',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Create user preferences error:', error)
      throw error
    }
  }
  
  // Get user organization
  async getUserOrganization(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user organization error:', error)
      return null
    }
  }
}

// Scene management service
export class SceneService {
  private supabase;
  
  constructor() {
    this.supabase = supabaseClient
  }
  
  // Get user scenes
  async getUserScenes(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('scenes')
        .select('*, scene_thumbnails(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Get user scenes error:', error)
      throw error
    }
  }
  
  // Create scene
  async createScene(userId: string, sceneData: any) {
    try {
      const { data, error } = await this.supabase
        .from('scenes')
        .insert([
          {
            id: crypto.randomUUID(),
            user_id: userId,
            name: sceneData.name,
            description: sceneData.description || null,
            config: sceneData.config,
            thumbnail_url: sceneData.thumbnail_url || null,
            tags: sceneData.tags || [],
            is_public: sceneData.is_public || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Create scene error:', error)
      throw error
    }
  }
  
  // Update scene
  async updateScene(sceneId: string, updates: any, userId: string) {
    try {
      // Check if user has permission to update this scene
      const { data: scene, error: sceneError } = await this.supabase
        .from('scenes')
        .select('user_id')
        .eq('id', sceneId)
        .single()
      
      if (sceneError) throw sceneError
      if (scene.user_id !== userId) {
        throw new Error('Unauthorized to update this scene')
      }
      
      const { data, error } = await this.supabase
        .from('scenes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sceneId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Update scene error:', error)
      throw error
    }
  }
  
  // Delete scene
  async deleteScene(sceneId: string, userId: string) {
    try {
      // Check if user has permission to delete this scene
      const { data: scene, error: sceneError } = await this.supabase
        .from('scenes')
        .select('user_id')
        .eq('id', sceneId)
        .single()
      
      if (sceneError) throw sceneError
      if (scene.user_id !== userId) {
        throw new Error('Unauthorized to delete this scene')
      }
      
      const { error } = await this.supabase
        .from('scenes')
        .delete()
        .eq('id', sceneId)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete scene error:', error)
      throw error
    }
  }
  
  // Duplicate scene
  async duplicateScene(sceneId: string, userId: string, newName: string) {
    try {
      // Get original scene
      const { data: originalScene, error: originalError } = await this.supabase
        .from('scenes')
        .select('*')
        .eq('id', sceneId)
        .single()
      
      if (originalError) throw originalError
      
      // Create new scene with copied data
      const { data, error } = await this.supabase
        .from('scenes')
        .insert([
          {
            id: crypto.randomUUID(),
            user_id: userId,
            name: newName,
            description: originalScene.description,
            config: originalScene.config,
            thumbnail_url: originalScene.thumbnail_url,
            tags: originalScene.tags,
            is_public: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Duplicate scene error:', error)
      throw error
    }
  }
  
  // Get shared scenes
  async getSharedScenes(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('scenes')
        .select('*, user_profiles(full_name, avatar_url)')
        .eq('is_public', true)
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Get shared scenes error:', error)
      throw error
    }
  }
}

// Organization service
export class OrganizationService {
  private supabase;
  
  constructor() {
    this.supabase = supabaseClient
  }
  
  // Get user organizations
  async getUserOrganizations(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .select('organizations(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
      
      if (error) throw error
      
      // Extract organization data from nested structure
      return data.map(item => item.organizations)
    } catch (error) {
      console.error('Get user organizations error:', error)
      throw error
    }
  }
  
  // Create organization
  async createOrganization(orgData: any, userId: string) {
    try {
      // Create organization
      const { data: organization, error: orgError } = await this.supabase
        .from('organizations')
        .insert([
          {
            id: crypto.randomUUID(),
            name: orgData.name,
            description: orgData.description || null,
            logo_url: orgData.logo_url || null,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (orgError) throw orgError
      
      // Add creator as admin member
      await this.addOrganizationMember(organization.id, userId, 'admin')
      
      return organization
    } catch (error) {
      console.error('Create organization error:', error)
      throw error
    }
  }
  
  // Add organization member
  async addOrganizationMember(organizationId: string, userId: string, role: string) {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .insert([
          {
            user_id: userId,
            organization_id: organizationId,
            role: role,
            joined_at: new Date().toISOString(),
            status: 'active'
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Add organization member error:', error)
      throw error
    }
  }
  
  // Get organization members
  async getOrganizationMembers(organizationId: string) {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .select('user_id, role, joined_at')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
      
      if (error) throw error
      
      // Get user details for each member
      const members = await Promise.all(
        data.map(async (member) => {
          const { data: userProfile, error: userError } = await this.supabase
            .from('user_profiles')
            .select('full_name, avatar_url')
            .eq('id', member.user_id)
            .single()
          
          return {
            ...member,
            user_profile: userProfile || null
          }
        })
      )
      
      return members
    } catch (error) {
      console.error('Get organization members error:', error)
      throw error
    }
  }
}

// Export all services
export { AuthService, SceneService, OrganizationService }