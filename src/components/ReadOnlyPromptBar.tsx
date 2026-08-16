import React, { useState } from 'react';
import {
  Lock,
  Eye,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  ArrowLeft,
  Sparkles,
  Shield,
  Stethoscope,
  Maximize2,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface ReadOnlyPromptBarProps {
  prompt: string;
  currentInputPrompt?: string;
  patientName?: string;
  patientAgeGender?: string;
  mrn?: string;
  allergies?: string;
  onReturnToPromptEntry: () => void;
  onRegenerateWithNewPrompt?: () => void;
  reasoningStepsCount: number;
  isLoading?: boolean;
}

export const ReadOnlyPromptBar: React.FC<ReadOnlyPromptBarProps> = ({
  prompt,
  currentInputPrompt,
  patientName = 'John Doe',
  patientAgeGender = '62M',
  mrn = 'MRN-884920',
  allergies = 'NKDA',
  onReturnToPromptEntry,
  onRegenerateWithNewPrompt,
  reasoningStepsCount,
  isLoading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  const isPromptModified =
    currentInputPrompt &&
    currentInputPrompt.trim().length > 0 &&
    currentInputPrompt.trim() !== prompt.trim();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        id="readonly-prompt-header-bar"
        className="w-full bg-[#FBFBFB] border-b border-[#BCABAE]/30 px-3 sm:px-5 py-2.5 shadow-xs select-none shrink-0"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Left section: Read-Only Badge & Patient Summary */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Return / Edit baseline case button */}
            <button
              id="btn-back-to-prompt-entry"
              onClick={onReturnToPromptEntry}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#BCABAE]/15 hover:bg-[#BCABAE]/30 text-[#0F0F0F] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#BCABAE]/30 shrink-0 cursor-pointer"
              title="Return to case setup to modify prompt or select template"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Case Input</span>
            </button>

            {/* Read-Only Status Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#0284C7] text-[11px] font-bold shrink-0">
              <Lock className="w-3 h-3 text-[#0284C7]" />
              <span>Active DAG Baseline</span>
            </div>

            {/* Patient Meta chips */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#716969] shrink-0 font-medium">
              <span className="px-2 py-0.5 bg-white border border-[#BCABAE]/40 rounded-md text-[#0F0F0F] font-bold">
                {patientName} ({patientAgeGender})
              </span>
              <span className="px-2 py-0.5 bg-white border border-[#BCABAE]/40 rounded-md">
                {mrn}
              </span>
              <span className="px-2 py-0.5 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[#DC2626] font-semibold truncate max-w-[120px]">
                {allergies}
              </span>
            </div>

            {/* Truncated Prompt Preview */}
            <div
              onClick={() => setShowFullModal(true)}
              className="flex-1 truncate text-xs text-[#0F0F0F] bg-white hover:bg-gray-50 border border-[#BCABAE]/40 px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-colors"
              title="Click to view full clinical presentation prompt"
            >
              <span className="truncate italic text-[#716969]">
                "{prompt.trim()}"
              </span>
              <span className="text-[10px] font-bold text-[#00A896] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Inspect
              </span>
            </div>
          </div>

          {/* Right section: Prompt Modified Sync Warning OR Graph step count & Quick Actions */}
          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
            {isPromptModified && onRegenerateWithNewPrompt && (
              <button
                id="btn-sync-new-prompt-dag"
                onClick={onRegenerateWithNewPrompt}
                disabled={isLoading}
                className="px-2.5 py-1 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="You entered a different prompt in Case Input. Click to generate a new reasoning DAG for it."
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>새 프롬프트 DAG 갱신</span>
              </button>
            )}

            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#00A896]/10 text-[#00A896] border border-[#00A896]/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{reasoningStepsCount} Graph Steps</span>
            </span>

            <button
              onClick={handleCopy}
              className="p-1.5 text-xs font-medium text-[#716969] hover:text-[#0F0F0F] bg-white border border-[#BCABAE]/40 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              title="Copy clinical prompt to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00A896]" />
                  <span className="text-[10px] text-[#00A896]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Prompt Read-Only Modal */}
      {showFullModal && (
        <div
          id="full-prompt-modal-backdrop"
          onClick={() => setShowFullModal(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#FBFBFB] rounded-2xl border border-[#BCABAE]/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#BCABAE]/30 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/15 text-[#0284C7] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F0F0F]">
                    Active Clinical Presentation (Read-Only Baseline)
                  </h3>
                  <p className="text-[11px] text-[#716969]">
                    Baseline clinical parameters used to synthesize this reasoning DAG
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullModal(false)}
                className="p-1 rounded-lg text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Patient Meta Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 bg-white rounded-xl border border-[#BCABAE]/30">
                  <div className="text-[10px] uppercase font-bold text-[#716969]">Patient</div>
                  <div className="font-bold text-[#0F0F0F] text-xs">{patientName}</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#BCABAE]/30">
                  <div className="text-[10px] uppercase font-bold text-[#716969]">Age/Gender</div>
                  <div className="font-bold text-[#0F0F0F] text-xs">{patientAgeGender}</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-[#BCABAE]/30">
                  <div className="text-[10px] uppercase font-bold text-[#716969]">MRN</div>
                  <div className="font-bold text-[#0F0F0F] text-xs">{mrn}</div>
                </div>
                <div className="p-2 bg-[#FEF2F2] rounded-xl border border-[#FECACA]">
                  <div className="text-[10px] uppercase font-bold text-[#DC2626]">Allergies</div>
                  <div className="font-bold text-[#DC2626] text-xs truncate">{allergies}</div>
                </div>
              </div>

              {/* Full Text Presentation */}
              <div className="p-4 bg-white rounded-xl border border-[#BCABAE]/40 leading-relaxed text-[#0F0F0F] whitespace-pre-wrap font-mono text-xs">
                {prompt}
              </div>

              <div className="p-3 bg-[#00A896]/10 border border-[#00A896]/20 rounded-xl text-[#004D4D] flex items-start gap-2 text-xs">
                <Shield className="w-4 h-4 text-[#00A896] shrink-0 mt-0.5" />
                <span>
                  <strong>Read-Only Safety Guarantee:</strong> Initial patient presentation is locked to preserve clinical provenance. To modify baseline findings or enter a new clinical case, use the <strong>"Case Input"</strong> tab. To adjust reasoning steps, double-click any node in the graph.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-[#BCABAE]/30 flex items-center justify-between">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-[#BCABAE]/40 text-xs font-semibold text-[#0F0F0F] hover:bg-gray-50 flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00A896]" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Baseline Prompt</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowFullModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#2D2E2E] text-white text-xs font-semibold hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
