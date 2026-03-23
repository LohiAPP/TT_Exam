'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { GlassCard } from '@/components/GlassCard';

export type AdminModalVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AdminModalAction {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export interface AdminModalOptions {
  title: string;
  message: string;
  variant?: AdminModalVariant;
  actions?: AdminModalAction[];
  closeOnOverlayClick?: boolean;
}

interface AdminModalProps {
  isOpen: boolean;
  options: AdminModalOptions;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, options, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { title, message, variant = 'info', actions = [], closeOnOverlayClick = true } = options;

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scroll
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (firstElement) firstElement.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      window.addEventListener('keydown', handleTab);
      return () => window.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger': return { color: '#ef4444', icon: '⚠️' };
      case 'warning': return { color: '#f59e0b', icon: '🔔' };
      case 'success': return { color: '#10b981', icon: '✅' };
      default: return { color: 'var(--accent)', icon: 'ℹ️' };
    }
  };

  const styles = getVariantStyles();

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) onClose();
  };

  return (
    <div className={`modal-overlay active`} onClick={handleOverlayClick}>
      <div 
        className="modal-container" 
        ref={modalRef} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <GlassCard className="modal-content admin-modal">
          <div className="modal-header">
            <span className="modal-icon" style={{ color: styles.color }}>{styles.icon}</span>
            <h3 id="admin-modal-title" className="modal-title">{title}</h3>
          </div>
          <div className="modal-body">
            <p className="modal-message">{message}</p>
          </div>
          <div className="modal-actions">
            {actions.length > 0 ? (
              actions.map((action, idx) => (
                <button
                  key={idx}
                  className={`btn ${
                    action.variant === 'danger' ? 'btn-danger' : 
                    action.variant === 'secondary' ? 'btn-outline' :
                    action.variant === 'outline' ? 'btn-outline' : 
                    'btn-primary'
                  }`}
                  onClick={() => {
                    if (action.onClick) action.onClick();
                    onClose();
                  }}
                  style={action.variant === 'danger' ? { backgroundColor: '#ef4444', color: 'white', border: 'none' } : {}}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <button className="btn btn-primary" onClick={onClose}>OK</button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
