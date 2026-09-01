"""
React hooks for scene management operations.
Provides CRUD functionality for immersive scenes with real-time updates.
"""

import { useState, useEffect, useCallback } from 'react'
import { SceneService } from '../lib/supabase'

interface Scene {
  id: string
  user_id: string
  name: string
  description?: string
  config: any
  thumbnail_url?: string
  tags?: string[]
  is_public: boolean
  created_at: string
  updated_at: string
  scene_thumbnails?: {
    url: string
    width: number
    height: number
  }
}

interface UseScenesReturn {
  scenes: Scene[]
  currentScene: Scene | null
  loading: boolean
  error: string | null
  creating: boolean
  updating: boolean
  deleting: boolean
  
  // Actions
  fetchScenes: (userId: string) => Promise<void>
  fetchSharedScenes: () => Promise<void>
  createScene: (userId: string, sceneData: Partial<Scene>) => Promise<Scene>
  updateScene: (sceneId: string, updates: Partial<Scene>, userId: string) => Promise<Scene>
  deleteScene: (sceneId: string, userId: string) => Promise<void>
  duplicateScene: (sceneId: string, userId: string, newName: string) => Promise<Scene>
  setCurrentScene: (scene: Scene | null) => void
  refreshScenes: () => Promise<void>
  clearError: () => void
}

export function useScenes(userId?: string): UseScenesReturn {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [currentScene, setCurrentSceneState] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const sceneService = new SceneService()
  
  // Fetch user scenes
  const fetchScenes = useCallback(async (currentUserId: string) => {
    if (!currentUserId) {
      setScenes([])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const userScenes = await sceneService.getUserScenes(currentUserId)
      setScenes(userScenes)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch scenes')
      console.error('Error fetching scenes:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  // Fetch shared scenes
  const fetchSharedScenes = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const sharedScenes = await sceneService.getSharedScenes(userId || '')
      setScenes(sharedScenes)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch shared scenes')
      console.error('Error fetching shared scenes:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])
  
  // Create scene
  const createScene = useCallback(async (currentUserId: string, sceneData: Partial<Scene>) => {
    if (!currentUserId) {
      throw new Error('User ID is required')
    }
    
    setCreating(true)
    setError(null)
    
    try {
      const newScene = await sceneService.createScene(currentUserId, sceneData)
      setScenes(prev => [newScene, ...prev])
      return newScene
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create scene'
      setError(errorMessage)
      console.error('Error creating scene:', error)
      throw error
    } finally {
      setCreating(false)
    }
  }, [])
  
  // Update scene
  const updateScene = useCallback(async (sceneId: string, updates: Partial<Scene>, currentUserId: string) => {
    setUpdating(true)
    setError(null)
    
    try {
      const updatedScene = await sceneService.updateScene(sceneId, updates, currentUserId)
      setScenes(prev => prev.map(scene => 
        scene.id === sceneId ? updatedScene : scene
      ))
      
      // Update current scene if it's the one being updated
      if (currentScene?.id === sceneId) {
        setCurrentSceneState(updatedScene)
      }
      
      return updatedScene
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update scene'
      setError(errorMessage)
      console.error('Error updating scene:', error)
      throw error
    } finally {
      setUpdating(false)
    }
  }, [currentScene])
  
  // Delete scene
  const deleteScene = useCallback(async (sceneId: string, currentUserId: string) => {
    setDeleting(true)
    setError(null)
    
    try {
      await sceneService.deleteScene(sceneId, currentUserId)
      setScenes(prev => prev.filter(scene => scene.id !== sceneId))
      
      // Clear current scene if it's the one being deleted
      if (currentScene?.id === sceneId) {
        setCurrentSceneState(null)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete scene'
      setError(errorMessage)
      console.error('Error deleting scene:', error)
      throw error
    } finally {
      setDeleting(false)
    }
  }, [currentScene])
  
  // Duplicate scene
  const duplicateScene = useCallback(async (sceneId: string, currentUserId: string, newName: string) => {
    setCreating(true)
    setError(null)
    
    try {
      const duplicatedScene = await sceneService.duplicateScene(sceneId, currentUserId, newName)
      setScenes(prev => [duplicatedScene, ...prev])
      return duplicatedScene
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate scene'
      setError(errorMessage)
      console.error('Error duplicating scene:', error)
      throw error
    } finally {
      setCreating(false)
    }
  }, [])
  
  // Set current scene
  const setCurrentScene = useCallback((scene: Scene | null) => {
    setCurrentSceneState(scene)
  }, [])
  
  // Refresh scenes
  const refreshScenes = useCallback(async () => {
    if (userId) {
      await fetchScenes(userId)
    } else {
      setScenes([])
    }
  }, [userId, fetchScenes])
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  // Initialize scenes when userId changes
  useEffect(() => {
    if (userId) {
      fetchScenes(userId)
    } else {
      setScenes([])
      setCurrentSceneState(null)
    }
  }, [userId, fetchScenes])
  
  return {
    scenes,
    currentScene,
    loading,
    error,
    creating,
    updating,
    deleting,
    fetchScenes,
    fetchSharedScenes,
    createScene,
    updateScene,
    deleteScene,
    duplicateScene,
    setCurrentScene,
    refreshScenes,
    clearError
  }
}