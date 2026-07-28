// components/QuizzesTab.jsx
import React, { useState, useEffect } from 'react';
import { getMyQuizzes, getQuizById, submitQuizAnswers } from '../services/api';

export default function QuizzesTab({ activeQuizId, setActiveQuizId }) {
  const [quizList, setQuizList] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  
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
    }
  }, [activeQuizId]);

  const fetchQuizList = async () => {
    try {
      const res = await getMyQuizzes();
      if (res.status === 'success') setQuizList(res.data);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    }
  };

  const loadQuiz = async (quizId) => {
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
      console.error("Failed to load quiz data:", err);
    }
  };

  // --- NEW TOGGLE SELECTION LOGIC ---
  const handleSelect = (qIndex, option) => {
    if (gradingResults) return; 
    
    setSelectedAnswers(prev => {
      const currentSelections = prev[qIndex] || [];
      
      // If already selected, remove it (toggle off)
      if (currentSelections.includes(option)) {
        return { ...prev, [qIndex]: currentSelections.filter(item => item !== option) };
      } 
      // If not selected, add it (toggle on)
      else {
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
      console.error("Failed to grade quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeQuizId || !currentQuiz) {
    return (
      <div style={{ padding: '20px', color: 'var(--text-color, #333)' }}>
        <h2>My Quizzes</h2>
        {quizList.length === 0 ? (
          <p>You haven't generated any quizzes yet. Go to an AI Tutor chat and click 'Generate Quiz'!</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
            {quizList.map(quiz => (
              <div 
                key={quiz.id} 
                onClick={() => loadQuiz(quiz.id)}
                style={{ padding: '16px', backgroundColor: 'var(--container-bg, #fff)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', border: '1px solid #e2e8f0' }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary, #3182ce)' }}>{quiz.title}</h3>
                <small style={{ color: '#718096' }}>Created: {new Date(quiz.created_at).toLocaleDateString()}</small>
              </div>
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
  
  // Ensure every question has at least ONE option selected before submitting
  const allAnswered = currentQuiz.questions.every((_, i) => selectedAnswers[i] && selectedAnswers[i].length > 0);

  return (
    <div style={{ padding: '20px', color: 'var(--text-color, #333)', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveQuizId(null)} 
          style={{ background: 'none', border: 'none', color: '#3182ce', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
        >
          ← Back to Quizzes
        </button>

        {gradingResults && (
          <div style={{ backgroundColor: gradingResults.score === gradingResults.total ? '#c6f6d5' : '#feebc8', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', color: '#2d3748' }}>
            Score: {gradingResults.score} / {gradingResults.total}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--container-bg, #fff)', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #edf2f7', paddingBottom: '12px', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>{currentQuiz.title}</h2>
          <span style={{ color: '#718096', fontWeight: 'bold' }}>
            Question {qIndex + 1} of {currentQuiz.questions.length}
          </span>
        </div>

        <div>
          <h3 style={{ marginBottom: '8px', fontSize: '1.2rem', lineHeight: '1.5' }}>{q.question}</h3>
          <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '20px', fontStyle: 'italic' }}>Select all that apply.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {q.options.map((opt, oIndex) => {
              // Check if it's in the array of selected answers
              const isSelected = selectedAnswers[qIndex]?.includes(opt);
              
              let bg = isSelected ? 'var(--primary, #3182ce)' : 'transparent';
              let color = isSelected ? '#fff' : 'inherit';
              let border = '2px solid #cbd5e0';

              if (gradingResults && resultData) {
                // Check against the array of correct answers
                const isCorrectOption = resultData.correct_answers.includes(opt);
                
                if (isCorrectOption) { 
                  bg = '#48bb78'; color = '#fff'; border = '2px solid #48bb78'; 
                }
                else if (isSelected && !isCorrectOption) { 
                  bg = '#f56565'; color = '#fff'; border = '2px solid #f56565'; 
                }
              }

              return (
                <button
                  key={oIndex}
                  onClick={() => handleSelect(qIndex, opt)}
                  style={{ padding: '14px 20px', textAlign: 'left', borderRadius: '8px', border: border, backgroundColor: bg, color: color, cursor: gradingResults ? 'default' : 'pointer', transition: 'all 0.2s', fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}
                >
                  {/* Add a tiny checkbox UI indicator inside the button */}
                  <div style={{ width: '18px', height: '18px', border: isSelected ? 'none' : '2px solid #a0aec0', backgroundColor: isSelected ? '#fff' : 'transparent', borderRadius: '4px', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <span style={{ color: 'var(--primary, #3182ce)', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
          
          {gradingResults && resultData && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#ebf8ff', borderLeft: '5px solid #4299e1', borderRadius: '4px', fontSize: '1rem', lineHeight: '1.5' }}>
              <strong>AI Explanation:</strong> {resultData.explanation}
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #edf2f7', paddingTop: '24px' }}>
          <button 
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={qIndex === 0}
            style={{ padding: '12px 24px', backgroundColor: qIndex === 0 ? '#edf2f7' : '#e2e8f0', color: qIndex === 0 ? '#a0aec0' : '#2d3748', border: 'none', borderRadius: '8px', cursor: qIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            Previous
          </button>

          {!isLastQuestion ? (
            <button 
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              style={{ padding: '12px 24px', backgroundColor: 'var(--primary, #3182ce)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
            >
              Next Question
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={!allAnswered || isSubmitting || gradingResults !== null}
              style={{ padding: '12px 24px', backgroundColor: (!allAnswered || gradingResults) ? '#cbd5e0' : '#48bb78', color: '#fff', border: 'none', borderRadius: '8px', cursor: (!allAnswered || gradingResults) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
            >
              {isSubmitting ? "Grading..." : gradingResults ? "Quiz Completed" : "Submit Quiz"}
            </button>
          )}
        </div>
        
        {isLastQuestion && !allAnswered && !gradingResults && (
          <p style={{ textAlign: 'right', color: '#e53e3e', fontSize: '0.85rem', marginTop: '8px' }}>
            * Please answer all questions before submitting.
          </p>
        )}
      </div>
    </div>
  );
}