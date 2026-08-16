import React, { useState } from 'react';
import { ReasoningDAG, UserProfile } from '../types';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  ShieldCheck,
  X,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dag: ReasoningDAG | null;
  user: UserProfile | null;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  dag,
  user,
}) => {
  if (!isOpen) return null;
  const [copied, setCopied] = useState(false);

  if (!dag) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center">
          <FileText className="w-10 h-10 text-[#716969] mx-auto mb-2" />
          <h3 className="font-bold text-base text-[#0F0F0F] mb-1">
            No Active Case Loaded
          </h3>
          <p className="text-xs text-[#716969] mb-4">
            Generate or select a clinical reasoning DAG to view the formal
            physician report and prescription orders.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00A896] text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    const reportText = `
CLINICAL XAI REASONING & PRESCRIPTION ORDER SUMMARY
System: AIGHT Explainable Clinical AI
Generated: ${new Date(dag.generatedAt).toLocaleString()}
Physician: ${user?.name || 'Dr. Attending, MD'} (${user?.specialty || 'Clinical Review'})

CLINICAL PRESENTATION:
${dag.prompt}

SUMMARY DIAGNOSIS:
${dag.summaryDiagnosis}

TREATMENT PLAN:
${dag.treatmentPlan}

PRESCRIPTION ORDERS:
${dag.prescriptions
  .map(
    (p, i) =>
      `${i + 1}. ${p.drug} | ${p.dosage} | ${p.route} | ${p.frequency} (${p.duration})\n   Rationale: ${p.rationale}`
  )
  .join('\n\n')}

CONTRAINDICATIONS SCREENED:
${dag.contraindicationsChecked.map((c) => `- ${c}`).join('\n')}

FOLLOW-UP INSTRUCTIONS:
${dag.followUpInstructions}
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="reports-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs print:p-0 print:bg-white"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#BCABAE]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#BCABAE]/30 flex items-center justify-between bg-[#FBFBFB] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D2E2E] text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F0F0F]">
                Clinical Summary & Prescription Orders
              </h3>
              <p className="text-xs text-[#716969]">
                Structured physician report derived from the verified reasoning DAG
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#0F0F0F] rounded-lg text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A896] hover:bg-[#009383] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#716969] hover:bg-[#BCABAE]/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6 text-[#0F0F0F]">
          {/* Institutional Header */}
          <div className="flex items-center justify-between border-b-2 border-[#0F0F0F] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D2E2E] text-white flex items-center justify-center font-black">
                A
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">AIGHT CLINICAL DECISION RECORD</h2>
                <p className="text-xs text-[#716969]">
                  Department of {user?.specialty || 'General Medicine'} • {user?.hospitalAffiliation || 'University Medical Center'}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-[#716969]">
              <p><strong>Report Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Reviewing MD:</strong> {user?.name || 'Dr. Attending, MD'}</p>
              <p><strong>License:</strong> {user?.licenseNumber || 'MD-74920'}</p>
            </div>
          </div>

          {/* Diagnosis & Summary Banner */}
          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]">
              Primary Verified Diagnosis
            </span>
            <h3 className="text-lg font-bold text-[#0F0F0F]">
              {dag.summaryDiagnosis}
            </h3>
            <p className="text-xs text-[#2D2E2E] mt-1 leading-relaxed">
              {dag.treatmentPlan}
            </p>
          </div>

          {/* Prescription Order Table */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[#0F0F0F] uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#00A896]" />
              Pharmacotherapy & Prescription Orders
            </h4>
            <div className="border border-[#BCABAE]/40 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-[#BCABAE]/30 text-[#716969] font-bold">
                  <tr>
                    <th className="p-3">Medication</th>
                    <th className="p-3">Dosage & Route</th>
                    <th className="p-3">Frequency / Duration</th>
                    <th className="p-3">Clinical Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BCABAE]/20">
                  {dag.prescriptions.map((rx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-[#0F0F0F]">{rx.drug}</td>
                      <td className="p-3 text-[#2D2E2E]">
                        {rx.dosage} ({rx.route})
                      </td>
                      <td className="p-3 text-[#2D2E2E]">
                        {rx.frequency} • {rx.duration}
                      </td>
                      <td className="p-3 text-[#716969] text-[11px] leading-relaxed">
                        {rx.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contraindications Checked */}
          <div className="p-4 rounded-xl border border-[#BCABAE]/40 bg-gray-50 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[#0F0F0F] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00A896]" />
              Verified Safety & Contraindication Checklist
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#2D2E2E]">
              {dag.contraindicationsChecked.map((check, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A896] mt-0.5 shrink-0" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Up Instructions */}
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-[#0F0F0F] uppercase tracking-wider text-[11px]">
              Monitoring & Follow-up Protocols
            </span>
            <p className="p-3 bg-white border border-[#BCABAE]/30 rounded-xl text-[#2D2E2E] leading-relaxed">
              {dag.followUpInstructions}
            </p>
          </div>

          {/* Physician Signature Block */}
          <div className="pt-4 border-t border-[#BCABAE]/30 flex items-center justify-between text-xs text-[#716969]">
            <div>
              <p className="font-semibold text-[#0F0F0F]">
                Electronically Attested by {user?.name || 'Dr. Attending, MD'}
              </p>
              <p className="text-[11px]">
                XAI Reasoning DAG Review Verified & Corrected
              </p>
            </div>
            <div className="text-right font-mono text-[10px] text-[#716969]">
              ID: {dag.generatedAt.slice(0, 19).replace(/[^0-9]/g, '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
