/**
 * @file Landing.jsx
 * @description Public marketing entry point — nav (brand, Pricing link,
 * Log in / Start Free Trial), hero section, and the pricing tiers. Signing
 * up doubles as starting the free trial; there's no separate opt-in step.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText, FileSearch, ClipboardList, Flame, Moon, ShieldCheck } from 'lucide-react';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PricingSection from '../components/PricingSection';
import useInView from '../hooks/useInView';

// Feature-Rich Showcase pattern: hero -> feature grid -> pricing/CTA.
// Each card's copy ties back to the calm-focus / growth-progress psychology
// already established for the indigo/green token pair (see index.css) —
// this section is presentation only, no new colors introduced.
const FEATURES = [
  { icon: MessageSquareText, title: 'AI tutor chat', description: 'Ask questions in plain language and get explanations grounded in your own material.' },
  { icon: FileSearch, title: 'File-aware answers', description: 'Upload lecture notes and readings — the tutor references them directly in its replies.' },
  { icon: ClipboardList, title: 'Quizzes from any chat', description: 'Turn a conversation into a practice quiz in one click, graded with explanations.' },
  { icon: Flame, title: 'Study streaks', description: 'A gentle, personal streak tracks consistency — no leaderboards, no comparison.' },
  { icon: Moon, title: 'Light & dark mode', description: 'A calm, low-glare interface for late-night sessions, tuned for contrast either way.' },
  { icon: ShieldCheck, title: 'Built for focus', description: 'Minimal visual noise, keyboard-accessible throughout, no distracting ads.' },
];

function FeatureCard({ icon: Icon, title, description, index }) {
  const { ref, isInView } = useInView();
  return (
    <Card
      ref={ref}
      className={`reveal${isInView ? ' is-visible' : ''}`}
      style={{ '--reveal-delay': `${index * 60}ms` }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary-500)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <Icon size={20} />
      </div>
      <h3>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>{description}</p>
    </Card>
  );
}

export default function Landing() {
  const scrollToPricing = (e) => {
    e.preventDefault();
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 650, fontSize: 'var(--font-size-h3)' }}>
          Study Companion
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <a
            href="#pricing"
            onClick={scrollToPricing}
            style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: 'var(--font-size-body-sm)' }}
          >
            Pricing
          </a>
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Start Free Trial</Button>
          </Link>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero-glow" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <h1 style={{ color: 'var(--color-on-primary)', fontSize: 'var(--font-size-display-lg)' }}>
            Study smarter, not longer.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-h3)', marginTop: 'var(--space-4)' }}>
            AI tutoring, smart quizzes, and all your materials in one calm, focused workspace.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-7)' }}>
            <Link to="/signup">
              <Button size="md" style={{ padding: '10px 24px' }}>Start Free Trial</Button>
            </Link>
          </div>
        </div>

        <img
          src={heroImage}
          alt=""
          style={{
            position: 'relative',
            zIndex: 1,
            width: 260,
            marginTop: 'var(--space-8)',
            filter: 'hue-rotate(-40deg) saturate(1.15) brightness(1.05) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.25))',
          }}
        />
      </header>

      <section className="landing-section">
        <div style={{ textAlign: 'center' }}>
          <h2>Everything you need to study, in one place</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            No clutter, no distractions — just the tools that actually help you learn.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} index={index} {...feature} />
          ))}
        </div>
      </section>

      <section id="pricing" className="landing-section">
        <div style={{ textAlign: 'center' }}>
          <h2>Simple, transparent pricing</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Start with a free trial. Upgrade whenever you're ready.
          </p>
        </div>

        <PricingSection />
      </section>
    </div>
  );
}
