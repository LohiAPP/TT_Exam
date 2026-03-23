'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/GlassCard';

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const lastResult = localStorage.getItem('lastResult');
    if (!lastResult) {
      router.push('/');
      return;
    }
    setResult(JSON.parse(lastResult));
  }, [router]);

  if (!result) return null;

  const percentage = Math.round(result.percentage || 0);
  const { questions = [], answers = {} } = result;

  return (
    <main className="container" style={{ minHeight: '90vh', padding: '2rem 1rem' }}>
      <div className="flex-center" style={{ marginBottom: '2rem' }}>
        <GlassCard style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginBottom: '1.5rem' }}>Exam Results</h1>

          <div style={{ position: 'relative', width: 'clamp(160px, 40vw, 200px)', height: 'clamp(160px, 40vw, 200px)', margin: '0 auto 2rem' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }} viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="90"
                fill="transparent"
                stroke="var(--glass-border)"
                strokeWidth="12"
              />
              <circle
                cx="100" cy="100" r="90"
                fill="transparent"
                stroke="var(--accent)"
                strokeWidth="12"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (565.48 * percentage) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
              <span style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 800 }}>{percentage}%</span>
            </div>
          </div>

          <h2 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)', marginBottom: '1rem', color: percentage >= 50 ? '#10B981' : '#EF4444' }}>
            {percentage >= 80 ? 'Excellent! 🏆' : percentage >= 50 ? 'Good Job! 👍' : 'Keep Practicing! 💪'}
          </h2>
          
          <p className="text-muted mb-6" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>
            You scored <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{result.score}</span> out of {result.total} <span style={{ fontWeight: 600 }}>marks</span>
          </p>

          <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '2rem' }}>
            <div className="glass" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Correct</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981' }}>{result.score}</p>
            </div>
            <div className="glass" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Wrong</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EF4444' }}>{result.total - result.score}</p>
            </div>
          </div>

          <div className="flex flex-center gap-4 mobile-stack">
            <button className="btn btn-outline" onClick={() => setShowReview(!showReview)} style={{ flex: 1 }}>
              {showReview ? 'Hide Review' : 'Review Answers'}
            </button>
            <button className="btn btn-primary" onClick={() => router.push('/')} style={{ flex: 1 }}>
              Back to Home
            </button>
          </div>
        </GlassCard>
      </div>

      {showReview && (
        <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="mb-6 text-center">Question Review</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((q: any, idx: number) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct;
              
              return (
                <GlassCard key={q.id} style={{ padding: '2rem' }}>
                  <div className="flex justify-between items-center mb-4">
                    <span style={{ 
                      background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                      color: isCorrect ? '#10B981' : '#EF4444', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      Question {idx + 1}: {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.question}</h3>
                  
                  <div className="grid-2" style={{ gap: '0.75rem' }}>
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const isUserChoice = userAnswer === opt;
                      const isCorrectChoice = q.correct === opt;
                      
                      let borderColor = 'var(--glass-border)';
                      let bgColor = 'rgba(255,255,255,0.02)';
                      let textColor = 'var(--text-muted)';
                      
                      if (isCorrectChoice) {
                        borderColor = '#10B981';
                        bgColor = 'rgba(16, 185, 129, 0.1)';
                        textColor = 'white';
                      } else if (isUserChoice && !isCorrect) {
                        borderColor = '#EF4444';
                        bgColor = 'rgba(239, 68, 68, 0.1)';
                        textColor = 'white';
                      }

                      return (
                        <div key={opt} style={{
                          padding: '1rem',
                          borderRadius: '10px',
                          border: `1px solid ${borderColor}`,
                          background: bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          position: 'relative',
                          transition: 'var(--transition)'
                        }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            background: isCorrectChoice ? '#10B981' : isUserChoice ? '#EF4444' : 'var(--glass-border)',
                            color: isCorrectChoice || isUserChoice ? 'var(--primary)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {opt}
                          </span>
                          <span style={{ fontSize: '0.95rem', color: textColor }}>{q[`option${opt}`]}</span>
                          
                          {isUserChoice && (
                            <span style={{ 
                              position: 'absolute', 
                              right: '1rem', 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              textTransform: 'uppercase',
                              color: isCorrect ? '#10B981' : '#EF4444'
                            }}>
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              );
            })}
          </div>
          
          <div className="text-center mt-10" style={{ marginTop: '3rem' }}>
            <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to Top ↑
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
