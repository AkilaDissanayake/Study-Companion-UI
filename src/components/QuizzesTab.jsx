// components/QuizzesTab.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, ClipboardList } from 'lucide-react';
import { getMyQuizzes, getQuizById, submitQuizAnswers } from '../services/api';
import { useNotify } from '../context/NotificationContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import EmptyState from './ui/EmptyState';

export default function QuizzesTab({ activeQuizId, setActiveQuizId }) {
  const notify = useNotify();
  const [quizList, setQuizList] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizNotFound, setQuizNotFound] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResults, setGradingResults] = useState(null);

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
    } catch (error) {
      notify.error(error.message || 'Failed to grade quiz. Please try again.', { retry: handleSubmit });
    } finally {
      setIsSubmitting(false);
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
        <h2>My Quizzes</h2>
        {quizList.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={22} />}
            title="No quizzes yet"
            description="Go to an AI Tutor chat and click “Generate Quiz” to turn a conversation into a practice quiz."
          />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            {quizList.map(quiz => (
              <Card key={quiz.id} hoverable onClick={() => loadQuiz(quiz.id)} style={{ cursor: 'pointer' }}>
                <h3 style={{ color: 'var(--color-primary-500)' }}>{quiz.title}</h3>
                <small style={{ color: 'var(--color-text-tertiary)' }}>
                  Created: {new Date(quiz.created_at).toLocaleDateString()}
                </small>
              </Card>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={() => setActiveQuizId(null)}>
          Back to Quizzes
        </Button>

        {gradingResults && (
          <Badge tone={gradingResults.score === gradingResults.total ? 'success' : 'warning'}>
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

        <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
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
