import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Settings,
  Shield,
  Sparkles,
  User,
  Key,
  Database,
  Check,
  X,
  Lock,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (u: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user?.name || 'Dr. Sarah Lin, MD');
  const [specialty, setSpecialty] = useState(user?.specialty || 'Interventional Cardiology');
  const [hospital, setHospital] = useState(user?.hospitalAffiliation || 'University Medical Center');
  const [license, setLicense] = useState(user?.licenseNumber || 'MD-884920');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onUpdateUser({
        ...user,
        name,
        specialty,
        hospitalAffiliation: hospital,
        licenseNumber: license,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#BCABAE]/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#BCABAE]/30 flex items-center justify-between bg-[#FBFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D2E2E] text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F0F0F]">
                Clinical & System Settings
              </h3>
              <p className="text-xs text-[#716969]">
                Manage physician profile, security keys, and vLLM parameters
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
          {/* Security & HIPAA status */}
          <div className="p-3 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#0D9488]">
              <Shield className="w-4 h-4 shrink-0" />
              <span>
                <strong>At-Rest AES-256 Storage:</strong> Active & Enforced
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#00A896] text-white font-bold text-[10px]">
              Compliant
            </span>
          </div>

          {/* AI Model Info */}
          <div className="p-3 bg-gray-50 border border-[#BCABAE]/30 rounded-xl flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between font-semibold text-[#0F0F0F]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
                Inference Engine
              </span>
              <span className="text-[#00A896] font-mono">gemini-3.7-flash</span>
            </div>
            <p className="text-[11px] text-[#716969]">
              Server-side structured DAG generation with JSON schemas and topological coordinates.
            </p>
          </div>

          {/* Clinician Profile */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#0F0F0F] uppercase tracking-wider">
              Physician Credentials
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#716969]">Full Name & Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#716969]">Medical Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#716969]">Hospital Affiliation</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#716969]">Medical License #</label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-[#BCABAE] focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
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
              className="flex items-center gap-1.5 px-5 py-2 bg-[#00A896] hover:bg-[#009383] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
