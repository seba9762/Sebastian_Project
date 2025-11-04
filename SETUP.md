# Design System Setup Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to view the application.
Visit `http://localhost:3000/design-system` to view the design system showcase.

## What's Included

### Design System Configuration

#### 1. Tailwind CSS Theme Extensions (`tailwind.config.ts`)
- **Color Palette**: Custom slate scale (11 shades) + semantic colors (success, warning, error, info)
- **Typography**: Geist font family with 8-level size scale
- **Spacing**: 8 levels from xs (4px) to 4xl (96px)
- **Shadows**: 5-level depth scale (xs to xl)
- **Border Radius**: 5 levels for consistent rounded corners
- **Responsive Breakpoints**: 6 breakpoints from 320px to 1536px
- **Dark Mode**: Support via `data-theme` attribute

#### 2. Global Styles (`app/globals.css`)
- CSS custom properties for all design tokens
- Light/dark mode color scheme definitions
- Base typography styles
- Focus state definitions for accessibility
- Smooth transitions for theme changes

#### 3. Layout Structure (`app/layout.tsx`)
- Root layout with font configuration
- Theme persistence via localStorage
- Responsive meta tags

### Foundational Components

All components located in `/components/`:

| Component | Purpose | Features |
|-----------|---------|----------|
| **Container** | Layout wrapper | Responsive max-widths, horizontal padding |
| **Section** | Semantic section | Responsive vertical padding (4 levels) |
| **SectionHeading** | Semantic heading | h1-h6 support, optional subtitle |
| **Button** | Interactive button | 4 variants, 3 sizes, href support |
| **Card** | Content container | Padding options, hover effects |
| **Tag** | Badge/label | 5 semantic variants, 2 sizes |
| **IconBadge** | Circular badge | For icons/indicators, 5 variants, 3 sizes |
| **SiteHeader** | Application header | Navigation, theme toggle, sticky positioning |
| **SiteFooter** | Application footer | Multi-column links, responsive grid |

### Pages

- **Home** (`/app/page.tsx`) - Welcome page with feature showcase
- **Design System** (`/app/(util)/design-system/page.tsx`) - Comprehensive component & token documentation
  - Excluded from main navigation (under `(util)` route group)
  - Accessible via direct URL or home page link
  - Showcases all components, tokens, and usage patterns

## Key Features

### 🎨 Design System
- Minimalist professional aesthetic
- Full responsive support
- Light and dark mode with automatic persistence
- Semantic color system
- Accessible focus states

### 🎯 Responsive Design
- Mobile-first approach
- 6 responsive breakpoints
- Flexible grid components
- Adaptive typography and spacing

### 🌙 Dark Mode Support
- Toggle via theme button in header
- Persisted to localStorage
- Smooth color transitions
- All components fully dark mode aware

### ♿ Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Focus indicators for keyboard navigation
- Proper heading hierarchy
- Color contrast compliance

## Development

### File Structure
```
.
├── app/                       # Next.js App Router
│   ├── (util)/design-system/  # Utility pages (not in navigation)
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/                # Reusable components
├── tailwind.config.ts         # Tailwind theme configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
├── postcss.config.js          # PostCSS configuration
└── DESIGN_SYSTEM.md           # Design system documentation
```

### Adding New Components

1. Create component in `/components/ComponentName.tsx`
2. Use TypeScript with proper prop interfaces
3. Import Tailwind classes using classname patterns
4. Add dark mode variants with `dark:` prefix
5. Export as default function component
6. Update `/app/(util)/design-system/page.tsx` to showcase

### Using Design Tokens

Access design tokens via CSS classes:
```tsx
// Color
<div className="text-accent dark:text-accent">Text</div>

// Spacing
<div className="p-md m-lg">Padded and margined</div>

// Typography
<h1>Heading 1</h1>

// Shadow
<div className="shadow-lg">Elevated</div>
```

Or via CSS variables:
```css
.custom {
  color: var(--color-accent);
  background: var(--color-bg-secondary);
  box-shadow: var(--shadow-md);
}
```

## Styling Patterns

### Responsive Classes
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

### Dark Mode
```tsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
  {/* Dark mode aware */}
</div>
```

### Semantic Colors
```tsx
<Tag variant="success">Success</Tag>
<Tag variant="warning">Warning</Tag>
<Tag variant="error">Error</Tag>
<Tag variant="info">Info</Tag>
```

## Browser Support

- Modern browsers with ES6 module support
- CSS custom properties support required
- CSS Grid and Flexbox support required

## Next Steps

1. **Extend Components**: Add more specialized components as needed
2. **Add Pages**: Create application pages using foundational components
3. **Update Documentation**: Keep design system doc updated with new components
4. **Brand Customization**: Modify colors in `tailwind.config.ts` for brand colors
5. **Typography Fonts**: Replace Geist fonts in `app/layout.tsx` as needed

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Troubleshooting

### Build Fails
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (v18+ recommended)

### Dark Mode Not Working
- Verify `data-theme` attribute is set on `<html>` element
- Check browser localStorage for `theme` key
- Ensure dark mode CSS is properly imported

### Styling Issues
- Verify Tailwind classes are spelled correctly
- Check `tailwind.config.ts` content paths include your files
- Clear cache: `npm run build -- --no-cache`
