---
name: Vibrant Sky
colors:
  surface: '#040e21'
  surface-dim: '#040e21'
  surface-bright: '#1c2c4a'
  surface-container-lowest: '#000000'
  surface-container-low: '#071328'
  surface-container: '#0c1931'
  surface-container-high: '#111f39'
  surface-container-highest: '#162541'
  on-surface: '#dce5ff'
  on-surface-variant: '#a1abc4'
  inverse-surface: '#f9f9ff'
  inverse-on-surface: '#4b556b'
  outline: '#6b758d'
  outline-variant: '#3e485e'
  surface-tint: '#7bd1fa'
  primary: '#7bd1fa'
  on-primary: '#00465d'
  primary-container: '#51aad2'
  on-primary-container: '#002635'
  inverse-primary: '#006787'
  secondary: '#b1ddf7'
  on-secondary: '#215065'
  secondary-container: '#1c4c60'
  on-secondary-container: '#aad7ef'
  tertiary: '#e0bfff'
  on-tertiary: '#56337a'
  tertiary-container: '#d6adff'
  on-tertiary-container: '#4c2970'
  error: '#ff716c'
  on-error: '#490006'
  error-container: '#9f0519'
  on-error-container: '#ffa8a3'
  primary-fixed: '#7bd1fa'
  primary-fixed-dim: '#6cc3eb'
  on-primary-fixed: '#003041'
  on-primary-fixed-variant: '#004f69'
  secondary-fixed: '#b1ddf7'
  secondary-fixed-dim: '#a3cfe8'
  on-secondary-fixed: '#063d51'
  on-secondary-fixed-variant: '#2c596f'
  tertiary-fixed: '#d6adff'
  tertiary-fixed-dim: '#c8a0f0'
  on-tertiary-fixed: '#361059'
  on-tertiary-fixed-variant: '#55327a'
  primary-dim: '#6cc3eb'
  secondary-dim: '#a3cfe8'
  tertiary-dim: '#c8a0f0'
  error-dim: '#d7383b'
  background: '#040e21'
  on-background: '#dce5ff'
  surface-variant: '#162541'
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

The design style leans into **Minimalism** with a touch of **Glassmorphism**. It utilizes a dark mode foundation to allow the high-vibrancy primary colors to "pop," creating a focused environment that reduces eye strain while maintaining a distinct, high-tech visual identity.

## Colors
The color palette is anchored by a luminous Sky Blue primary color, optimized for a dark mode environment. 

- **Primary (#7dd3fc):** A vibrant sky blue used for primary actions, active states, and key branding moments.
- **Secondary (#88b4cc):** A muted, desaturated blue-grey used for secondary UI elements and supporting information.
- **Tertiary (#c8a0f0):** A soft lavender used for highlights, accents, and distinguishing alternative data sets.
- **Neutral (#1a2438):** A deep, cool-toned midnight blue used for backgrounds and structural surfaces, replacing traditional blacks for a more sophisticated depth.

## Typography
The system uses **Inter** across all levels to ensure maximum readability and a clean, geometric aesthetic. Inter's tall x-height and wide range of weights make it ideal for high-density interfaces.

- **Headlines:** Set in bold or semi-bold weights with tight letter spacing for a modern, impactful look.
- **Body:** Standardized at 16px for primary reading and 14px for secondary data, ensuring high legibility against the dark background.
- **Labels:** Utilizing medium weights and slight tracking (letter-spacing) to define hierarchy in small-scale UI elements like buttons and chips.

## Layout & Spacing
The system employs a fluid grid architecture based on an 8px square rhythm. This ensures consistent alignment and vertical rhythm across all components.

- **Grid:** A 12-column responsive layout for desktop, transitioning to 4 columns for mobile.
- **Margins & Gutters:** Standardized 24px margins provide breathing room, while 16px gutters maintain tight relationships between content cards.
- **Rhythm:** All component heights and padding should be multiples of 4px or 8px.

## Elevation & Depth
In this dark, vibrant environment, depth is communicated through **Tonal Layers** and subtle **Glassmorphism** rather than heavy shadows.

- **Surfaces:** Higher elevation levels are indicated by lighter shades of the neutral palette (e.g., a "Surface 1" might be slightly lighter than the "Background").
- **Glass Effects:** Overlays and modals use a 10-20% opacity white tint with a background blur (12px-20px) to create a sense of translucency.
- **Outer Glows:** Primary buttons and active indicators may use a very soft, low-opacity glow using the primary sky blue color to simulate light emission.

## Shapes
The shape language is defined by a **Pill-shaped (3)** roundedness strategy. This high degree of rounding creates a friendly, organic, and highly modern feel that contrasts effectively with the technical precision of the typography and dark color palette.

- **Buttons & Inputs:** Fully rounded "pill" shapes (radius of 1rem or greater).
- **Cards:** Large corner radii (2rem or 32px) to maintain the soft, fluid aesthetic.
- **Small Elements:** Chips and tags follow the pill-shape convention.

## Components
- **Buttons:** Primary buttons are solid Sky Blue (#7dd3fc) with dark text. Secondary buttons use an outline style with the Secondary blue-grey. All buttons are pill-shaped.
- **Inputs:** Darker neutral backgrounds with a 1px border. On focus, the border transitions to the primary sky blue with a soft outer glow.
- **Cards:** Use a slightly lighter neutral shade than the background. Corners are heavily rounded (32px).
- **Chips/Tags:** Small pill-shaped containers. For status, use the Tertiary lavender or Primary blue with low-opacity fills and high-vibrancy text.
- **Lists:** Separated by subtle 1px neutral borders or simple vertical spacing, avoiding heavy containers where possible to maintain the minimalist feel.
