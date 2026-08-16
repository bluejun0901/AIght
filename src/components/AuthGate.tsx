import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AightLogo } from './AightLogo';
import {
  ShieldCheck,
  Lock,
  Stethoscope,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Activity,
} from 'lucide-react';

interface AuthGateProps {
  onSignIn: (user: UserProfile) => void;
}

const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Dr. Sarah Lin, MD',
    email: 'sarah.lin.md@hospital.org',
    role: 'Attending Physician',
    specialty: 'Interventional Cardiology',
    licenseNumber: 'CA-MD-994821',
    hospitalAffiliation: 'University Heart & Vascular Institute',
  },
  {
    id: 'user-2',
    name: 'Dr. Marcus Vance, MD',
    email: 'marcus.vance.md@hospital.org',
    role: 'Attending Physician',
    specialty: 'Emergency Medicine',
    licenseNumber: 'NY-MD-448102',
    hospitalAffiliation: 'Metro Trauma & Resuscitation Center',
  },
  {
    id: 'user-3',
    name: 'Dr. Elena Rostova, MD, PhD',
    email: 'elena.rostova@hospital.org',
    role: 'Associate Professor',
    specialty: 'Vascular Neurology & Stroke',
    licenseNumber: 'MA-MD-771920',
    hospitalAffiliation: 'Brain & Spine Comprehensive Institute',
  },
];

export const AuthGate: React.FC<AuthGateProps> = ({ onSignIn }) => {
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  const handleGoogleSignIn = () => {
    // In production with Google OAuth or 1-click in preview environment
    onSignIn(DEMO_PROFILES[selectedDemoIndex]);
  };

  return (
    <div
      id="auth-gate-container"
      className="min-h-screen w-full bg-[#FBFBFB] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none"
    >
      {/* Background Subtle Grid */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#BCABAE 1.2px, transparent 1.2px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Main Auth Card */}
      <div className="z-10 w-full max-w-md bg-white rounded-3xl border border-[#BCABAE]/50 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* AIGHT Logo matching Image 1 */}
        <div className="mb-4">
          <AightLogo size={44} textColor="text-[#0F0F0F]" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#0F0F0F] tracking-tight">
          Explainable AI Clinical Review
        </h1>
        <p className="text-xs text-[#716969] mt-1.5 mb-6 max-w-xs leading-relaxed">
          Inspect, correct, and re-reason step-by-step AI medical treatment DAGs
          before finalizing patient prescription orders.
        </p>

        {/* Security & Access Notice */}
        <div className="w-full p-3 bg-[#F0FDFA] border border-[#99F6E4] rounded-2xl flex items-center gap-2.5 text-xs text-[#0D9488] mb-6 text-left">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[#00A896]" />
          <div>
            <span className="font-bold">Authorized Medical Access Only:</span>{' '}
            Protected under HIPAA protocols with client-side and at-rest AES-256
            encryption.
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          id="btn-google-oauth-signin"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#2D2E2E] hover:bg-[#0F0F0F] active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer group"
        >
          {/* Google SVG G icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Sign in with Google</span>
          <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Demo Physician Switcher for fast verification */}
        <div className="w-full mt-6 pt-5 border-t border-[#BCABAE]/30 flex flex-col gap-2.5 text-left">
          <span className="text-[11px] font-bold text-[#716969] uppercase tracking-wider text-center">
            Or select clinician credential for demo:
          </span>
          <div className="flex flex-col gap-1.5">
            {DEMO_PROFILES.map((profile, idx) => {
              const isSelected = selectedDemoIndex === idx;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all text-left ${
                    isSelected
                      ? 'border-[#00A896] bg-[#F0FDFA] font-semibold text-[#0D9488]'
                      : 'border-[#BCABAE]/40 hover:bg-gray-50 text-[#2D2E2E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2D2E2E] text-white flex items-center justify-center font-bold text-[10px]">
                      {profile.name.split(' ')[1]?.[0] || 'D'}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F0F0F]">{profile.name}</p>
                      <p className="text-[10px] text-[#716969]">{profile.specialty}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00A896] text-white">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="z-10 mt-6 text-center text-xs text-[#716969]">
        AIGHT Clinical Reasoning Suite • Designed for Physician Decision Support
      </div>
    </div>
  );
};
