import React from 'react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Container from '@/components/Container'
import Section from '@/components/Section'
import SectionHeading from '@/components/SectionHeading'
import Button from '@/components/Button'
import Card from '@/components/Card'

export default function Home() {
  const toolkits = [
    {
      id: 1,
      title: 'Project Planning Toolkit',
      description: 'Comprehensive templates and frameworks for effective project planning and execution.',
      icon: '📋',
      link: '#',
    },
    {
      id: 2,
      title: 'Team Collaboration Suite',
      description: 'Tools and strategies for improving team communication and collaboration.',
      icon: '👥',
      link: '#',
    },
    {
      id: 3,
      title: 'Risk Management Framework',
      description: 'Identify, assess, and mitigate project risks with proven methodologies.',
      icon: '⚠️',
      link: '#',
    },
  ]

  const projects = [
    {
      id: 1,
      title: 'Workflow Automation Engine',
      description: 'Streamlined automation workflows for recurring business processes.',
      icon: '⚙️',
      link: '#',
    },
    {
      id: 2,
      title: 'Data Pipeline Integration',
      description: 'Connect and orchestrate data flows across multiple platforms seamlessly.',
      icon: '🔄',
      link: '#',
    },
    {
      id: 3,
      title: 'Real-time Notification System',
      description: 'Deliver timely alerts and notifications across your organization.',
      icon: '🔔',
      link: '#',
    },
  ]

  const knowledgeBase = [
    {
      id: 1,
      title: 'Getting Started Guide',
      description: 'Learn the fundamentals and get up to speed quickly.',
      icon: '🚀',
      link: '#',
    },
    {
      id: 2,
      title: 'Best Practices Documentation',
      description: 'Industry-proven practices and patterns for optimal results.',
      icon: '✨',
      link: '#',
    },
    {
      id: 3,
      title: 'API Reference',
      description: 'Complete API documentation for developers and integrations.',
      icon: '📚',
      link: '#',
    },
  ]

  const testimonials = [
    {
      quote: 'This portfolio has been instrumental in organizing our projects efficiently.',
      author: 'Jane Smith',
      role: 'Project Manager',
      company: 'TechCorp',
    },
    {
      quote: 'The toolkits provided have significantly improved our team productivity.',
      author: 'John Doe',
      role: 'Operations Lead',
      company: 'InnovateLabs',
    },
    {
      quote: 'Excellent resources and clear documentation. Highly recommended!',
      author: 'Sarah Johnson',
      role: 'Team Lead',
      company: 'DigitalFirst',
    },
  ]

  const metrics = [
    {
      label: 'Projects Completed',
      value: '150+',
      icon: '✅',
    },
    {
      label: 'Team Members',
      value: '5K+',
      icon: '👥',
    },
    {
      label: 'Resources Available',
      value: '500+',
      icon: '📦',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <Section className="pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-28 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-white dark:to-slate-950">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="flex flex-col justify-center">
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-sm font-semibold">
                    Welcome to your portfolio
                  </span>
                </div>

                <SectionHeading level={1} className="mb-6">
                  Build, Plan & Execute
                </SectionHeading>

                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Discover comprehensive project management toolkits, n8n automation projects, and
                  an extensive knowledge base to elevate your project delivery and team
                  collaboration.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button href="#toolkits" size="lg" variant="primary">
                    Explore Toolkits
                  </Button>
                  <Button href="#contact" size="lg" variant="outline">
                    Get in Touch
                  </Button>
                </div>

                {/* Social Links */}
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Connect with us
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors"
                      aria-label="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.029 3.747 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.338 16.338H13.67V12.16c0-.995-.017-2.553-1.553-2.553-1.554 0-1.791 1.213-1.791 2.462v3.269h-2.668V9.309h2.56v1.310h.036c.357-.674 1.228-1.387 2.528-1.387 2.704 0 3.203 1.778 3.203 4.092v4.354zM5.337 7.433c-.86 0-1.554-.694-1.554-1.554 0-.86.694-1.554 1.554-1.554.86 0 1.554.694 1.554 1.554 0 .86-.694 1.554-1.554 1.554zm1.316 8.905H4.02V9.309h2.633v6.029zM17.914 3H2.086A2.087 2.087 0 000 5.087V14.913a2.086 2.086 0 002.086 2.086h15.828A2.087 2.087 0 0020 14.913V5.087A2.087 2.087 0 0017.914 3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors"
                      aria-label="GitHub"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.529 2.341 1.547 2.914 1.186.092-.923.35-1.546.636-1.903-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.286.098-2.676 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.39.203 2.423.1 2.676.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.195 20 14.44 20 10.017 20 4.484 15.522 0 10 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Hero Image/Illustration */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl p-8 aspect-square flex items-center justify-center">
                    <div className="text-7xl">📊</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Metrics Strip */}
        <Section className="bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-4xl mb-4">{metric.icon}</div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary-500 mb-2">
                    {metric.value}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{metric.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* PM Toolkits Section */}
        <Section id="toolkits">
          <Container>
            <div className="mb-12 sm:mb-16">
              <SectionHeading level={2} className="mb-4">
                PM Toolkits
              </SectionHeading>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Powerful templates and frameworks designed to streamline your project management
                process and enhance team collaboration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {toolkits.map((toolkit) => (
                <Card key={toolkit.id} href={toolkit.link}>
                  <div className="text-4xl mb-4">{toolkit.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    {toolkit.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{toolkit.description}</p>
                  <div className="text-primary-500 font-medium text-sm">Learn more →</div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* n8n Projects Section */}
        <Section id="projects" className="bg-slate-50 dark:bg-slate-900">
          <Container>
            <div className="mb-12 sm:mb-16">
              <SectionHeading level={2} className="mb-4">
                n8n Automation Projects
              </SectionHeading>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Pre-built workflows and automation solutions to accelerate your business
                processes and eliminate manual work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} href={project.link}>
                  <div className="text-4xl mb-4">{project.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>
                  <div className="text-primary-500 font-medium text-sm">Explore project →</div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Knowledge Base Section */}
        <Section id="knowledge">
          <Container>
            <div className="mb-12 sm:mb-16">
              <SectionHeading level={2} className="mb-4">
                Knowledge Base
              </SectionHeading>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Comprehensive documentation and resources to help you get the most out of our
                tools and frameworks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {knowledgeBase.map((item) => (
                <Card key={item.id} href={item.link}>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{item.description}</p>
                  <div className="text-primary-500 font-medium text-sm">Read docs →</div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Testimonials Section */}
        <Section className="bg-slate-50 dark:bg-slate-900">
          <Container>
            <div className="mb-12 sm:mb-16">
              <SectionHeading level={2} className="mb-4">
                What Our Users Say
              </SectionHeading>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Real feedback from professionals who use our portfolio and tools daily.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <div className="mb-4">
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Newsletter/Lead Capture Section */}
        <Section id="contact" className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700">
          <Container>
            <div className="max-w-2xl">
              <SectionHeading
                level={2}
                className="mb-4 text-white"
              >
                Stay Updated
              </SectionHeading>
              <p className="text-lg text-primary-50 mb-8">
                Subscribe to our newsletter to receive the latest updates, tips, and resources
                directly in your inbox.
              </p>

              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-primary-300"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-primary-300 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>

              <p className="text-sm text-primary-100 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>

            {/* Contact Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-12 border-t border-primary-400">
              <div>
                <h4 className="font-semibold text-white mb-2">Email</h4>
                <a
                  href="mailto:contact@portfolio.com"
                  className="text-primary-50 hover:text-white no-underline transition-colors"
                >
                  contact@portfolio.com
                </a>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Phone</h4>
                <a
                  href="tel:+1234567890"
                  className="text-primary-50 hover:text-white no-underline transition-colors"
                >
                  +1 (234) 567-8900
                </a>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Location</h4>
                <p className="text-primary-50">San Francisco, CA</p>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <SiteFooter />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Portfolio Dashboard',
            url: 'https://portfolio.example.com',
            logo: 'https://portfolio.example.com/logo.png',
            description:
              'Professional portfolio showcasing PM Toolkits, n8n Projects, and Knowledge Base resources.',
            sameAs: [
              'https://twitter.com',
              'https://linkedin.com',
              'https://github.com',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+1-234-567-8900',
              contactType: 'Customer Support',
              email: 'contact@portfolio.com',
            },
          }),
        }}
      />
    </div>
  )
}
