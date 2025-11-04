# Design System Documentation

## Overview

This document describes the design system tokens and components used throughout the German Vocabulary Dashboard. The design system is built on **Tailwind CSS** with custom theme extensions, providing a minimalist professional aesthetic with full light/dark mode support.

## Table of Contents

- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing](#spacing)
- [Shadows](#shadows)
- [Border Radius](#border-radius)
- [Components](#components)
- [Usage Guidelines](#usage-guidelines)
- [Responsive Design](#responsive-design)
- [Dark Mode](#dark-mode)

## Color Palette

### Primary Slate Scale

The primary color palette uses a slate scale with 11 shades for neutral colors:

- **slate-50**: `hsl(210, 40%, 98%)` - Lightest background
- **slate-100**: `hsl(210, 40%, 96%)` - Light background
- **slate-200**: `hsl(210, 13%, 91%)` - Light borders
- **slate-300**: `hsl(210, 11%, 85%)` - Light accents
- **slate-400**: `hsl(210, 10%, 66%)` - Medium gray
- **slate-500**: `hsl(210, 10%, 52%)` - Medium gray
- **slate-600**: `hsl(210, 12%, 43%)` - Dark gray
- **slate-700**: `hsl(210, 13%, 33%)` - Dark gray
- **slate-800**: `hsl(210, 14%, 20%)` - Dark backgrounds
- **slate-900**: `hsl(210, 15%, 13%)` - Very dark backgrounds
- **slate-950**: `hsl(210, 20%, 3%)` - Darkest background

### Semantic Colors

- **Accent**: `hsl(199, 89%, 48%)` - Primary brand color (blue)
- **Success**: `hsl(142, 71%, 45%)` - Green for success states
- **Warning**: `hsl(38, 92%, 50%)` - Yellow for warning states
- **Error**: `hsl(0, 84%, 60%)` - Red for error states
- **Info**: `hsl(199, 89%, 48%)` - Blue for informational content

### CSS Variables

All colors are available as CSS variables for programmatic access:

```css
:root {
  --color-slate-50: hsl(210, 40%, 98%);
  --color-accent: hsl(199, 89%, 48%);
  --color-success: hsl(142, 71%, 45%);
  /* ... etc */
}
```

## Typography

### Font Stack

The design system uses the **Geist** font family from Next.js fonts for sans-serif and **Geist Mono** for monospace.

```typescript
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
```

### Font Sizes

- **xs**: `0.75rem` (12px) - Captions and small labels
- **sm**: `0.875rem` (14px) - Small body text
- **base**: `1rem` (16px) - Default body text
- **lg**: `1.125rem` (18px) - Large body text
- **xl**: `1.25rem` (20px) - Subheading
- **2xl**: `1.5rem` (24px) - Section heading
- **3xl**: `1.875rem` (30px) - Page heading
- **4xl**: `2.25rem` (36px) - Hero heading

### Font Weights

- **light**: `300`
- **normal**: `400`
- **medium**: `500`
- **semibold**: `600`
- **bold**: `700`

### Heading Styles

```html
<h1>Heading 1 - 4xl font-bold text-slate-900</h1>
<h2>Heading 2 - 3xl font-bold text-slate-900</h2>
<h3>Heading 3 - 2xl font-semibold text-slate-900</h3>
<h4>Heading 4 - xl font-semibold text-slate-900</h4>
<p>Paragraph - base font-normal text-slate-600</p>
```

## Spacing

The design system uses an 8px baseline spacing scale:

- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)
- **3xl**: `4rem` (64px)
- **4xl**: `6rem` (96px)

Use these for padding, margins, gaps, and other spacing needs:

```html
<div class="p-4">Padding: 1rem</div>
<div class="m-6">Margin: 1.5rem</div>
<div class="gap-3">Gap: 0.75rem</div>
```

## Shadows

The design system includes 5 shadow levels for layering and depth:

- **shadow-xs**: Subtle shadow for minimal elevation
- **shadow-sm**: Small shadow for slight elevation
- **shadow-md**: Medium shadow for normal elevation
- **shadow-lg**: Large shadow for significant elevation
- **shadow-xl**: Extra large shadow for maximum elevation

```html
<div class="shadow-xs">Subtle</div>
<div class="shadow-md">Medium elevation</div>
<div class="shadow-xl">Maximum elevation</div>
```

## Border Radius

Consistent border radius scale for rounded corners:

- **rounded-xs**: `0.25rem`
- **rounded-sm**: `0.375rem`
- **rounded-md**: `0.5rem`
- **rounded-lg**: `0.75rem`
- **rounded-xl**: `1rem`

```html
<div class="rounded-md">Slightly rounded</div>
<div class="rounded-lg">Rounded corners</div>
<div class="rounded-full">Circular</div>
```

## Components

### Button

The Button component comes in 4 variants: primary, secondary, outline, and ghost.

**Variants:**
- **primary**: Solid accent color background
- **secondary**: Solid secondary color background
- **outline**: Border with transparent background
- **ghost**: Text-only with hover background

**Sizes:**
- **sm**: Small button for compact layouts
- **md**: Medium button (default)
- **lg**: Large button for prominent actions

```tsx
import Button from '@/components/Button'

<Button>Primary Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="lg">Large Button</Button>
<Button disabled>Disabled Button</Button>
<Button href="/page">Link Button</Button>
```

### Card

Container component for content grouping with optional hover effects.

**Props:**
- **padding**: `sm` | `md` | `lg` (default: `md`)
- **hover**: Enable hover shadow effect (default: `true`)

```tsx
import Card from '@/components/Card'

<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

<Card padding="lg" hover={false}>
  <p>Large padding, no hover effect</p>
</Card>
```

### Tag

Badge component for labels and status indicators.

**Variants:**
- **default**: Gray background
- **success**: Green background
- **warning**: Yellow background
- **error**: Red background
- **info**: Blue background

**Sizes:**
- **sm**: Small tag
- **md**: Medium tag (default)

```tsx
import Tag from '@/components/Tag'

<Tag variant="success">Active</Tag>
<Tag variant="warning">In Progress</Tag>
<Tag variant="error">Failed</Tag>
<Tag size="sm">Small Tag</Tag>
```

### IconBadge

Circular badge component for icons or characters.

**Variants:** Same as Tag (default, success, warning, error, info)

**Sizes:**
- **sm**: `w-6 h-6`
- **md**: `w-8 h-8` (default)
- **lg**: `w-10 h-10`

```tsx
import IconBadge from '@/components/IconBadge'

<IconBadge>✓</IconBadge>
<IconBadge variant="success">✓</IconBadge>
<IconBadge variant="error" size="lg">✕</IconBadge>
```

### Container

Layout component that manages max-width and horizontal padding.

**Sizes:**
- **sm**: `max-w-2xl`
- **md**: `max-w-4xl`
- **lg**: `max-w-6xl` (default)
- **xl**: `max-w-7xl`
- **full**: `max-w-full`

```tsx
import Container from '@/components/Container'

<Container>
  <p>Content with responsive padding and max-width</p>
</Container>

<Container size="sm">
  <p>Narrower container</p>
</Container>
```

### Section

Semantic section component with responsive vertical padding.

**Padding Options:**
- **none**: No padding
- **sm**: `py-6 sm:py-8`
- **md**: `py-12 sm:py-16`
- **lg**: `py-16 sm:py-24` (default)
- **xl**: `py-24 sm:py-32`

```tsx
import Section from '@/components/Section'

<Section>
  <SectionHeading>Section Title</SectionHeading>
  <p>Section content</p>
</Section>

<Section padding="xl">
  <p>Extra large padding</p>
</Section>
```

### SectionHeading

Semantic heading component with optional subtitle.

**Props:**
- **level**: `1` | `2` | `3` | `4` | `5` | `6` (default: `2`)
- **subtitle**: Optional subtitle text

```tsx
import SectionHeading from '@/components/SectionHeading'

<SectionHeading level={1}>Main Title</SectionHeading>
<SectionHeading level={2} subtitle="Optional subtitle">
  Section Heading
</SectionHeading>
```

### SiteHeader

Application header component with navigation and theme toggle.

```tsx
import SiteHeader from '@/components/SiteHeader'

<SiteHeader />
```

Features:
- Sticky positioning
- Brand logo/title
- Theme toggle button (light/dark)
- Navigation links
- Responsive layout

### SiteFooter

Application footer component with multi-column layout.

```tsx
import SiteFooter from '@/components/SiteFooter'

<SiteFooter />
```

Features:
- Multi-column link groups
- Copyright information
- Social media links
- Responsive grid layout

## Usage Guidelines

### Responsive Design

The design system supports 6 breakpoints:

- **xs**: 320px - Mobile devices
- **sm**: 640px - Mobile landscape
- **md**: 768px - Tablets
- **lg**: 1024px - Small desktops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Large desktops

```html
<!-- Stack on mobile, 2 columns on tablet, 3 columns on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Grid items -->
</div>
```

### Dark Mode

Dark mode is controlled via the `data-theme` attribute on the HTML element:

```html
<html data-theme="light">
  <!-- Light mode -->
</html>

<html data-theme="dark">
  <!-- Dark mode -->
</html>
```

Theme preference is stored in `localStorage` for persistence.

Use `dark:` prefixed utilities to style for dark mode:

```html
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
  Content
</div>
```

### Accessibility

All components follow accessibility best practices:

- **Focus States**: All interactive elements have visible focus rings
- **Semantic HTML**: Proper heading hierarchy and link elements
- **ARIA Labels**: Where applicable for screen readers
- **Color Contrast**: All text meets WCAG AA standards
- **Keyboard Navigation**: Full keyboard support for interactive elements

### CSS Variables

Access design tokens programmatically:

```css
.custom-element {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}
```

## Design System Demo

View the complete design system showcase at `/design-system`.

This page demonstrates:
- Typography scales
- Color palette
- All component variants
- Spacing scales
- Shadow levels
- Border radius options
- Responsive grids
- Combined component examples
- Usage guidelines

## Best Practices

1. **Use Semantic Components**: Leverage `SectionHeading`, `Card`, `Button` for consistency
2. **Maintain Spacing**: Use the defined spacing scale consistently
3. **Follow Color Usage**: Use semantic colors (success, warning, error, info) appropriately
4. **Responsive First**: Design mobile-first, then add breakpoints for larger screens
5. **Dark Mode**: Test all new components in both light and dark modes
6. **Accessibility**: Ensure proper focus states, ARIA labels, and semantic HTML

## Contributing

When adding new components or tokens:

1. Update the theme configuration in `tailwind.config.ts`
2. Create component with responsive and dark mode support
3. Add demo examples to the design system page
4. Update this documentation
5. Test across different screen sizes and color modes

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Font Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
