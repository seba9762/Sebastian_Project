import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Container from '@/components/Container'
import Section from '@/components/Section'
import SectionHeading from '@/components/SectionHeading'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Tag from '@/components/Tag'
import IconBadge from '@/components/IconBadge'

export const metadata = {
  title: 'Design System - Tokens & Components',
  description: 'Comprehensive showcase of the design system components and tokens',
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container>
          {/* Typography Section */}
          <Section>
            <SectionHeading level={1} className="mb-6">
              Design System Tokens & Components
            </SectionHeading>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
              A comprehensive guide to the design system components and tokens used throughout the German Vocabulary Dashboard.
            </p>
          </Section>

          {/* Typography */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Typography
            </SectionHeading>
            
            <div className="space-y-8">
              <div>
                <h1 className="mb-2">Heading 1 - text-4xl sm:text-5xl</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Main page titles and hero sections
                </p>
              </div>
              
              <div>
                <h2 className="mb-2">Heading 2 - text-3xl sm:text-4xl</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Section headings and major content divisions
                </p>
              </div>
              
              <div>
                <h3 className="mb-2">Heading 3 - text-2xl sm:text-3xl</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Subsection headings
                </p>
              </div>
              
              <div>
                <h4 className="mb-2">Heading 4 - text-xl sm:text-2xl</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Component titles
                </p>
              </div>
              
              <div>
                <p className="text-lg mb-1">Paragraph - text-lg</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Large body text for emphasis and introduction paragraphs
                </p>
              </div>
              
              <div>
                <p className="text-base mb-1">Paragraph - text-base (default)</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Regular body text for content and descriptions
                </p>
              </div>
              
              <div>
                <p className="text-sm mb-1">Small text - text-sm</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Captions and secondary information
                </p>
              </div>
            </div>
          </Section>

          {/* Color Palette */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Color Palette
            </SectionHeading>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {/* Slate */}
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                <div key={shade}>
                  <div
                    className={`w-full h-20 rounded-lg border border-slate-200 dark:border-slate-700 mb-2 bg-slate-${shade}`}
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400">slate-{shade}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Semantic colors */}
              <div>
                <div className="w-full h-20 rounded-lg bg-accent mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400">accent</p>
              </div>
              <div>
                <div className="w-full h-20 rounded-lg bg-green-500 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400">success</p>
              </div>
              <div>
                <div className="w-full h-20 rounded-lg bg-yellow-500 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400">warning</p>
              </div>
              <div>
                <div className="w-full h-20 rounded-lg bg-red-500 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400">error</p>
              </div>
            </div>
          </Section>

          {/* Buttons */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Buttons
            </SectionHeading>
            
            <div className="space-y-8">
              {/* Primary Buttons */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Primary Buttons
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">Small Button</Button>
                  <Button size="md">Medium Button</Button>
                  <Button size="lg">Large Button</Button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Secondary Buttons
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="secondary" size="sm">Small Button</Button>
                  <Button variant="secondary" size="md">Medium Button</Button>
                  <Button variant="secondary" size="lg">Large Button</Button>
                </div>
              </div>

              {/* Outline Buttons */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Outline Buttons
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" size="sm">Small Button</Button>
                  <Button variant="outline" size="md">Medium Button</Button>
                  <Button variant="outline" size="lg">Large Button</Button>
                </div>
              </div>

              {/* Ghost Buttons */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Ghost Buttons
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="ghost" size="sm">Small Button</Button>
                  <Button variant="ghost" size="md">Medium Button</Button>
                  <Button variant="ghost" size="lg">Large Button</Button>
                </div>
              </div>

              {/* Disabled Buttons */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Disabled State
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled Button</Button>
                  <Button variant="secondary" disabled>Disabled Button</Button>
                  <Button variant="outline" disabled>Disabled Button</Button>
                </div>
              </div>
            </div>
          </Section>

          {/* Cards */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Cards
            </SectionHeading>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Standard Card
                </h4>
                <Card>
                  <h5 className="text-lg font-semibold mb-2">Card Title</h5>
                  <p className="text-slate-600 dark:text-slate-400">
                    This is a standard card component with padding and shadow. It provides a clean container for content with responsive padding sizes.
                  </p>
                </Card>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Card Grid
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <h5 className="text-lg font-semibold mb-2">Card {i}</h5>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        A responsive card in a grid layout with proper spacing.
                      </p>
                      <Button variant="ghost" size="sm">Learn More</Button>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Card Padding Sizes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card padding="sm">
                    <p className="font-semibold text-sm">Small Padding</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      Compact padding for dense information
                    </p>
                  </Card>
                  <Card padding="md">
                    <p className="font-semibold">Medium Padding</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Standard padding for most use cases
                    </p>
                  </Card>
                  <Card padding="lg">
                    <p className="font-semibold">Large Padding</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      Spacious padding for featured content
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </Section>

          {/* Tags */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Tags
            </SectionHeading>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Tag Variants
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Tag variant="default">Default</Tag>
                  <Tag variant="success">Success</Tag>
                  <Tag variant="warning">Warning</Tag>
                  <Tag variant="error">Error</Tag>
                  <Tag variant="info">Info</Tag>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Tag Sizes
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Tag size="sm">Small Tag</Tag>
                  <Tag size="md">Medium Tag</Tag>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Tag Examples
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Tag variant="success">Completed</Tag>
                  <Tag variant="warning">In Progress</Tag>
                  <Tag variant="error">Failed</Tag>
                  <Tag variant="info">Active</Tag>
                  <Tag variant="default">Pending</Tag>
                </div>
              </div>
            </div>
          </Section>

          {/* Icon Badges */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Icon Badges
            </SectionHeading>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Badge Sizes
                </h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <IconBadge size="sm">✓</IconBadge>
                  <IconBadge size="md">✓</IconBadge>
                  <IconBadge size="lg">✓</IconBadge>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Badge Variants
                </h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <IconBadge variant="default">●</IconBadge>
                  <IconBadge variant="success">✓</IconBadge>
                  <IconBadge variant="warning">!</IconBadge>
                  <IconBadge variant="error">✕</IconBadge>
                  <IconBadge variant="info">ℹ</IconBadge>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Badge Examples
                </h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <IconBadge variant="success" size="md">✓</IconBadge>
                    <span>Status: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBadge variant="warning" size="md">!</IconBadge>
                    <span>Needs Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBadge variant="error" size="md">✕</IconBadge>
                    <span>Action Required</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Spacing */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Spacing Scale
            </SectionHeading>
            
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Consistent spacing scale ensures visual harmony across the design system.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'xs', value: '0.25rem (4px)' },
                  { name: 'sm', value: '0.5rem (8px)' },
                  { name: 'md', value: '1rem (16px)' },
                  { name: 'lg', value: '1.5rem (24px)' },
                  { name: 'xl', value: '2rem (32px)' },
                  { name: '2xl', value: '3rem (48px)' },
                  { name: '3xl', value: '4rem (64px)' },
                  { name: '4xl', value: '6rem (96px)' },
                ].map(({ name, value }) => (
                  <div key={name} className="flex items-center gap-4">
                    <div className="w-24 font-mono text-sm font-medium">{name}</div>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded h-8" style={{
                      width: value.split('(')[1].replace('px)', ''),
                    }} />
                    <div className="w-24 text-right text-sm text-slate-600 dark:text-slate-400">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Responsive Grid */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Responsive Grid
            </SectionHeading>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  Grid Columns by Breakpoint
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <Card key={i} padding="sm" hover={false}>
                      <p className="text-center text-sm font-medium text-slate-900 dark:text-slate-50">
                        Item {i + 1}
                      </p>
                      <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                        1 col, 2 cols, 3 cols, 4 cols
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
                  2-3 Column Grid
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <h5 className="font-semibold mb-2">Card {i + 1}</h5>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Responsive card in a flexible grid layout
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Shadow Scale */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Shadow Scale
            </SectionHeading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-xs border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-sm mb-1">Shadow XS</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Subtle depth</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-sm mb-1">Shadow SM</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Small elevation</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-sm mb-1">Shadow MD</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Medium elevation</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-sm mb-1">Shadow LG</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Large elevation</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-sm mb-1">Shadow XL</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Maximum elevation</p>
              </div>
            </div>
          </Section>

          {/* Border Radius */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Border Radius Scale
            </SectionHeading>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'xs', class: 'rounded-xs' },
                { name: 'sm', class: 'rounded-sm' },
                { name: 'md', class: 'rounded-md' },
                { name: 'lg', class: 'rounded-lg' },
                { name: 'xl', class: 'rounded-xl' },
                { name: 'full', class: 'rounded-full' },
              ].map(({ name, class: classes }) => (
                <div key={name} className="text-center">
                  <div className={`w-full h-16 bg-accent mb-2 ${classes}`} />
                  <p className="text-xs text-slate-600 dark:text-slate-400">{name}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Combined Example */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Combined Component Example
            </SectionHeading>
            
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-semibold mb-1">Feature Showcase</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    This demonstrates how design system components work together
                  </p>
                </div>
                <IconBadge variant="success" size="lg">✓</IconBadge>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Tag variant="info">Design System</Tag>
                <Tag variant="success">Production Ready</Tag>
                <Tag variant="warning">Beta</Tag>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                The design system provides a comprehensive set of components and tokens that enable consistent, 
                scalable, and maintainable user interfaces across the application. All components support light 
                and dark modes with seamless transitions.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button>Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Tertiary Action</Button>
              </div>
            </Card>
          </Section>

          {/* Documentation */}
          <Section>
            <SectionHeading level={2} className="mb-8">
              Usage Guidelines
            </SectionHeading>
            
            <div className="space-y-6">
              <Card>
                <h4 className="font-semibold mb-2">Color Palette</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  The design system uses a carefully curated color palette with semantic color meanings:
                  Success (green), Warning (yellow), Error (red), and Info (blue). All colors support light and dark modes.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  CSS variables are available for programmatic color access: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">var(--color-accent)</code>
                </p>
              </Card>

              <Card>
                <h4 className="font-semibold mb-2">Responsive Design</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  All components use Tailwind breakpoints: xs (320px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px).
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Use responsive utilities like <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">md:grid-cols-2</code> to adapt layouts across screen sizes.
                </p>
              </Card>

              <Card>
                <h4 className="font-semibold mb-2">Dark Mode Support</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  Dark mode is managed via the <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">data-theme</code> attribute on the html element.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Use <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">dark:</code> prefixed utilities to style for dark mode.
                </p>
              </Card>

              <Card>
                <h4 className="font-semibold mb-2">Accessibility</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  All components include proper focus states, ARIA labels where needed, and semantic HTML structure.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Interactive elements have clear focus indicators using ring utilities for keyboard navigation.
                </p>
              </Card>
            </div>
          </Section>
        </Container>
      </main>
      <SiteFooter />
    </div>
  )
}
