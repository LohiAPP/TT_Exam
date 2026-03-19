'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import { GlassCard } from '@/components/GlassCard';

export default function ExamPage() {
  const { id: examId } = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('examUser');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    // Check if there's a stored timer, otherwise use full duration
    const savedTime = localStorage.getItem(`timer_${examId}_${userData.rollNo}`);
    setTimeLeft(savedTime ? parseInt(savedTime) : userData.duration * 60);

    const savedAnswers = localStorage.getItem(`answers_${examId}_${userData.rollNo}`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const fetchQuestions = async () => {
      try {
        const response = await api.getQuestions(examId);
        if (response.success) {
          setQuestions(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId, router]);

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.submitExam({
        userId: user.userId,
        examId: user.examInternalId,
        answers,
        timeTaken: user.duration * 60 - timeLeft
      });

      if (response.success) {
        localStorage.removeItem(`answers_${examId}_${user.rollNo}`);
        localStorage.removeItem(`timer_${examId}_${user.rollNo}`);
        localStorage.setItem('lastResult', JSON.stringify(response.data));
        router.push('/result');
      }
    } catch (err) {
      alert('Error submitting exam. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [user, answers, examId, timeLeft, router]);

  // Timer & Auto-save logic
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const nextTime = prev - 1;
        if (user) {
          localStorage.setItem(`timer_${examId}_${user.rollNo}`, nextTime.toString());
        }
        if (nextTime <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft, user, examId, handleSubmit]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`answers_${examId}_${user.rollNo}`, JSON.stringify(answers));
    }
  }, [answers, examId, user]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading && questions.length === 0) {
    return (
      <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="animate-fade text-center">
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Preparing your exam session...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion && !loading) {
    return (
      <div className="container text-center mt-20">
        <GlassCard>
          <h2>No questions found for this exam.</h2>
          <button className="btn btn-primary mt-4" onClick={() => router.push('/')}>Go Back</button>
        </GlassCard>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--glass-border)', borderRadius: 0 }}>
        <div className="container flex justify-between items-center" style={{ padding: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>{user?.title}</h2>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.name} | {user?.rollNo}</p>
          </div>
          <div className="flex items-center gap-4">
            <div style={{ 
              background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.1)', 
              color: timeLeft < 300 ? '#EF4444' : 'var(--accent)', 
              padding: '0.5rem 1rem', 
              borderRadius: '10px', 
              fontWeight: 700,
              fontSize: '1.25rem',
              border: `1px solid ${timeLeft < 300 ? '#EF4444' : 'var(--accent)'}`
            }}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            <button className="btn btn-primary" onClick={() => confirm('Submit your exam?') && handleSubmit()} disabled={loading}>
              Submit
            </button>
          </div>
        </div>
        <div className="progress-container" style={{ borderRadius: 0 }}>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
        <GlassCard style={{ padding: '3rem' }}>
          <div className="flex justify-between items-center mb-6">
            <span style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600 }}>
              Question {currentIndex + 1}
            </span>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              Overall Progress: {Math.round(progress)}%
            </span>
          </div>

          <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', lineHeight: 1.4 }}>
            {currentQuestion?.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <button
                key={opt}
                className="btn glass"
                onClick={() => setAnswers({ ...answers, [currentQuestion?.id]: opt })}
                style={{
                  padding: '1.5rem',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  fontSize: '1.1rem',
                  border: answers[currentQuestion?.id] === opt ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                  background: answers[currentQuestion?.id] === opt ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                  color: 'white',
                }}
              >
                <span style={{ 
                  fontWeight: 700, 
                  marginRight: '1rem',
                  background: answers[currentQuestion?.id] === opt ? 'var(--accent)' : 'var(--glass-border)',
                  color: answers[currentQuestion?.id] === opt ? 'var(--primary)' : 'var(--text-muted)',
                  width: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}>
                  {opt}
                </span>
                {currentQuestion?.[`option${opt}`]}
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-between" style={{ padding: '0 1rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            style={{ minWidth: '140px' }}
          >
            ← Previous
          </button>
          {currentIndex === questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => confirm('Submit your exam?') && handleSubmit()}
              disabled={loading}
              style={{ minWidth: '160px', background: 'linear-gradient(to right, #06B6D4, #A855F7)', border: 'none' }}
            >
              Final Submit 🚀
            </button>
          ) : (
            <button
              className="btn btn-outline"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              style={{ minWidth: '140px' }}
            >
              Next →
            </button>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
