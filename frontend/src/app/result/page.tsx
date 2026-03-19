'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/GlassCard';

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);
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

  return (
    <main className="container flex-center" style={{ minHeight: '90vh', padding: '1rem' }}>
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

        <button className="btn btn-primary" onClick={() => router.push('/')} style={{ width: '100%' }}>
          Go to Home
        </button>
      </GlassCard>
    </main>
  );
}
