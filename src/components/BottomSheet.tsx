import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** Primary + secondary action buttons, rendered stacked at the bottom. */
  footer?: React.ReactNode;
  maxWidthClassName?: string;
}

/**
 * Shared pop-up shell used across KHONA: a bottom sheet on small screens
 * (drag handle, rounded top corners, actions pinned above the safe area)
 * that becomes a centered rounded card on larger screens. Mirrors the
 * pattern of confident, native-feeling app pop-ups — bold short title,
 * one muted subtitle line, a clear single-column list of content, and a
 * simple two-button footer (solid primary, outlined secondary).
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidthClassName = 'sm:max-w-md',
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClassName} max-h-[88vh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 ${
          isDark ? 'bg-[#101722] text-white' : 'bg-white text-zinc-900'
        }`}
      >
        {/* Drag handle — mobile only, signals "this can be swiped away" */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className={`w-9 h-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
        </div>

        {/* Header */}
        <div className="px-6 pt-3 sm:pt-6 pb-4 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-700'
              }`}>
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-[22px] font-bold tracking-tight leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className={`text-sm font-normal mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-full shrink-0 transition-colors cursor-pointer ${
              isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            }`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 overflow-y-auto flex-1 pb-2">
          {children}
        </div>

        {/* Footer actions */}
        {footer && (
          <div className={`px-6 pt-4 pb-6 sm:pb-6 space-y-2.5 border-t shrink-0 ${
            isDark ? 'border-zinc-800' : 'border-zinc-100'
          }`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/** Solid primary action button — the one confident, high-contrast CTA per sheet. */
export const SheetPrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <button
    type="button"
    className={`w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${className}`}
    {...props}
  >
    {children}
  </button>
);

/** Outlined secondary action — "Cancel" style, sits under the primary button. */
export const SheetSecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...props
}) => {
  const { isDark } = useTheme();
  return (
    <button
      type="button"
      className={`w-full py-3.5 rounded-2xl border font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
        isDark
          ? 'border-zinc-700 text-zinc-200 hover:bg-zinc-900'
          : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default BottomSheet;
