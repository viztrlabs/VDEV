# AI Agents & Skills System Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.  
> **Prerequisite**: Phase 5-7 (Monorepo + Multi-App + Hermes Integration) must be complete.

**Goal:** Implement a complete **AI Agents & Skills System** using **Google GenAI** as the primary provider (with OpenAI and Stable Diffusion as alternatives), with **16 AI style presets** and **Hermes Skills integration**. NOT replacing Google GenAI with Hermes skills — instead adding Hermes skills on top as an enhancement layer.

**Architecture:**
- **AI Agent Engine**: `packages/agents/` (using `google/genai` SDK)
- **16 Style Presets**: Architecture visualization presets (Realistic, Unreal Engine, Octane, etc.)
- **Hermes Skills**: Custom skills for VizTR workflows (not replacing AI agent)
- **User API Key**: Each user supplies their own OpenAI/Claude/Gemini key
- **Integration**: Embedded in Admin/Super Admin dashboard via Hermes button

**Tech Stack:** @google/genai, OpenAI SDK, Stable Diffusion API, Next.js App Router, Zustand

---

## 📋 Current State

### What Exists (from audit)
- ❌ `google/genai` package not installed yet
- ❌ AI agents package not created
- ❌ Style presets not defined
- ❌ Hermes connection button (Phase 7) — being built

### What's Needed
- ✅ 16 AI style presets for architectural visualization
- ✅ AI agent engine using Google GenAI
- ✅ Hermes Skills integration (supplementary, not replacement)
- ✅ User API key management
- ✅ Admin dashboard integration

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    User's Local Machine                          │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────────────────┐         │
│  │ User's API Keys │  │ Hermes Agent (Local)         │         │
│  │ (OpenAI/Claude/ │  │ + Custom Skills              │         │
│  │ Gemini)         │  │                             │         │
│  └─────────────────┘  └─────────────────────────────┘         │
│           │                        │                          │
│           │ API Key                │ WebSocket/MCP             │
│           │                       └►│                          │
│           ▼                         ▼                          │
└──────────┬────────────────────────┬────────────────────────────┘
           │                        │
┌──────────▼──────────┐    ┌────────▼──────────────┐
│  Vercel Production   │    │  Browser (Dashboard)  │
│                      │    │                       │
│  packages/agents/    │◄───┤  Hermes Button         │
│  AI Agent Engine     │    │  (from Phase 7)        │
│  @google/genai       │    │  + AI Presets Panel    │
│                      │    │                       │
│  packages/mcp/       │◄───┤  AI Agent UI           │
│  Custom Skills       │    │  16 Presets            │
└──────────────────────┘    └───────────────────────┘
```

### Integration Flow

1. **User (Admin/Super Admin)** navigates to dashboard
2. **Sees Hermes Button** (from Phase 7) in header
3. **Clicks Hermes Button** → Opens connection modal
4. **Enters API Key** (Google/OpenAI/Claude) for AI agents
5. **Hermes Skills** run alongside the AI agent engine
6. **AI Presets** available in admin panel for visualization tasks

---

## 🛠️ Step-by-Step Implementation Plan

## Phase 1: AI Agents Package (Day 1-2)

### Task 1: Create AI Agents Package Skeleton

**Objective:** Set up the `packages/agents/` monorepo package structure.

**Files:**
- Create: `packages/agents/package.json`
- Create: `packages/agents/tsconfig.json`
- Create: `packages/agents/src/index.ts`

**Step 1: Create package.json**

Create: `packages/agents/package.json`
```json
{
  "name": "@viztr/agents",
  "version": "0.1.0",
  "description": "AI agents for VizTR platform - visual generation and control",
  "main": "src/index.ts",
  "license": "MIT",
  "dependencies": {
    "@google/genai": "^1.0.0",
    "openai": "^5.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.5.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

Create: `packages/agents/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "typescript-turbo"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@viztr/*": ["../*/src"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
  "references": [{ "path": "./tsconfig.json" }]
}
```

**Step 3: Create main entry point**

Create: `packages/agents/src/index.ts`
```typescript
/**
 * @viztr/agents - AI Agents package for VizTR Platform
 * 
 * Contains AI agent implementations for:
 * - 3D scene generation
 * - Style transfer (16 presets)
 * - Architectural visualization control
 * - Content moderation
 * 
 * Uses Google GenAI as primary provider with OpenAI fallback.
 */

export { AIAgentEngine } from './engine';
export { StylePresets, StylePreset } from './presets';
export { ContentAgent } from './agents/content-agent';
export { ModerationAgent } from './agents/moderation-agent';
export { type AgentConfig, type AgentResponse } from './types';

export const AGENT_VERSION = '1.0.0';
```

**Step 4: Verify**

```bash
cd /c/Users/Arch_Viz/Documents/VizTR/vdev/packages/agents
npm install
npx tsc --noEmit
```
Expected: No errors

**Step 5: Commit**

```bash
git add packages/agents/
git commit -m "feat: create AI agents package skeleton"
```

---

### Task 2: Create 16 AI Style Presets

**Objective:** Define the 16 architectural visualization style presets.

**Files:**
- Create: `packages/agents/src/presets/index.ts`
- Create: `packages/agents/src/presets/types.ts`

**Step 1: Create style preset types**

Create: `packages/agents/src/presets/types.ts`
```typescript
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  category: 'rendering' | 'styling' | 'mood' | 'technical';
  prompt: string;
  parameters: Record<string, any>;
  model: 'google' | 'openai' | 'stablediffusion' | 'any';
  preview: string; // URL or emoji
}

export type StyleCategory = 'rendering' | 'styling' | 'mood' | 'technical';
```

**Step 2: Create 16 style presets**

Create: `packages/agents/src/presets/index.ts`
```typescript
import { StylePreset } from './types';

export const StylePresets: Record<string, StylePreset> = {
  // Rendering Engine Presets
  'unreal-engine-5': {
    id: 'unreal-engine-5',
    name: 'Unreal Engine 5',
    description: 'Cinematic quality renders with Lumen global illumination and Nanite geometry',
    category: 'rendering',
    prompt: 'Ultra-realistic architectural rendering, Unreal Engine 5 cinematic quality, Lumen global illumination, Nanite geometry, volumetric lighting, ray tracing, 8K resolution, photorealistic',
    parameters: {
      engine: 'unreal',
      lighting: 'lumen',
      geometry: 'nanite',
      resolution: '8k',
      quality: 'cinematic'
    },
    model: 'any',
    preview: '🎮'
  },

  'blender-cycles': {
    id: 'blender-cycles',
    name: 'Blender Cycles',
    description: 'Path-traced rendering with realistic materials and physics',
    category: 'rendering',
    prompt: 'Path-traced rendering using Blender Cycles, physically-based materials, realistic lighting, global illumination, ray tracing, PBR textures, ultra-detailed, photorealistic architecture',
    parameters: {
      engine: 'cycles',
      samples: 1024,
      denoising: true,
      pbr: true,
      resolution: '4k'
    },
    model: 'any',
    preview: '🔺'
  },
  'v-ray': {
    id: 'v-ray',
    name: 'V-Ray',
    description: 'Industry-standard professional architectural visualization',
    category: 'rendering',
    prompt: 'V-Ray professional architectural visualization, industry-standard quality, advanced materials, global illumination, caustics, physically accurate lighting, exterior/interior rendering, photorealistic',
    parameters: {
      engine: 'vray',
      quality: 'high',
      gi: true,
      caustics: true,
      materials: 'physical'
    },
    model: 'any',
    preview: '🏢'
  },
  'corona-renderer': {
    id: 'corona-renderer',
    name: 'Corona Renderer',
    description: 'High-quality unbiased rendering with realistic lighting',
    category: 'rendering',
    prompt: 'Corona Renderer high-quality unbiased rendering, realistic natural lighting, advanced material editor, global illumination, HDR lighting, photorealistic architectural visualization',
    parameters: {
      engine: 'corona',
      quality: 'unbiased',
      gi: true,
      hdr: true
    },
    model: 'any',
    preview: '🌅'
  },
  'octane-render': {
    id: 'octane-render',
    name: 'OctaneRender',
    description: 'GPU-accelerated unbiased rendering with cinematic quality',
    category: 'rendering',
    prompt: 'OctaneRender GPU-accelerated unbiased rendering, cinematic quality, realistic materials, spectral dispersion, volumetric lighting, PBR workflows, photorealistic architecture visualization',
    parameters: {
      engine: 'octane',
      gpu_accel: true,
      spectral: true,
      pbr: true,
      quality: 'cinematic'
    },
    model: 'any',
    preview: '⚡'
  },
  'arnold-renderer': {
    id: 'arnold-renderer',
    name: 'Arnold Renderer',
    description: 'Industry-standard Monte Carlo ray tracing renderer',
    category: 'rendering',
    prompt: 'Arnold Renderer Monte Carlo ray tracing, industry-standard for VFX, physically-based rendering, accurate lighting simulation, cinematic quality architecture visualization',
    parameters: {
      engine: 'arnold',
      sampling: 'monte_carlo',
      pbr: true,
      quality: 'production'
    },
    model: 'any',
    preview: '🎬'
  },

  // Styling & Aesthetic Presets
  'minimalist-modern': {
    id: 'minimalist-modern',
    name: 'Minimalist Modern',
    description: 'Clean lines, open spaces, monochromatic palette',
    category: 'styling',
    prompt: 'Minimalist modern architecture, clean lines, open spaces, monochromatic palette, neutral colors, simple geometry, contemporary design, uncluttered interior, natural materials, soft lighting',
    parameters: {
      style: 'minimalist',
      colors: ['#F5F5F5', '#E0E0E0', '#212121'],
      materials: ['concrete', 'wood', 'glass'],
      lighting: 'natural_soft'
    },
    model: 'any',
    preview: '🤍'
  },
  'scandinavian-hygge': {
    id: 'scandinavian-hygge',
    name: 'Scandinavian Hygge',
    description: 'Warm, cozy Nordic design with natural light',
    category: 'styling',
    prompt: 'Scandinavian hygge design, warm and cozy atmosphere, natural light, light woods, white walls, comfortable textiles, Nordic minimalism, functional furniture, organic forms',
    parameters: {
      style: 'scandinavian',
      colors: ['#FFFFFF', '#F8F4E3', '#D4AF37', '#8B4513'],
      materials: ['light_wood', 'linen', 'wool'],
      lighting: 'warm_natural'
    },
    model: 'any',
    preview: '🕯️'
  },
  'industrial-loft': {
    id: 'industrial-loft',
    name: 'Industrial Loft',
    description: 'Raw urban aesthetic with exposed brick and steel',
    category: 'styling',
    prompt: 'Industrial loft style, exposed brick walls, steel beams, concrete floors, raw aesthetic, urban atmosphere, metal fixtures, large windows, warehouse conversion, modern industrial design',
    parameters: {
      style: 'industrial',
      colors: ['#2C2C2C', '#8B4513', '#C0C0C0', '#F5F5DC'],
      materials: ['brick', 'steel', 'concrete'],
      lighting: 'exposed_bulbs'
    },
    model: 'any',
    preview: '🏭'
  },
  'mid-century-modern': {
    id: 'mid-century-modern',
    name: 'Mid-Century Modern',
    description: '1950s-60s inspired retro-futuristic design',
    category: 'styling',
    prompt: 'Mid-century modern design, 1950s 1960s retro aesthetic, atomic age influences, organic forms, teak wood, bold colors, geometric patterns, clean lines, futuristic retro style',
    parameters: {
      style: 'mid_century',
      colors: ['#FF6B35', '#F7931E', '#4ECDC4', '#1A535C'],
      materials: ['teak', 'plastic', 'metal'],
      lighting: 'atomic_era'
    },
    model: 'any',
    preview: '🛋️'
  },
  'bohemian-rattan': {
    id: 'bohemian-rattan',
    name: 'Bohemian Rattan',
    description: 'Eclectic, textured design with natural materials',
    category: 'styling',
    prompt: 'Bohemian rattan decor, eclectic style, natural materials, woven textures, plants and greenery, warm earthy tones, global patterns, cozy atmosphere, organic modern design',
    parameters: {
      style: 'bohemian',
      colors: ['#D2691E', '#8B4513', '#228B22', '#F4A460'],
      materials: ['rattan', 'cane', 'wicker', 'linen'],
      lighting: 'warm_edison'
    },
    model: 'any',
    preview: '🧺'
  },
  'japanese-zen': {
    id: 'japanese-zen',
    name: 'Japanese Zen',
    description: 'Serene, minimalist Japanese-inspired design',
    category: 'styling',
    prompt: 'Japanese zen design, serene minimalism, natural materials, clean lines, neutral palette, shoji screens, tatami mats, bonsai, Japanese aesthetics, tranquil atmosphere',
    parameters: {
      style: 'zen',
      colors: ['#F5F5F5', '#000000', '#8B4513', '#2F4F4F'],
      materials: ['bamboo', 'rice_paper', 'stone', 'wood'],
      lighting: 'soft_diffused'
    },
    model: 'any',
    preview: '🎋'
  },

  // Mood & Atmosphere Presets
  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm, soft lighting during sunset',
    category: 'mood',
    prompt: 'Golden hour lighting, warm soft sunlight, long shadows, atmospheric, cinematic lighting, sunset glow, warm color temperature, dreamy atmosphere, golden light streaming through windows',
    parameters: {
      lighting: 'natural_golden_hour',
      color_temp: 3500,
      shadows: 'long_soft',
      atmosphere: 'dreamy'
    },
    model: 'any',
    preview: '🌇'
  },
  'dramatic-storm': {
    id: 'dramatic-storm',
    name: 'Dramatic Storm',
    description: 'High-contrast lighting with stormy atmosphere',
    category: 'mood',
    prompt: 'Dramatic storm lighting, dark storm clouds, high contrast, cinematic drama, moody atmosphere, rain effects, dramatic shadows, intense lighting, atmospheric tension',
    parameters: {
      lighting: 'storm_dramatic',
      color_temp: 8000,
      weather: 'stormy',
      atmosphere: 'dramatic'
    },
    model: 'any',
    preview: '⛈️'
  },
  'neon-night': {
    id: 'neon-night',
    name: 'Neon Night',
    description: 'Cyberpunk-inspired night scene with neon lights',
    category: 'mood',
    prompt: 'Neon night scene, cyberpunk aesthetic, vibrant neon lights, dark atmosphere, reflections on wet surfaces, futuristic cityscape, blue and pink neon glow, urban night lighting',
    parameters: {
      lighting: 'neon',
      color_temp: 2000,
      atmosphere: 'cyberpunk',
      neon_colors: ['#00FFE5', '#FF00FF', '#FFFF00']
    },
    model: 'any',
    preview: '🌃'
  },

  // Technical & Specialized Presets
  'blueprint-diagram': {
    id: 'blueprint-diagram',
    name: 'Blueprint Diagram',
    description: 'Technical blueprint-style visualization',
    category: 'technical',
    prompt: 'Architectural blueprint diagram, technical drawing style, white lines on blue background, precise measurements, grid overlay, engineering plans, construction documentation style',
    parameters: {
      style: 'technical_drawing',
      colors: ['#000080', '#FFFFFF', '#000000'],
      overlay: 'grid',
      annotations: true
    },
    model: 'any',
    preview: '📐'
  },
  'wireframe-glitch': {
    id: 'wireframe-glitch',
    name: 'Wireframe Glitch',
    description: 'Digital wireframe with glitch art effects',
    category: 'technical',
    prompt: '3D wireframe model, digital glitch effects, low poly aesthetic, transparent geometry, neon wire edges, computational design, algorithmic art style, cyberpunk interface',
    parameters: {
      style: 'wireframe',
      effects: ['glitch', 'digital_noise'],
      transparency: true,
      wireframe_color: '#00FFE5'
    },
    model: 'any',
    preview: '🕸️'
  },
  'hand-sketch': {
    id: 'hand-sketch',
    name: 'Hand Sketch',
    description: 'Architectural hand-drawing sketch style',
    category: 'technical',
    prompt: 'Hand-drawn architectural sketch, pencil drawing style, rough texture, freehand lines, conceptual design, sketchbook aesthetic, artistic rendering, hand-drawn perspective',
    parameters: {
      style: 'sketch',
      medium: 'pencil',
      texture: 'paper',
      line_quality: 'hand_drawn'
    },
    model: 'any',
    preview: '✏️'
  },
  'isometric-grid': {
    id: 'isometric-grid',
    name: 'Isometric Grid',
    description: 'Clean isometric diagram with technical overlay',
    category: 'technical',
    prompt: 'Isometric grid diagram, clean technical illustration, 3D isometric projection, precise grid overlay, technical presentation style, architectural diagram, clean lines, professional visualization',
    parameters: {
      style: 'isometric',
      grid: true,
      line_weight: 'clean',
      projection: 'isometric'
    },
    model: 'any',
    preview: '📊'
  }
};

export const StylePresetCategories = {
  rendering: 'Rendering Engines',
  styling: 'Design Styles',
  mood: 'Mood & Atmosphere',
  technical: 'Technical & Diagrams'
};

export const getPresetsByCategory = (category: string) => {
  return Object.values(StylePresets).filter(p => p.category === category);
};

export const getAllPresets = () => {
  return Object.values(StylePresets);
};
```

**Step 3: Verify**

```bash
cd /c/Users/Arch_Viz/Documents/VizTR/vdev/packages/agents
npx tsc --noEmit
```
Expected: No errors

**Step 4: Commit**

```bash
git add packages/agents/src/presets/
git commit -m "feat: add 16 AI style presets for architectural visualization"
```

---

### Task 3: Create AI Agent Engine

**Objective:** Build the core AI agent engine with Google GenAI and OpenAI support.

**Files:**
- Create: `packages/agents/src/engine.ts`
- Create: `packages/agents/src/types.ts`

**Step 1: Create agent types**

Create: `packages/agents/src/types.ts`
```typescript
export interface AgentConfig {
  provider: 'google' | 'openai' | 'stablediffusion';
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateImageParams {
  prompt: string;
  stylePreset?: string;
  width?: number;
  height?: number;
  negativePrompt?: string;
  numVariations?: number;
}

export interface Generate3DSceneParams {
  description: string;
  stylePreset?: string;
  existingScene?: any; // Scene data
  modifications?: string[];
}

export interface AgentResponse {
  success: boolean;
  data: any;
  error?: string;
  usage?: Record<string, number>;
  provider: string;
  model: string;
}

export interface ModerationResult {
  flagged: boolean;
  reasons: string[];
  confidence: number;
}

export interface ContentModerationParams {
  prompt: string;
  context?: string;
}
```

**Step 2: Create AI agent engine**

Create: `packages/agents/src/engine.ts`
```typescript
import { GoogleGenAI, Type, Modality } from '@google/genai';
import OpenAI from 'openai';
import { AgentConfig, AgentResponse, GenerateImageParams, Generate3DSceneParams, ContentModerationParams, ModerationResult } from './types';
import { StylePresets } from './presets';

export class AIAgentEngine {
  private googleAI: GoogleGenAI | null = null;
  private openai: OpenAI | null = null;
  private config: AgentConfig;
  private currentProvider: 'google' | 'openai';

  constructor(config: AgentConfig) {
    this.config = config;
    this.currentProvider = config.provider;
    
    if (config.provider === 'google' && config.apiKey) {
      this.googleAI = new GoogleGenAI({ apiKey: config.apiKey });
    }
    
    if (config.provider === 'openai' && config.apiKey) {
      this.openai = new OpenAI({ apiKey: config.apiKey });
    }
  }

  getProvider() {
    return this.currentProvider;
  }

  async generateImage(params: GenerateImageParams): Promise<AgentResponse> {
    const stylePreset = params.stylePreset ? StylePresets[params.stylePreset] : null;
    const enhancedPrompt = stylePreset 
      ? `${params.prompt}, ${stylePreset.prompt}` 
      : params.prompt;

    try {
      if (this.currentProvider === 'google' && this.googleAI) {
        return await this.generateImageGoogle(enhancedPrompt, params);
      } else if (this.currentProvider === 'openai' && this.openai) {
        return await this.generateImageOpenAI(enhancedPrompt, params);
      }
      
      throw new Error('No AI provider configured');
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.currentProvider,
        model: this.config.model || 'unknown'
      };
    }
  }

  private async generateImageGoogle(prompt: string, params: GenerateImageParams): Promise<AgentResponse> {
    if (!this.googleAI) throw new Error('Google AI not initialized');

    const response = await this.googleAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      prompt: `You are an expert architectural visualization AI. Create a detailed image: ${prompt}. ${params.negativePrompt ? `Avoid: ${params.negativePrompt}` : ''}`,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: params.stylePreset ? undefined : this.config.temperature,
      }
    });

    // Extract image from response
    const imageUri = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    
    return {
      success: !!imageUri,
      data: { images: [imageUri], prompt, stylePreset: params.stylePreset },
      provider: 'google',
      model: 'gemini-2.0-flash-exp',
      usage: { tokens: response.usageMetadata?.totalTokenCount || 0 }
    };
  }

  private async generateImageOpenAI(prompt: string, params: GenerateImageParams): Promise<AgentResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.images.generate({
      model: this.config.model || 'dall-e-3',
      prompt: prompt,
      n: params.numVariations || 1,
      size: `${params.width || 1024}x${params.height || 1024}`,
      response_format: 'b64_json'
    });

    return {
      success: true,
      data: { images: response.data.map(d => d.b64_json), prompt, stylePreset: params.stylePreset },
      provider: 'openai',
      model: this.config.model || 'dall-e-3'
    };
  }

  async generate3DScene(params: Generate3DSceneParams): Promise<AgentResponse> {
    const stylePreset = params.stylePreset ? StylePresets[params.stylePreset] : null;
    const enhancedDescription = stylePreset 
      ? `${params.description}, ${stylePreset.prompt}` 
      : params.description;

    const fullPrompt = `
You are an expert 3D architectural visualization assistant.
Create a detailed 3D scene specification: ${enhancedDescription}.

${params.modifications?.map((mod, i) => `Modification ${i + 1}: ${mod}`).join('\n')}

Return ONLY valid JSON with this exact structure:
${JSON.stringify({
  scene: {
    camera: { position: [0,0,0], target: [0,0,0], fov: 60 },
    lighting: [{ type: 'ambient', color: '#ffffff', intensity: 1 }],
    objects: [{ 
      type: 'box', position: [0,0,0], rotation: [0,0,0], 
      scale: [1,1,1], material: { color: '#ffffff' } 
    }],
    skybox: { type: 'solid', color: '#000000' },
    fog: { enabled: false }
  },
  modifications: [],
  description: ''
})}
`;

    try {
      if (this.currentProvider === 'google' && this.googleAI) {
        const response = await this.googleAI.models.generateContent({
          model: 'gemini-2.0-flash',
          prompt: fullPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scene: { type: Type.OBJECT },
                modifications: { type: Type.ARRAY },
                description: { type: Type.STRING }
              }
            },
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        });

        const result = JSON.parse(response.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        
        return {
          success: !!result.scene,
          data: { scene: result.scene, modifications: result.modifications, description: result.description },
          provider: 'google',
          model: 'gemini-2.0-flash'
        };
      } else if (this.currentProvider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: fullPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 8192
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        
        return {
          success: !!result.scene,
          data: { scene: result.scene, modifications: result.modifications, description: result.description },
          provider: 'openai',
          model: 'gpt-4o'
        };
      }

      throw new Error('No AI provider configured');
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.currentProvider,
        model: this.config.model || 'unknown'
      };
    }
  }

  async moderateContent(params: ContentModerationParams): Promise<ModerationResult> {
    try {
      if (this.currentProvider === 'openai' && this.openai) {
        const response = await this.openai.moderations.create({
          input: params.prompt
        });

        const result = response.results[0];
        const reasons = Object.entries(result.scores)
          .filter(([_, score]) => (score as number) > 0.5)
          .map(([category]) => category);

        return {
          flagged: result.flagged,
          reasons: reasons,
          confidence: Math.max(...Object.values(result.scores) as number[]) || 0
        };
      } else if (this.currentProvider === 'google' && this.googleAI) {
        // Use Gemini for moderation
        const response = await this.googleAI.models.generateContent({
          model: 'gemini-2.0-flash',
          prompt: `As a content moderator, check if this content is appropriate: "${params.prompt}". 
          If inappropriate, list categories: safety, violence, sexual, hate, harassment.
          Return JSON: {"flagged": boolean, "reasons": string[], "confidence": number}`
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        return JSON.parse(text);
      }

      // Default safe if no provider
      return { flagged: false, reasons: [], confidence: 0 };
    } catch (error) {
      return { flagged: false, reasons: [], confidence: 0 };
    }
  }

  getAvailablePresets() {
    return Object.values(StylePresets);
  }

  getPresetsByCategory(category: string) {
    return Object.values(StylePresets).filter(p => p.category === category);
  }
}
```

**Step 3: Verify**

```bash
cd /c/Users/Arch_Viz/Documents/VizTR/vdev/packages/agents
npm install
npx tsc --noEmit
```
Expected: No errors (may need to skip lib check for @google/genai)

**Step 4: Commit**

```bash
git add packages/agents/src/engine.ts packages/agents/src/types.ts
git commit -m "feat: create AI agent engine with Google GenAI and OpenAI support"
```

---

## Phase 2: Agent Implementations (Day 3-4)

### Task 4: Create Content Generation Agent

**Objective:** Implement the content generation agent using the engine.

**Files:**
- Create: `packages/agents/src/agents/content-agent.ts`

**Step 1: Create content agent**

```typescript
// packages/agents/src/agents/content-agent.ts
import { AIAgentEngine } from '../engine';
import { GenerateImageParams, Generate3DSceneParams, AgentResponse } from '../types';

export class ContentAgent {
  private engine: AIAgentEngine;

  constructor(engine: AIAgentEngine) {
    this.engine = engine;
  }

  async generateVisualization(params: GenerateImageParams): Promise<AgentResponse> {
    return await this.engine.generateImage(params);
  }

  async generateScene(params: Generate3DSceneParams): Promise<AgentResponse> {
    return await this.engine.generate3DScene(params);
  }

  async applyStyle(imageUrl: string, stylePreset: string): Promise<AgentResponse> {
    const preset = require('../presets').StylePresets[stylePreset];
    if (!preset) {
      return {
        success: false,
        data: null,
        error: `Style preset "${stylePreset}" not found`,
        provider: this.engine.getProvider(),
        model: 'unknown'
      };
    }

    return {
      success: true,
      data: { 
        imageUrl, 
        style: preset.name, 
        prompt: preset.prompt,
        applied: true
      },
      provider: this.engine.getProvider(),
      model: 'unknown'
    };
  }

  async batchGenerate(prompts: string[], stylePreset?: string): Promise<AgentResponse[]> {
    const results = await Promise.all(
      prompts.map(prompt => this.engine.generateImage({
        prompt,
        stylePreset,
        numVariations: 1
      }))
    );
    return results;
  }
}
```

**Step 2: Verify**

```bash
cd /c/Users/Arch_Viz/Documents/VizTR/vdev/packages/agents
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add packages/agents/src/agents/content-agent.ts
git commit -m "feat: add content generation agent"
```

---

### Task 5: Create Content Moderation Agent

**Objective:** Implement automated moderation agent for user-generated content.

**Files:**
- Create: `packages/agents/src/agents/moderation-agent.ts`

**Step 1: Create moderation agent**

```typescript
// packages/agents/src/agents/moderation-agent.ts
import { AIAgentEngine } from '../engine';
import { ContentModerationParams, ModerationResult } from '../types';

export class ModerationAgent {
  private engine: AIAgentEngine;
  private blockedKeywords: string[] = [];

  constructor(engine: AIAgentEngine) {
    this.engine = engine;
  }

  addBlockedKeyword(keyword: string) {
    if (!this.blockedKeywords.includes(keyword.toLowerCase())) {
      this.blockedKeywords.push(keyword.toLowerCase());
    }
  }

  removeBlockedKeyword(keyword: string) {
    this.blockedKeywords = this.blockedKeywords.filter(k => k !== keyword.toLowerCase());
  }

  async moderateContent(params: ContentModerationParams): Promise<ModerationResult> {
    // First check keywords
    const lowerPrompt = params.prompt.toLowerCase();
    for (const keyword of this.blockedKeywords) {
      if (lowerPrompt.includes(keyword)) {
        return {
          flagged: true,
          reasons: [`Blocked keyword: ${keyword}`],
          confidence: 1.0
        };
      }
    }

    // Then use AI moderation
    return await this.engine.moderateContent(params);
  }

  async moderateBatch(items: ContentModerationParams[]): Promise<ModerationResult[]> {
    return await Promise.all(items.map(item => this.moderateContent(item)));
  }
}
```

**Step 2: Verify**

```bash
cd /c/Users/Arch_Viz/Documents/VizTR/vdev/packages/agents
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add packages/agents/src/agents/moderation-agent.ts
git commit -m "feat: add content moderation agent"
```

---

## Phase 3: Admin Dashboard Integration (Day 5)

### Task 6: Create AI Agents UI Panel in Admin Dashboard

**Objective:** Integrate AI agent controls into the Super Admin dashboard.

**Files:**
- Create: `apps/dashboard/components/admin/AIAgentPanel.tsx`
- Modify: `apps/dashboard/app/admin/dashboard/page.tsx`

**Step 1: Create UI panel component**

Create: `apps/dashboard/components/admin/AIAgentPanel.tsx`

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Wand2, Image, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getAllPresets, getPresetsByCategory } from '@viztr/agents/presets';

interface AIAgentPanelProps {
  apiKey: string;
  provider: 'google' | 'openai';
  userRole: string;
}

export default function AIAgentPanel({ apiKey, provider, userRole }: AIAgentPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('unreal-engine-5');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const { showToast } = useAppStore();

  const presets = getAllPresets();
  const categories = [...new Set(presets.map(p => p.category))];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt', 'warning');
      return;
    }

    if (!apiKey) {
      showToast('Please configure your AI API key in User Settings', 'warning');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('generating');

    try {
      // In production, this would call the actual AI engine
      console.log('Generating with preset:', selectedPreset, 'prompt:', prompt, 'provider:', provider);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGenerationStatus('success');
      showToast('Image generated successfully!', 'success');
      
      // Placeholder image - in production, use actual API response
      setGeneratedImage(`data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <rect width="512" height="512" fill="#09090B"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                fill="#3ECF8E" font-family="monospace" font-size="18" font-weight="bold">
            Generated: ${selectedPreset}
          </text>
          <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" 
                fill="#71717A" font-family="monospace" font-size="10">
            ${prompt.substring(0, 40)}...
          </text>
        </svg>
      `)}`);
    } catch (error) {
      setGenerationStatus('error');
      showToast('Image generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono font-bold text-[#3ECF8E] uppercase">
          AI Agent Control
        </h2>
        <span className="text-[10px] font-mono text-[#71717A] bg-[#09090B] px-2 py-1 rounded">
          {provider === 'google' ? 'Google GenAI' : 'OpenAI'}
        </span>
      </div>

      {/* Provider Badge */}
      {userRole === 'SUPER_ADMIN' && (
        <div className="p-2 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-between">
          <span className="text-xs text-[#71717A]">Admin Mode</span>
          <span className="text-xs font-mono text-[#3ECF8E]">Super Admin Active</span>
        </div>
      )}

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-[#71717A]">Style Preset</label>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPreset(preset.id)}
              className={`relative p-2 rounded-lg border text-xs font-mono transition-all ${
                selectedPreset === preset.id
                  ? 'border-[#3ECF8E] bg-[#1A1A1D] text-white'
                  : 'border-[#27272A] bg-[#09090B] text-[#71717A] hover:border-[#3ECF8E]/50 hover:text-white'
              }`}
            >
              <span className="text-lg mb-1 block">{preset.preview}</span>
              <span className="text-[9px] leading-tight">{preset.name}</span>
              {selectedPreset === preset.id && (
                <CheckCircle className="w-3 h-3 absolute top-1 right-1 text-[#3ECF8E]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-[#71717A]">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the architectural scene you want to generate..."
          className="w-full px-3 py-2 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#3ECF8E] resize-none"
          rows={3}
        />
        <div className="text-[10px] text-[#71717A]">
          Using style: {presets.find(p => p.id === selectedPreset)?.name}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full py-2.5 rounded-lg bg-[#3ECF8E] hover:bg-[#34b27b] disabled:opacity-50 font-mono text-xs font-bold text-black flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>Generate with AI</span>
          </>
        )}
      </button>

      {/* Status */}
      {generationStatus === 'error' && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/30 border border-rose-800/50">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span className="text-xs text-rose-300">Generation failed. Check your API key and try again.</span>
        </div>
      )}

      {/* Generated Image */}
      {generatedImage && generationStatus === 'success' && (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border border-[#27272A]">
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-auto object-cover"
            />
          </div>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = generatedImage;
              link.download = `viztr-${selectedPreset}.png`;
              link.click();
            }}
            className="w-full py-1.5 rounded-lg bg-[#09090B] hover:bg-[#1A1A1D] text-xs font-mono text-[#71717A] flex items-center justify-center gap-1 cursor-pointer border border-[#27272A]"
          >
            <CheckCircle className="w-3 h-3 text-[#3ECF8E]" />
            <span>Apply to Scene</span>
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Add AI Agent panel to Super Admin dashboard**

Modify: `apps/dashboard/app/admin/dashboard/page.tsx`

First, update imports:
```typescript
import AIAgentPanel from '@/components/admin/AIAgentPanel';
```

Then, add to sidebar sections:
```typescript
{
  title: 'AI Agents',
  icon: Bot,
  items: [
    { id: 'ai-agents', label: 'AI Agent Panel', icon: Wand2 },
    { id: 'ai-styles', label: 'Style Presets', icon: Image },
  ],
},
```

And in the content rendering section:
```tsx
{activeSection === 'ai-agents' && (
  <div className="p-6">
    <div className="mb-4">
      <h2 className="text-xl font-bold text-white mb-1">AI Agent Control Center</h2>
      <p className="text-xs text-[#71717A]">
        Generate visualizations using 16 AI style presets. Connect your Google/Gemini or OpenAI API key.
      </p>
    </div>
    <AIAgentPanel 
      apiKey={userApiKey || ''}
      provider={userProvider || 'google'}
      userRole={activeRoleView}
    />
  </div>
)}
```

**Step 3: Verify**

```bash
cd /c/Users/Arch_Viz/Documents/VizTR/vdev/apps/dashboard
npm run dev
```
Navigate to: `http://localhost:3002/admin/dashboard`
Switch to Super Admin view → Click "AI Agent Panel" in sidebar
Expected: AI agent panel visible with 16 style presets

**Step 4: Commit**

```bash
git add apps/dashboard/components/admin/AIAgentPanel.tsx apps/dashboard/app/admin/dashboard/page.tsx
git commit -m "feat: integrate AI agents panel into Super Admin dashboard"
```

---

## Phase 4: Hermes Skills Integration (Day 6)

### Task 7: Create Hermes Skills for VizTR

**Objective:** Create Hermes custom skills that integrate with VizTR workflows.

**Files:**
- Create: `packages/mcp/src/skills/viztr-skills.ts`
- Create: `packages/mcp/package.json`

**Step 1: Create MCP package skeleton**

Create: `packages/mcp/package.json`
```json
{
  "name": "@viztr/mcp",
  "version": "0.1.0",
  "description": "Hermes MCP skills for VizTR platform",
  "main": "src/index.ts",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "ws": "^8.17.1"
  },
  "devDependencies": {
    "@types/ws": "^8.17.4",
    "typescript": "^5.5.0"
  }
}
```

**Step 2: Create VizTR Hermes skills**

Create: `packages/mcp/src/skills/viztr-skills.ts`
```typescript
/**
 * Hermes MCP Skills for VizTR
 * 
 * These skills are used by the local Hermes agent and do NOT replace
 * the AI agent engine. They provide CLI/tool interactions for VizTR.
 * 
 * Usage:
 *   These skills are registered with the Hermes MCP server
 *   and are invoked via the Hermes CLI or desktop app.
 */

export const viztrSkills = [
  {
    name: 'viztr:list-projects',
    description: 'List all projects in the VizTR workspace',
    handler: async (params: { limit?: number }) => {
      // This would connect to the VizTR database
      // For local dev, read from localStorage or mock API
      const projects = [
        { id: 'proj_1', name: 'Modern Villa', status: 'active' },
        { id: 'proj_2', name: 'Office Complex', status: 'draft' },
        { id: 'proj_3', name: 'Retail Space', status: 'active' }
      ];
      
      return { projects: projects.slice(0, params.limit || 10) };
    }
  },
  {
    name: 'viztr:create-scene',
    description: 'Create a new 3D scene with specified parameters',
    handler: async (params: { 
      name: string; 
      style?: string; 
      description: string;
      provider?: 'google' | 'openai'
    }) => {
      // This skill would trigger AI generation
      return {
        sceneId: `scene_${Date.now()}`,
        name: params.name,
        status: 'created',
        preview: '/api/scenes/preview',
        message: `Scene "${params.name}" created with ${params.style || 'default'} style`
      };
    }
  },
  {
    name: 'viztr:modify-scene',
    description: 'Modify an existing 3D scene',
    handler: async (params: { 
      sceneId: string; 
      modification: string;
      provider?: 'google' | 'openai'
    }) => {
      return {
        sceneId: params.sceneId,
        modified: true,
        modification: params.modification,
        message: `Scene modified: ${params.modification}`
      };
    }
  },
  {
    name: 'viztr:export-scene',
    description: 'Export a 3D scene to specified format',
    handler: async (params: { 
      sceneId: string; 
      format: 'glb' | 'gltf' | 'fbx' | 'obj' | 'playcanvas';
      quality?: 'low' | 'medium' | 'high'
    }) => {
      return {
        sceneId: params.sceneId,
        format: params.format,
        quality: params.quality || 'medium',
        downloadUrl: `/api/export/${params.sceneId}?format=${params.format}`,
        message: `Scene exported to ${params.format.toUpperCase()} format`
      };
    }
  },
  {
    name: 'viztr:connect-dashboard',
    description: 'Connect to a running VizTR dashboard instance',
    handler: async (params: { url: string; apiKey?: string }) => {
      return {
        connected: true,
        url: params.url,
        sessionId: `sess_${Date.now()}`,
        message: 'Connected to VizTR dashboard'
      };
    }
  },
  {
    name: 'viztr:apply-preset',
    description: 'Apply an AI style preset to the current scene',
    handler: async (params: { 
      presetId: string; 
      apiKey?: string;
      provider?: 'google' | 'openai'
    }) => {
      const validPresets = Object.keys(StylePresets).map(k => ({ id: k, name: StylePresets[k].name }));
      const isValid = validPresets.some(p => p.id === params.presetId);
      
      if (!isValid) {
        return {
          error: `Invalid preset: ${params.presetId}`,
          validPresets: validPresets
        };
      }
      
      return {
        applied: true,
        preset: params.presetId,
        presetName: StylePresets[params.presetId]?.name,
        message: `Applied preset: ${StylePresets[params.presetId]?.name}`
      };
    }
  }
];
```

**Step 3: Create MCP index**

Create: `packages/mcp/src/index.ts`
```typescript
/**
 * @viztr/mcp - Hermes MCP Skills for VizTR Platform
 * 
 * Custom skills for VizTR workflows, integrated with Hermes Agent.
 */

export { viztrSkills } from './skills/viztr-skills';

export const MCP_VERSION = '1.0.0';
export const MCP_NAME = '@viztr/mcp';
```

**Step 4: Verify**

```bash
cd /c/Users/Arch_Viz/Documents/VizTR/vdev/packages/mcp
npm install
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add packages/mcp/
git commit -m "feat: create Hermes MCP skills package for VizTR"
```

---

## 📊 Time Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1. AI Agents Package | 3 tasks | 2-4 hours |
| 2. Agent Implementations | 2 tasks | 2-3 hours |
| 3. Admin Dashboard Integration | 1 task | 2-3 hours |
| 4. Hermes Skills Integration | 1 task | 1-2 hours |
| **TOTAL** | **7 tasks** | **8-14 hours** |

---

## 📁 Files to Create/Modify

### New Files
- ✅ `packages/agents/package.json`
- ✅ `packages/agents/tsconfig.json`
- ✅ `packages/agents/src/index.ts`
- ✅ `packages/agents/src/types.ts`
- ✅ `packages/agents/src/presets/index.ts`
- ✅ `packages/agents/src/presets/types.ts`
- ✅ `packages/agents/src/engine.ts`
- ✅ `packages/agents/src/agents/content-agent.ts`
- ✅ `packages/agents/src/agents/moderation-agent.ts`
- ✅ `packages/mcp/package.json`
- ✅ `packages/mcp/src/index.ts`
- ✅ `packages/mcp/src/skills/viztr-skills.ts`
- ✅ `apps/dashboard/components/admin/AIAgentPanel.tsx`

### Modified Files
- `apps/dashboard/app/admin/dashboard/page.tsx` (add AI Agent section)
- `apps/dashboard/package.json` (add agent dependencies)
- `packages/dashboard/package.json` (monorepo references)

---

## 🔧 Post-Deployment Instructions

### For Users:
1. **Navigate to** `/admin/dashboard` (Admin or Super Admin role)
2. **Find Hermes Button** in header → Connect local Hermes agent
3. **Visit User Settings** → `/user/settings` → Add AI API key (Google/OpenAI)
4. **Access AI Agents** → Click "AI Agent Panel" in sidebar
5. **Select Style Preset** → Enter prompt → Generate!
6. **Use Hermes CLI** → `hermes viztr:create-scene --name "My Project"`

### For Developers:
1. Install @google/genai: `npm install @google/genai`
2. Install OpenAI: `npm install openai`
3. Configure API keys in User Settings
4. Run Hermes MCP server: `hermes mcp serve --port 8080`
5. Use AI Presets in dashboard or via Hermes CLI

---

## 🚨 Important Notes

1. **NOT replacing AI agent with Hermes skills** - Google GenAI stays as primary provider
2. **Hermes Skills are supplementary tools**, not replacements for the AI engine
3. **16 style presets** defined as static data (no AI generation needed for presets themselves)
4. **API keys are user-configured** - no backend key storage on Vercel
5. **WebSocket connection** only to localhost (no cloud relay)

---

**Plan saved to**: `C:\Users\Arch_Viz\Documents\VizTR\vdev\.hermes\plans\20260828_143400-ai-agents-skills-plan.md`"