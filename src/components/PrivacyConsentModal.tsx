import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileCheck, Check } from 'lucide-react';
import type { POPIAConsentState } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { BottomSheet, SheetPrimaryButton, SheetSecondaryButton } from './BottomSheet';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  popiaConsent: POPIAConsentState;
  onSetConsent: (allow: boolean) => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onClose,
  popiaConsent,
  onSetConsent,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const handleChoice = (allow: boolean) => {
    onSetConsent(allow);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t.privacy.title}
      subtitle={t.privacy.badge}
      icon={<ShieldCheck className="w-5 h-5" />}
      maxWidthClassName="sm:max-w-lg"
      footer={
        <>
          <SheetPrimaryButton onClick={() => handleChoice(true)}>
            <Check className="w-4 h-4" />
            <span>{t.privacy.acceptBtn}</span>
          </SheetPrimaryButton>
          <SheetSecondaryButton onClick={() => handleChoice(false)}>
            <span>{t.privacy.declineBtn}</span>
          </SheetSecondaryButton>
        </>
      }
    >
      <div className="space-y-3 pb-2">
        {/* Core Privacy Guarantees */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-700'}`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">{t.privacy.onDeviceTitle}</h4>
            <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t.privacy.onDeviceDesc}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'}`}>
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">{t.privacy.zeroBiometricsTitle}</h4>
            <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t.privacy.zeroBiometricsDesc}
            </p>
          </div>
        </div>

        {/* POPIA Consent section */}
        <div className={`rounded-2xl p-5 space-y-3 mt-1 ${isDark ? 'bg-zinc-950 border border-zinc-800' : 'bg-zinc-900 text-white'}`}>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-sm font-bold">{t.privacy.popiaSectionTitle}</h3>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {t.privacy.popiaSectionDesc}
          </p>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pt-0.5">
            <span>{t.privacy.statusLabel}</span>
            <span className={popiaConsent.allowModelImprovement ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {popiaConsent.allowModelImprovement ? t.privacy.optedInStatus : t.privacy.optedOutStatus}
            </span>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default PrivacyConsentModal;
