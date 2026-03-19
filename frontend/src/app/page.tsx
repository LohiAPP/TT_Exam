'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { GlassCard } from '@/components/GlassCard';

export default function Home() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    phone: '',
    location: '',
    pincode: '',
    examId: ''
  });
  const [selectedExam, setSelectedExam] = useState<any>(null);

  useEffect(() => {
    const fetchExams = async () => {
      const res = await api.getExams();
      if (res.success) {
        setExams(res.data.filter((e: any) => e.isActive));
      }
    };
    fetchExams();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'examId') {
      const exam = exams.find(e => e.examId === value);
      setSelectedExam(exam);
    }
  };

  const getExamStatus = (exam: any) => {
    if (!exam) return null;
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);

    if (now < start) return { status: 'upcoming', text: `Starts at ${start.toLocaleString()}` };
    if (now > end) return { status: 'ended', text: 'Exam has ended' };
    return { status: 'live', text: 'Exam is live now!' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length < 10) {
      alert('Phone Number must be at least 10 digits');
      return;
    }

    try {
      const response = await api.startExam(formData);
      if (response.success) {
        localStorage.setItem('examUser', JSON.stringify(response.data));
        router.push(`/exam/${formData.examId}`);
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert('Enrollment failed. Please try again.');
    }
  };

  return (
    <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Full Screen Welcome Content */}
      <div 
        className="flex-center animate-fade" 
        style={{ 
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          flexDirection: 'column',
          textAlign: 'center',
          padding: '2rem',
          filter: showLogin ? 'blur(10px)' : 'none',
          transition: 'filter 0.5s ease',
          pointerEvents: showLogin ? 'none' : 'all'
        }}
      >
        <span className="badge mb-6" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', padding: '0.6rem 2rem', fontSize: '1rem', letterSpacing: '2px' }}>
          DEEP DHYANA EXPERIENCE
        </span>
        <h1 style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginBottom: '1.5rem', lineHeight: '1', fontWeight: 800 }}>
          Meditation Teacher <br/> Training Exam
        </h1>
        <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)', color: 'var(--accent)', fontWeight: 500, opacity: 0.9, marginBottom: '2.5rem' }}>
          By Nlight Spiritual Science Academy
        </h2>
        
        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', color: '#CBD5E1', lineHeight: '1.6', marginBottom: '4rem', maxWidth: '800px' }}>
          A transformative journey into inner stillness and the art of guiding others in meditation.
        </p>

        <button 
          className="btn btn-primary" 
          style={{ 
            fontSize: '1.5rem', 
            padding: '1.5rem 4rem', 
            borderRadius: '100px', 
            boxShadow: '0 20px 50px rgba(6, 182, 212, 0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          onClick={() => setShowLogin(true)}
        >
          Take Exam Now 🚀
        </button>

        <div style={{ position: 'absolute', bottom: '3rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '4rem', color: '#94A3B8', fontSize: '0.9rem', opacity: 0.6 }}>
          <span>✨ TRANSFORMATIVE</span>
          <span>🕉️ SPIRITUAL</span>
          <span>🧘 MEDITATIVE</span>
        </div>
      </div>

      {/* Overlay for Registration Form */}
      {showLogin && (
        <div 
          className="flex-center animate-fade" 
          style={{ 
            position: 'fixed',
            inset: 0,
            zIndex: 10,
            background: 'rgba(2, 6, 23, 0.4)',
            backdropFilter: 'blur(5px)',
            padding: '2rem'
          }}
          onClick={(e) => { if(e.target === e.currentTarget) setShowLogin(false); }}
        >
          <GlassCard style={{ maxWidth: '500px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h2 style={{ fontSize: '1.75rem' }}>Admission Form</h2>
               <button onClick={() => setShowLogin(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                <input type="text" name="name" placeholder="Ex: Shiva Kumar" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Roll Number</label>
                  <input type="text" name="rollNo" placeholder="Ex: A26Jan***" value={formData.rollNo} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number</label>
                  <input type="text" name="phone" placeholder="10 Digits" value={formData.phone} onChange={handleInputChange} required maxLength={10} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Location</label>
                  <input type="text" name="location" placeholder="City/Town" value={formData.location} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Pincode</label>
                  <input type="text" name="pincode" placeholder="6 Digits" value={formData.pincode} onChange={handleInputChange} required maxLength={6} />
                </div>
              </div>

              <div className="form-group">
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Select Exam</label>
                <select
                  name="examId"
                  value={formData.examId}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.875rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                >
                  <option value="" style={{ background: '#0F172A' }}>Choose an exam...</option>
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.examId} style={{ background: '#0F172A' }}>{exam.title}</option>
                  ))}
                </select>
              </div>

              {selectedExam && (
                <div className="animate-fade" style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedExam.title}</span>
                    <span className={`badge badge-${getExamStatus(selectedExam)?.status}`}>
                      {getExamStatus(selectedExam)?.status?.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{getExamStatus(selectedExam)?.text}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: '1rem' }}
                disabled={!selectedExam || getExamStatus(selectedExam)?.status !== 'live'}
              >
                Start Assessment Now
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </main>
  );
}
