'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const username = form.username.trim();
    const password = form.password.trim();
    
    if (username === 'admin' && password === 'admin123') {
      const session = {
        isLoggedIn: true,
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('adminSession', JSON.stringify(session));
      router.push('/admin');
    } else {
      alert('Invalid username or password.');
    }
  };

  return (
    <main className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label>Username</label>
            <input 
              type="text" 
              value={form.username} 
              onChange={(e) => setForm({...form, username: e.target.value})} 
            />
          </div>
          <div className="mb-4">
            <label>Password</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </main>
  );
}
