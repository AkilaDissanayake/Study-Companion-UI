/**
 * @file Landing.jsx
 * @description Public marketing entry point — nav (brand, Pricing link,
 * Log in / Start Free Trial), hero section, and the pricing tiers. Signing
 * up doubles as starting the free trial; there's no separate opt-in step.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import Button from '../components/ui/Button';
import PricingSection from '../components/PricingSection';

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
          <h1 style={{ color: '#ffffff', fontSize: 'var(--font-size-display)' }}>
            Study smarter, not longer.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-h3)', marginTop: 'var(--space-4)' }}>
            AI tutoring, smart quizzes, and all your materials in one calm, focused workspace.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-7)' }}>
            <Link to="/signup">
              <Button size="md" style={{ padding: '10px 24px' }}>Start Free Trial</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="md" style={{ padding: '10px 24px' }}>Log in</Button>
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
