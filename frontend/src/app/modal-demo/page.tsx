'use client';

import React from 'react';
import { useModal } from '@/components/ModalContext';
import { GlassCard } from '@/components/GlassCard';

export default function ModalDemo() {
  const { showModal } = useModal();

  const handleInfo = () => {
    showModal({
      title: 'Information',
      message: 'This is a custom modal system! It replaces standard browser alerts with a modern glassmorphism design.',
      type: 'info'
    });
  };

  const handleWarning = () => {
    showModal({
      title: 'System Warning',
      message: 'Your session is about to expire. Please save your work before proceeding.',
      type: 'warning',
      confirmLabel: 'Extend Session',
      cancelLabel: 'Logout',
      onConfirm: () => console.log('Session extended'),
      onCancel: () => console.log('Logging out')
    });
  };

  const handleDanger = () => {
    showModal({
      title: 'Delete Resource?',
      message: 'Are you sure you want to delete this item? This action is permanent and cannot be undone.',
      type: 'danger',
      confirmLabel: 'Delete Permanently',
      cancelLabel: 'Keep It',
      onConfirm: () => alert('Deleted successfully! (from callback)'),
    });
  };

  const handleConfirm = () => {
    showModal({
      title: 'Action Required',
      message: 'Do you want to apply these changes to the entire database?',
      type: 'confirm',
      confirmLabel: 'Apply Changes',
      onConfirm: () => console.log('Changes applied'),
      onCancel: () => console.log('Cancelled')
    });
  };

  return (
    <div className="container" style={{ paddingTop: '100px' }}>
      <GlassCard style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="mb-6">Modal System Demo</h1>
        <p className="text-muted mb-6">
          Click the buttons below to see different types of modals. These modals 
          are fully responsive, styled with glassmorphism, and can be triggered 
          from anywhere in the application using the <code>useModal</code> hook.
        </p>
        
        <div className="grid-2">
          <button className="btn btn-primary" onClick={handleInfo}>
            Show Info Modal
          </button>
          
          <button className="btn btn-outline" onClick={handleConfirm} style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            Show Confirm Modal
          </button>
          
          <button className="btn btn-outline" onClick={handleWarning} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
            Show Warning Modal
          </button>
          
          <button className="btn btn-danger" onClick={handleDanger}>
            Show Danger Modal
          </button>
        </div>

        <div className="mt-4" style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
          <h3>Benefits:</h3>
          <ul style={{ color: 'var(--text-muted)', marginTop: '1rem', paddingLeft: '1.5rem' }}>
            <li>Consistency: Same UI across all pages.</li>
            <li>Branding: Aligns with the app's glassmorphism theme.</li>
            <li>Usability: Clear visual cues (icons, colors) for different action types.</li>
            <li>Accessibility: Centered, blurred background to focus attention.</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}
