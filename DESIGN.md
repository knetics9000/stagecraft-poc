---
name: Stagecraft Intelligence
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#001c10'
  on-tertiary-container: '#009365'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -1px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 2rem
  gutter: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The design system for high-tier revenue intelligence is defined by **Authority, Precision, and Foresight**. It targets executive-level Revenue Managers who require high-density data visualization without cognitive overload. 

The visual style is **Corporate Modern with Intelligence Layers**. It utilizes a structured, professional foundation (Minimalism/Corporate) and overlays it with **Glassmorphism** and subtle kinetic gradients to signify AI-driven insights. The aesthetic must evoke the feeling of a "Command Center"—stable, premium, and inherently smarter than standard CRM interfaces. High-tier features are distinguished by increased visual weight, deeper shadows, and "active" surfaces that indicate real-time AI processing.

## Colors
The palette is rooted in a **Deep Navy and Slate** foundation to establish trust and professional rigor.

- **Primary (Deep Navy):** Used for main canvases and structural navigation.
- **Secondary (Intelligence Purple):** Reserved exclusively for AI-driven insights, generative suggestions, and automated workflows.
- **Tertiary (Success Green):** Used for positive forecast momentum and realized revenue targets.
- **Revenue Risk (Accent):** A high-visibility coral/orange (#F43F5E) is used sparingly for risk alerts.
- **Intelligence Layers:** Semi-transparent overlays of the Secondary color at 5-10% opacity are used to distinguish AI-augmented modules from static data.

## Typography
**Hanken Grotesk** is the sole typeface, chosen for its sharp terminals and high legibility in dense data environments. 

- **Display & Headlines:** Use tighter letter spacing and heavier weights to project authority.
- **Stats-XL:** Specifically for revenue totals and primary forecast figures.
- **Label-MD:** Used for metadata, confidence scores, and table headers; always uppercase with tracking to ensure distinction from body text.
- **Mobile scaling:** Display-LG scales to 32px; Headline-LG scales to 24px on devices below 768px.

## Layout & Spacing
The layout follows a **12-column fluid grid** for the main dashboard, transitioning to a **fixed sidebar and flexible content area** for intelligence tools.

- **Density:** High-tier views use a "Comfortable-Compact" rhythm. Spacing units are based on a 4px baseline.
- **Breakpoints:** Mobile (under 640px), Tablet (640px-1024px), Desktop (1024px-1440px), and Ultra-wide (1440px+). 
- **Revenue Intelligence Reflow:** On mobile, the multi-pane "Insight Panel" collapses into a bottom-sheet drawer to prioritize the primary data visualization.

## Elevation & Depth
This design system uses **Tonal Layers** combined with **Intelligence Blurs** to signify depth.

- **Level 0 (Floor):** The darkest slate (#020617), used for the background.
- **Level 1 (Cards):** Surface color (#1E293B) with a subtle 1px border (#334155).
- **Level 2 (Intelligence Layers):** Used for AI features. These elements use a backdrop-filter (blur 12px) and a semi-transparent purple tint.
- **Shadows:** Avoid heavy black shadows. Use 20% opacity navy shadows with a large spread (20px-40px) to create an "ambient glow" effect rather than a physical drop shadow.

## Shapes
The shape language is **Soft and Geometric**. 

- **Standard Elements:** 4px (0.25rem) radius for a precise, professional feel.
- **AI Modules & Intelligence Layers:** 8px (0.5rem) radius to differentiate "smart" containers from standard UI.
- **Data Points:** Use circles for confidence scores and pill shapes for status badges.

## Components

### Intelligence Badges & Indicators
- **Confidence Scores:** 
  - *High:* Success Green text with a subtle outer glow.
  - *Med:* Slate Blue text.
  - *Low:* Warning Amber text.
- **Revenue Risk Badges:** Solid Coral background with white bold text; used for immediate attention.
- **Forecast Momentum:** Up/Down chevrons paired with Tertiary Green or Revenue Risk Coral. Momentum indicators should be accompanied by a small "AI-Sparkle" icon if derived from predictive modeling.

### Buttons & Inputs
- **Primary Action:** Solid Slate with 1px Intelligence Purple top-border.
- **AI Action:** Gradient background (Purple to Navy) with high-contrast white text.
- **Input Fields:** Darker than the surface layer, using a 1px focus ring of Intelligence Purple.

### Cards & Modules
- **Revenue Intelligence Card:** Features a vertical 4px Purple border on the left side and a glassmorphic background to indicate the content is AI-generated.
- **List Items:** High-density with 1px border-bottom separators; hover states use a 5% Navy tint increase.