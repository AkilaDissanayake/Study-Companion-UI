// components/QuizzesTab.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, ClipboardList, Trash2 } from 'lucide-react';
import { getMyQuizzes, getQuizById, submitQuizAnswers, deleteQuiz, getStatsSummary, ackMilestone } from '../services/api';
import { useNotify } from '../context/NotificationContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';
import IconButton from './ui/IconButton';
import ConfirmDialog from './ConfirmDialog';
import CelebrationModal from './CelebrationModal';
import useInView from '../hooks/useInView';

// A score at or above this fraction reads as "passing" — colored with
// --color-success (growth/mastery) rather than --color-warning, so the
// score badge and the in-progress-quiz badge share the same success
// threshold instead of only ever turning green on a perfect score.
const PASSING_SCORE_RATIO = 0.6;

// Extracted as a pure, exported function purely so the passing-score
// boundary can be unit-tested directly (see QuizzesTab.test.js) without
// rendering the whole component.
export function getScoreTone(score, total) {
  if (!total) return 'warning';
  return score / total >= PASSING_SCORE_RATIO ? 'success' : 'warning';
}

function QuizListItem({ quiz, index, onSelect, onDelete }) {
  const { ref, isInView } = useInView();
  return (
    <Card
      ref={ref}
      className={`reveal${isInView ? ' is-visible' : ''}`}
      hoverable
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '--reveal-delay': `${index * 50}ms` }}
    >
      {/* A real <button>, sibling to the delete IconButton (not nested inside it) */}
      <button
        type="button"
        onClick={onSelect}
        style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', flex: 1, minWidth: 0, textAlign: 'left' }}
      >
        <h3 style={{ color: 'var(--color-primary-500)' }}>{quiz.title}</h3>
        <small style={{ color: 'var(--color-text-tertiary)' }}>
          Created: {new Date(quiz.created_at).toLocaleDateString()}
        </small>
      </button>
      <IconButton
        variant="ghost"
        aria-label="Delete quiz"
        title="Delete quiz"
        icon={<Trash2 size={16} color="var(--color-danger)" />}
        onClick={onDelete}
      />
    </Card>
  );
}

export default function QuizzesTab({ activeQuizId, setActiveQuizId }) {
  const notify = useNotify();
  const [quizList, setQuizList] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizNotFound, setQuizNotFound] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResults, setGradingResults] = useState(null);

  // Delete confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Newly-unlocked streak/badge milestones, shown one at a time after a
  // successful submission (see handleSubmit).
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const activeCelebration = celebrationQueue[0] || null;

  useEffect(() => {
    fetchQuizList();
  }, []);

  useEffect(() => {
    if (activeQuizId) {
      loadQuiz(activeQuizId);
    } else {
      setCurrentQuiz(null);
      setGradingResults(null);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setQuizNotFound(false);
    }
  }, [activeQuizId]);

  const fetchQuizList = async () => {
    try {
      const res = await getMyQuizzes();
      if (res.status === 'success') setQuizList(res.data);
    } catch (err) {
      notify.error(err.message || 'Could not load your quizzes.', { retry: fetchQuizList });
    }
  };

  const loadQuiz = async (quizId) => {
    setQuizNotFound(false);
    try {
      const res = await getQuizById(quizId);
      if (res.status === 'success') {
        setCurrentQuiz(res.data);
        setSelectedAnswers({});
        setGradingResults(null);
        setCurrentQuestionIndex(0);
        setActiveQuizId(quizId);
      }
    } catch (err) {
      if (err.status === 404) {
        setQuizNotFound(true);
      } else {
        notify.error(err.message || 'Failed to load quiz.', { retry: () => loadQuiz(quizId) });
      }
    }
  };

  // --- TOGGLE SELECTION LOGIC (unchanged) ---
  const handleSelect = (qIndex, option) => {
    if (gradingResults) return;

    setSelectedAnswers(prev => {
      const currentSelections = prev[qIndex] || [];

      if (currentSelections.includes(option)) {
        return { ...prev, [qIndex]: currentSelections.filter(item => item !== option) };
      } else {
        return { ...prev, [qIndex]: [...currentSelections, option] };
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await submitQuizAnswers(currentQuiz.quiz_id, selectedAnswers);
      if (response.status === 'success') {
        setGradingResults(response.data);
        setCurrentQuestionIndex(0);
      }

      // Check for newly-unlocked streak/badge milestones to celebrate.
      // Non-critical: a stats hiccup should never block the quiz results.
      try {
        const stats = await getStatsSummary();
        const queue = [];
        for (const days of stats.newly_unlocked?.streaks || []) {
          queue.push({
            type: 'streak',
            id: days,
            title: `${days}-Day Streak!`,
            description: `You've studied ${days} day${days === 1 ? '' : 's'} in a row. Keep it going!`,
          });
        }
        for (const badgeId of stats.newly_unlocked?.badges || []) {
          const badge = (stats.badges || []).find((b) => b.id === badgeId);
          queue.push({
            type: 'badge',
            id: badgeId,
            title: badge?.label || 'New Badge!',
            description: badge?.description,
          });
        }
        if (queue.length > 0) setCelebrationQueue(queue);
      } catch {
        // silent — see comment above
      }
    } catch (error) {
      notify.error(error.message || 'Failed to grade quiz. Please try again.', { retry: handleSubmit });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCelebration = async () => {
    const current = celebrationQueue[0];
    if (current) {
      try {
        await ackMilestone(current.type, current.id);
      } catch {
        // If the ack fails it may re-celebrate next time — harmless, non-critical.
      }
    }
    setCelebrationQueue((prev) => prev.slice(1));
  };

  const handleDeleteClick = (e, quiz) => {
    e.stopPropagation();
    setQuizToDelete(quiz);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      await deleteQuiz(quizToDelete.id);
      if (activeQuizId === quizToDelete.id) {
        setActiveQuizId(null);
      }
      await fetchQuizList();
    } catch (err) {
      notify.error(err.message || 'Failed to delete quiz. Please try again.');
    } finally {
      setIsConfirmOpen(false);
      setQuizToDelete(null);
    }
  };

  if (quizNotFound) {
    return (
      <div>
        <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={() => setActiveQuizId(null)}>
          Back to Quizzes
        </Button>
        <EmptyState
          icon={<ClipboardList size={22} />}
          title="This quiz could not be found"
          description="It may have been deleted, or the link is no longer valid."
        />
      </div>
    );
  }

  if (!activeQuizId || !currentQuiz) {
    return (
      <div>
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          message="Are you sure you want to delete this quiz? This action cannot be undone."
        />

        <h2>My Quizzes</h2>
        {quizList.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={22} />}
            title="No quizzes yet"
            description="Go to an AI Tutor chat and click “Generate Quiz” to turn a conversation into a practice quiz."
          />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            {quizList.map((quiz, index) => (
              <QuizListItem
                key={quiz.id}
                quiz={quiz}
                index={index}
                onSelect={() => loadQuiz(quiz.id)}
                onDelete={(e) => handleDeleteClick(e, quiz)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const qIndex = currentQuestionIndex;
  const q = currentQuiz.questions[qIndex];
  const resultData = gradingResults?.results[qIndex];
  const isLastQuestion = qIndex === currentQuiz.questions.length - 1;
  const progressPct = ((qIndex + 1) / currentQuiz.questions.length) * 100;

  // Ensure every question has at least ONE option selected before submitting
  const allAnswered = currentQuiz.questions.every((_, i) => selectedAnswers[i] && selectedAnswers[i].length > 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>

      <CelebrationModal
        isOpen={!!activeCelebration}
        onClose={handleCloseCelebration}
        title={activeCelebration?.title}
        description={activeCelebration?.description}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={() => setActiveQuizId(null)}>
          Back to Quizzes
        </Button>

        {gradingResults && (
          <Badge tone={getScoreTone(gradingResults.score, gradingResults.total)}>
            Score: {gradingResults.score} / {gradingResults.total}
          </Badge>
        )}
      </div>

      <Card padding="var(--space-8)">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-3)' }}>
          <h2>{currentQuiz.title}</h2>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)', fontWeight: 600 }}>
            Question {qIndex + 1} of {currentQuiz.questions.length}
          </span>
        </div>

        {/* Progress bar — visible remaining-question count reduces quiz anxiety (Zeigarnik effect) */}
        <div
          style={{
            height: 6,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface-hover)',
            overflow: 'hidden',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--color-primary-500)',
              borderRadius: 'var(--radius-full)',
              transition: `width var(--duration-slow) var(--ease-standard)`,
            }}
          />
        </div>

        <div>
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: '1.2rem', lineHeight: '1.5' }}>{q.question}</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)', marginBottom: 'var(--space-5)', fontStyle: 'italic' }}>
            Select all that apply.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {q.options.map((opt, oIndex) => {
              const isSelected = selectedAnswers[qIndex]?.includes(opt);

              let bg = isSelected ? 'var(--color-info-bg)' : 'var(--color-surface)';
              let borderColor = isSelected ? 'var(--color-primary-500)' : 'var(--color-border-strong)';
              let indicatorIcon = null;

              if (gradingResults && resultData) {
                const isCorrectOption = resultData.correct_answers.includes(opt);

                if (isCorrectOption) {
                  bg = 'var(--color-success-bg)';
                  borderColor = 'var(--color-success)';
                  indicatorIcon = <Check size={14} color="var(--color-success)" strokeWidth={3} />;
                } else if (isSelected && !isCorrectOption) {
                  bg = 'var(--color-danger-bg)';
                  borderColor = 'var(--color-danger)';
                  indicatorIcon = <X size={14} color="var(--color-danger)" strokeWidth={3} />;
                }
              } else if (isSelected) {
                indicatorIcon = <Check size={14} color="var(--color-primary-500)" strokeWidth={3} />;
              }

              return (
                <button
                  key={oIndex}
                  onClick={() => handleSelect(qIndex, opt)}
                  disabled={!!gradingResults}
                  style={{
                    padding: '14px 18px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${borderColor}`,
                    backgroundColor: bg,
                    color: 'var(--color-text-primary)',
                    cursor: gradingResults ? 'default' : 'pointer',
                    transition: `all var(--duration-base) var(--ease-standard)`,
                    fontSize: 'var(--font-size-body)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    margin: 0,
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: isSelected || indicatorIcon ? 'none' : '2px solid var(--color-border-strong)',
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-sm)',
                      marginRight: 'var(--space-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {indicatorIcon}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>

          {gradingResults && resultData && (
            <div
              style={{
                marginTop: 'var(--space-5)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-info-bg)',
                borderLeft: '4px solid var(--color-primary-500)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-body)',
                lineHeight: '1.5',
              }}
            >
              <strong>AI Explanation:</strong> {resultData.explanation}
            </div>
          )}
        </div>

        <div className="quiz-footer-actions" style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={qIndex === 0}
          >
            Previous
          </Button>

          {!isLastQuestion ? (
            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
              Next Question
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting || gradingResults !== null}
              isLoading={isSubmitting}
            >
              {gradingResults ? "Quiz Completed" : "Submit Quiz"}
            </Button>
          )}
        </div>

        {isLastQuestion && !allAnswered && !gradingResults && (
          <p style={{ textAlign: 'right', color: 'var(--color-danger)', fontSize: 'var(--font-size-caption)', marginTop: 'var(--space-2)' }}>
            * Please answer all questions before submitting.
          </p>
        )}
      </Card>
    </div>
  );
}
