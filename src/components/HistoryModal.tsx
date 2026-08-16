import React, { useState } from 'react';
import { Folder, SavedSession } from '../types';
import { decryptSensitiveData } from '../lib/crypto';
import {
  History,
  Search,
  FolderOpen,
  Calendar,
  Lock,
  Trash2,
  ArrowUpRight,
  ShieldCheck,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSessions: SavedSession[];
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onRestoreSession: (session: SavedSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedSessions,
  folders,
  selectedFolderId,
  onSelectFolder,
  onRestoreSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');

  const folderMap = new Map<string, Folder>();
  folders.forEach((f) => folderMap.set(f.id, f));

  const filteredSessions = savedSessions.filter((session) => {
    if (selectedFolderId && session.folderId !== selectedFolderId) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const decryptedName = decryptSensitiveData(session.patientNameEncrypted).toLowerCase();
    const title = session.title.toLowerCase();
    const summary = session.previewSummary.toLowerCase();

    return (
      title.includes(q) ||
      summary.includes(q) ||
      decryptedName.includes(q)
    );
  });

  return (
    <div
      id="history-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#BCABAE]/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#BCABAE]/30 flex items-center justify-between bg-[#FBFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D2E2E] text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F0F0F]">
                Clinical Case History & Reviews
              </h3>
              <p className="text-xs text-[#716969]">
                Browse past explainable DAG reasoning sessions & doctor corrections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#716969] hover:bg-[#BCABAE]/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-[#BCABAE]/20 bg-gray-50 flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#716969] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by diagnosis, clinical history, or patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
            />
          </div>

          {/* Folder Filter Pill List */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => onSelectFolder(null)}
              className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium ${
                selectedFolderId === null
                  ? 'bg-[#2D2E2E] text-white'
                  : 'bg-white border border-[#BCABAE]/40 text-[#716969] hover:text-[#0F0F0F]'
              }`}
            >
              All ({savedSessions.length})
            </button>
            {folders.map((f) => {
              const count = savedSessions.filter((s) => s.folderId === f.id).length;
              const isSelected = selectedFolderId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectFolder(f.id)}
                  className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#00A896] text-white'
                      : 'bg-white border border-[#BCABAE]/40 text-[#716969] hover:text-[#0F0F0F]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : f.color }}
                  />
                  <span>{f.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-[#716969]">
              <FolderOpen className="w-10 h-10 text-[#BCABAE] mb-2" />
              <p className="text-sm font-semibold">No saved sessions found</p>
              <p className="text-xs max-w-sm mt-1">
                Save active reasoning graphs after reviewing to track clinical
                corrections over time.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const folder = session.folderId ? folderMap.get(session.folderId) : undefined;
              const decryptedPatient = decryptSensitiveData(session.patientNameEncrypted);
              const decryptedAgeGender = decryptSensitiveData(session.patientAgeGenderEncrypted);

              return (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-[#BCABAE]/40 hover:border-[#00A896] bg-white transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#0F0F0F]">
                        {session.title}
                      </h4>
                      {folder && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 text-white"
                          style={{ backgroundColor: folder.color || '#00A896' }}
                        >
                          {folder.name}
                        </span>
                      )}
                      {session.overriddenNodesCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {session.overriddenNodesCount} Clinician Override(s)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#2D2E2E] line-clamp-2">
                      {session.previewSummary}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#716969] flex-wrap mt-0.5">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#00A896]" />
                        <span className="font-semibold text-[#0F0F0F]">
                          {decryptedPatient || 'Encrypted Patient'}
                        </span>
                        <span>({decryptedAgeGender || 'Adult'})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(session.createdAt).toLocaleDateString()} at{' '}
                          {new Date(session.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{session.doctorName}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-2 rounded-lg text-[#716969] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                      title="Delete saved session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onRestoreSession(session);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00A896] hover:bg-[#009383] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <span>Load Graph</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 border-t border-[#BCABAE]/20 px-5 flex items-center justify-between text-xs text-[#716969]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00A896]" />
            <span>Sensitive records are AES-256 decrypted in-memory for this authorized session.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#BCABAE] rounded-lg text-xs font-semibold text-[#0F0F0F]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
