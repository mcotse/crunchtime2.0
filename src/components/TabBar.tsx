import React from 'react';
import { HomeIcon, CreditCardIcon, SettingsIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWebHaptics } from 'web-haptics/react';
interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const EQX_EASING = [0.2, 0.0, 0.0, 1.0] as const;
export function TabBar({
  activeTab,
  onTabChange
}: TabBarProps) {
  const haptic = useWebHaptics();
  const tabs = [{
    id: 'home',
    icon: HomeIcon,
    label: 'Home'
  }, {
    id: 'feed',
    icon: ClockIcon,
    label: 'Activity'
  }, {
    id: 'events',
    icon: CalendarIcon,
    label: 'Events'
  }, {
    id: 'splits',
    icon: CreditCardIcon,
    label: 'Splits'
  }, {
    id: 'settings',
    icon: SettingsIcon,
    label: 'Settings'
  }];
  return <div className="fixed bottom-0 left-0 right-0 z-40 border-t" style={{
    backgroundColor: 'var(--eqx-base)',
    borderColor: 'var(--eqx-hairline)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
  }}>
      <div className="max-w-md mx-auto flex justify-between items-stretch h-16 px-1">
        {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return <button key={tab.id} onClick={() => {
          haptic.trigger('selection');
          onTabChange(tab.id);
        }} className="relative flex flex-col items-center justify-center flex-1 h-full active:opacity-[0.92]" aria-label={tab.label} aria-current={isActive ? 'page' : undefined}>
              {/* Top indicator — always rendered, opacity-toggled for reliability */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-opacity" style={{
            width: 28,
            backgroundColor: 'var(--eqx-primary)',
            opacity: isActive ? 1 : 0,
            transitionDuration: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)'
          }} />

              <div className="flex flex-col items-center gap-1 mt-1">
                <tab.icon size={22} strokeWidth={isActive ? 2 : 1.5} style={{
              color: isActive ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
            }} />
                <span className="text-[10px] font-medium leading-none tracking-wide" style={{
              color: isActive ? 'var(--eqx-primary)' : 'var(--eqx-tertiary)'
            }}>
                  {tab.label}
                </span>
              </div>
            </button>;
      })}
      </div>
    </div>;
}