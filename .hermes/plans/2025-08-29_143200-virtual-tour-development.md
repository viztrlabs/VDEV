# Virtual Tour Development - Marzipano Implementation Plan

## Goal
Implement a comprehensive virtual tour experience using Marzipano 3D viewer, integrated with existing VizTR platform architecture. The virtual tour will serve as the first major feature in our XR-first development strategy.

## Current Context / Assumptions

### Existing Architecture
- **Monorepo Structure**: 8 apps + 5 packages with TurboRepo configuration
- **Three.js Removed**: Successfully migrated to PlayCanvas for XR experiences
- **Existing Components**: Shared UI library, design tokens, experience engine foundation
- **Agent System**: 16 specialized AI agents (planned for lower priority)

### Current State
- Marzipano package installed (`pnpm add marzipano@0.10.2`)
- Experience engine structure created with type definitions
- Virtual tour application directory created (`apps/xr-world/`)
- Package configurations established for shared components

### Key Technologies
- **Marzipano**: 360° viewer for virtual tours
- **PlayCanvas**: 3D rendering engine for XR features
- **Next.js**: React framework for the virtual tour application
- **TypeScript**: Full type safety across the platform
- **Tailwind CSS**: Design system with shared tokens

## Proposed Approach

### Architecture Strategy
1. **Core XR Experience**: Marzipano-based virtual tour system
2. **Component Integration**: Leverage shared UI components and design tokens
3. **Service Integration**: Connect virtual tour with existing studio services
4. **Cross-Platform Support**: Desktop VR, AR, and 3D viewing experiences
5. **Performance Optimized**: Efficient loading and rendering for smooth user experience

### Development Philosophy
- **TDD (Test-Driven Development)**: All features implemented with comprehensive tests first
- **Modular Design**: Separate components for reusability and maintainability
- **Shared Infrastructure**: Utilize existing monorepo patterns and shared packages
- **Progressive Enhancement**: Start with core functionality, add features incrementally

## Step-by-Step Plan

### Phase 1: Core Marzipano Setup (Weeks 1-2)

#### Task 1: Marzipano Configuration and Basic Integration
**Objective**: Set up Marzipano viewer foundation and basic tour structure

**Files**:
- Create: `packages/experience-engine/src/marzipano-tour.ts`
- Create: `packages/experience-engine/src/types/marzipano-types.ts`
- Create: `packages/experience-engine/src/interfaces/xr-interfaces.ts`
- Modify: `packages/experience-engine/src/index.ts`

**Implementation**:
1. **Define Marzipano Type Definitions**
```typescript
// packages/experience-engine/src/types/marzipano-types.ts
export interface MarzipinatoTourConfig {
  basePath: string;
  crossOrigin?: string;
  loadingStrategy?: 'preload' | 'lazy' | 'progressive';
  hotspotStyle?: MarzipanoHotspotStyle;
  annotationStyle?: MarzipanoAnnotationStyle;
  scenes: MarzipanoSceneConfig[];
  initialView?: MarzipanoViewConfig;
}
```

2. **Create Marzipano Tour Core Class**
```typescript
// packages/experience-engine/src/marzipano-tour.ts
export class MarzipanoTour {
  private viewer: any;
  private scenes: Map<string, MarzipanoScene>;
  private currentSceneId: string;
  private config: MarzipanoTourConfig;

  constructor(config: MarzipanoTourConfig) {
    this.scenes = new Map();
    this.currentSceneId = config.scenes[0]?.id || '';
    this.config = config;
  }

  public async initialize(): Promise<void> {
    await this.loadScenes();
    await this.createViewer();
    this.setupNavigation();
    this.setupHotspots();
  }

  private async loadScenes(): Promise<void> {
    for (const sceneConfig of this.config.scenes) {
      const scene = await this.createScene(sceneConfig);
      this.scenes.set(sceneConfig.id, scene);
    }
  }

  public createInteractiveHotspot(hotspotConfig: MarzipanoHotspotConfig): MarzipanoHotspot {
    return {
      position: hotspotConfig.position,
      scene: hotspotConfig.sceneId ? { id: hotspotConfig.sceneId } : undefined,
      link: hotspotConfig.sceneId,
      label: hotspotConfig.label,
      icon: hotspotConfig.icon,
      tooltip: hotspotConfig.tooltip,
      activate: () => {
        if (hotspotConfig.sceneId) {
          this.navigateToScene(hotspotConfig.sceneId);
        }
        hotspotConfig.activate?.();
      }
    };
  }
}
```

**Testing**:
```typescript
// packages/experience-engine/tests/marzipano-tour.test.ts
import { MarzipanoTour } from '../src/marzipano-tour';

describe('MarzipanoTour', () => {
  let tour: MarzipanoTour;

  beforeEach(() => {
    const config: MarzipanoTourConfig = {
      basePath: '/tours/test',
      loadingStrategy: 'lazy',
      scenes: [{ id: 'test-scene', path: 'scene', view: {} }]
    };
    tour = new MarzipanoTour(config);
  });

  it('should initialize successfully', async () => {
    await expect(tour.initialize()).resolves.not.toThrow();
    expect(tour.getAvailableScenes()).toContain('test-scene');
  });
});
```

#### Task 2: Virtual Tour Application Setup
**Objective**: Create Next.js application for virtual tour interface

**Files**:
- Create: `apps/xr-world/app/page.tsx`
- Create: `apps/xr-world/app/layout.tsx`
- Create: `apps/xr-world/components/tour-viewport.tsx`
- Create: `apps/xr-world/components/tour-navigation.tsx`
- Create: `apps/xr-world/components/tour-header.tsx`
- Create: `apps/xr-world/components/hotspot-panel.tsx`
- Create: `apps/xr-world/components/tour-loader.tsx`
- Create: `apps/xr-world/app/tour-config.ts`
- Create: `apps/xr-world/package.json`

**Implementation**:
1. **Main Application Page**
```typescript
// apps/xr-world/app/page.tsx
export default function VirtualTourPage() {
  const [currentScene, setCurrentScene] = useState('lobby');
  const [tourService, setTourService] = useState<VirtualTourService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTour = async () => {
      try {
        const service = new VirtualTourService();
        await service.createVirtualTour(VIRTUAL_TOUR_CONFIG);
        setTourService(service);
      } catch (err) {
        setError('Failed to initialize virtual tour.');
        console.error('Virtual tour initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTour();

    return () => {
      if (tourService) {
        tourService.destroy();
      }
    };
  }, []);

  if (isLoading) {
    return <TourLoader message="Loading virtual tour..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <Container>
      <Section title="Virtual Tour Experience" description="Explore our architectural masterpiece">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <TourViewport sceneId={currentScene} onSceneChange={setCurrentScene} />
          </div>
          <div className="lg:col-span-1">
            <TourNavigation currentScene={currentScene} onSceneChange={setCurrentScene} />
            <HotspotPanel currentScene={currentScene} />
          </div>
        </div>
      </Section>
    </Container>
  );
}
```

2. **Tour Viewport Component**
```typescript
// apps/xr-world/components/tour-viewport.tsx
export function TourViewport({ sceneId, onSceneChange }: TourViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);

  useEffect(() => {
    if (!viewportRef.current) return;

    const config = {
      basePath: '/tours/lobby',
      crossOrigin: 'anonymous',
      loadingStrategy: 'lazy' as const,
    };

    const v = new Marzipano.Viewer(viewportRef.current, config);
    setViewer(v);

    // Scene initialization and event handling
    return () => v.destroy();
  }, [sceneId]);

  return (
    <div ref={viewportRef} className="tour-viewport" style={{ width: '100%', height: '100%' }} />
  );
}
```

#### Task 3: Tour Configuration and Service
**Objective**: Create virtual tour configuration and service layer

**Files**:
- Create: `apps/xr-world/lib/tour-config.ts`
- Create: `apps/xr-world/lib/virtual-tour-service.ts`

**Implementation**:
```typescript
// apps/xr-world/lib/virtual-tour-service.ts
export class VirtualTourService {
  private tour: MarzipanoTour | null = null;
  private tourData: MarzipanoTourConfig | null = null;

  public async createVirtualTour(config: MarzipanoTourConfig): Promise<void> {
    try {
      this.tour = new MarzipanoTour(config);
      await this.tour.initialize();
      this.tourData = config;
    } catch (error) {
      console.error('Failed to create virtual tour:', error);
      throw error;
    }
  }

  public navigateToScene(sceneId: string): void {
    if (this.tour) {
      this.tour.navigateToScene(sceneId);
    }
  }

  public getAvailableScenes(): string[] {
    return this.tour ? this.tour.getAvailableScenes() : [];
  }

  public async destroy(): Promise<void> {
    if (this.tour) {
      await this.tour.destroy();
      this.tour = null;
      this.tourData = null;
    }
  }
}
```

### Phase 2: Feature Implementation (Weeks 3-4)

#### Task 4: Interactive Tour Experience
**Objective**: Implement interactive tour features with hotspots and navigation

**Files**:
- Modify: `apps/xr-world/components/tour-navigation.tsx`
- Create: `apps/xr-world/components/hotspot-panel.tsx`
- Modify: `apps/xr-world/components/tour-header.tsx`
- Create: `apps/xr-world/lib/hotspot-service.ts`

**Implementation**:
1. **Enhanced Tour Navigation**
```typescript
// Enhanced TourNavigation component with filtering and search
export function TourNavigation({ currentScene, onSceneChange }: TourNavigationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredScenes = scenes.filter(scene => {
    if (filter !== 'all' && scene.id !== filter) return false;
    if (searchTerm && !scene.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search scenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'lobby' ? 'default' : 'outline'} onClick={() => setFilter('lobby')}>Lobby</Button>
            <Button variant={filter === 'corridor' ? 'default' : 'outline'} onClick={() => setFilter('corridor')}>Corridor</Button>
          </div>
          {filteredScenes.map((scene) => (
            <NavButton key={scene.id} scene={scene} current={currentScene} onChange={onSceneChange} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Task 5: Loading States and Error Handling
**Objective**: Implement comprehensive loading states and error handling

**Files**:
- Modify: `apps/xr-world/components/tour-loader.tsx`
- Modify: `apps/xr-world/components/error-display.tsx`
- Create: `apps/xr-world/lib/tour-loading-service.ts`

### Phase 3: Integration and Testing (Weeks 5-8)

#### Task 6: Integration with Studio Services
**Objective**: Connect virtual tour with existing studio services

**Files**:
- Modify: `apps/xr-world/lib/virtual-tour-service.ts`
- Create: `apps/xr-world/services/tour-service-bridge.ts`
- Create: `apps/xr-world/types/tour-service.types.ts`

**Implementation**:
```typescript
// apps/xr-world/services/tour-service-bridge.ts
import { StudioService } from '../types/studio-service.types';

export class TourServiceBridge {
  private virtualTourService: VirtualTourService;

  constructor() {
    this.virtualTourService = new VirtualTourService();
  }

  public async integrateWithStudioService(service: StudioService): Promise<void> {
    switch (service.type) {
      case 'exterior':
        await this.virtualTourService.createVirtualTour(this.createExteriorTourConfig(service));
        break;
      case 'interior':
        await this.virtualTourService.createVirtualTour(this.createInteriorTourConfig(service));
        break;
      case 'walkthrough':
        await this.virtualTourService.createVirtualTour(this.createWalkthroughTourConfig(service));
        break;
      default:
        throw new Error(`Unsupported service type: ${service.type}`);
    }
  }

  private createExteriorTourConfig(service: StudioService): MarzipanoTourConfig {
    return {
      basePath: service.basePath,
      crossOrigin: 'anonymous',
      loadingStrategy: 'lazy',
      hotspotStyle: this.createHotspotStyle(service.theme),
      annotationStyle: this.createAnnotationStyle(service.theme),
      scenes: this.mapExteriorScenes(service.scenes),
      initialView: { yaw: 0, pitch: 0, fov: 100 }
    };
  }

  // Additional helper methods for other service types
}
```

#### Task 7: Complete Testing Suite
**Objective**: Implement comprehensive tests for all virtual tour functionality

**Files**:
- Create: `apps/xr-world/tests/virtual-tour.test.ts`
- Create: `apps/xr-world/tests/tour-integration.test.ts`
- Create: `apps/xr-world/tests/tour-service.test.ts`

**Implementation**:
```typescript
// apps/xr-world/tests/virtual-tour.test.ts
import { MarzipanoTour } from '../src/marzipano-tour';
import { VirtualTourService } from '../lib/virtual-tour-service';

describe('VirtualTour', () => {
  describe('MarzipanoTour', () => {
    // ... existing tests
  });

  describe('VirtualTourService', () => {
    let service: VirtualTourService;

    beforeEach(() => {
      service sombras = new VirtualTourService();
    });

    it('should create virtual tour successfully', async () => {
      const config: MarzipanoTourConfig = {
        basePath: '/tours/test',
        loadingStrategy: 'lazy',
        scenes: [{ id: 'test-scene', path: 'scene', view: {} }]
      };
      await expect(service.createVirtualTour(config)).resolves.not.toThrow();
    });

    it('should navigate to correct scene', async () => {
      const config: MarzipanoTourConfig = {
        basePath: '/tours/test',
        loadingStrategy: 'lazy',
        scenes: [
          { id: 'scene1', path: 'scene1', view: {} },
          { id: 'scene2', path: 'scene2', view: {} }
        ]
      };
      await service.createVirtualTour(config);
      service.navigateToScene('scene2');
      expect(service.getAvailableScenes()).toContain('scene2');\n    });
  });
});
```

## Files That Will Change

### Modified Existing Files:
- `package.json` (apps/xr-world)
- `tsconfig.json` (xr-world app)
- `turborepo.json` (update workspace members)
- `README.md` (project documentation)

### New Files:
- `apps/xr-world/app/page.tsx` (main application)
- `apps/xr-world/app/layout.tsx` (application layout)
- `apps/xr-world/package.json` (app-specific dependencies)
- `apps/xr-world/components/\*` (all component files)
- `apps/xr-world/lib/\*` (service and utility files)
- `packages/experience-engine/src/marzipano-tour.ts`
- `packages/experience-engine/src/types/marzipano-types.ts`
- `packages/experience-engine/src/interfaces/xr-interfaces.ts`

## Tests / Validation

### Unit Tests:
```bash
pnpm test apps/xr-world
pnpm test packages/experience-engine
```

### Integration Tests:
```bash
pnpm test:integration xr-world
pnpm test:e2e xr-world
```

### Manual Testing:
1. **Local Development**
   ```bash
   pnpm dev --filter xr-world
   ```

2. **Build Verification**
   ```bash
   pnpm build --filter xr-world
   ```

3. **Storybook**
   ```bash
   pnpm stories --filter xr-world
   ```

## Risks, Tradeoffs, and Open Questions

### Risks:
1. **Marzipano Compatibility**: Cross-browser support and version compatibility issues
2. **Performance**: Large 360° image loading and rendering performance
3. **User Experience**: Complex navigation UI vs. simplicity
4. **Mobile Support**: Touch interaction and mobile viewport optimization

### Tradeoffs:
1. **Loading Strategy**: 'preload' vs 'lazy' vs 'progressive' loading strategies
2. **Hotspot Complexity**: Detailed vs. minimal hotspot information display
3. **Mobile vs Desktop**: Responsive design challenges
4. **Feature Scope**: Comprehensive vs. minimal viable product

### Open Questions:
1. How will we handle scene transitions smoothly?
2. What are the requirements for offline functionality?
3. How will we track user navigation patterns for analytics?
4. What accessibility features are needed for all users?

## Next Steps

### Immediate Actions:
1. Set up Marzipano development environment
2. Create basic virtual tour configuration
3. Implement core Marzipano viewer functionality
4. Set up testing infrastructure

### Medium-term Goals:
1. Complete virtual tour features (hotspots, navigation, interactions)
2. Integrate with studio services
3. Deploy to production
4. Monitor performance and gather user feedback

### Long-term Vision:
1. Extend to additional XR features (PlayCanvas integration)
2. Add AI-powered tour recommendations
3. Develop mobile VR experiences
4. Create virtual tour authoring tools

---

**Priority**: This virtual tour implementation is the **FIRST PRIORITY** for the VizTR platform, serving as the foundation for all future XR features and establishing our immersive experience capabilities.**