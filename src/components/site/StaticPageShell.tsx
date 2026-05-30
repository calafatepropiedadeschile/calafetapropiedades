import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StaticPageContent from '@/components/site/StaticPageContent';
import type { StaticPageView } from '@/features/site-content/static-page';

interface Props {
  page: StaticPageView;
  children?: React.ReactNode;
}

export default function StaticPageShell({ page, children }: Props) {
  return (
    <>
      <Navbar />
      <main
        style={{
          paddingTop: 'calc(var(--nav-height) + var(--secondary-header-height))',
          backgroundColor: 'var(--color-surface-2)',
          minHeight: '100vh',
          paddingBottom: 'var(--space-4xl)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)',
            color: '#ffffff',
            padding: 'var(--space-4xl) 0',
            textAlign: 'center',
            marginBottom: 'var(--space-4xl)',
          }}
        >
          <div className="container">
            <h1
              className="heading-1 heading-display"
              style={{
                color: '#ffffff',
                fontFamily: 'var(--font-admin)',
                fontWeight: 800,
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                marginBottom: 'var(--space-md)',
              }}
            >
              {page.title}
            </h1>
          </div>
        </div>

        <div className="container" style={{ maxWidth: '820px' }}>
          <StaticPageContent content={page.content} />
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
