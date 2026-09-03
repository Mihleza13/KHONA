import React from 'react';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useTheme, ThemeMode } from '../theme/ThemeContext';
import { BottomSheet, SheetPrimaryButton } from './BottomSheet';

interface AppearanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { themeMode, setThemeMode, isDark } = useTheme();

  const modes: { id: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Appearance"
      subtitle="Choose how KHONA looks on this device"
      icon={<Palette className="w-5 h-5" />}
      maxWidthClassName="sm:max-w-sm"
      footer={<SheetPrimaryButton onClick={onClose}>Done</SheetPrimaryButton>}
    >
      <div className="space-y-2 pb-2">
        {modes.map((item) => {
          const Icon = item.icon;
          const isSelected = themeMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`theme-option-${item.id}`}
              onClick={() => setThemeMode(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? isDark
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-cyan-50/80 border-cyan-600 text-cyan-950 font-semibold'
                  : isDark
                  ? 'bg-zinc-900/50 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {/* Radio Indicator */}
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-400'
                  : isDark ? 'border-zinc-600 bg-transparent' : 'border-zinc-400 bg-white'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-950" />}
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};

export default AppearanceSettingsModal;
