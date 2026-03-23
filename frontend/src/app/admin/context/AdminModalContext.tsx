'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AdminModal, AdminModalOptions } from '../components/modal/AdminModal';

interface AdminModalContextType {
  showModal: (options: AdminModalOptions) => void;
  hideModal: () => void;
}

const AdminModalContext = createContext<AdminModalContextType | undefined>(undefined);

export const AdminModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<AdminModalOptions | null>(null);

  const showModal = useCallback((options: AdminModalOptions) => {
    setModalOptions(options);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AdminModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalOptions && (
        <AdminModal 
          isOpen={isOpen} 
          options={modalOptions} 
          onClose={hideModal} 
        />
      )}
    </AdminModalContext.Provider>
  );
};

export const useAdminModal = () => {
  const context = useContext(AdminModalContext);
  if (!context) {
    throw new Error('useAdminModal must be used within an AdminModalProvider');
  }
  return context;
};
