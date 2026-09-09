---
name: Vibrant Sky
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d8e2fd'
  on-surface: '#111b2f'
  on-surface-variant: '#3f484e'
  inverse-surface: '#263045'
  inverse-on-surface: '#edf0ff'
  outline: '#6f787e'
  outline-variant: '#bec8ce'
  surface-tint: '#006686'
  primary: '#006686'
  on-primary: '#ffffff'
  primary-container: '#7dd3fc'
  on-primary-container: '#005b78'
  inverse-primary: '#7bd1fa'
  secondary: '#376479'
  on-secondary: '#ffffff'
  secondary-container: '#bae6ff'
  on-secondary-container: '#3c687e'
  tertiary: '#724e97'
  on-tertiary: '#ffffff'
  tertiary-container: '#ddbaff'
  on-tertiary-container: '#66438b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0e8ff'
  primary-fixed-dim: '#7bd1fa'
  on-primary-fixed: '#001e2b'
  on-primary-fixed-variant: '#004d66'
  secondary-fixed: '#c0e8ff'
  secondary-fixed-dim: '#a0cde5'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#1c4c60'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#dcb8ff'
  on-tertiary-fixed: '#2b024f'
  on-tertiary-fixed-variant: '#59367d'
  background: '#f9f9ff'
  on-background: '#111b2f'
  surface-variant: '#d8e2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  xl: 48px
  gutter: 16px
  margin: 24px
---

# Vibrant Sky Design System

## Brand & Style
Vibrant Sky is a design system built for modern, high-energy digital experiences. It transitions from a professional, grounded aesthetic to a "Vibrant" style that emphasizes clarity, technical precision, and a futuristic feel. The brand evokes feelings of innovation, agility, and openness.

The design style leans into **Minimalism** with a touch of **Glassmorphism**. It utilizes a light mode foundation to allow the high-vibrancy primary colors to stand out, creating a clean, focused, and approachable environment that maintains a distinct, high-tech visual identity.

## Colors
The color palette is anchored by a luminous Sky Blue primary color, optimized for a clean light mode environment. 

- **Primary (#7dd3fc):** A vibrant sky blue used for primary actions, active states, and key branding moments.
- **Secondary (#88b4cc):** A muted, desaturated blue-grey used for secondary UI elements and supporting information.
- **Tertiary (#c8a0f0):** A soft lavender used for highlights, accents, and distinguishing alternative data sets.
- **Neutral (#1a2438):** A deep, cool-toned midnight blue used for structural surfaces and high-contrast text elements, providing a sophisticated depth.

## Typography
The system uses **Inter** across all levels to ensure maximum readability and a clean, geometric aesthetic. Inter's tall x-height and wide range of weights make it ideal for high-density interfaces.

- **Headlines:** Set in bold or semi-bold weights with tight letter spacing for a modern, impactful look.
- **Body:** Standardized at 16px for primary reading and 14px for secondary data, ensuring high legibility against the light background.
- **Labels:** Utilizing medium weights and slight tracking (letter-spacing) to define hierarchy in small-scale UI elements like buttons and chips.

## Layout & Spacing
The system employs a fluid grid architecture based on an 8px square rhythm. This ensures consistent alignment and vertical rhythm across all components.

- **Grid:** A 12-column responsive layout for desktop, transitioning to 4 columns for mobile.
- **Margins & Gutters:** Standardized 24px margins provide breathing room, while 16px gutters maintain tight relationships between content cards.
- **Rhythm:** All component heights and padding should be multiples of 4px or 8px.

## Elevation & Depth
In this light, vibrant environment, depth is communicated through **Tonal Layers** and subtle **Glassmorphism** rather than heavy shadows.

- **Surfaces:** Higher elevation levels are indicated by lighter or carefully contrasted shades of the surface palette.
- **Glass Effects:** Overlays and modals use a semi-transparent white/light tint with a background blur (12px-20px) to create a sense of translucency.
- **Outer Glows:** Primary buttons and active indicators may use a very soft, low-opacity glow using the primary sky blue color to simulate light emission.

## Shapes
The shape language is defined by a **Pill-shaped (3)** roundedness strategy. This high degree of rounding creates a friendly, organic, and highly modern feel that contrasts effectively with the technical precision of the typography and light color palette.

- **Buttons & Inputs:** Fully rounded "pill" shapes (radius of 1rem or greater).
- **Cards:** Large corner radii (2rem or 32px) to maintain the soft, fluid aesthetic.
- **Small Elements:** Chips and tags follow the pill-shape convention.

## Components
- **Buttons:** Primary buttons are solid Sky Blue (#7dd3fc) with dark text. Secondary buttons use an outline style with the Secondary blue-grey. All buttons are pill-shaped.
- **Inputs:** Light neutral backgrounds with a 1px border. On focus, the border transitions to the primary sky blue with a soft outer glow.
- **Cards:** Use clean surface shades with soft contrast against the background. Corners are heavily rounded (32px).
- **Chips/Tags:** Small pill-shaped containers. For status, use the Tertiary lavender or Primary blue with low-opacity fills and high-vibrancy text.
- **Lists:** Separated by subtle 1px neutral borders or simple vertical spacing, avoiding heavy containers where possible to maintain the minimalist feel.
