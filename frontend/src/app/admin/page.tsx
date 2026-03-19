'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { GlassCard } from '@/components/GlassCard';

// SVG Icons
const Icons = {
  Dashboard: ({ active }: { active?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#0F172A" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="11" width="7" height="10"></rect><rect x="3" y="15" width="7" height="6"></rect></svg>
  ),
  Exams: ({ active }: { active?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#0F172A" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  ),
  Questions: ({ active }: { active?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#0F172A" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  ),
  Results: ({ active }: { active?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#0F172A" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  )
};

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: Icons.Dashboard },
    { id: 'exams', label: 'Exams', Icon: Icons.Exams },
    { id: 'questions', label: 'Questions', Icon: Icons.Questions },
    { id: 'results', label: 'Results', Icon: Icons.Results }
  ];

  if (loading) return <div className="container flex-center" style={{ minHeight: '80vh' }}>Loading Dashboard...</div>;

  return (
    <>
      <nav className="mobile-nav-bar">
        {navItems.map(item => (
          <div 
            key={item.id} 
            className={`nav-icon ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.Icon active={activeTab === item.id} />
          </div>
        ))}
      </nav>

      <div className="admin-layout">
        <aside className="sidebar">
          <h2 style={{ color: 'var(--accent)', marginBottom: '2.5rem', paddingLeft: '1rem', background: 'linear-gradient(to right, #06B6D4, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Admin Panel</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map(item => (
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
                <item.Icon active={activeTab === item.id} />
                <span style={{ marginLeft: '0.75rem' }}>{item.label}</span>
              </button>
            ))}
            <button 
              className="btn btn-outline" 
              style={{ marginTop: 'auto', color: '#EF4444', borderColor: '#EF4444', justifyContent: 'flex-start' }}
              onClick={() => { localStorage.removeItem('isAdminLoggedIn'); router.push('/admin/login'); }}
            >
               <Icons.Logout />
               <span style={{ marginLeft: '0.75rem' }}>Logout</span>
            </button>
          </nav>
        </aside>

        <main className="main-content" style={{ flex: 1, paddingBottom: '90px' }}>
          {activeTab === 'dashboard' && (
            <div className="animate-fade">
              <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <GlassCard style={{ padding: '2rem', borderTop: '4px solid #06B6D4' }}>
                  <p className="text-muted">Total Users</p>
                  <h2 style={{ fontSize: '2.5rem', color: '#06B6D4' }}>{stats.totalUsers}</h2>
                </GlassCard>
                <GlassCard style={{ padding: '2rem', borderTop: '4px solid #A855F7' }}>
                  <p className="text-muted">Total Attempts</p>
                  <h2 style={{ fontSize: '2.5rem', color: '#A855F7' }}>{stats.totalAttempts}</h2>
                </GlassCard>
                <GlassCard style={{ padding: '2rem', borderTop: '4px solid #10B981' }}>
                  <p className="text-muted">Active Exams</p>
                  <h2 style={{ fontSize: '2.5rem', color: '#10B981' }}>{stats.activeExams}</h2>
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="animate-fade">
              <div className="admin-header">
                <h1>Exam Management</h1>
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setIsEditingExam(false); setExamFormData({ id: '', title: '', examId: '', duration: 60, startTime: '', endTime: '', totalQuestions: 10, isActive: true }); setShowExamForm(true); }}>+ Create Exam</button>
              </div>

              {showExamForm && (
                <GlassCard className="mb-8">
                  <h3>{isEditingExam ? 'Edit' : 'Create'} Exam</h3>
                  <form onSubmit={handleSaveExam} className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div className="grid-2">
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="text-muted">Title</label>
                        <input type="text" value={examFormData.title} onChange={e => setExamFormData({...examFormData, title: e.target.value})} placeholder="Final Term Exam" required />
                      </div>
                      <div className="form-group">
                        <label className="text-muted">Exam ID (Slug)</label>
                        <input type="text" value={examFormData.examId} onChange={e => setExamFormData({...examFormData, examId: e.target.value})} placeholder="final-2024" required />
                      </div>
                      <div className="form-group">
                        <label className="text-muted">Duration (Mins)</label>
                        <input type="number" value={examFormData.duration} onChange={e => setExamFormData({...examFormData, duration: parseInt(e.target.value)})} required />
                      </div>
                      <div className="form-group">
                        <label className="text-muted">Start Time</label>
                        <input type="datetime-local" value={examFormData.startTime} onChange={e => setExamFormData({...examFormData, startTime: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="text-muted">End Time</label>
                        <input type="datetime-local" value={examFormData.endTime} onChange={e => setExamFormData({...examFormData, endTime: e.target.value})} required />
                      </div>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" id="isActive" checked={examFormData.isActive} onChange={e => setExamFormData({...examFormData, isActive: e.target.checked})} />
                        <label htmlFor="isActive">Is Active?</label>
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                      <button type="submit" className="btn btn-primary">{isEditingExam ? 'Update' : 'Save'} Exam</button>
                      <button type="button" className="btn btn-outline" onClick={() => setShowExamForm(false)}>Cancel</button>
                    </div>
                  </form>
                </GlassCard>
              )}

              <div className="glass" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
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
                          <strong style={{ color: 'var(--accent)' }}>{e.title}</strong>
                          <br/><small className="text-muted">{e.examId}</small>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <small>{new Date(e.startTime).toLocaleString()} - </small>
                          <br/><small>{new Date(e.endTime).toLocaleString()}</small>
                        </td>
                        <td style={{ padding: '1rem' }}>
                           <span style={{ background: e.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: e.isActive ? '#10B981' : '#EF4444', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>{e.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div className="flex gap-2">
                             <button className="btn btn-outline btn-icon" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} title="Edit" onClick={() => handleEditExam(e)}>✍️</button>
                             <button className="btn btn-outline btn-icon" style={{ borderColor: '#EF4444', color: '#EF4444' }} title="Delete" onClick={() => handleDeleteExam(e.id)}>🗑️</button>
                             <button className="btn btn-primary btn-icon" title="Manage Questions" onClick={() => { setActiveTab('questions'); fetchQuestions(e.id); setQuestionFormData({...questionFormData, examId: e.id}); }}>❓</button>
                          </div>
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
              <div className="admin-header">
                <h1>Question Bank</h1>
                <div className="flex gap-3 mobile-stack w-full sm-w-auto">
                  <select 
                    className="btn glass w-full sm-w-auto" 
                    value={selectedExamId} 
                    onChange={e => fetchQuestions(e.target.value)}
                    style={{ background: '#0F172A', color: 'white', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}
                  >
                    <option value="" style={{ background: '#0F172A', color: 'white' }}>Select Exam</option>
                    {exams.map(e => <option key={e.id} value={e.id} style={{ background: '#0F172A', color: 'white' }}>{e.title}</option>)}
                  </select>
                  <div className="flex gap-2 w-full sm-w-auto">
                    <button className="btn btn-outline btn-icon" title="View Format" onClick={() => setShowImportPreview(true)}>ℹ️</button>
                    <input 
                      type="file" 
                      accept=".xlsx, .csv" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleImportFile}
                    />
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1 }}
                      disabled={!selectedExamId || importing} 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {importing ? '⌛' : '📤 Bulk Import'}
                    </button>
                    <button className="btn btn-primary btn-icon" disabled={!selectedExamId} onClick={() => { setQuestionFormData({ id: '', examId: selectedExamId, question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A' }); setShowQuestionForm(true); }}>+</button>
                  </div>
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
                </GlassCard>
              )}

              {showQuestionForm && (
                <GlassCard className="mb-8">
                  <h3>{questionFormData.id ? 'Edit' : 'Add'} Question</h3>
                  <form onSubmit={handleSaveQuestion} className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea value={questionFormData.question} onChange={e => setQuestionFormData({...questionFormData, question: e.target.value})} placeholder="What is the question?" required rows={3} />
                    <div className="grid-2">
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
                    <div className="grid-2">
                      <button type="submit" className="btn btn-primary">Save</button>
                      <button type="button" className="btn btn-outline" onClick={() => setShowQuestionForm(false)}>Cancel</button>
                    </div>
                  </form>
                </GlassCard>
              )}

              <div className="glass" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {!selectedExamId ? <p style={{ padding: '2rem', textAlign: 'center' }}>Please select an exam to manage questions.</p> : questions.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center' }}>No questions found for this exam.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
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
                           <td style={{ padding: '1rem' }}>{q.question.substring(0, 60)}...</td>
                           <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{q.correct}</td>
                           <td style={{ padding: '1rem' }}>
                             <div className="flex gap-2">
                               <button className="btn btn-outline btn-icon" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={() => { setQuestionFormData(q); setShowQuestionForm(true); }}>✍️</button>
                               <button className="btn btn-outline btn-icon" style={{ borderColor: '#EF4444', color: '#EF4444' }} onClick={() => handleDeleteQuestion(q.id, q.examId)}>🗑️</button>
                             </div>
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
               <div className="admin-header">
                <h1>User Results</h1>
                <div className="flex gap-4 mobile-stack w-full sm-w-auto">
                  <select 
                    className="btn glass w-full sm-w-auto" 
                    value={selectedExamId}
                    onChange={e => { fetchResults(e.target.value); }}
                    style={{ background: '#0F172A', color: 'white', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}
                  >
                    <option value="" style={{ background: '#0F172A', color: 'white' }}>Select Exam</option>
                    {exams.map(e => <option key={e.id} value={e.id} style={{ background: '#0F172A', color: 'white' }}>{e.title}</option>)}
                  </select>
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleExport} disabled={!selectedExamId}>📥 Export CSV</button>
                </div>
              </div>

              {showResultForm && (
                <GlassCard className="mb-8">
                  <h3>Edit Result</h3>
                  <form onSubmit={handleSaveResult} className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="text-muted">Score</label>
                        <input type="number" value={resultFormData.score} onChange={e => setResultFormData({...resultFormData, score: parseInt(e.target.value)})} required />
                      </div>
                      <div className="form-group">
                        <label className="text-muted">Percentage</label>
                        <input type="number" step="0.01" value={resultFormData.percentage} onChange={e => setResultFormData({...resultFormData, percentage: parseFloat(e.target.value)})} required />
                      </div>
                      <div className="form-group">
                        <label className="text-muted">Time Taken (Secs)</label>
                        <input type="number" value={resultFormData.timeTaken} onChange={e => setResultFormData({...resultFormData, timeTaken: parseInt(e.target.value)})} required />
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                      <button type="submit" className="btn btn-primary">Update Result</button>
                      <button type="button" className="btn btn-outline" onClick={() => setShowResultForm(false)}>Cancel</button>
                    </div>
                  </form>
                </GlassCard>
              )}

              <div className="glass" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {results.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center' }}>Select an exam to view user performance.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
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
                            <strong style={{ color: 'var(--accent)' }}>{r.user.name}</strong>
                            <br/><small className="text-muted">{r.user.rollNo}</small>
                         </td>
                         <td style={{ padding: '1rem' }}>
                            <strong>{r.user.location}</strong>
                            <br/><small className="text-muted">{r.user.pincode}</small>
                         </td>
                         <td style={{ padding: '1rem', fontWeight: 700 }}>{r.score}</td>
                         <td style={{ padding: '1rem' }}>
                            <span style={{ color: r.percentage >= 50 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>{Math.round(r.percentage)}%</span>
                         </td>
                         <td style={{ padding: '1rem' }}><small>{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</small></td>
                         <td style={{ padding: '1rem' }}>
                           <div className="flex gap-2">
                              <button className="btn btn-outline btn-icon" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={() => { setResultFormData({id: r.id, score: r.score, percentage: r.percentage, timeTaken: r.timeTaken, examId: r.examId}); setShowResultForm(true); }}>✍️</button>
                              <button className="btn btn-outline btn-icon" style={{ borderColor: '#EF4444', color: '#EF4444' }} onClick={() => handleDeleteResult(r.id, r.examId)}>🗑️</button>
                           </div>
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
  </>
  );
}
