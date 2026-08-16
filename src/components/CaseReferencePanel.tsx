import React, { useState } from 'react';
import { CaseReferenceFile } from '../types';
import {
  ChevronDown,
  ExternalLink,
  File,
  FileText,
  Image,
  Paperclip,
  X,
} from 'lucide-react';

interface CaseReferencePanelProps {
  files: CaseReferenceFile[];
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const CaseReferencePanel: React.FC<CaseReferencePanelProps> = ({ files }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [previewFile, setPreviewFile] = useState<CaseReferenceFile | null>(null);

  if (files.length === 0) return null;

  const canPreview = (file: CaseReferenceFile) =>
    file.type.startsWith('image/') || file.type === 'application/pdf';

  return (
    <>
      <aside className="absolute right-3 top-3 z-30 w-[min(300px,calc(100%-24px))] overflow-hidden rounded-2xl border border-[#0284C7]/25 bg-white/95 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-[#F0F9FF]"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0284C7]/10 text-[#0284C7]">
              <Paperclip className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold text-[#0F0F0F]">Reference files</span>
              <span className="block text-[9px] text-[#716969]">시각적 참고 전용 · AI 분석 제외</span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="rounded-full bg-[#0284C7] px-1.5 py-0.5 text-[9px] font-bold text-white">{files.length}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-[#716969] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {isOpen && (
          <div className="max-h-64 space-y-1.5 overflow-y-auto border-t border-[#BCABAE]/25 p-2">
            {files.map((file) => {
              const Icon = file.type.startsWith('image/')
                ? Image
                : file.type === 'application/pdf'
                ? FileText
                : File;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => (canPreview(file) ? setPreviewFile(file) : window.open(file.url, '_blank', 'noopener,noreferrer'))}
                  className="group flex w-full items-center gap-2 rounded-xl border border-transparent p-2 text-left hover:border-[#0284C7]/20 hover:bg-[#F0F9FF]"
                >
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-[#BCABAE]/30 object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0284C7]/10 text-[#0284C7]">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold text-[#0F0F0F]">{file.name}</span>
                    <span className="block text-[9px] text-[#716969]">{formatFileSize(file.size)}</span>
                  </span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-[#BCABAE] group-hover:text-[#0284C7]" />
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {previewFile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F0F0F]/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            event.stopPropagation();
            if (event.target === event.currentTarget) setPreviewFile(null);
          }}
        >
          <div className="flex h-[min(86vh,900px)] w-[min(92vw,1100px)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#BCABAE]/30 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#0F0F0F]">{previewFile.name}</p>
                <p className="text-[10px] text-[#716969]">Reference only · 모델 입력에 포함되지 않음</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-[#716969] hover:bg-[#F0F9FF] hover:text-[#0284C7]"
                  title="새 탭에서 열기"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="rounded-lg p-2 text-[#716969] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  aria-label="미리보기 닫기"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[#F3F4F6] p-3">
              {previewFile.type.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-full max-w-full rounded-lg object-contain shadow-sm" />
              ) : (
                <iframe src={previewFile.url} title={previewFile.name} className="h-full w-full rounded-lg border-0 bg-white" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
