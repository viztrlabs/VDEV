# WebXR Development - Supabase-Optimized Phase 3 Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Implement comprehensive WebXR development with Supabase ecosystem (OAuth + storage + PostgreSQL) for XR World services, building upon existing Phase 1 and Phase 2 foundations with PlayCanvas, Marzipano, and advanced virtual tour capabilities.

**Architecture:** Monorepo with Supabase as unified backend platform, PlayCanvas for 3D rendering, Marzipano for 360° viewing, and comprehensive admin dashboard for XR content management.

**Tech Stack:** 
- **Backend:** Supabase (PostgreSQL + Storage + Auth + Edge Functions), Node.js/TypeScript, Next.js API routes
- **Frontend:** React/Vue, TypeScript, PlayCanvas 2.21.4, Marzipano 0.10.2, WebXR API
- **Infrastructure:** Docker/Kubernetes, GitOps, ArgoCD, MinIO, Redis
- **Development:** Vite/Next.js, Tailwind CSS, ESLint/Prettier

**Core Technologies:**
1. **WebXR API** for VR/AR device support and immersive experiences
2. **PlayCanvas 2.21.4** for 3D rendering and interactive 3D content
3. **Marzipano 0.10.2** for 360° panorama integration and navigation
4. **Supabase Ecosystem** for authentication, database, storage, and edge functions
5. **WebGPU** for GPU-accelerated rendering via PlayCanvas
6. **Real-time WebSocket** for collaboration and live updates
7. **AI/ML** for intelligent tour recommendations and content processing

**Development Approach:**
- **Progressive Enhancement**: Build upon existing Phase 1 and Phase 2 foundations
- **Supabase-First Architecture**: Use Supabase as unified backend for all services
- **Cross-Functional Teams**: Specialized teams for WebXR, 3D, Content, and Admin domains
- **Continuous Integration**: Regular testing and validation
- **Quality Focus**: Comprehensive testing, accessibility, and production readiness

**Development Phases:**
1. **Phase 3.1**: Supabase Infrastructure Setup (Weeks 1-2)
2. **Phase 3.2**: PlayCanvas Integration (Weeks 3-4)
3. **Phase 3.3**: Supabase-Powered Admin Dashboard (Weeks 5-6)
4. **Phase 3.4**: Real-time Collaboration with Supabase (Weeks 7-8)

---

## 📋 **CURRENT CONTEXT & ASSUMPTIONS**

### **Existing Foundation**
- ✅ Marzipano 360° viewer integration (Phase 1)
- ✅ Enhanced navigation and user experience (Phase 2)
- ✅ Component architecture established
- ✅ Frontend XR capabilities established

### **Supabase Ecosystem Focus**
**Technical Dependencies:**
- **Authentication**: Supabase OAuth (GitHub, Google, Apple, email)
- **Database**: Supabase PostgreSQL with PostGIS extension
- **Storage**: Supabase Storage for file uploads and media management
- **Edge Functions**: Serverless functions for backend business logic
- **Real-time**: Built-in WebSocket subscriptions
- **API**: RESTful APIs via Supabase client

**Development Environment Assumptions:**
- Supabase as unified backend platform
- Existing frontend components will consume Supabase APIs
- File uploads handled via Supabase Storage
- Authentication managed through Supabase Auth
- Real-time features via Supabase subscriptions
- Production deployment using Docker/Kubernetes

### **Key Business Requirements:**
1. **XR Content Management**: Complete lifecycle management for virtual tours, WebAR, VR experiences
2. **Advanced File Processing**: Support for 360° images, 3D models, Gaussian splats, videos
3. **User Authentication & Authorization**: Role-based access control for content management
4. **Real-time Collaboration**: Multi-user editing and content sharing
5. **Analytics & Monitoring**: Usage tracking and performance metrics
6. **Admin Dashboard**: Comprehensive configuration and management tools

---

## 🎯 **PROPOSED APPROACH**

### **Supabase-First Architecture**

**Unified Backend Layer:**
1. **XR Content API** (`packages/xr-backend/api/`) - RESTful APIs for XR content
2. **Content Management** (`packages/xr-backend/content/`) - File processing and storage
3. **Admin Dashboard** (`packages/xr-backend/admin/`) - Configuration and management tools
4. **Real-time Services** (`packages/xr-backend/realtime/`) - Collaboration and updates
5. **Analytics & Monitoring** (`packages/xr-backend/analytics/`) - Usage and performance tracking

**Technology Stack Integration:**
- **Supabase**: Authentication, database, storage, edge functions
- **PlayCanvas**: 3D rendering and interactive experiences
- **Marzipano**: 360° panorama integration (existing)
- **WebXR API**: VR/AR device support
- **Tailwind CSS**: Admin dashboard styling
- **TypeScript**: Full type safety across all layers

### **Implementation Strategy:**
1. **Infrastructure Setup**: Configure Supabase project with proper services
2. **API Development**: Build RESTful APIs for content management
3. **Frontend Integration**: Enhance existing frontend with Supabase authentication
4. **Advanced Features**: Implement PlayCanvas 3D rendering and collaboration
5. **Production Deployment**: Setup CI/CD, monitoring, and scaling
6. **Quality Assurance**: Comprehensive testing and validation

---

## 📋 **STEP-BY-STEP IMPLEMENTATION PLAN**

### **Phase 3.1: Supabase Infrastructure Setup (Weeks 1-2)**

#### **Task 1: Supabase Project Configuration**
**Objective:** Setup Supabase project with proper authentication, storage, and database

**Files**:
- `packages/xr-backend/src/supabase-client.ts` (Supabase client configuration)
- `packages/xr-backend/src/types/supabase.types.ts` (TypeScript definitions)
- `packages/xr-backend/prisma/schema.prisma` (Database schema)
- `packages/xr-backend/.env.example` (Environment variables)

**Implementation**:
```typescript
// Supabase Client Configuration
export class SupabaseClient {
  private supabase: any;
  
  constructor() {
    this.supabase = this.initializeSupabase();
  }
  
  private initializeSupabase() {
    return {
      // Authentication Configuration
      auth: {
        autoConfirm: false,
        autoLogin: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
        providers: ['google', 'github', 'apple', 'email'],
        redirectTo: `${window.location.origin}/auth/callback`
      },
      
      // Database Configuration
      db: {
        schema: 'public',
        pool: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000
        }
      },
      
      // Storage Configuration
      storage: {
        storageProvider: 's3',
        bucketUrl: process.env.SUPABASE_STORAGE_URL,
        accessKey: process.env.SUPABASE_STORAGE_KEY,
        region: 'us-east-1',
        endpoint: process.env.SUPABASE_STORAGE_ENDPOINT
      },
      
      // Edge Functions Configuration
      functions: {
        cors: {
          origin: '*',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Authorization', 'Content-Type']
        }
      }
    };
  }
  
  public getClient() {
    return this.supabase;
  }
  
  public async initializeAuth() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    
    this.supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN') {
        this.handleSignIn(session);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignOut();
      }
    });
    
    return session;
  }
}
```

#### **Task 2: Database Schema Setup**
**Objective:** Create comprehensive database schema using Supabase PostgreSQL

**Files**:
- `packages/xr-backend/prisma/schema.prisma` (Database schema)
- `packages/xr-backend/src/repositories/xr-content.repository.ts` (Content repository)
- `packages/xr-backend/src/repositories/user-profiles.repository.ts` (User profiles)

**Implementation**:
```sql
-- Prisma Schema
model XRContent {
  id              String    @id @default(uuid())
  title           String
  description     String?
  type            XRContentType
  status          ContentStatus  @default(DRAFT)
  thumbnail       String?
  duration        Int?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  createdBy       String
  organizationId  String
  metadata        Json?
  settings        Json?
  
  // Relations
  assets          Asset[]
  configurations  XRConfig[]
  collaborations  Collaboration[]
  analytics       ContentAnalytics[]
  
  @@index([organizationId])
  @@index([createdBy])
  @@index([type, status])
}

model Asset {
  id             String    @id @default(uuid())
  contentId      String
  filename       String
  originalName   String
  filePath       String
  fileType       String
  fileSize       Int
  mimeType       String
  thumbnail      String?
  metadata       Json?
  createdAt      DateTime  @default(now())
  
  // Relations
  content        XRContent @relation(fields: [contentId], references: [id])
  
  @@index([contentId])
}

model XRConfig {
  id          String    @id @default(uuid())
  contentId   String
  type        XRConfigType
  name        String
  config      Json
  isDefault   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  content     XRContent @relation(fields: [contentId], references: [id])
  
  @@unique([contentId, type])
}

model Collaboration {
  id          String    @id @default(uuid())
  contentId   String
  userId      String
  role        CollaborationRole
  permissions Json
  joinedAt    DateTime  @default(now())
  
  // Relations
  content     XRContent @relation(fields: [contentId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
  
  @@unique([contentId, userId])
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  fullName      String?
  avatarUrl     String?
  organizationId String?
  role          UserRole    @default(USER)
  preferences   Json?      @default('{}')
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  contents      XRContent[]
  collaborations Collaboration[]
}

enum XRContentType {
  VIRTUAL_TOUR
  WEBAR
  VIRTUAL_REALITY
  GAUSSIAN_SPLAT
  MARZIPANO
  PLAYCANVAS
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  REJECTED
}

enum XRConfigType {
  DISPLAY_SETTINGS
  NAVIGATION_CONTROLS
  INTERACTION_SETTINGS
  PERFORMANCE_OPTIMIZATION
  CUSTOM
}

enum CollaborationRole {
  OWNER
  EDITOR
  VIEWER
  COMMENTATOR
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}
```

---

### **Phase 3.2: PlayCanvas Integration (Weeks 3-4)**

#### **Task 3: PlayCanvas Service Setup**
**Objective:** Integrate PlayCanvas for 3D rendering and interactive experiences

**Files**:
- `packages/xr-3d/src/services/playcanvas-renderer.ts` (PlayCanvas rendering service)
- `packages/xr-3d/src/services/gaussian-splat.service.ts` (Gaussian splat processing)
- `packages/xr-3d/src/components/3d-model-viewer.tsx` (React component)
- `hooks/use-playcanvas-xr.ts` (Custom hooks for PlayCanvas)

**Implementation**:
```typescript
// PlayCanvas Rendering Service
export class PlayCanvasRenderer {
  private engine: any;
  private scenes: Map<string, any>;
  private cameras: Map<string, any>;
  private materials: Map<string, any>;
  
  constructor() {
    this.initializeEngine();
    this.scenes = new Map();
    this.cameras = new Map();
    this.materials = new Map();
  }
  
  private initializeEngine() {
    // Initialize PlayCanvas engine with WebXR compatibility
    this.engine = new window.PlayCanvas({
      canvas: document.getElementById('playcanvas-canvas'),
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      antialias: true,
      alpha: true,
      transparent: true,
      powerPreference: 'high-performance',
      xrCompatible: true, // Enable WebXR support
      graphicsDeviceOptions: {
        preserveDrawingBuffer: true,
        preferWebGl2: true,
        antialias: true
      }
    });
    
    // Register event listeners
    this.engine.on('update', this.update.bind(this));
    this.engine.on('error', this.handleError.bind(this));
  }
  
  public async create3DScene(sceneId: string, config: SceneConfig): Promise<string> {
    try {
      // Create new scene
      const scene = new this.engine.Scene();
      
      // Configure camera
      const camera = new this.engine.Camera(scene);
      camera.nearClip = 0.1;
      camera.farClip = 1000;
      camera.fov = config.fov || 75;
      camera.aspectRatio = config.aspectRatio || window.innerWidth / window.innerHeight;
      
      // Setup lighting
      this.setupLighting(scene, config.lighting);
      
      // Store scene and camera
      this.scenes.set(sceneId, scene);
      this.cameras.set(sceneId, camera);
      
      return sceneId;
    } catch (error) {
      throw new Error(`Failed to create 3D scene: ${error.message}`);
    }
  }
  
  public async load3DModel(
    sceneId: string,
    modelUrl: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    scale: { x: number; y: number; z: number }
  ): Promise<string> {
    try {
      const scene = this.scenes.get(sceneId);
      if (!scene) throw new Error('Scene not found');
      
      // Load model using PlayCanvas asset system
      const asset = await this.engine.assets.load({
        type: 'container',
        url: modelUrl,
        data: {
          position,
          rotation,
          scale
        }
      });
      
      if (asset && asset.model) {
        scene.addChild(asset.model);
        return asset.model.id;
      }
      
      throw new Error('Failed to load 3D model');
    } catch (error) {
      throw new Error(`Failed to load 3D model: ${error.message}`);
    }
  }
  
  public update(deltaTime: number): void {
    // Update all scenes
    this.scenes.forEach((scene, sceneId) => {
      const camera = this.cameras.get(sceneId);
      if (camera) {
        // Update camera based on WebXR state if presenting
        if (this.isWebXRActive()) {
          this.updateForWebXR(scene, camera);
        }
        
        // Update animations
        scene.update(deltaTime);
      }
    });
  }
  
  private setupLighting(scene: any, lighting: LightingConfig): void {
    // Environment lighting
    if (lighting.environment) {
      const environmentLight = new this.engine.Light({
        type: this.engine.Light.Type.Directional,
        color: new this.engine.math.Color(
          lighting.environment.color.r,
          lighting.environment.color.g,
          lighting.environment.color.b
        ),
        intensity: lighting.environment.intensity || 1.0,
        castShadow: lighting.environment.castShadow || true,
        shadowBias: lighting.environment.shadowBias || 0.001,
        shadowMapSize: lighting.environment.shadowMapSize || 2048,
        position: new this.engine.math.Vec3(
          lighting.environment.position.x,
          lighting.environment.position.y,
          lighting.environment.position.z
        ),
        direction: new this.engine.math.Vec3(
          lighting.environment.direction.x,
          lighting.environment.direction.y,
          lighting.environment.direction.z
        )
      });
      
      scene.addChild(environmentLight);
    }
    
    // Ambient lighting
    const ambientLight = new this.engine.Light({
      type: this.engine.Light.Type.Ambient,
      color: new this.engine.math.Color(
        lighting.ambient.color.r,
        lighting.ambient.color.g,
        lighting.ambient.color.b
      ),
      intensity: lighting.ambient.intensity || 0.3
    });
    
    scene.addChild(ambientLight);
  }
  
  private isWebXRActive(): boolean {
    // Check if WebXR session is active
    return (
      navigator.xr?.getSession() !== null ||
      this.engine.xrActive || 
      false
    );
  }
  
  private updateForWebXR(scene: any, camera: any): void {
    // Update scene for WebXR presentation
    // Handle device motion, orientation, and interaction
    // Sync PlayCanvas state with WebXR frame data
  }
}
```

#### **Task 4: Gaussian Splat Processing Setup**
**Objective:** Setup Gaussian Splat processing using Supabase storage and PlayCanvas

**Files**:
- `packages/xr-3d/src/services/gaussian-splat-processor.ts` (Gaussian splat processor)
- `packages/xr-3d/src/processors/image-batch-processor.ts` (Image batch processing)
- `packages/xr-3d/src/processors/splat-exporters.ts` (Splat export utilities)
- `apps/xr-world-admin/src/components/gaussian-splat-uploader.tsx` (Upload component)

**Implementation**:
```typescript
// Gaussian Splat Processor
export class GaussianSplatProcessor {
  private supabaseClient: any;
  private playcanvasRenderer: PlayCanvasRenderer;
  
  constructor(supabaseClient: any, renderer: PlayCanvasRenderer) {
    this.supabaseClient = supabaseClient;
    this.playcanvasRenderer = renderer;
  }
  
  public async processImagesToGaussianSplats(
    imageUrls: string[],
    sceneId: string,
    options: GaussianSplatOptions
  ): Promise<GaussianSplatResult> {
    try {
      // Download images from storage
      const images = await this.downloadImagesFromStorage(imageUrls);
      
      // Process images using Gaussian Splat algorithm
      const gaussians = await this.processWithGaussianSplat(images, options);
      
      // Optimize for PlayCanvas rendering
      const optimizedSplats = await this.optimizeForPlayCanvas(gaussians, options);
      
      // Export for PlayCanvas
      const exportData = await this.exportForPlayCanvas(optimizedSplats, sceneId);
      
      return {
        success: true,
        sceneId,
        splatCount: optimizedSplats.length,
        exportData,
        processingTime: Date.now()
      };
    } catch (error) {
      throw new Error(`Gaussian Splat processing failed: ${error.message}`);
    }
  }
  
  private async downloadImagesFromStorage(imageUrls: string[]): Promise<ImageData[]> {
    const images = [];
    
    for (const url of imageUrls) {
      try {
        // Download image from Supabase Storage
        const response = await fetch(url);
        const blob = await response.blob();
        const imageData = await this.blobToImageData(blob);
        images.push(imageData);
      } catch (error) {
        console.warn(`Failed to download image ${url}: ${error}`);
      }
    }
    
    return images;
  }
  
  private async processWithGaussianSplat(
    images: ImageData[],
    options: GaussianSplatOptions
  ): Promise<GaussianSplat[]> {
    // Implementation of Gaussian Splat processing
    // Using @mkkellogg/gaussian-splats-3d package
    const { GaussianSplat3D } = await import('@mkkellogg/gaussian-splats-3d');
    
    const processor = new GaussianSplat3D({
      width: options.width || 512,
      height: options.height || 512,
      cameraPosition: { x: 0, y: 0, z: 0 },
      fov: options.fov || 75,
      near: options.near || 0.1,
      far: options.far || 100
    });
    
    // Process images to generate gaussians
    const gaussians = await processor.generateGaussianSplatsFromImages(images);
    
    return gaussians;
  }
  
  private async optimizeForPlayCanvas(
    gaussians: GaussianSplat[],
    options: GaussianSplatOptions
  ): Promise<OptimizedGaussianSplat[]> {
    // Optimize gaussians for PlayCanvas rendering
    return gaussians.map(splat => ({
      ...splat,
      // Apply optimizations
      optimizeDensity: true,
      mergeSimilar: true,
      reducePrecision: options.reducePrecision || true,
      generateLOD: options.generateLOD || true
    }));
  }
  
  private async exportForPlayCanvas(
    gaussians: OptimizedGaussianSplat[],
    sceneId: string
  ): Promise<PlayCanvasExport> {
    // Export data in PlayCanvas-compatible format
    return {
      sceneId,
      type: 'gaussian_splat',
      data: {
        gaussians: gaussians.map(g => ({
          position: g.position,
          rotation: g.rotation,
          scale: g.scale,
          color: g.color,
          opacity: g.opacity,
          sphericalHarmonics: g.sphericalHarmonics
        })),
        metadata: {
          totalGaussians: gaussians.length,
          boundingBox: this.calculateBoundingBox(gaussians),
          generatedAt: new Date().toISOString()
        }
      },
      settings: {
        enableShadows: true,
        castShadows: true,
        receiveShadows: true,
        alphaBlend: true,
        depthTest: true,
        cullFaces: false
      }
    };
  }
}
```

---

### **Phase 3.3: Supabase-Powered Admin Dashboard (Weeks 5-6)**

#### **Task 5: Admin Dashboard Services**
**Objective:** Build admin dashboard using Supabase as backend

**Files**:
- `packages/xr-backend/src/services/supabase-admin.service.ts` (Admin service)
- `packages/xr-backend/src/services/xr-content-admin.service.ts` (Content admin service)
- `packages/xr-backend/src/controllers/admin-dashboard.controller.ts` (Dashboard controller)
- `packages/xr-backend/src/controllers/config-editor.controller.ts` (Config editor controller)

**Implementation**:
```typescript
// Supabase Admin Service
export class SupabaseAdminService {
  private supabase: any;
  private cache: Map<string, any>;
  
  constructor() {
    this.supabase = this.initializeSupabase();
    this.cache = new Map();
  }
  
  private initializeSupabase() {
    return {
      ...this.createSupabaseConfig(),
      auth: {
        ...this.createAuthConfig(),
        onAuthStateChange: (callback: any) => {
          this.supabase.auth.onAuthStateChange(callback);
        }
      },
      storage: this.createStorageConfig(),
      functions: this.createFunctionsConfig()
    };
  }
  
  public async createXRContent(
    contentData: CreateXRContentData,
    files: File[]
  ): Promise<XRContentResult> {
    try {
      // Upload thumbnail to Supabase Storage
      const thumbnailUrl = files.find(f => f.type.startsWith('image/')) 
        ? await this.uploadToStorage(files[0], 'thumbnails')
        : null;
      
      // Process additional files
      const assetUrls = files
        .filter(f => !f.type.startsWith('image/'))
        .map(f => this.uploadToStorage(f, 'assets'));
      
      const assetUrlsResult = await Promise.all(assetUrls);
      
      // Create content record in database
      const { data: content, error } = await this.supabase
        .from('xr_contents')
        .insert({
          title: contentData.title,
          description: contentData.description,
          type: contentData.type,
          status: 'DRAFT',
          thumbnail: thumbnailUrl,
          created_by: (await this.supabase.auth.getUser()).data.user.id,
          organization_id: contentData.organizationId,
          metadata: contentData.metadata,
          settings: contentData.settings
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create default configurations
      await this.createDefaultConfigurations(content.id);
      
      // Process files if needed
      if (contentData.processFiles) {
        await this.processContentFiles(content.id, assetUrlsResult, contentData.type);
      }
      
      return {
        success: true,
        contentId: content.id,
        message: 'XR content created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create XR content: ${error.message}`);
    }
  }
  
  public async getXRContents(
    filters: ContentFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<XRContentListResult> {
    try {
      // Build query
      let query = this.supabase
        .from('xr_contents')
        .select(
          `
          *,
          user_profiles!created_by(full_name, avatar_url)
        `, { count: 'exact' }
        );
      
      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.createdBy) {
        query = query.eq('created_by', filters.createdBy);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      
      // Execute query
      const { data, count, error } = await query;
      
      if (error) throw error;
      
      return {
        contents: data || [],
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      throw new Error(`Failed to get XR contents: ${error.message}`);
    }
  }
  
  public async updateXRContent(
    contentId: string,
    updateData: Partial<XRContent>,
    userId: string
  ): Promise<XRContentUpdateResult> {
    try {
      // Check permissions
      const hasPermission = await this.checkContentPermission(
        contentId, userId, 'edit'
      );
      
      if (!hasPermission) {
        throw new Error('Insufficient permissions to edit this content');
      }
      
      // Update content
      const { data, error } = await this.supabase
        .from('xr_contents')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .eq('created_by', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        contentId: data.id,
        message: 'XR content updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update XR content: ${error.message}`);
    }
  }
  
  private async checkContentPermission(
    contentId: string,
    userId: string,
    action: 'view' | 'edit' | 'delete'
  ): Promise<boolean> {
    try {
      // Check if user is owner
      const { data: content, error } = await this.supabase
        .from('xr_contents')
        .select('created_by')
        .eq('id', contentId)
        .single();
      
      if (error) throw error;
      
      if (content.created_by === userId) {
        return true; // Owner has all permissions
      }
      
      // Check collaboration permissions
      const { data: collaboration, error: collabError } = await this.supabase
        .from('user_sessions')
        .select('role')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .single();
      
      if (collabError && collabError.code === 'PGRST116') {
        return false; // No collaboration record
      }
      
      const role = collaboration.role;
      
      // Map roles to permissions
      const permissions: Record<string, string[]> = {
        'OWNER': ['view', 'edit', 'delete'],
        'EDITOR': ['view', 'edit'],
        'VIEWER': ['view'],
        'COMMENTATOR': ['view']
      };
      
      return permissions[role]?.includes(action) || false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }
  
  private async createDefaultConfigurations(contentId: string): Promise<void> {
    const defaultConfigs = [
      {
        content_id: contentId,
        type: 'DISPLAY_SETTINGS',
        name: 'Default Display Settings',
        config: JSON.stringify({
          quality: 'high',
          antialias: true,
          fps: 60,
          vrMode: true,
          arMode: false
        }),
        is_default: true
      },
      {
        content_id: contentId,
        type: 'NAVIGATION_CONTROLS',
        name: 'Default Navigation',
        config: JSON.stringify({
          enableTouch: true,
          enableKeyboard: true,
          enableVoice: false,
          navigationSpeed: 'normal'
        }),
        is_default: true
      },
      {
        content_id: contentId,
        type: 'INTERACTION_SETTINGS',
        name: 'Default Interactions',
        config: JSON.stringify({
          enableHoverEffects: true,
          enableClickGestures: true,
          enableDragDrop: true,
          interactionDistance: 5.0
        }),
        is_default: true
      }
    ];
    
    await this.supabase
      .from('xr_configurations')
      .insert(defaultConfigs);
  }
}
```

---

### **Phase 3.4: Real-time Collaboration with Supabase (Weeks 7-8)**

#### **Task 6: Real-time Collaboration Services**
**Objective:** Implement real-time collaboration using Supabase subscriptions

**Files**:
- `packages/xr-backend/src/services/realtime-collaboration.service.ts` (Real-time service)
- `packages/xr-backend/src/controllers/room.controller.ts` (Room management)
- `packages/xr-backend/src/middleware/room-auth.middleware.ts` (Room authentication)
- `packages/xr-backend/src/validators/collaboration.validator.ts` (Collaboration validation)

**Implementation**:
```typescript
// Real-time Collaboration Service
export class RealtimeCollaborationService {
  private supabase: any;
  private channels: Map<string, any>;
  private presence: Map<string, any>;
  
  constructor() {
    this.supabase = this.initializeSupabase();
    this.channels = new Map();
    this.presence = new Map();
  }
  
  public async joinXRContent(
    contentId: string,
    userId: string,
    userInfo: UserInfo
  ): Promise<CollaborationSession> {
    try {
      // Create or get collaboration session
      const { data: session, error } = await this.supabase
        .from('user_sessions')
        .upsert({
          content_id: contentId,
          user_id: userId,
          role: 'VIEWER', // Default role, can be changed by owner
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }, {
          onConflict: 'content_id,user_id',
          count: 'exact'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Setup real-time subscriptions
      await this.setupRealtimeSubscriptions(contentId, userId, userInfo);
      
      return {
        sessionId: session.id,
        contentId,
        userId,
        role: session.role,
        joinedAt: session.joined_at
      };
    } catch (error) {
      throw new Error(`Failed to join XR content: ${error.message}`);
    }
  }
  
  public async setupRealtimeSubscriptions(
    contentId: string,
    userId: string,
    userInfo: UserInfo
  ): Promise<void> {
    const channelName = `xr-content-${contentId}`;
    
    // Subscribe to content changes
    const contentChannel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'xr_contents',
          filter: `id=eq.${contentId}`
        },
        (payload: any) => {
          this.handleContentChange(payload, userId, userInfo);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `content_id=eq.${contentId}`
        },
        (payload: any) => {
          this.handleAssetChange(payload, userId, userInfo);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'xr_configurations',
          filter: `content_id=eq.${contentId}`
        },
        (payload: any) => {
          this.handleConfigChange(payload, userId, userInfo);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          this.updatePresence(contentId, userId, userInfo, 'online');
        }
      });
    
    this.channels.set(channelName, contentChannel);
    
    // Subscribe to user presence
    const presenceChannel = this.supabase
      .channel(`${channelName}-presence`, {
        opts: {
          presence: true
        }
      })
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync(channelName);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        this.handleUserJoin(channelName, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        this.handleUserLeave(channelName, leftPresences);
      })
      .subscribe();
    
    this.channels.set(`${channelName}-presence`, presenceChannel);
    
    // Track user presence
    this.updatePresence(contentId, userId, userInfo, 'online');
  }
  
  public async broadcastEdit(
    contentId: string,
    editData: ContentEdit,
    userId: string,
    userInfo: UserInfo
  ): Promise<void> {
    const channelName = `xr-content-${contentId}`;
    const contentChannel = this.channels.get(channelName);
    
    if (contentChannel) {
      contentChannel.send({
        type: 'content-edit',
        payload: {
          editId: generateEditId(),
          contentId,
          editType: editData.editType,
          field: editData.field,
          oldValue: editData.oldValue,
          newValue: editData.newValue,
          userId,
          username: userInfo.username,
          timestamp: new Date().toISOString(),
          userAgent: editData.userAgent
        }
      });
    }
  }
  
  private handleContentChange(
    payload: any,
    userId: string,
    userInfo: UserInfo
  ): void {
    // Notify all users in the room except the editor
    const channelName = `xr-content-${payload.new.id}`;
    const contentChannel = this.channels.get(channelName);
    
    if (contentChannel && payload.old && payload.old.id !== userId) {
      contentChannel.send({
        type: 'content-updated',
        payload: {
          content: payload.new,
          userId,
          username: userInfo.username,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
  
  private handlePresenceSync(channelName: string): void {
    const presenceChannel = this.channels.get(channelName + '-presence');
    if (presenceChannel) {
      const state = presenceChannel.presenceState();
      this.presence.set(channelName, state);
    }
  }
  
  private handleUserJoin(channelName: string, newPresences: any): void {
    // Notify other users about new user joining
    const contentChannel = this.channels.get(channelName);
    if (contentChannel) {
      contentChannel.send({
        type: 'user-joined',
        payload: {
          userId: newPresences[0].key,
          username: newPresences[0].username,
          avatar: newPresences[0].avatar,
          joinedAt: newPresences[0].joinedAt
        }
      });
    }
  }
  
  private handleUserLeave(channelName: string, leftPresences: any): void {
    // Notify other users about user leaving
    const contentChannel = this.channels.get(channelName);
    if (contentChannel) {
      contentChannel.send({
        type: 'user-left',
        payload: {
          userId: leftPresences[0].key,
          username: leftPresences[0].username,
          leftAt: leftPresences[0].leftAt
        }
      });
    }
  }
}
```

---

## 📁 **FILES CREATED/MODIFIED - PHASE 3 SUPABASE-OPTIMIZED**

### **New Files**:
- `packages/xr-backend/` - Complete Supabase backend layer
- `packages/xr-backend/src/` - Core Supabase services
- `packages/xr-3d/` - PlayCanvas 3D rendering services
- `apps/xr-world-admin/` - Admin dashboard application
- `apps/xr-world-admin/src/` - Admin dashboard components
- `packages/xr-content/` - Content management services
- `packages/xr-realtime/` - Real-time collaboration services
- `packages/xr-analytics/` - Analytics and monitoring
- `packages/xr-monitoring/` - Production monitoring
- `packages/xr-scripts/` - Deployment and operations scripts
- `packages/xr-docker/` - Docker configurations
- `packages/xr-k8s/` - Kubernetes configurations

### **Existing Files Enhanced**:
- `apps/xr-world/app/page.tsx` - Enhanced frontend integration
- `packages/experience-engine/src/marzipano-tour.ts` - Enhanced tour engine
- All Phase 1 & Phase 2 foundation files maintained

---

## 🧪 **TESTS / VALIDATION**

### **Unit Tests**:
```bash
# Supabase integration tests
pnpm test packages/xr-backend/tests/

# PlayCanvas integration tests
pnpm test packages/xr-3d/tests/

# Admin dashboard tests
pnpm test apps/xr-world-admin/tests/

# Real-time collaboration tests
pnpm test packages/xr-realtime/tests/
```

### **Integration Tests**:
```bash
# End-to-end API tests
pnpm test:e2e packages/xr-backend/tests/e2e/

# Supabase storage tests
pnpm test:storage packages/xr-backend/tests/storage/

# Authentication tests
pnpm test:auth packages/xr-backend/tests/auth/
```

### **Manual Testing**:
1. **Local Development**:
   ```bash
   # Start all backend services
   pnpm dev --filter xr-backend
   pnpm dev --filter xr-3d
   pnpm dev --filter xr-world-admin
   pnpm dev --filter xr-realtime
   ```

2. **Database Testing**:
   ```bash
   # Initialize test database
   pnpm db:init:test
   
   # Run migrations
   pnpm db:migrate:test
   
   # Seed test data
   pnpm db:seed:test
   ```

3. **API Testing**:
   ```bash
   # Start API server
   pnpm start:xr-backend
   
   # Test authentication
   curl -X POST http://localhost:3000/auth/sign-in \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"***"}'
   
   # Test content creation
   curl -X POST http://localhost:3000/api/xr-contents \
     -H "Authorization: Bearer ***" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test XR Content","type":"VIRTUAL_TOUR"}'
   ```

---

## ⚠️ **RISKS, TRADEOFFS, AND OPEN QUESTIONS**

### **Critical Risks**:

#### 1. **Supabase Scaling & Performance**
**Risk**: High traffic may impact Supabase free tier limits
**Mitigation**:
- Implement caching strategies
- Use Supabase edge functions for intensive processing
- Consider paid Supabase tier for production
- Monitor and optimize database queries

#### 2. **Real-time Sync Issues**
**Risk**: Synchronization delays and conflicts
**Mitigation**:
- Implement conflict resolution strategies
- Use Supabase's built-in real-time features
- Implement local processing for offline scenarios
- Set up proper channel management

#### 3. **Security & Data Privacy**
**Risk**: Sensitive content and user data exposure
**Mitigation**:
- Implement proper authentication and authorization
- Use encryption for sensitive data
- Regular security audits and penetration testing
- Compliance with data protection regulations

### **Tradeoffs**:

#### 1. **Supabase vs. Custom Backend**
**Tradeoff**: Managed service vs. custom infrastructure
**Decision Framework**:
- Supabase for rapid development and managed services
- Custom backend for specialized requirements
- Hybrid approach for cost optimization

#### 2. **Real-time Features vs. Simplicity**
**Tradeoff**: Rich collaboration vs. implementation complexity
**Decision Framework**:
- Start with essential real-time features
- Add advanced collaboration incrementally
- Prioritize user experience and performance

### **Open Questions**:

#### 1. **User Experience Design**
**Question**: What admin dashboard UX patterns work best for XR content management?
**Consideration**: Intuitive interface, accessibility, mobile support

#### 2. **Integration Complexity**
**Question**: How complex is integrating Supabase with PlayCanvas and existing components?
**Consideration**: API design, authentication flows, real-time synchronization

#### 3. **Business Requirements**
**Question**: What are the specific KPIs and success metrics?
**Consideration**: User acquisition, content engagement, feature adoption

---

## 🎯 **CONCLUSION**

**Phase 3 XR Module Development** with Supabase-optimized architecture will deliver a comprehensive, production-ready XR content management system that leverages:

### **✅ Core Capabilities**:
1. **Unified Backend** - Supabase for auth, storage, and database
2. **Advanced 3D Rendering** - PlayCanvas for immersive experiences
3. **Real-time Collaboration** - Supabase subscriptions and presence
4. **Content Management** - Complete lifecycle management with admin tools
5. **Production Ready** - Scalable, secure, and maintainable architecture

### **✅ Technical Excellence**:
- **Managed Infrastructure** - Supabase for database and storage
- **Real-time Capabilities** - Built-in WebSocket and subscription support
- **Type Safety** - Full TypeScript compliance across all layers
- **Security Hardening** - Comprehensive authentication and authorization
- **Performance Optimized** - Efficient queries and caching strategies
- **Future Ready** - Scalable architecture for advanced features

### **✅ Business Value**:
- **Content Management** - Efficient XR content lifecycle management
- **Collaboration Features** - Enhanced teamwork and real-time editing
- **User Experience** - Intuitive admin dashboard for content management
- **Scalable Architecture** - Growing with business requirements
- **Data-Driven Decisions** - Analytics and insights from Supabase data

**The Supabase-optimized XR module will provide a powerful platform for creating, managing, and sharing immersive virtual reality and augmented reality content, with a strong focus on developer experience, rapid iteration, and production readiness.**