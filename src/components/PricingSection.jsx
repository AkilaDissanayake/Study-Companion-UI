/**
 * @file PricingSection.jsx
 * @description Fetches the hand-edited pricing tiers from the backend
 * (GET /pricing, reads pricing.yaml) and renders one card per tier. Every
 * CTA links to /signup — there's no payment flow yet, so every tier just
 * drives account creation for now.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import * as api from '../services/api';

function formatPrice(tier) {
  if (!tier.price) return 'Free';
  const amount = Number(tier.price).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(tier.price) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `$${amount}`;
}

export default function PricingSection() {
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .getPricing()
      .then((data) => {
        if (!cancelled) setTiers(data.tiers || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load pricing.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading pricing…</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', color: 'var(--color-danger)' }}>{error}</p>;
  }

  return (
    <div className="pricing-grid">
      {tiers.map((tier) => (
        <Card key={tier.id} hoverable className={`pricing-card ${tier.highlighted ? 'highlighted' : ''}`}>
          {tier.highlighted && (
            <Badge tone="primary" style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}>
              Most Popular
            </Badge>
          )}

          <h3>{tier.name}</h3>

          <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-display)', fontWeight: 650 }}>
              {formatPrice(tier)}
            </span>
            {!!tier.price && (
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
                / {tier.billing_period}
              </span>
            )}
          </div>
          {!tier.price && (
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
              for {tier.billing_period}
            </span>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-5) 0', flex: 1 }}>
            {(tier.features || []).map((feature) => (
              <li
                key={feature}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}
              >
                <Check size={16} color="var(--color-primary-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)' }}>{feature}</span>
              </li>
            ))}
          </ul>

          <Link to="/signup" style={{ marginTop: 'auto' }}>
            <Button fullWidth variant={tier.highlighted ? 'primary' : 'secondary'}>
              {tier.cta_label || 'Get Started'}
            </Button>
          </Link>
        </Card>
      ))}
    </div>
  );
}
