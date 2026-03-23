'use client';

import React from 'react';
import { AdminModalProvider } from './context/AdminModalContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminModalProvider>
      {children}
    </AdminModalProvider>
  );
}
