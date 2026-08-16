import React from 'react';
import { DAGNode } from '../types';
import {
  Sparkles,
  Zap,
  Edit3,
  Loader2,
  AlertTriangle,
  CornerDownLeft,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ReReasonBarProps {
  flaggedNodes: DAGNode[];
  correctionNote: string;
  setCorrectionNote: (note: string) => void;
  onExecuteReReason: () => void;
  isLoading: boolean;
  onClearAllFlags: () => void;
  hideFlaggedNodes?: boolean;
  onToggleHideFlaggedNodes?: () => void;
}

export const ReReasonBar: React.FC<ReReasonBarProps> = ({
  flaggedNodes,
  correctionNote,
  setCorrectionNote,
  onExecuteReReason,
  isLoading,
  onClearAllFlags,
  hideFlaggedNodes = false,
  onToggleHideFlaggedNodes,
}) => {
  if (flaggedNodes.length === 0) return null;

  const primaryFlagged = flaggedNodes[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onExecuteReReason();
    }
  };

  return (
    <div
      id="re-reason-bar"
      className="absolute bottom-4 left-4 right-4 z-30 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#BCABAE]/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Flag badge / Context pill */}
        <div className="flex items-center justify-between sm:justify-start gap-2 px-2.5 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-[#DC2626] font-bold truncate max-w-[200px] sm:max-w-[240px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              지적된 노드: {primaryFlagged.title}
            </span>
          </div>

          {onToggleHideFlaggedNodes && (
            <button
              type="button"
              onClick={onToggleHideFlaggedNodes}
              className="px-1.5 py-0.5 rounded bg-white text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title={hideFlaggedNodes ? '지적된 노드 표시' : '지적된 노드 숨김'}
            >
              {hideFlaggedNodes ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{hideFlaggedNodes ? '숨김 중' : '숨기기'}</span>
            </button>
          )}

          <button
            onClick={onClearAllFlags}
            className="p-0.5 rounded text-[#EF4444] hover:bg-[#FEE2E2]"
            title="Cancel flag"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Correction input matching Image 2 */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Edit3 className="w-4 h-4 text-[#716969] absolute left-3 pointer-events-none" />
            <input
              id="input-correction-directive"
              type="text"
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              placeholder="Provide doctor correction instructions (e.g. 'Adjusting for cardiac history...')..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50/80 rounded-xl border border-[#BCABAE]/60 text-[#0F0F0F] placeholder-[#716969] focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:bg-white transition-all"
            />
          </div>

          {/* Re-infer Action Button matching Image 2 style */}
          <button
            id="btn-re-infer"
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#004D4D] hover:bg-[#003838] active:bg-[#002626] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Re-inferring...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Re-infer</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
