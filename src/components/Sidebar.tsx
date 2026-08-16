import React, { useState } from 'react';
import { Folder, SavedSession } from '../types';
import {
  Plus,
  Home,
  Network,
  History,
  FolderOpen,
  HelpCircle,
  LogOut,
  FolderPlus,
  ChevronRight,
  Shield,
  Stethoscope,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'graph' | 'history' | 'analytics' | 'reports';
  setCurrentView: (view: 'graph' | 'history' | 'analytics' | 'reports') => void;
  onNewAnalysis: () => void;
  folders: Folder[];
  savedSessions: SavedSession[];
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId: string | null;
  onCreateFolder: (name: string, description?: string) => void;
  onOpenHelp: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  setCurrentView,
  onNewAnalysis,
  folders,
  savedSessions,
  onSelectFolder,
  selectedFolderId,
  onCreateFolder,
  onOpenHelp,
  onSignOut,
}) => {
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowAddFolderInput(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-15 bottom-0 left-0 z-35 w-64 bg-[#FBFBFB] border-r border-[#BCABAE]/30 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!isOpen ? 'lg:hidden' : 'lg:flex'}`}
      >
        {/* Top Section: Title & New Analysis CTA */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#0F0F0F] text-base leading-tight flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#00A896]" />
                Medical AI
              </span>
              <span className="text-[11px] font-medium text-[#716969] tracking-tight">
                Clinical Review Mode
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-[#716969] hover:bg-[#BCABAE]/20"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* "+ New Analysis" CTA button matching Image 2 */}
          <button
            id="btn-new-analysis"
            onClick={() => {
              onNewAnalysis();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#38BDF8] hover:bg-[#0EA5E9] active:bg-[#0284C7] text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Analysis</span>
          </button>

          {/* Primary Navigation List */}
          <nav className="flex flex-col gap-1 mt-1">
            <button
              id="sidebar-nav-home"
              onClick={() => {
                onNewAnalysis();
                setCurrentView('graph');
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/15 transition-colors text-left"
            >
              <Home className="w-4 h-4 text-[#716969]" />
              <span>Home</span>
            </button>

            <button
              id="sidebar-nav-reasoning-graph"
              onClick={() => {
                setCurrentView('graph');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all text-left ${
                currentView === 'graph'
                  ? 'bg-[#1E4D4F] text-white shadow-xs'
                  : 'text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/15'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Reasoning Graph</span>
            </button>

            <button
              id="sidebar-nav-history"
              onClick={() => {
                setCurrentView('history');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all text-left ${
                currentView === 'history'
                  ? 'bg-[#1E4D4F] text-white shadow-xs'
                  : 'text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/15'
              }`}
            >
              <History className="w-4 h-4" />
              <div className="flex items-center justify-between w-full">
                <span>History</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#BCABAE]/25 text-[#2D2E2E] font-semibold">
                  {savedSessions.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Folders & Saved Cases Section (Pinned bottom area in sidebar) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-[#BCABAE]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#716969] uppercase tracking-wider">
              Folders / Departments
            </span>
            <button
              id="btn-add-folder-toggle"
              onClick={() => setShowAddFolderInput(!showAddFolderInput)}
              className="p-1 rounded-md text-[#716969] hover:text-[#00A896] hover:bg-[#BCABAE]/20 transition-colors"
              title="Add New Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showAddFolderInput && (
            <form onSubmit={handleCreateFolder} className="mb-2">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#BCABAE] bg-white text-[#0F0F0F] focus:outline-none focus:ring-1 focus:ring-[#00A896]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1.5 bg-[#00A896] text-white text-xs font-semibold rounded-lg hover:bg-[#009383]"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {/* All Cases option */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => {
                onSelectFolder(null);
                setCurrentView('history');
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                selectedFolderId === null && currentView === 'history'
                  ? 'bg-[#BCABAE]/25 font-semibold text-[#0F0F0F]'
                  : 'text-[#716969] hover:bg-[#BCABAE]/10 hover:text-[#0F0F0F]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FolderOpen className="w-3.5 h-3.5 text-[#716969]" />
                <span className="truncate">All Saved Cases</span>
              </div>
              <span className="text-[10px] text-[#716969]">
                {savedSessions.length}
              </span>
            </button>

            {folders.map((folder) => {
              const count = savedSessions.filter((s) => s.folderId === folder.id).length;
              const isSelected = selectedFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectFolder(folder.id);
                    setCurrentView('history');
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                    isSelected && currentView === 'history'
                      ? 'bg-[#BCABAE]/25 font-semibold text-[#0F0F0F]'
                      : 'text-[#716969] hover:bg-[#BCABAE]/10 hover:text-[#0F0F0F]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color || '#00A896' }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="text-[10px] text-[#716969]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Area inside Sidebar matching Image 2 */}
        <div className="p-4 border-t border-[#BCABAE]/30 flex flex-col gap-1 bg-[#FBFBFB]">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#716969] font-medium">
            <Shield className="w-3.5 h-3.5 text-[#00A896]" />
            <span>AES-256 Encrypted Store</span>
          </div>

          <button
            id="sidebar-btn-help"
            onClick={onOpenHelp}
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/15 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Clinical Guide & Help</span>
          </button>

          <button
            id="sidebar-btn-signout"
            onClick={onSignOut}
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-[#716969] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
