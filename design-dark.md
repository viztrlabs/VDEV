---
name: Cyan Spark
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#54de99'
  on-secondary: '#003920'
  secondary-container: '#00ac6c'
  on-secondary-container: '#00361f'
  tertiary: '#f4f6ff'
  on-tertiary: '#263143'
  tertiary-container: '#cfdaf2'
  on-tertiary-container: '#545f73'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#74fcb3'
  secondary-fixed-dim: '#54de99'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005231'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
---

# Cyan Spark Design System

This design system establishes the core visual language and functional principles for the Cyan Spark theme.

## Theme Overview

The Cyan Spark theme emphasizes a **dark** interface with vibrant cyan and green accents.

### Color Palette

**Primary Colors:** Cyan-based palette
- **Primary (#00F0FF):** A bright, electric cyan for primary actions and accents
- **Primary Container (#DBFcff):** A softer cyan for container backgrounds
- **On Primary (#00363a):** Deep cyan-green for text on primary elements

**Secondary Colors:** Green-based palette
- **Secondary (#42CF8B):** A fresh, vibrant green for supporting UI elements
- **Secondary Container (#00AC6c):** Deeper green for backgrounds and containers
- **On Secondary (#003920):** Dark green for text on secondary elements

**Tertiary Colors:** Blue-gray palette
- **Tertiary (#1E293B):** Dark blue-gray for tertiary elements and depth
- **Tertiary Container (#CFDAF2):** Lighter blue-gray for container backgrounds
- **On Tertiary (#263143):** Medium blue-gray for text on tertiary elements

**Neutral Colors:** Dark theme foundation
- **Surface (#0A0A0B):** Deepest dark for main backgrounds
- **Surface Container (#131314):** Slightly lighter dark for surfaces
- **On Surface (#E5E2E3):** Light gray for primary text
- **On Surface Variant (#B9CACB):** Medium gray for secondary text

### Typography

We use a curated selection of fonts to ensure readability and visual hierarchy:
- **Headlines:** `Manrope` - Modern, geometric with good legibility at large sizes
- **Body Text:** `Inter` - Highly legible for continuous reading
- **Labels:** `Inter` - Consistent with body for clear information hierarchy

### Shape and Form

Our UI features **maximum, pill-shaped** rounded corners throughout, creating a soft, approachable feel that contrasts well with the vibrant color palette.

### Spacing

The design uses a **normal** spacing convention based on an 8px grid:
- Base: 8px
- Compact: 4px
- Standard: 8px-24px
- Spacious: 32px+

## Component Examples (for test purposes)

### Button Styles
```css
/* Primary Button */
background: #00F0FF;
color: #00363a;
border-radius: 1rem;

/* Secondary Button */  
background: #42CF8B;
color: #003920;
border-radius: 1rem;
```

### Card/Container Styles
```css
/* Card Background */
background: #131314;
border: 1px solid #3B494B;
border-radius: 1.5rem;

/* Card Text */
color: #E5E2E3;
```