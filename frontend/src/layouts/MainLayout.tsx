import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { VoiceAssistantModal } from '../components/voice/VoiceAssistantModal';

export const MainLayout: React.FC = () => {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  // Desktop collapsible state with persistent user preference
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('nilam_pesum_sidebar_collapsed') === 'true';
  });

  // Mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nilam_pesum_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans selection:bg-leaf-600 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenVoice={() => setVoiceOpen(true)}
        onToggleMobileSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex w-full relative">
        {/* Collapsible & Expandable Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Responsive Main Content: Automatically expands when sidebar collapses */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'md:ml-20' : 'md:ml-64'
          } p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto overflow-x-hidden`}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Quick Actions */}
      <BottomNav onOpenVoice={() => setVoiceOpen(true)} />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
};
