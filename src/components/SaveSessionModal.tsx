import React, { useState } from 'react';
import { Folder, ReasoningDAG, SavedSession, UserProfile } from '../types';
import { encryptSensitiveData } from '../lib/crypto';
import {
  BookmarkPlus,
  FolderOpen,
  FolderPlus,
  ShieldCheck,
  X,
  Lock,
  Check,
} from 'lucide-react';

interface SaveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dag: ReasoningDAG | null;
  folders: Folder[];
  onCreateFolder: (name: string, description?: string) => void;
  onSaveSession: (session: SavedSession) => void;
  user: UserProfile | null;
}

export const SaveSessionModal: React.FC<SaveSessionModalProps> = ({
  isOpen,
  onClose,
  dag,
  folders,
  onCreateFolder,
  onSaveSession,
  user,
}) => {
  if (!isOpen || !dag) return null;

  const [title, setTitle] = useState(
    `Review: ${dag.summaryDiagnosis || 'Clinical Case'}`
  );
  const [patientName, setPatientName] = useState('Patient Record');
  const [patientAgeGender, setPatientAgeGender] = useState('Adult');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    folders[0]?.id || ''
  );
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const overriddenCount = dag.nodes.filter((n) => n.flaggedIncorrect).length;

    const newSession: SavedSession = {
      id: `session-${Date.now()}`,
      title: title.trim() || 'Clinical Review Session',
      patientNameEncrypted: encryptSensitiveData(patientName),
      patientAgeGenderEncrypted: encryptSensitiveData(patientAgeGender),
      patientPromptEncrypted: encryptSensitiveData(dag.prompt),
      previewSummary: dag.summaryDiagnosis,
      dagData: dag,
      folderId: selectedFolderId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctorEmail: user?.email || 'physician@hospital.org',
      doctorName: user?.name || 'Dr. Attending Physician, MD',
      overriddenNodesCount: overriddenCount,
    };

    onSaveSession(newSession);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      id="save-session-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#BCABAE]/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#BCABAE]/30 flex items-center justify-between bg-[#FBFBFB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00A896]/15 text-[#00A896] flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F0F0F]">
                Save Reasoning Review
              </h3>
              <p className="text-xs text-[#716969]">
                Organize this XAI clinical graph into department folders
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

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
          {/* Encryption Badge */}
          <div className="p-3 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl flex items-center gap-2.5 text-xs text-[#0D9488]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              <strong>HIPAA & AES-256 At-Rest:</strong> Patient demographics and
              raw clinical prompts will be encrypted before persistence.
            </span>
          </div>

          {/* Session Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#0F0F0F]">
              Review Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
            />
          </div>

          {/* Patient Identifiers to Encrypt */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#716969] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#00A896]" /> Patient Name / ID
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#716969] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#00A896]" /> Age & Gender
              </label>
              <input
                type="text"
                value={patientAgeGender}
                onChange={(e) => setPatientAgeGender(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>
          </div>

          {/* Folder Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F0F0F]">
                Target Folder / Department
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                className="text-xs text-[#00A896] hover:underline font-semibold flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ New Folder</span>
              </button>
            </div>

            {isCreatingFolder && (
              <div className="p-2.5 bg-gray-50 border border-[#BCABAE]/40 rounded-xl flex items-center gap-2 mb-1">
                <input
                  type="text"
                  placeholder="New folder title..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#BCABAE] bg-white"
                />
                <button
                  type="button"
                  onClick={handleCreateNewFolder}
                  className="px-3 py-1 bg-[#00A896] text-white text-xs font-semibold rounded-lg"
                >
                  Create
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {folders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;
                return (
                  <button
                    type="button"
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'border-[#00A896] bg-[#F0FDFA] font-bold text-[#0D9488]'
                        : 'border-[#BCABAE]/40 hover:bg-gray-50 text-[#0F0F0F]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color || '#00A896' }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#BCABAE]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#716969] hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="flex items-center gap-2 px-5 py-2 bg-[#00A896] hover:bg-[#009383] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved Encrypted!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Save Review Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
