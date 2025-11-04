import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Container from '@/components/Container'
import Section from '@/components/Section'
import SectionHeading from '@/components/SectionHeading'
import Button from '@/components/Button'
import Card from '@/components/Card'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container>
          <Section>
            <SectionHeading level={1} className="mb-6">
              Welcome to German Vocabulary Dashboard
            </SectionHeading>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
              A comprehensive admin dashboard for the German Vocabulary Learning System with real-time analytics and user insights.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/design-system" variant="primary">
                View Design System
              </Button>
              <Button href="#" variant="secondary">
                Documentation
              </Button>
            </div>
          </Section>

          <Section>
            <SectionHeading level={2} className="mb-8">
              Features
            </SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Monitor user activity and learning progress with comprehensive dashboards and charts.
                </p>
              </Card>
              <Card>
                <h3 className="text-xl font-semibold mb-2">User Management</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Track top performers and identify users who need additional support.
                </p>
              </Card>
              <Card>
                <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Analyze word difficulty distribution and exercise completion rates.
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
