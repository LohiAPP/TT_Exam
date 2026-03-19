'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { GlassCard } from '@/components/GlassCard';

// Helper to format date for datetime-local input (stripping TZ shift)
const formatForInput = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalAttempts: 0, activeExams: 0 });
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal/Form States
  const [showExamForm, setShowExamForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [importing, setImporting] = useState(false);

  // Forms
  const [examFormData, setExamFormData] = useState({
    id: '', title: '', examId: '', duration: 60, startTime: '', endTime: '', totalQuestions: 10, isActive: true
  });
  const [questionFormData, setQuestionFormData] = useState({
    id: '', examId: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A'
  });
  const [resultFormData, setResultFormData] = useState({
    id: '', score: 0, percentage: 0, timeTaken: 0, examId: ''
  });

  const fetchData = async () => {
    try {
      const [statsRes, examsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getExams()
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (examsRes.success) setExams(examsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router]);

  // Exam CRUD
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert local input strings to proper ISO UTC for backend
      const payload = {
        ...examFormData,
        startTime: new Date(examFormData.startTime).toISOString(),
        endTime: new Date(examFormData.endTime).toISOString()
      };

      const res = isEditingExam 
        ? await api.updateExam(examFormData.id, payload)
        : await api.createExam(payload);
      
      if (res.success) {
        setShowExamForm(false);
        setIsEditingExam(false);
        await fetchData();
        setExamFormData({ id: '', title: '', examId: '', duration: 60, startTime: '', endTime: '', totalQuestions: 10, isActive: true });
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleEditExam = (exam: any) => {
    setExamFormData({
      id: exam.id,
      title: exam.title,
      examId: exam.examId,
      duration: exam.duration,
      startTime: formatForInput(exam.startTime),
      endTime: formatForInput(exam.endTime),
      totalQuestions: exam.totalQuestions,
      isActive: exam.isActive
    });
    setIsEditingExam(true);
    setShowExamForm(true);
  };

  const handleDeleteExam = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam? All related questions and results will be lost.')) {
      try {
        const res = await api.deleteExam(id);
        if (res.success) {
          await fetchData();
        } else {
          alert('Failed to delete exam');
        }
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  // Question CRUD
  const fetchQuestions = async (examId: string) => {
    const res = await api.getQuestions(examId);
    if (res.success) setQuestions(res.data);
    setSelectedExamId(examId);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = questionFormData.id 
        ? await api.updateQuestion(questionFormData.id, questionFormData)
        : await api.createQuestion(questionFormData);
      
      if (res.success) {
        setShowQuestionForm(false);
        await fetchQuestions(questionFormData.examId);
        setQuestionFormData({ id: '', examId: questionFormData.examId, question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' });
      }
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };

  const handleDeleteQuestion = async (id: string, examId: string) => {
    if (confirm('Delete this question?')) {
      try {
        const res = await api.deleteQuestion(id);
        if (res.success) {
          await fetchQuestions(examId);
        } else {
          alert('Delete failed');
        }
      } catch (err: any) {
        alert(err.message || 'Error occurred');
      }
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExamId) return;

    setImporting(true);
    try {
      const res = await api.importQuestions(selectedExamId, file);
      if (res.success) {
        alert(res.message);
        await fetchQuestions(selectedExamId);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Failed to import questions');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Result CRUD
  const fetchResults = async (examId: string) => {
    const res = await api.getResults(examId);
    if (res.success) setResults(res.data);
    setSelectedExamId(examId);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateResult(resultFormData.id, resultFormData);
      if (res.success) {
        setShowResultForm(false);
        await fetchResults(resultFormData.examId);
      }
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleDeleteResult = async (id: string, examId: string) => {
    if (confirm('Delete this result? This action cannot be undone.')) {
      try {
        const res = await api.deleteResult(id);
        if (res.success) {
          await fetchResults(examId);
        } else {
          alert('Delete failed');
        }
      } catch (err: any) {
        alert(err.message || 'Error occurred');
      }
    }
  };

  const handleExport = () => {
    if (!selectedExamId) return;
    window.open(api.getExportUrl(selectedExamId), '_blank');
  };

  if (loading) return <div className="container text-center">Loading Dashboard...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: 'white' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 style={{ color: 'var(--accent)', marginBottom: '2.5rem', paddingLeft: '1rem' }}>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'exams', label: '📝 Exams' },
            { id: 'questions', label: '❓ Questions' },
            { id: 'results', label: '🏆 Results' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`btn ${activeTab === item.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                justifyContent: 'flex-start', 
                border: activeTab === item.id ? 'none' : '1px solid transparent',
                background: activeTab === item.id ? 'var(--accent)' : 'transparent',
                color: activeTab === item.id ? 'var(--primary)' : '#94A3B8'
              }}
            >
              {item.label}
            </button>
          ))}
          <button 
            className="btn btn-outline" 
            style={{ marginTop: 'auto', color: '#EF4444', borderColor: '#EF4444' }}
            onClick={() => { localStorage.removeItem('isAdminLoggedIn'); router.push('/admin/login'); }}
          >
             🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'dashboard' && (
          <div className="animate-fade">
            <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <GlassCard style={{ padding: '2rem' }}>
                <p className="text-muted">Total Users</p>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>{stats.totalUsers}</h2>
              </GlassCard>
              <GlassCard style={{ padding: '2rem' }}>
                <p className="text-muted">Total Attempts</p>
                <h2 style={{ fontSize: '2.5rem', color: '#A855F7' }}>{stats.totalAttempts}</h2>
              </GlassCard>
              <GlassCard style={{ padding: '2rem' }}>
                <p className="text-muted">Active Exams</p>
                <h2 style={{ fontSize: '2.5rem', color: '#10B981' }}>{stats.activeExams}</h2>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="animate-fade">
            <div className="flex justify-between items-center mb-8">
              <h1>Exam Management</h1>
              <button className="btn btn-primary" onClick={() => { setIsEditingExam(false); setExamFormData({ id: '', title: '', examId: '', duration: 60, startTime: '', endTime: '', totalQuestions: 10, isActive: true }); setShowExamForm(true); }}>+ Create Exam</button>
            </div>

            {showExamForm && (
              <GlassCard className="mb-8">
                <h3>{isEditingExam ? 'Edit' : 'Create'} Exam</h3>
                <form onSubmit={handleSaveExam} className="mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="text-muted">Title</label>
                    <input type="text" value={examFormData.title} onChange={e => setExamFormData({...examFormData, title: e.target.value})} placeholder="Final Term Exam" required />
                  </div>
                  <div>
                    <label className="text-muted">Exam ID (Slug)</label>
                    <input type="text" value={examFormData.examId} onChange={e => setExamFormData({...examFormData, examId: e.target.value})} placeholder="final-2024" required />
                  </div>
                  <div>
                    <label className="text-muted">Duration (Mins)</label>
                    <input type="number" value={examFormData.duration} onChange={e => setExamFormData({...examFormData, duration: parseInt(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="text-muted">Start Time</label>
                    <input type="datetime-local" value={examFormData.startTime} onChange={e => setExamFormData({...examFormData, startTime: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-muted">End Time</label>
                    <input type="datetime-local" value={examFormData.endTime} onChange={e => setExamFormData({...examFormData, endTime: e.target.value})} required />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="isActive" checked={examFormData.isActive} onChange={e => setExamFormData({...examFormData, isActive: e.target.checked})} />
                    <label htmlFor="isActive">Active</label>
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditingExam ? 'Update' : 'Save'} Exam</button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowExamForm(false)} style={{ flex: 1 }}>Cancel</button>
                  </div>
                </form>
              </GlassCard>
            )}

            <div className="glass">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Exam</th>
                    <th style={{ padding: '1rem' }}>Timing</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <strong>{e.title}</strong>
                        <br/><small className="text-muted">{e.examId}</small>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <small>{new Date(e.startTime).toLocaleString()} - </small>
                        <br/><small>{new Date(e.endTime).toLocaleString()}</small>
                      </td>
                      <td style={{ padding: '1rem' }}>
                         <span style={{ color: e.isActive ? '#10B981' : '#EF4444' }}>{e.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditExam(e)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#EF4444' }} onClick={() => handleDeleteExam(e.id)}>Del</button>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setActiveTab('questions'); fetchQuestions(e.id); setQuestionFormData({...questionFormData, examId: e.id}); }}>Manage Qs</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="animate-fade">
            <div className="flex justify-between items-center mb-8">
              <h1>Question Bank</h1>
              <div className="flex gap-4">
                <select 
                  className="btn glass" 
                  value={selectedExamId} 
                  onChange={e => fetchQuestions(e.target.value)}
                  style={{ background: '#0F172A', color: 'white', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}
                >
                  <option value="" style={{ background: '#0F172A', color: 'white' }}>Select Exam</option>
                  {exams.map(e => <option key={e.id} value={e.id} style={{ background: '#0F172A', color: 'white' }}>{e.title}</option>)}
                </select>
                <button className="btn btn-outline" onClick={() => setShowImportPreview(true)}>ℹ️ Format</button>
                <input 
                  type="file" 
                  accept=".xlsx, .csv" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImportFile}
                />
                <button 
                  className="btn btn-outline" 
                  disabled={!selectedExamId || importing} 
                  onClick={() => fileInputRef.current?.click()}
                >
                  {importing ? '⌛ Importing...' : '📤 Bulk Import (Excel)'}
                </button>
                <button className="btn btn-primary" disabled={!selectedExamId} onClick={() => { setQuestionFormData({ id: '', examId: selectedExamId, question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }); setShowQuestionForm(true); }}>+ Add Single Q</button>
              </div>
            </div>

            {showImportPreview && (
              <GlassCard className="mb-8" style={{ border: '1px solid var(--accent)' }}>
                <div className="flex justify-between">
                  <h3>Required Excel Format</h3>
                  <button onClick={() => setShowImportPreview(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                </div>
                <p className="text-muted mt-2">Make sure your Excel/CSV has the following column headers:</p>
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <tr>
                        <th style={{ padding: '0.5rem' }}>Question</th>
                        <th style={{ padding: '0.5rem' }}>OptionA</th>
                        <th style={{ padding: '0.5rem' }}>OptionB</th>
                        <th style={{ padding: '0.5rem' }}>OptionC</th>
                        <th style={{ padding: '0.5rem' }}>OptionD</th>
                        <th style={{ padding: '0.5rem' }}>Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '0.5rem' }}>What is 2+2?</td>
                        <td style={{ padding: '0.5rem' }}>3</td>
                        <td style={{ padding: '0.5rem' }}>4</td>
                        <td style={{ padding: '0.5rem' }}>5</td>
                        <td style={{ padding: '0.5rem' }}>6</td>
                        <td style={{ padding: '0.5rem' }}>B</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted mt-4 small"><em>Note: Headers are case-insensitive. Column order doesn't matter. Correct should be A, B, C, or D.</em></p>
              </GlassCard>
            )}

            {showQuestionForm && (
              <GlassCard className="mb-8">
                <h3>{questionFormData.id ? 'Edit' : 'Add'} Question</h3>
                <form onSubmit={handleSaveQuestion} className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea value={questionFormData.question} onChange={e => setQuestionFormData({...questionFormData, question: e.target.value})} placeholder="What is the question?" required />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="text" value={questionFormData.optionA} onChange={e => setQuestionFormData({...questionFormData, optionA: e.target.value})} placeholder="Option A" required />
                    <input type="text" value={questionFormData.optionB} onChange={e => setQuestionFormData({...questionFormData, optionB: e.target.value})} placeholder="Option B" required />
                    <input type="text" value={questionFormData.optionC} onChange={e => setQuestionFormData({...questionFormData, optionC: e.target.value})} placeholder="Option C" required />
                    <input type="text" value={questionFormData.optionD} onChange={e => setQuestionFormData({...questionFormData, optionD: e.target.value})} placeholder="Option D" required />
                  </div>
                  <div>
                    <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Correct Answer</label>
                    <select value={questionFormData.correct} onChange={e => setQuestionFormData({...questionFormData, correct: e.target.value})} style={{ width: '100%', padding: '0.875rem', background: '#0F172A', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                      {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>Option {o}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowQuestionForm(false)} style={{ flex: 1 }}>Cancel</button>
                  </div>
                </form>
              </GlassCard>
            )}

            <div className="glass">
              {!selectedExamId ? <p style={{ padding: '2rem', textAlign: 'center' }}>Please select an exam to manage questions.</p> : questions.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center' }}>No questions found for this exam.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                   <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                     <tr>
                        <th style={{ padding: '1rem', width: '50px' }}>No.</th>
                        <th style={{ padding: '1rem' }}>Question</th>
                        <th style={{ padding: '1rem' }}>Correct</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {questions.map((q, index) => (
                       <tr key={q.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                         <td style={{ padding: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>{index + 1}</td>
                         <td style={{ padding: '1rem' }}>{q.question.substring(0, 80)}...</td>
                         <td style={{ padding: '1rem' }}>{q.correct}</td>
                         <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                           <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setQuestionFormData(q); setShowQuestionForm(true); }}>Edit</button>
                           <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#EF4444' }} onClick={() => handleDeleteQuestion(q.id, q.examId)}>Del</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="animate-fade">
             <div className="flex justify-between items-center mb-8">
              <h1>User Results</h1>
              <div className="flex gap-4">
                <select 
                  className="btn glass" 
                  value={selectedExamId}
                  onChange={e => { fetchResults(e.target.value); }}
                  style={{ background: '#0F172A', color: 'white', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}
                >
                  <option value="" style={{ background: '#0F172A', color: 'white' }}>Select Exam</option>
                  {exams.map(e => <option key={e.id} value={e.id} style={{ background: '#0F172A', color: 'white' }}>{e.title}</option>)}
                </select>
                <button className="btn btn-primary" onClick={handleExport} disabled={!selectedExamId}>📥 Export CSV</button>
              </div>
            </div>

            {showResultForm && (
              <GlassCard className="mb-8">
                <h3>Edit Result</h3>
                <form onSubmit={handleSaveResult} className="mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="text-muted">Score</label>
                    <input type="number" value={resultFormData.score} onChange={e => setResultFormData({...resultFormData, score: parseInt(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="text-muted">Percentage</label>
                    <input type="number" step="0.01" value={resultFormData.percentage} onChange={e => setResultFormData({...resultFormData, percentage: parseFloat(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="text-muted">Time Taken (Secs)</label>
                    <input type="number" value={resultFormData.timeTaken} onChange={e => setResultFormData({...resultFormData, timeTaken: parseInt(e.target.value)})} required />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update Result</button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowResultForm(false)} style={{ flex: 1 }}>Cancel</button>
                  </div>
                </form>
              </GlassCard>
            )}

            <div className="glass">
              {results.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center' }}>Select an exam to view user performance.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                   <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                     <tr>
                        <th style={{ padding: '1rem' }}>User</th>
                        <th style={{ padding: '1rem' }}>Location</th>
                        <th style={{ padding: '1rem' }}>Score</th>
                        <th style={{ padding: '1rem' }}>Percentage</th>
                        <th style={{ padding: '1rem' }}>Time</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {results.map(r => (
                       <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                         <td style={{ padding: '1rem' }}>
                            <strong>{r.user.name}</strong>
                            <br/><small className="text-muted">{r.user.rollNo}</small>
                         </td>
                         <td style={{ padding: '1rem' }}>
                            <strong>{r.user.location}</strong>
                            <br/><small className="text-muted">{r.user.pincode}</small>
                         </td>
                         <td style={{ padding: '1rem' }}>{r.score}</td>
                         <td style={{ padding: '1rem' }}>{Math.round(r.percentage)}%</td>
                         <td style={{ padding: '1rem' }}><small>{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</small></td>
                         <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setResultFormData({id: r.id, score: r.score, percentage: r.percentage, timeTaken: r.timeTaken, examId: r.examId}); setShowResultForm(true); }}>Edit</button>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#EF4444' }} onClick={() => handleDeleteResult(r.id, r.examId)}>Del</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
