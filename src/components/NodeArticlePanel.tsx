import React from 'react';
import { DAGNode } from '../types';
import { getNodeTypeConfig } from './DAGCanvas';
import {
  X,
  Clock,
  Target,
  FileText,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Flag,
  Share2,
  Copy,
  Sparkles,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

interface NodeArticlePanelProps {
  node: DAGNode | null;
  onClose: () => void;
  onToggleFlag: (nodeId: string) => void;
  onInitiateReReasonFromNode?: (node: DAGNode) => void;
  hideFlaggedNodes?: boolean;
  onToggleHideFlaggedNodes?: () => void;
}

export const NodeArticlePanel: React.FC<NodeArticlePanelProps> = ({
  node,
  onClose,
  onToggleFlag,
  onInitiateReReasonFromNode,
  hideFlaggedNodes = false,
  onToggleHideFlaggedNodes,
}) => {
  if (!node) {
    return (
      <aside
        id="article-panel"
        className="w-full lg:w-96 bg-[#FBFBFB] border-t lg:border-t-0 lg:border-l border-[#BCABAE]/30 p-6 flex flex-col items-center justify-center text-center select-none"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#BCABAE]/20 flex items-center justify-center text-[#716969] mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#0F0F0F] mb-1">
          No Reasoning Step Selected
        </h4>
        <p className="text-xs text-[#716969] max-w-[240px] leading-relaxed">
          Single-click any node in the Directed Acyclic Graph to inspect its
          clinical rationale, evidence bullets, and medical guidelines.
        </p>
      </aside>
    );
  }

  const typeConfig = getNodeTypeConfig(node.type);
  const isFlagged = node.flaggedIncorrect;

  return (
    <aside
      id="article-panel"
      className="w-full lg:w-96 bg-[#FBFBFB] border-t lg:border-t-0 lg:border-l border-[#BCABAE]/30 flex flex-col h-full overflow-y-auto select-none shadow-[-1px_0_4px_rgba(0,0,0,0.02)]"
    >
      {/* Header with Title & Close Button matching Image 2 */}
      <div className="p-4 sm:p-5 border-b border-[#BCABAE]/30 flex items-center justify-between sticky top-0 bg-[#FBFBFB] z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-[#0F0F0F]">
            Node Details
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
            style={{
              backgroundColor: isFlagged ? '#FEF2F2' : typeConfig.bg,
              color: isFlagged ? '#EF4444' : typeConfig.color,
              border: `1px solid ${isFlagged ? '#FECACA' : typeConfig.border}`,
            }}
          >
            {typeConfig.label}
          </span>
        </div>
        <button
          id="btn-close-article-panel"
          onClick={onClose}
          className="p-1 rounded-lg text-[#716969] hover:text-[#0F0F0F] hover:bg-[#BCABAE]/20 transition-colors"
          aria-label="Close Details Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex flex-col gap-5 flex-1">
        {/* Status Indicator matching Image 2 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isFlagged ? 'bg-[#EF4444] animate-pulse' : 'bg-[#00A896]'
              }`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isFlagged ? 'text-[#EF4444]' : 'text-[#00A896]'
              }`}
            >
              {isFlagged ? 'FLAGGED FOR RE-REASONING' : 'ACTIVE ANALYSIS PATH'}
            </span>
          </div>

          {/* Node Title */}
          <h3 className="text-lg sm:text-xl font-bold text-[#0F0F0F] leading-tight">
            {node.title}
          </h3>

          {/* Meta Badges: Compute Time & Confidence matching Image 2 */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
            {node.computeTime && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#BCABAE]/15 text-[#2D2E2E]">
                <Clock className="w-3.5 h-3.5 text-[#716969]" />
                <span>{node.computeTime}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00A896]/10 text-[#00A896] font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>Confidence: {node.confidence}%</span>
            </span>
          </div>
        </div>

        {/* Flag Alert Notice if flagged */}
        {isFlagged && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Clinician Flag: Incorrect Pathway</span>
            </div>
            <p className="text-xs text-[#B91C1C] leading-snug">
              {node.flagReason ||
                'This step has been flagged. Use the Re-reason action below to regenerate reasoning from this point forward.'}
            </p>
          </div>
        )}

        {/* Section: Evidence & Reasoning matching Image 2 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F0F0F]">
            <FileText className="w-4 h-4 text-[#716969]" />
            <span>Evidence & Reasoning</span>
          </div>

          {/* Detailed Paragraph */}
          <p className="text-xs text-[#2D2E2E] leading-relaxed bg-white p-3.5 rounded-xl border border-[#BCABAE]/30">
            {node.detail || node.summary}
          </p>

          {/* Bulleted Evidence Points matching Image 2 */}
          {node.evidence && node.evidence.length > 0 && (
            <ul className="flex flex-col gap-2 mt-1">
              {node.evidence.map((item, idx) => (
                <li
                  key={idx}
                  className="text-xs text-[#2D2E2E] leading-relaxed flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section: Clinical Metrics / Risk Scores */}
        {node.clinicalMetrics && Object.keys(node.clinicalMetrics).length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F0F0F]">
              <Layers className="w-4 h-4 text-[#716969]" />
              <span>Clinical Metrics & Parameters</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(node.clinicalMetrics).map(([key, val]) => (
                <div
                  key={key}
                  className="p-2.5 bg-white rounded-lg border border-[#BCABAE]/30 flex flex-col"
                >
                  <span className="text-[10px] text-[#716969] font-medium">
                    {key}
                  </span>
                  <span className="text-xs font-bold text-[#0F0F0F]">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Source References matching Image 2 */}
        <div className="flex flex-col gap-2.5 mt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F0F0F]">
            <BookOpen className="w-4 h-4 text-[#716969]" />
            <span>Source References & Guidelines</span>
          </div>

          <div className="flex flex-col gap-2">
            {node.references && node.references.length > 0 ? (
              node.references.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-[#BCABAE]/40 hover:border-[#BCABAE] transition-colors flex flex-col gap-1 shadow-2xs"
                >
                  <span className="text-xs font-bold text-[#0F0F0F] leading-snug">
                    {ref.title}
                  </span>
                  <span className="text-[11px] text-[#716969] leading-tight">
                    {ref.source}
                  </span>
                  {ref.doiOrUrl && (
                    <div className="flex items-center gap-1 text-[10px] text-[#00A896] font-medium mt-0.5">
                      <ExternalLink className="w-3 h-3" />
                      <span>DOI: {ref.doiOrUrl}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 bg-white rounded-xl border border-[#BCABAE]/30 text-xs text-[#716969]">
                ACC/AHA & ESC Clinical Practice Consensus Standards (2025).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Toolbar */}
      <div className="p-4 border-t border-[#BCABAE]/30 bg-[#FBFBFB] sticky bottom-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-flag-node"
            onClick={() => onToggleFlag(node.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isFlagged
                ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                : 'bg-white border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isFlagged ? 'Clear Flag' : 'Flag as Incorrect (Double-Click)'}</span>
          </button>

          {isFlagged && onInitiateReReasonFromNode && (
            <button
              onClick={() => onInitiateReReasonFromNode(node)}
              className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-[#00A896] hover:bg-[#009383] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Re-reason from this node"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Re-reason</span>
            </button>
          )}
        </div>

        {isFlagged && onToggleHideFlaggedNodes && (
          <button
            id="btn-article-hide-flagged"
            type="button"
            onClick={onToggleHideFlaggedNodes}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              hideFlaggedNodes
                ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#DC2626] hover:bg-[#EF4444]/20'
                : 'bg-gray-100 hover:bg-gray-200 text-[#716969]'
            }`}
          >
            {hideFlaggedNodes ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>지적된 노드 숨김 상태 (클릭하여 다시 표시)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>잘못 지적된 노드 숨기기</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
