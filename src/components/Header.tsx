import React from 'react';
import { AightLogo } from './AightLogo';
import { UserProfile } from '../types';
import {
  Menu,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  BookmarkPlus,
  ShieldCheck,
  FolderGit2,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTab: 'dashboard' | 'analytics' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'reports') => void;
  screenMode: 'prompt-entry' | 'dag-review';
  onSetScreenMode: (mode: 'prompt-entry' | 'dag-review') => void;
  onOpenSettings: () => void;
  onOpenSaveSession: () => void;
  user: UserProfile | null;
  onSignOut: () => void;
  hasActiveDAG: boolean;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  activeTab,
  setActiveTab,
  screenMode,
  onSetScreenMode,
  onOpenSettings,
  onOpenSaveSession,
  user,
  onSignOut,
  hasActiveDAG,
  onOpenHistory,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full h-14 sm:h-15 bg-[#FBFBFB] border-b border-[#BCABAE]/30 px-3 sm:px-5 flex items-center justify-between select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)] shrink-0"
    >
      {/* Left section: Hamburger & Logo & Nav Links */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 rounded-lg text-[#2D2E2E] hover:bg-[#BCABAE]/20 transition-colors focus:outline-none"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5 text-[#2D2E2E]" />
        </button>

        <button
          id="btn-logo-home"
          onClick={() => {
            setActiveTab('dashboard');
            onSetScreenMode('prompt-entry');
          }}
          className="cursor-pointer focus:outline-none flex items-center"
        >
          <AightLogo size={26} textColor="text-[#0F0F0F]" />
        </button>

        {/* Screen Mode Switcher Pills (Prompt Entry vs DAG Review) */}
        <div className="flex items-center bg-[#BCABAE]/15 p-0.5 rounded-lg border border-[#BCABAE]/30 text-xs font-semibold">
          <button
            id="header-btn-mode-prompt"
            onClick={() => onSetScreenMode('prompt-entry')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              screenMode === 'prompt-entry'
                ? 'bg-white text-[#0F0F0F] shadow-xs'
                : 'text-[#716969] hover:text-[#0F0F0F]'
            }`}
          >
            1. Case Input
          </button>
          <button
            id="header-btn-mode-dag"
            onClick={() => onSetScreenMode('dag-review')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              screenMode === 'dag-review'
                ? 'bg-[#00A896] text-white shadow-xs'
                : 'text-[#716969] hover:text-[#0F0F0F]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>2. Reasoning DAG</span>
            {!hasActiveDAG && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-80 ml-0.5" />
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1.5 ml-2">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#2D2E2E] text-[#FBFBFB] shadow-xs'
                : 'text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/15'
            }`}
          >
            Dashboard
          </button>
          <button
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#2D2E2E] text-[#FBFBFB] shadow-xs'
                : 'text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/15'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            id="nav-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-[#2D2E2E] text-[#FBFBFB] shadow-xs'
                : 'text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/15'
            }`}
          >
            <FileText className="w-4 h-4" />
            Reports & Rx
          </button>
        </nav>
      </div>

      {/* Right section: Action Tools & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {hasActiveDAG && (
          <button
            id="btn-save-session-header"
            onClick={onOpenSaveSession}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A896] hover:bg-[#009383] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            title="Save clinical reasoning DAG into a folder"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Save Session</span>
          </button>
        )}

        <button
          id="btn-open-history-header"
          onClick={onOpenHistory}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-[#BCABAE]/40 text-[#2D2E2E] hover:bg-[#BCABAE]/15 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer"
          title="Browse Saved Patient Cases"
        >
          <FolderGit2 className="w-4 h-4 text-[#716969]" />
          <span>Case History</span>
        </button>

        {/* Settings button */}
        <button
          id="btn-settings-header"
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/20 transition-colors focus:outline-none"
          title="Clinical & Model Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User profile dropdown / status */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-[#BCABAE]/30">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#0F0F0F] leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-[#716969] leading-tight">
                {user.specialty}
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-full bg-[#2D2E2E] text-[#FBFBFB] flex items-center justify-center font-bold text-xs shadow-inner cursor-pointer"
              title={`${user.name} (${user.email}) - ${user.hospitalAffiliation}`}
            >
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <button
              id="btn-signout-header"
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-[#716969] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              title="Sign Out of AIGHT"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="btn-login-header"
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 border border-[#BCABAE] rounded-lg text-sm font-semibold text-[#0F0F0F] hover:bg-[#BCABAE]/20 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};
