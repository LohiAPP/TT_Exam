'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ModalType = 'info' | 'warning' | 'danger' | 'confirm';

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showModal = useCallback((newOptions: ModalOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    // Don't clear options immediately to allow for exit animation
  }, []);

  const handleConfirm = useCallback(() => {
    if (options?.onConfirm) options.onConfirm();
    hideModal();
  }, [options, hideModal]);

  const handleCancel = useCallback(() => {
    if (options?.onCancel) options.onCancel();
    hideModal();
  }, [options, hideModal]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {options && (
        <Modal 
          isOpen={isOpen} 
          options={options} 
          onConfirm={handleConfirm} 
          onCancel={handleCancel} 
          onClose={hideModal}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Modal Component defined locally for simplicity in exports, or could be a separate file
import { GlassCard } from './GlassCard';

interface ModalProps {
  isOpen: boolean;
  options: ModalOptions;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, options, onConfirm, onCancel, onClose }) => {
  if (!isOpen && !options) return null;

  const { title, message, type = 'info', confirmLabel = 'Confirm', cancelLabel = 'Cancel' } = options;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger': return { color: '#ef4444', icon: '⚠️' };
      case 'warning': return { color: '#f59e0b', icon: '🔔' };
      case 'confirm': return { color: 'var(--accent)', icon: '❓' };
      default: return { color: 'var(--accent)', icon: 'ℹ️' };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <GlassCard className="modal-content">
          <div className="modal-header">
            <span className="modal-icon" style={{ color: styles.color }}>{styles.icon}</span>
            <h3 className="modal-title">{title}</h3>
          </div>
          <p className="modal-message">{message}</p>
          <div className="modal-actions">
            {(type === 'confirm' || type === 'danger' || type === 'warning') && (
              <button className="btn btn-outline" onClick={onCancel}>
                {cancelLabel}
              </button>
            )}
            <button 
              className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
              onClick={onConfirm}
              style={type === 'danger' ? { backgroundColor: '#ef4444', color: 'white', border: 'none' } : {}}
            >
              {type === 'info' ? 'OK' : confirmLabel}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
