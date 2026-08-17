/**
 * @file FlashcardsTab.jsx
 * @description Long-term retention: a spaced-repetition (SM-2) review queue
 * fed from two sources into one shared pool — an AI-generated deck parsed
 * from an uploaded file, and automatically whenever a quiz question is
 * answered wrong (see main.py's /quizzes/{quiz_id}/grade). Two views:
 * today's due-card review (default), and a deck management list.
 */
import React, { useState, useEffect } from 'react';
import { Layers, Trash2 } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import { Select } from './ui/Input';
import { useNotify } from '../context/NotificationContext';
import {
  getDueFlashcards,
  getAllFlashcards,
  submitFlashcardReview,
  generateFlashcards,
  deleteFlashcardDeck,
} from '../services/api';

export default function FlashcardsTab({ uploadedFiles }) {
  const notify = useNotify();
  const [view, setView] = useState('review'); // 'review' | 'decks'

  // --- Review queue ---
  const [dueCards, setDueCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingDue, setIsLoadingDue] = useState(true);

  // --- Decks (management view) ---
  const [allCards, setAllCards] = useState([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

  // --- Generate-from-file control ---
  const [selectedFileKey, setSelectedFileKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchDue = async () => {
    setIsLoadingDue(true);
    try {
      const res = await getDueFlashcards();
      setDueCards(res.data || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      notify.error(err.message || 'Could not load your due flashcards.', { retry: fetchDue });
    } finally {
      setIsLoadingDue(false);
    }
  };

  useEffect(() => {
    fetchDue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDecks = async () => {
    setIsLoadingDecks(true);
    try {
      const res = await getAllFlashcards();
      setAllCards(res.data || []);
    } catch (err) {
      notify.error(err.message || 'Could not load your flashcard decks.', { retry: fetchDecks });
    } finally {
      setIsLoadingDecks(false);
    }
  };

  useEffect(() => {
    if (view === 'decks') fetchDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleRate = async (rating) => {
    const card = dueCards[currentIndex];
    if (!card) return;
    try {
      await submitFlashcardReview(card.id, rating);
    } catch (err) {
      notify.error(err.message || 'Failed to save your review.');
    }
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleGenerate = async () => {
    if (!selectedFileKey) return;
    const { filename, subject } = JSON.parse(selectedFileKey);
    setIsGenerating(true);
    try {
      const res = await generateFlashcards(filename, subject);
      notify.success(`Generated ${res.data?.created ?? 0} flashcards from ${filename}.`);
      setSelectedFileKey('');
      fetchDue();
    } catch (err) {
      notify.error(err.message || 'Failed to generate flashcards from this file.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDeck = async (sourceRef) => {
    try {
      await deleteFlashcardDeck(sourceRef);
      notify.success('Deck deleted.');
      fetchDecks();
      fetchDue();
    } catch (err) {
      notify.error(err.message || 'Failed to delete deck.');
    }
  };

  const currentCard = dueCards[currentIndex];

  // Group all cards by source_ref (a filename or quiz id) for the decks view.
  const decks = {};
  allCards.forEach((c) => {
    const key = c.source_ref || 'Uncategorized';
    if (!decks[key]) decks[key] = [];
    decks[key].push(c);
  });

  return (
    <div style={{ maxWidth: '700px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h2>Flashcards</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Review due cards, or generate a new deck from one of your files.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant={view === 'review' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('review')}>
            Review
          </Button>
          <Button variant={view === 'decks' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('decks')}>
            Decks
          </Button>
        </div>
      </div>

      <Card style={{ marginTop: 'var(--space-5)' }}>
        <h3>Generate from a file</h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Select value={selectedFileKey} onChange={(e) => setSelectedFileKey(e.target.value)}>
              <option value="">Select a file…</option>
              {(uploadedFiles || []).map((f) => (
                <option
                  key={`${f.subject || 'root'}/${f.filename}`}
                  value={JSON.stringify({ filename: f.filename, subject: f.subject || 'root' })}
                >
                  {f.subject && f.subject !== 'root' ? f.subject : 'General'} / {f.filename}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={!selectedFileKey || isGenerating} isLoading={isGenerating}>
            Generate
          </Button>
        </div>
      </Card>

      {view === 'review' ? (
        isLoadingDue ? (
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-5)' }}>Loading your due cards…</p>
        ) : !currentCard ? (
          <div style={{ marginTop: 'var(--space-5)' }}>
            <EmptyState
              icon={<Layers size={22} />}
              title="All caught up"
              description="No cards are due for review right now. Generate a deck above, or come back later."
            />
          </div>
        ) : (
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
              Card {currentIndex + 1} of {dueCards.length}
            </p>

            <button
              type="button"
              className="flashcard-scene"
              onClick={() => setIsFlipped((f) => !f)}
              aria-label={
                isFlipped
                  ? 'Showing the answer — click to show the question again'
                  : 'Showing the question — click to reveal the answer'
              }
            >
              <div className={`flashcard-inner${isFlipped ? ' flipped' : ''}`}>
                <div className="flashcard-face front">{currentCard.front}</div>
                <div className="flashcard-face back">{currentCard.back}</div>
              </div>
            </button>

            {!isFlipped ? (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-body-sm)', marginTop: 'var(--space-4)' }}>
                Click the card to reveal the answer
              </p>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="secondary"
                  style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                  onClick={() => handleRate('again')}
                >
                  Again
                </Button>
                <Button
                  variant="secondary"
                  style={{ color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
                  onClick={() => handleRate('hard')}
                >
                  Hard
                </Button>
                <Button
                  variant="secondary"
                  style={{ color: 'var(--color-primary-500)', borderColor: 'var(--color-primary-500)' }}
                  onClick={() => handleRate('good')}
                >
                  Good
                </Button>
                <Button
                  variant="secondary"
                  style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                  onClick={() => handleRate('easy')}
                >
                  Easy
                </Button>
              </div>
            )}
          </div>
        )
      ) : (
        <div style={{ marginTop: 'var(--space-5)' }}>
          {isLoadingDecks ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading your decks…</p>
          ) : Object.keys(decks).length === 0 ? (
            <EmptyState
              icon={<Layers size={22} />}
              title="No flashcards yet"
              description="Generate a deck from a file above, or get a question wrong on a quiz — it'll show up here automatically."
            />
          ) : (
            Object.entries(decks).map(([sourceRef, cards]) => (
              <Card
                key={sourceRef}
                style={{ marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sourceRef}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
                    {cards.length} card{cards.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button
                  variant="danger-secondary"
                  size="sm"
                  iconLeft={<Trash2 size={14} />}
                  onClick={() => handleDeleteDeck(sourceRef)}
                  style={{ flexShrink: 0 }}
                >
                  Delete
                </Button>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
