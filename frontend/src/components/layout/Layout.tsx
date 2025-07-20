
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-[250px] fixed top-0 left-0 h-screen bg-white shadow-lg z-50">
        <Sidebar isOpen={true} onClose={closeSidebar} />
      </aside>

      {/* Contenu principal */}
      <div className="ml-[250px] w-full h-screen overflow-y-auto flex flex-col">
        <Header onMenuToggle={toggleSidebar} />
        <main className="flex-1 px-4 py-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
