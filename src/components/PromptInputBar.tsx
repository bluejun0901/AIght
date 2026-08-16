import React, { useState } from 'react';
import { SAMPLE_CLINICAL_CASES } from '../lib/mockData';
import {
  Sparkles,
  Send,
  Loader2,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Shield,
  FileSpreadsheet,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface PromptInputBarProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onSubmit: (patientDetails?: any) => void;
  isLoading: boolean;
  onClear: () => void;
}

export const PromptInputBar: React.FC<PromptInputBarProps> = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  onClear,
}) => {
  const [showPatientMeta, setShowPatientMeta] = useState(false);
  const [patientName, setPatientName] = useState('John Doe');
  const [patientAgeGender, setPatientAgeGender] = useState('62M');
  const [mrn, setMrn] = useState('MRN-884920');
  const [allergies, setAllergies] = useState('NKDA (No known drug allergies)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit({
      patientName,
      patientAgeGender,
      mrn,
      allergies,
    });
  };

  const handleSelectCase = (caseItem: (typeof SAMPLE_CLINICAL_CASES)[0]) => {
    setPrompt(caseItem.fullPrompt);
  };

  return (
    <div
      id="prompt-input-container"
      className="w-full bg-[#FBFBFB] border-b border-[#BCABAE]/30 p-3 sm:p-4 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Preset quick pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[#716969] font-semibold shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-[#00A896]" />
            Clinical Presets:
          </span>
          {SAMPLE_CLINICAL_CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectCase(item)}
              type="button"
              className="px-2.5 py-1 bg-[#BCABAE]/15 hover:bg-[#BCABAE]/30 text-[#0F0F0F] rounded-full shrink-0 font-medium transition-colors border border-[#BCABAE]/40 cursor-pointer"
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Main Form Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <textarea
                id="input-patient-condition"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe patient condition, clinical presentation, vital signs, lab values, or differential dilemmas..."
                className="w-full px-3.5 py-2.5 text-sm bg-white text-[#0F0F0F] placeholder-[#716969] rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all resize-none shadow-inner leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
              />
              {prompt && (
                <button
                  type="button"
                  onClick={onClear}
                  className="absolute right-3 top-2.5 text-xs text-[#716969] hover:text-[#0F0F0F] px-1.5 py-0.5 rounded bg-gray-100"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex sm:flex-col justify-between sm:justify-center gap-2 shrink-0">
              <button
                id="btn-submit-reasoning"
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00A896] hover:bg-[#009383] disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate DAG</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPatientMeta(!showPatientMeta)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-[#716969] hover:text-[#0F0F0F] bg-white border border-[#BCABAE]/40 rounded-lg hover:bg-gray-50 transition-colors"
                title="Toggle encrypted patient metadata fields"
              >
                <Shield className="w-3 h-3 text-[#00A896]" />
                <span>Patient Data</span>
                {showPatientMeta ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Optional Encrypted Demographics Panel */}
          {showPatientMeta && (
            <div className="p-3 bg-white rounded-xl border border-[#BCABAE]/40 shadow-xs flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[#00A896] font-semibold mr-2">
                <Shield className="w-3.5 h-3.5" />
                <span>AES-256 Patient Fields (Encrypted on Save):</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#716969]">Name:</span>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="px-2 py-1 rounded border border-[#BCABAE] bg-gray-50 text-[#0F0F0F] w-28 text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#716969]">Age/Sex:</span>
                <input
                  type="text"
                  value={patientAgeGender}
                  onChange={(e) => setPatientAgeGender(e.target.value)}
                  className="px-2 py-1 rounded border border-[#BCABAE] bg-gray-50 text-[#0F0F0F] w-18 text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#716969]">MRN:</span>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="px-2 py-1 rounded border border-[#BCABAE] bg-gray-50 text-[#0F0F0F] w-28 text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                <span className="text-[#716969]">Allergies:</span>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="px-2 py-1 rounded border border-[#BCABAE] bg-gray-50 text-[#0F0F0F] w-full text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
