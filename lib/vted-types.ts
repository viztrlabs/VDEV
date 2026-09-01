/**
 * Virtual Tour Editor Dashboard (VTED) — extended types
 *
 * These types extend `data/tour-config.ts` and `lib/tourSettings.ts` with the
 * 8-type hotspot model, per-type style/label, scene config, design, marketing,
 * content and project-management fields described in `VTDF.txt`.
 *
 * Rules:
 *  - All fields are OPTIONAL so existing data and public viewer remain compatible.
 *  - No breaking changes to existing types — additive only.
 */

// ============================================================================
// Hotspot System (Phase 1)
// ============================================================================

export type VtedHotspotType =
  | 'point'
  | 'chevron'
  | 'image'
  | 'article'
  | 'video'
  | 'sound'
  | 'link'
  | 'compact'
  | 'product'
  | 'room_link'   // legacy VT alias
  | 'metadata'    // legacy VT alias
  | 'info'        // legacy VT alias
  | 'audio';      // legacy VT alias

export type VtedHotspotShape = 'circle' | 'square' | 'rounded' | 'diamond';
export type VtedHotspotEffect = 'normal' | 'radar' | 'glowing' | 'subtle';

export interface VtedHotspotStyle {
  icon?: string;            // Font Awesome class, e.g. "fas fa-map-marker-alt"
  shape?: VtedHotspotShape;
  backgroundColor?: string; // hex with optional alpha, e.g. "#3ECF8E" or "#3ECF8E40"
  size?: number;            // px, 8-64
  opacity?: number;         // 0-100
  rotate?: number;          // 0-360
  effect?: VtedHotspotEffect;
  visibility?: number;      // current/total count, optional
  distort?: boolean;
}

export interface VtedHotspotLabel {
  fontType?: string;
  size?: number;            // px
  letterSpacing?: number;   // px
  spacing?: number;
  weight?: number;          // 100-900
  paddingX?: number;        // px
  paddingY?: number;        // px
  borderRadius?: number;    // px
  backgroundColor?: string; // hex+alpha
  textColor?: string;       // hex
  textShadow?: string;      // CSS text-shadow
  uppercase?: boolean;
  italic?: boolean;
  showOnHover?: boolean;
}

export interface VtedPointSetup {
  transitioning?: boolean;
  hidePreview?: boolean;
  viewMode?: '360flat' | 'thumbnail' | 'upload';
}

export interface VtedHotspotGlobal {
  locked?: boolean;
  keepPositionOnZoom?: boolean;
  hideTitleOnTop?: boolean;
  hidePreviewBoxOnHover?: boolean;
  hideTitleOnPreviewBox?: boolean;
  popupSize?: 'custom' | 'fixed';
  popupLayout?: string;
}

// Extend Hotspot with optional VTED fields (additive, non-breaking).
// We re-export the type from `data/tour-config.ts` as the canonical one.
export type { Hotspot } from '@/data/tour-config';

// ============================================================================
// Scene Configuration (Phase 2)
// ============================================================================

export interface VtedLightFilter {
  enabled: boolean;
  exposure: number;     // -100 to 100
  lights: number;
  shadows: number;
  range: number;
  masking: number;
  quality: number;
}

export interface VtedSharpenFilter {
  enabled: boolean;
  strength: number;
  range: number;
  quality: number;
}

export interface VtedSunLight {
  enabled: boolean;
  // Drag-and-drop sun position. -1 to 1 normalized to panorama.
  x: number;
  y: number;
  brightnessSun: number; // 0-100
  effect: number;        // 0-100
  brightnessRainbow: number;
  exposureBias: number;
}

export type VtedStagingMode = 'none' | 'staging' | 'day_to_dusk';

export interface VtedNadirFix {
  mode: 'none' | 'quick' | 'custom';
  customImageUrl?: string;
}

export interface VtedViewConstraints {
  top: number;    // -90
  bottom: number; // 90
  left: number;   // -180
  right: number;  // 180
  zoomMin: number; // 60
  zoomMax: number; // 150
  mobileZoomEnabled: boolean;
}

// ============================================================================
// Design & Theming (Phase 4)
// ============================================================================

export type VtedThemePreset =
  | 'default'
  | 'default_2'
  | 'solid'
  | 'wall'
  | 'base'
  | 'folio'
  | 'blank';

export interface VtedDesign {
  preset?: VtedThemePreset;
  primaryColor?: string; // hex+alpha
  textColor?: string;
  primaryFont?: string;
  secondaryFont?: string;
  display?: {
    hideProjectTitle?: boolean;
    hideSceneTitleOnCard?: boolean;
    hideSceneTitle?: boolean;
    autoOpenSceneList?: boolean;
    showSceneTitleInList?: boolean;
  };
}

// ============================================================================
// Form, Polygon, Popup (Phase 5)
// ============================================================================

export interface VtedFormStyle {
  layout: 'dialog' | 'panel';
  position?: 'left' | 'right';
  backgroundColor?: string;
  overlayColor?: string;   // hex+alpha
}

export interface VtedPolygonStyle {
  backgroundColor?: string;
  backgroundHoverColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  borderWidth?: number;
}

export interface VtedPopupStyle {
  backgroundColor?: string;
  textColor?: string;
}

// ============================================================================
// Floorplan (Phase 6)
// ============================================================================

export interface VtedFloorplan {
  id: string;
  name: string;
  imageUrl: string;
  status: 'draft' | 'published';
  draft?: boolean;
  roomsLinked?: string[];
  createdAt: string;
  updatedAt: string;
  aiData?: VtedFloorplanAI;
}

export interface VtedFloorplanDisplay {
  showOnStart: boolean;
  layout: 'box' | 'panel';
  position: 'left' | 'right';
  backgroundColor?: string;
  radar?: {
    enabled: boolean;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    width?: number;
  };
  marker?: {
    backgroundColor?: string;
    borderColor?: string;
  };
  ai?: VtedFloorplanAI;
}

export type VtedRoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'other';

export interface VtedRoom {
  id: string;
  name: string;
  polygon: [number, number][];
  area: number;
  sceneId?: string;
  type?: VtedRoomType;
}

export interface VtedWall {
  id: string;
  line: [[number, number], [number, number]];
  thickness: number;
}

export interface VtedOpening {
  id: string;
  position: [number, number];
  width: number;
  height?: number;
}

export interface VtedFloorplanAI {
  rooms: VtedRoom[];
  walls: VtedWall[];
  doors: VtedOpening[];
  windows: VtedOpening[];
  scale: {
    pixelsPerMeter: number;
    referenceLength?: { pixels: number; meters: number };
  };
  processingConfidence: number;
}

export type VtedMapType = 'road' | 'satellite' | 'terrain';

export interface VtedGoogleMap {
  enabled: boolean;
  showOnStart: boolean;
  mapType: VtedMapType;
  layout: 'box' | 'panel';
  position: 'left' | 'right';
  backgroundColor?: string;
  radar?: VtedFloorplanDisplay['radar'];
  marker?: {
    imageUrl?: string;
    activeImageUrl?: string;
    width?: number;
  };
}

// ============================================================================
// Call To Action & Control Bar (Phase 9)
// ============================================================================

export interface VtedCallToAction {
  layout: 'bubble' | 'list';
  position: 'left' | 'right';
  offsetLeft: number;   // px
  offsetRight: number;  // px
  offsetBottom: number; // px
}

export type VtedControlBarItemId =
  | 'floorplan'
  | 'sound_on'
  | 'sound_off'
  | 'auto_rotate_on'
  | 'auto_rotate_off'
  | 'home'
  | 'auto_change_scene_on'
  | 'auto_change_scene_off'
  | 'scene_sound_on'
  | 'scene_sound_off'
  | 'view_mode'
  | 'multi_staging'
  | 'gyro'
  | 'vr'
  | 'full_screen'
  | 'map'
  | 'info_scene'
  | 'info_tour'
  | 'group_auto_play'
  | 'view_mode_normal'
  | 'view_mode_little_planet'
  | 'view_mode_mirror'
  | 'snapshot'
  | 'multi_language'
  | 'dollhouse';

export interface VtedControlBarItem {
  id: VtedControlBarItemId;
  category: 'icon' | 'text';
  source: string; // Font Awesome class
  hidden: boolean;
}

export interface VtedControlBar {
  items: VtedControlBarItem[];
}

// ============================================================================
// Marketing (Phase 10)
// ============================================================================

export interface VtedFormConfig {
  id: string;
  formId: string;
  closeable: boolean;
  eventType: 'project' | 'scene' | 'hotspot';
  sceneId?: string;
  hotspotId?: string;
  waitTime: number; // seconds
}

export interface VtedSeo {
  faviconUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  googleAnalyticsId?: string; // UA-XXXX or G-XXXX
  seoImageUrl?: string;
  slug?: string;
}

export interface VtedScript {
  id: string;
  html?: string;
  script?: string;
}

export interface VtedSnapshot {
  hideWatermark: boolean;
  watermarkImageUrl?: string;
}

export interface VtedMarketing {
  forms: VtedFormConfig[];
  analytics?: {
    dateRange?: { from: string; to: string };
  };
  seo?: VtedSeo;
  scripts: VtedScript[];
  snapshot?: VtedSnapshot;
}

// ============================================================================
// Content Settings (Phase 11)
// ============================================================================

export interface VtedLogo {
  enabled: boolean;
  imageUrl?: string;
  width: number;          // px, default 180
  redirectUrl?: string;
  position: 'top_left' | 'top_center' | 'top_right';
}

export interface VtedPopupIntro {
  enabled: boolean;
  mode: 'image' | 'video' | 'description_tour';
  imageDesktopUrl?: string;
  imageMobileUrl?: string;
  videoDesktopUrl?: string;
  videoMobileUrl?: string;
  mute?: boolean;
  autoClose?: boolean;
  autoCloseTime?: number; // seconds, default 2
  textClose?: string;
  descriptionTourId?: string;
  descriptionMode?: 'fullscreen' | 'modal';
}

export interface VtedCollaboration {
  enabled: boolean;
  permissions: 'anyone' | 'restricted';
  url?: string;
  // Mocked counters for Phase 11 UI
  commentsTotal?: number;
  commentsResolved?: number;
  commentsUnresolved?: number;
}

export interface VtedSystem {
  archivedImagesReady?: boolean;
  lastArchiveRefreshAt?: string;
}

export interface VtedBackgroundSound {
  enabled: boolean;
  url?: string;
  label?: string;
  volume: number; // 0-100
}

export interface VtedCopyright {
  enabled: boolean;
  link?: string;
  authorName?: string;
  description?: string;
  qrData?: string;
}

export interface VtedContent {
  multiLanguage: boolean;
  descriptionTour?: string;
  initialSceneId?: string;
  category?: string;
  backgroundSound?: VtedBackgroundSound;
  copyright?: VtedCopyright;
  nadir?: { enabled: boolean };
  logo?: VtedLogo;
  popupIntro?: VtedPopupIntro;
  view?: { constraints: VtedViewConstraints };
  collaboration?: VtedCollaboration;
  system?: VtedSystem;
}

// ============================================================================
// Projects (Phase 12)
// ============================================================================

export interface VtedProject {
  id: string;
  name: string;
  tourId: string;            // FK -> tours row
  author?: string;
  sceneCount: number;
  status: 'draft' | 'published';
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Root VTED settings shape (additive to existing TourSettings)
// ============================================================================

export interface VtedSettings {
  design?: VtedDesign;
  formStyle?: VtedFormStyle;
  polygonStyle?: VtedPolygonStyle;
  popupStyle?: VtedPopupStyle;
  floorplanDisplay?: VtedFloorplanDisplay;
  googleMap?: VtedGoogleMap;
  callToAction?: VtedCallToAction;
  controlBar?: VtedControlBar;
  marketing?: VtedMarketing;
  content?: VtedContent;
}

// ============================================================================
// Symbol / icon catalog for hotspot Style tab (Phase 1)
// ============================================================================

export const VTED_HOTSPOT_ICONS: Record<string, string> = {
  point: 'fas fa-map-marker-alt',
  image: 'fas fa-images',
  article: 'fas fa-newspaper',
  video: 'fas fa-video',
  sound: 'fas fa-waveform',
  link: 'fas fa-link',
  product: 'fas fa-tshirt',
  chevron: 'fas fa-chevron-right',
  compact: 'fas fa-compress',
  info: 'fas fa-info-circle',
  door: 'fas fa-door-open',
};

export const VTED_DISTORTION_KEYS: VtedHotspotType[] = [
  'point', 'chevron', 'image', 'article', 'video', 'sound', 'link', 'compact', 'product',
];

export const VTED_CONTROL_BAR_DEFAULTS: VtedControlBarItem[] = [
  { id: 'floorplan', category: 'icon', source: 'far fa-layer-group', hidden: false },
  { id: 'sound_on', category: 'icon', source: 'far fa-volume', hidden: false },
  { id: 'sound_off', category: 'icon', source: 'far fa-volume-mute', hidden: true },
  { id: 'auto_rotate_on', category: 'icon', source: 'far fa-repeat', hidden: false },
  { id: 'auto_rotate_off', category: 'icon', source: 'fal fa-repeat', hidden: true },
  { id: 'home', category: 'icon', source: 'far fa-home', hidden: false },
  { id: 'auto_change_scene_on', category: 'icon', source: 'far fa-pause', hidden: false },
  { id: 'auto_change_scene_off', category: 'icon', source: 'far fa-play', hidden: true },
  { id: 'scene_sound_on', category: 'icon', source: 'far fa-volume-up', hidden: false },
  { id: 'scene_sound_off', category: 'icon', source: 'far fa-volume-off', hidden: true },
  { id: 'view_mode', category: 'icon', source: 'far fa-eye', hidden: false },
  { id: 'multi_staging', category: 'icon', source: 'far fa-images', hidden: false },
  { id: 'gyro', category: 'icon', source: 'far fa-hurricane', hidden: false },
  { id: 'vr', category: 'icon', source: 'far fa-head-vr', hidden: false },
  { id: 'full_screen', category: 'icon', source: 'far fa-expand-arrows-alt', hidden: false },
  { id: 'map', category: 'icon', source: 'far fa-map-marked-alt', hidden: false },
  { id: 'info_scene', category: 'icon', source: 'far fa-info', hidden: false },
  { id: 'info_tour', category: 'icon', source: 'far fa-file-alt', hidden: false },
  { id: 'group_auto_play', category: 'icon', source: 'far fa-play', hidden: true },
  { id: 'view_mode_normal', category: 'icon', source: 'far fa-mountains', hidden: true },
  { id: 'view_mode_little_planet', category: 'icon', source: 'far fa-globe-asia', hidden: true },
  { id: 'view_mode_mirror', category: 'icon', source: 'far fa-globe', hidden: true },
  { id: 'snapshot', category: 'icon', source: 'far fa-camera-viewfinder', hidden: false },
  { id: 'multi_language', category: 'icon', source: 'far fa-language', hidden: false },
  { id: 'dollhouse', category: 'icon', source: 'far fa-kaaba', hidden: true },
];

export const VTED_THEME_PRESETS: Array<{ id: VtedThemePreset; name: string; subtitle: string }> = [
  { id: 'default', name: 'Default', subtitle: 'Standard VizTR branding' },
  { id: 'default_2', name: 'Default 2.0', subtitle: 'Refined spacing & motion' },
  { id: 'solid', name: 'Solid', subtitle: 'Solid color blocks' },
  { id: 'wall', name: 'Wall', subtitle: 'Full-bleed background' },
  { id: 'base', name: 'Base', subtitle: 'Minimal base layout' },
  { id: 'folio', name: 'Folio', subtitle: 'Editorial portfolio' },
  { id: 'blank', name: 'Blank', subtitle: 'No default styling' },
];

export const VTED_HOTSPOT_TYPES: Array<{ id: VtedHotspotType; label: string; description: string }> = [
  { id: 'point', label: 'Point', description: 'Location marker' },
  { id: 'chevron', label: 'Chevron', description: 'Directional indicator' },
  { id: 'image', label: 'Image', description: 'Image popup' },
  { id: 'article', label: 'Article', description: 'Text content / info' },
  { id: 'video', label: 'Video', description: 'Embedded video' },
  { id: 'sound', label: 'Sound', description: 'Audio element' },
  { id: 'link', label: 'Link', description: 'External / portal link' },
  { id: 'compact', label: 'Compact', description: 'Compact info dot' },
  { id: 'product', label: 'Product', description: 'E-commerce product' },
];
