'use client';

import { ReactNode } from 'react';
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "react-hot-toast";
import Navigation from "@/components/Navigation";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 md:ml-20 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
} 