import React, { useRef, useState } from 'react';
import { SAMPLE_CLINICAL_CASES } from '../lib/mockData';
import { CaseReferenceFile, SavedSession } from '../types';
import {
  Sparkles,
  Send,
  Loader2,
  Stethoscope,
  Shield,
  FileSpreadsheet,
  AlertCircle,
  Lightbulb,
  Clock,
  ChevronRight,
  User,
  HeartPulse,
  History as HistoryIcon,
  CheckCircle2,
  Copy,
  Info,
  PenTool,
  RotateCcw,
  Check,
  X,
  Paperclip,
  Upload,
  FileText,
  Image,
} from 'lucide-react';

interface PromptEntryScreenProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onSubmit: (patientDetails?: any) => void;
  isLoading: boolean;
  onClear: () => void;
  savedSessions: SavedSession[];
  onRestoreSession: (session: SavedSession) => void;
  hasActiveDAG: boolean;
  onGoToDAGReview?: () => void;
  currentDagPrompt?: string;
  referenceFiles: CaseReferenceFile[];
  onAddReferenceFiles: (files: File[]) => void;
  onRemoveReferenceFile: (id: string) => void;
}

export const PromptEntryScreen: React.FC<PromptEntryScreenProps> = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  onClear,
  savedSessions,
  onRestoreSession,
  hasActiveDAG,
  onGoToDAGReview,
  currentDagPrompt,
  referenceFiles,
  onAddReferenceFiles,
  onRemoveReferenceFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [patientName, setPatientName] = useState('John Doe');
  const [patientAgeGender, setPatientAgeGender] = useState('62M');
  const [mrn, setMrn] = useState('MRN-884920');
  const [allergies, setAllergies] = useState('NKDA (No known drug allergies)');
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent' | 'STAT'>('Urgent');
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Check if current prompt strictly matches one of the sample cases
  const matchedSample = SAMPLE_CLINICAL_CASES.find(
    (c) => c.fullPrompt.trim() === prompt.trim()
  );
  const isCustomPrompt = !matchedSample && prompt.trim().length > 0;
  const isPromptModifiedFromDAG = hasActiveDAG && currentDagPrompt && prompt.trim() !== currentDagPrompt.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit({
      patientName,
      patientAgeGender,
      mrn,
      allergies,
      urgency,
    });
  };

  const handleSelectCase = (caseItem: (typeof SAMPLE_CLINICAL_CASES)[0]) => {
    // If clicking already selected template, toggle it off (deselect / clear to custom empty)
    if (prompt.trim() === caseItem.fullPrompt.trim()) {
      setPrompt('');
    } else {
      setPrompt(caseItem.fullPrompt);
      if (caseItem.id === 'case-acs') {
        setPatientName('John Doe');
        setPatientAgeGender('62M');
        setMrn('MRN-884920');
        setAllergies('NKDA');
      } else if (caseItem.id === 'case-stroke') {
        setPatientName('Elena Rostova');
        setPatientAgeGender('58F');
        setMrn('MRN-991204');
        setAllergies('Penicillin (Rash)');
      } else if (caseItem.id === 'case-sepsis') {
        setPatientName('Robert Vance');
        setPatientAgeGender('71M');
        setMrn('MRN-441203');
        setAllergies('Sulfa drugs');
      } else if (caseItem.id === 'case-dka') {
        setPatientName('Sarah Jenkins');
        setPatientAgeGender('24F');
        setMrn('MRN-558291');
        setAllergies('NKDA');
      }
    }
  };

  const handleSelectNone = () => {
    setPrompt('');
  };

  return (
    <div
      id="prompt-entry-screen"
      className="flex-1 w-full h-full flex flex-col overflow-y-auto bg-[#FBFBFB] select-none p-3 sm:p-5 md:p-6"
    >
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-between gap-4">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BCABAE]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A896]/10 text-[#00A896] flex items-center justify-center shrink-0 border border-[#00A896]/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#0F0F0F] tracking-tight">
                  Clinical Case Setup & Diagnostic Prompt
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00A896]/10 text-[#00A896] border border-[#00A896]/20">
                  Step 1: Case Input
                </span>
              </div>
              <p className="text-xs text-[#716969]">
                Input clinical presentation, vitals, and lab values in Korean or English to generate an explainable reasoning DAG.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveDAG && onGoToDAGReview && (
              <button
                id="btn-return-to-active-dag"
                onClick={onGoToDAGReview}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#00A896]/10 hover:bg-[#00A896]/20 text-[#00A896] text-xs font-bold rounded-lg transition-colors cursor-pointer border border-[#00A896]/30"
              >
                <span>View Active DAG</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00A896]" />
              </button>
            )}
          </div>
        </div>

        {/* Rapid Clinical Case Templates with Explicit 'None / Custom' Option */}
        <div className="flex flex-col gap-2 bg-white p-3.5 rounded-2xl border border-[#BCABAE]/40 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#716969]">
            <div className="flex items-center gap-2">
              <span className="font-bold flex items-center gap-1.5 text-[#0F0F0F]">
                <Lightbulb className="w-3.5 h-3.5 text-[#00A896]" />
                Rapid Clinical Case Templates
              </span>
              <span className="text-[11px] text-[#716969] hidden md:inline">
                (Choose a template or select "None / Custom" to write your own)
              </span>
            </div>

            {/* Template Status Indicator Badge */}
            <div className="flex items-center gap-1.5">
              {matchedSample ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00A896]/10 text-[#00A896] border border-[#00A896]/30">
                  <Check className="w-3 h-3" />
                  Template: {matchedSample.title}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38BDF8]/15 text-[#0284C7] border border-[#38BDF8]/30">
                  <PenTool className="w-3 h-3" />
                  None (직접 입력 모드)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {/* Option 0: Explicit "None / Custom Case (직접 입력 / 선택 안 함)" button */}
            <button
              id="template-option-none"
              type="button"
              onClick={handleSelectNone}
              className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-1.5 ${
                !matchedSample
                  ? 'bg-[#38BDF8]/10 border-[#0284C7] ring-1 ring-[#0284C7]'
                  : 'bg-white hover:bg-[#F3F4F6] border-[#BCABAE]/40 hover:border-[#BCABAE]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F0F0F] flex items-center gap-1">
                  <PenTool className="w-3 h-3 text-[#0284C7]" />
                  None / 직접 입력
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${!matchedSample ? 'bg-[#0284C7] text-white' : 'bg-[#BCABAE]/15 text-[#716969]'}`}>
                  {!matchedSample ? 'ACTIVE' : 'BLANK'}
                </span>
              </div>
              <p className="text-[11px] text-[#716969] line-clamp-2 leading-relaxed">
                템플릿을 선택하지 않고 자유롭게 임상 증상 및 검사 결과를 직접 입력합니다.
              </p>
            </button>

            {/* Predefined Sample Cases */}
            {SAMPLE_CLINICAL_CASES.map((item) => {
              const isSelected = prompt.trim() === item.fullPrompt.trim();
              return (
                <button
                  key={item.id}
                  id={`template-option-${item.id}`}
                  type="button"
                  onClick={() => handleSelectCase(item)}
                  title={isSelected ? 'Click again to deselect' : 'Click to select this template'}
                  className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-1.5 relative ${
                    isSelected
                      ? 'bg-[#00A896]/10 border-[#00A896] ring-1 ring-[#00A896]'
                      : 'bg-white hover:bg-[#F3F4F6] border-[#BCABAE]/40 hover:border-[#BCABAE]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F0F0F] truncate">{item.title}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-[#00A896] text-white' : 'bg-[#BCABAE]/15 text-[#716969]'
                    }`}>
                      {isSelected ? 'SELECTED' : item.id.replace('case-', '')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#716969] line-clamp-2 leading-relaxed">
                    {item.fullPrompt.slice(0, 100)}...
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Out-of-Sync / Update Required Notice */}
        {isPromptModifiedFromDAG && (
          <div className="p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl flex items-center justify-between text-xs text-[#92400E]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>
                <strong>입력된 프롬프트가 변경되었습니다:</strong> 새로운 추론 그래프를 생성하려면 아래 <strong>"Generate Reasoning DAG"</strong> 버튼을 눌러주세요.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-2.5 py-1 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>지금 DAG 생성</span>
            </button>
          </div>
        )}

        {/* Main Work Area: Split in 2 columns on larger screens */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          {/* Left / Primary: Prompt Text Area */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#BCABAE]/50 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#BCABAE]/20 text-xs">
              <span className="font-bold text-[#0F0F0F] flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-[#00A896]" />
                Patient Presentation & Clinical Findings (임상 증상 및 검사 소견)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#716969]">
                  {prompt.length} chars | ~{Math.ceil(prompt.split(/\s+/).filter(Boolean).length)} words
                </span>
                {prompt && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-[11px] font-medium text-[#716969] hover:text-[#DC2626] px-1.5 py-0.5 rounded hover:bg-[#FEF2F2] transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="input-main-clinical-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="임상 증상, 환자 병력, 활력징후(Vitals), 심전도(ECG) 소견, 혈액검사 결과(Troponin, Lactate, CBC, BMP 등), 알레르기 및 감별진단 항목을 한국어 또는 영어로 자유롭게 입력하세요..."
              className="flex-1 w-full min-h-[140px] sm:min-h-[180px] p-3 text-xs sm:text-sm text-[#0F0F0F] bg-[#FBFBFB] rounded-xl border border-[#BCABAE]/40 focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:bg-white transition-all resize-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />

            {/* Local-only reference attachments (never sent to the reasoning API) */}
            <div className="mt-3 rounded-xl border border-[#BCABAE]/35 bg-[#FBFBFB] p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <Paperclip className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0284C7]" />
                  <div>
                    <p className="text-xs font-bold text-[#0F0F0F]">Reference files (참고 자료)</p>
                    <p className="text-[10px] leading-relaxed text-[#716969]">
                      그래프 화면에서만 표시되며, AI 답변이나 추론 요청에는 포함되지 않습니다.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#0284C7]/30 bg-[#0284C7]/10 px-3 py-1.5 text-[11px] font-bold text-[#0284C7] transition-colors hover:bg-[#0284C7]/15"
                >
                  <Upload className="h-3.5 w-3.5" />
                  파일 선택
                </button>
                <input
                  ref={fileInputRef}
                  id="input-case-reference-files"
                  type="file"
                  multiple
                  accept="image/*,application/pdf,text/plain,text/csv,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={(event) => {
                    onAddReferenceFiles(Array.from(event.target.files || []));
                    event.target.value = '';
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setIsDraggingFiles(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(false);
                  onAddReferenceFiles(Array.from(event.dataTransfer.files));
                }}
                className={`mt-2 flex w-full items-center justify-center rounded-lg border border-dashed px-3 py-2 text-[10px] transition-colors ${
                  isDraggingFiles
                    ? 'border-[#0284C7] bg-[#E0F2FE] text-[#0284C7]'
                    : 'border-[#BCABAE]/60 bg-white text-[#716969] hover:border-[#0284C7]/50 hover:text-[#0284C7]'
                }`}
              >
                파일을 여기에 놓거나 클릭해 업로드 · 파일당 최대 20MB
              </button>

              {referenceFiles.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5">
                  {referenceFiles.map((file) => {
                    const FileIcon = file.type.startsWith('image/') ? Image : FileText;
                    return (
                      <div
                        key={file.id}
                        className="flex min-w-0 max-w-[220px] shrink-0 items-center gap-2 rounded-lg border border-[#BCABAE]/35 bg-white px-2.5 py-2"
                      >
                        <FileIcon className="h-4 w-4 shrink-0 text-[#0284C7]" />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-[10px] font-semibold text-[#0F0F0F]">{file.name}</p>
                          <p className="text-[9px] text-[#716969]">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveReferenceFile(file.id)}
                          className="rounded p-0.5 text-[#716969] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                          aria-label={`${file.name} 삭제`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-3 pt-3 border-t border-[#BCABAE]/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-[#716969]">
                <Shield className="w-3.5 h-3.5 text-[#00A896] shrink-0" />
                <span>Protected Health Information (PHI) encrypted locally</span>
              </div>

              <button
                id="btn-generate-reasoning-dag"
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#00A896] hover:bg-[#009383] active:bg-[#007f71] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer min-w-[220px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing DAG...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Reasoning DAG</span>
                    <span className="text-[10px] opacity-75 font-normal ml-1 hidden sm:inline">(⌘+Enter)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right / Secondary: Patient Demographics & Urgency */}
          <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
            <div className="bg-white rounded-2xl border border-[#BCABAE]/50 p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#BCABAE]/20">
                <span className="text-xs font-bold text-[#0F0F0F] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00A896]" />
                  Patient Demographics
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00A896]/10 text-[#00A896]">
                  Encrypted
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-[#716969] mb-1">Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2 bg-[#FBFBFB] border border-[#BCABAE]/40 rounded-lg text-[#0F0F0F] text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#716969] mb-1">Age / Gender</label>
                  <input
                    type="text"
                    value={patientAgeGender}
                    onChange={(e) => setPatientAgeGender(e.target.value)}
                    className="w-full p-2 bg-[#FBFBFB] border border-[#BCABAE]/40 rounded-lg text-[#0F0F0F] text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[11px] font-medium text-[#716969] mb-1">Medical Record # (MRN)</label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="w-full p-2 bg-[#FBFBFB] border border-[#BCABAE]/40 rounded-lg text-[#0F0F0F] text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                />
              </div>

              <div className="text-xs">
                <label className="block text-[11px] font-medium text-[#716969] mb-1">Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full p-2 bg-[#FBFBFB] border border-[#BCABAE]/40 rounded-lg text-[#0F0F0F] text-xs focus:ring-1 focus:ring-[#00A896] focus:outline-none"
                />
              </div>

              <div className="text-xs">
                <label className="block text-[11px] font-medium text-[#716969] mb-1">Acuity / Urgency</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Standard', 'Urgent', 'STAT'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border cursor-pointer text-center ${
                        urgency === lvl
                          ? lvl === 'STAT'
                            ? 'bg-[#DC2626] text-white border-[#DC2626]'
                            : lvl === 'Urgent'
                            ? 'bg-[#D97706] text-white border-[#D97706]'
                            : 'bg-[#00A896] text-white border-[#00A896]'
                          : 'bg-[#FBFBFB] text-[#716969] border-[#BCABAE]/40 hover:bg-gray-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Saved Case History / Recent Sessions */}
            {savedSessions.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#BCABAE]/50 p-3 shadow-xs flex flex-col gap-2">
                <span className="text-xs font-bold text-[#0F0F0F] flex items-center gap-1.5">
                  <HistoryIcon className="w-3.5 h-3.5 text-[#00A896]" />
                  Saved Cases ({savedSessions.length})
                </span>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                  {savedSessions.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onRestoreSession(s)}
                      className="p-2 text-left rounded-lg bg-[#FBFBFB] hover:bg-[#BCABAE]/20 border border-[#BCABAE]/30 transition-colors text-xs flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate">
                        <span className="font-bold text-[#0F0F0F] block truncate">{s.title}</span>
                        <span className="text-[10px] text-[#716969]">
                          {s.patientDetails?.name || 'Patient'} • {s.dagData.nodes.length} nodes
                        </span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-[#716969] group-hover:text-[#00A896] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
