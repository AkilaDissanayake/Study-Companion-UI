/**
 * @file OverviewTab.jsx
 * @description The default landing tab after login. Surfaces the
 * motivational/gamification layer: current study streak, quick stats
 * (derived from existing quiz/chat/file data, no separate tracking), any
 * unlocked badges, and a "continue where you left off" resume CTA — a
 * deliberate, complementary use of the Zeigarnik effect (drives resumption)
 * alongside the quiz progress bar's use of the same effect (reduces
 * mid-quiz anxiety, see QuizzesTab.jsx).
 */
import React, { useEffect, useState } from 'react';
import { Flame, ClipboardList, MessageSquare, FolderOpen, ArrowRight } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import useInView from '../hooks/useInView';

/** Counts up from 0 to `target` on mount — reinforces the "progress" framing
 * behind these numbers (see index.css's --color-success comment). Snaps
 * straight to the final value under prefers-reduced-motion. */
function useCountUp(target, duration = 800) {
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Lazy initializer covers the reduced-motion/falsy-target short-circuit
  // directly, so the effect below only ever calls setState from inside the
  // async rAF callback, never synchronously in the effect body.
  const [value, setValue] = useState(() => (prefersReducedMotion ? target || 0 : 0));

  useEffect(() => {
    if (prefersReducedMotion || !target) {
      return undefined;
    }
    let start;
    let raf;
    const step = (timestamp) => {
      if (start === undefined) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

function StatTile({ icon, label, value, index }) {
  const { ref, isInView } = useInView();
  const displayValue = useCountUp(value);
  return (
    <Card
      ref={ref}
      className={`reveal${isInView ? ' is-visible' : ''}`}
      style={{ textAlign: 'center', '--reveal-delay': `${index * 80}ms` }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary-500)', marginBottom: 'var(--space-2)' }}>
        {icon}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-stat)',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {displayValue}
      </div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)', marginTop: 'var(--space-1)' }}>
        {label}
      </div>
    </Card>
  );
}

export default function OverviewTab({ onResumeChat }) {
  const { userName } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentChat, setRecentChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Called unconditionally (before the isLoading early return below) so the
  // hook order stays stable across renders — see Rules of Hooks.
  const { ref: streakRef, isInView: isStreakInView } = useInView();

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.getStatsSummary(), api.getSidebarChats()])
      .then(([statsData, chatsRes]) => {
        if (cancelled) return;
        setStats(statsData);
        const chats = chatsRes.data || [];
        if (chats.length > 0) setRecentChat(chats[0]);
      })
      .catch(() => {
        // Overview is a nice-to-have landing surface, not a critical path —
        // fail quietly rather than blocking the dashboard with an error toast.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p style={{ color: 'var(--color-text-secondary)' }}>Loading your overview…</p>;
  }

  const hasStreak = (stats?.current_streak ?? 0) > 0;

  return (
    <div style={{ maxWidth: '900px', width: '100%' }}>
      <h2>Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
        Here's where you left off.
      </p>

      <Card
        ref={streakRef}
        className={`reveal${isStreakInView ? ' is-visible' : ''}`}
        style={{
          marginTop: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          borderColor: hasStreak ? 'var(--color-accent-200)' : undefined,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Flame size={28} color="var(--color-accent-600)" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-stat)', fontWeight: 700 }}>
            {stats?.current_streak ?? 0} day{stats?.current_streak === 1 ? '' : 's'}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
            {hasStreak
              ? 'Current study streak — keep it going!'
              : 'Start a streak today by taking a quiz, chatting, or uploading a file.'}
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
        <StatTile index={0} icon={<ClipboardList size={20} />} label="Quizzes taken" value={stats?.quiz_count ?? 0} />
        <StatTile index={1} icon={<MessageSquare size={20} />} label="Chats" value={stats?.chat_count ?? 0} />
        <StatTile index={2} icon={<FolderOpen size={20} />} label="Files uploaded" value={stats?.file_count ?? 0} />
      </div>

      {stats?.badges?.length > 0 && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <h3>Badges</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {stats.badges.map((badge) => (
              <Badge key={badge.id} tone="accent" title={badge.description}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {recentChat && (
        <Card hoverable style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>Continue where you left off</div>
            <div
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-body-sm)',
                marginTop: 'var(--space-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {recentChat.title?.trim() ? recentChat.title : 'New Chat'}
            </div>
          </div>
          <Button iconLeft={<ArrowRight size={16} />} onClick={() => onResumeChat(recentChat.session_id)} style={{ flexShrink: 0 }}>
            Resume
          </Button>
        </Card>
      )}
    </div>
  );
}
