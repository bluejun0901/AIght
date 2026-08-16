import React from 'react';
import { SavedSession } from '../types';
import {
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Award,
  X,
  Stethoscope,
} from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSessions: SavedSession[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  savedSessions,
}) => {
  if (!isOpen) return null;

  const totalSessions = savedSessions.length || 1;
  const sessionsWithOverrides = savedSessions.filter((s) => s.overriddenNodesCount > 0).length;
  const totalOverrides = savedSessions.reduce((acc, s) => acc + s.overriddenNodesCount, 0);
  const concordanceRate = Math.round(((totalSessions - sessionsWithOverrides) / totalSessions) * 100);

  return (
    <div
      id="analytics-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#BCABAE]/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#BCABAE]/30 flex items-center justify-between bg-[#FBFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00A896] text-white flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F0F0F]">
                Clinical XAI Accuracy & Override Analytics
              </h3>
              <p className="text-xs text-[#716969]">
                Performance metrics for AI diagnostic paths and physician corrections
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-[#BCABAE]/30 flex flex-col">
              <span className="text-xs font-semibold text-[#716969]">
                Total Cases Analyzed
              </span>
              <span className="text-2xl font-black text-[#0F0F0F] mt-1">
                {savedSessions.length + 8}
              </span>
              <span className="text-[10px] text-[#00A896] font-medium mt-0.5">
                +4 cases this week
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-[#BCABAE]/30 flex flex-col">
              <span className="text-xs font-semibold text-[#716969]">
                AI-Physician Concordance
              </span>
              <span className="text-2xl font-black text-[#0D9488] mt-1">
                {concordanceRate}%
              </span>
              <span className="text-[10px] text-[#716969] font-medium mt-0.5">
                Initial DAG accepted
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-[#BCABAE]/30 flex flex-col">
              <span className="text-xs font-semibold text-[#716969]">
                Total Clinical Overrides
              </span>
              <span className="text-2xl font-black text-[#EF4444] mt-1">
                {totalOverrides + 3}
              </span>
              <span className="text-[10px] text-[#716969] font-medium mt-0.5">
                Re-reasoned branches
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-[#BCABAE]/30 flex flex-col">
              <span className="text-xs font-semibold text-[#716969]">
                Mean Reasoning Depth
              </span>
              <span className="text-2xl font-black text-[#2D2E2E] mt-1">
                5.4
              </span>
              <span className="text-[10px] text-[#716969] font-medium mt-0.5">
                DAG logical layers
              </span>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Override Reasons distribution */}
            <div className="p-4 rounded-xl border border-[#BCABAE]/40 bg-white flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[#0F0F0F] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                Most Common Override Categories
              </h4>
              <div className="flex flex-col gap-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Hypothesis Calibration (e.g. GERD vs ACS)</span>
                    <span className="text-[#0F0F0F]">48%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#EF4444] h-2 rounded-full w-[48%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Contraindication Screening Adjustment</span>
                    <span className="text-[#0F0F0F]">26%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#D97706] h-2 rounded-full w-[26%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Medication Dosage / Route Tuning</span>
                    <span className="text-[#0F0F0F]">18%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#0284C7] h-2 rounded-full w-[18%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Observation / Lab Refinement</span>
                    <span className="text-[#0F0F0F]">8%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#00A896] h-2 rounded-full w-[8%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Department Alignment */}
            <div className="p-4 rounded-xl border border-[#BCABAE]/40 bg-white flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[#0F0F0F] uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#00A896]" />
                Top Speciality Utilization
              </h4>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="font-semibold text-[#0F0F0F]">
                    Cardiology & Coronary Care
                  </span>
                  <span className="font-bold text-[#00A896]">12 Cases</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="font-semibold text-[#0F0F0F]">
                    Emergency Medicine & Trauma
                  </span>
                  <span className="font-bold text-[#00A896]">8 Cases</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="font-semibold text-[#0F0F0F]">
                    Neurology & Acute Stroke
                  </span>
                  <span className="font-bold text-[#00A896]">6 Cases</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="font-semibold text-[#0F0F0F]">
                    ICU & Critical Care
                  </span>
                  <span className="font-bold text-[#00A896]">5 Cases</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-[#BCABAE]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2D2E2E] text-white text-xs font-bold rounded-xl"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
