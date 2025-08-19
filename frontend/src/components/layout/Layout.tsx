
import React from 'react';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar Desktop - Fixe à gauche */}
      <aside className="w-[250px] fixed top-0 left-0 h-screen bg-white shadow-lg z-50 hidden lg:flex">
        <Sidebar />
      </aside>

      {/* Contenu principal */}
      <div className="lg:ml-[250px] w-full h-screen overflow-y-auto flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Navigation Mobile - Barre fixe en bas */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <MobileSidebar />
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
