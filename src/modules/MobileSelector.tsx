import React, { useEffect, useState } from 'react';
import '../styles/mobile-selector.css';

type ModuleItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  variant?: 'auto' | 'bottom';
  value?: string;
  onChange?: (id: string) => void;
  modules?: ModuleItem[];
};

const DefaultIcons = {
  points: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 19C21 15.13 16.97 12 12 12C7.03 12 3 15.13 3 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  route: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 3L11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 3V8H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 21C5.5 16 8.5 14 12 14C15.5 14 18.5 16 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  schedule: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
};

export default function MobileSelector({ variant = 'auto', value, onChange, modules }: Props) {
  const baseModules: ModuleItem[] = modules ?? [
    { id: 'attractions', label: '景点', icon: DefaultIcons.points },
    { id: 'routes', label: '线路', icon: DefaultIcons.route },
    { id: 'schedule', label: '日程', icon: DefaultIcons.schedule },
  ];

  const [selected, setSelected] = useState<string>(value ?? baseModules[0].id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setSelected(value ?? baseModules[0].id);
  }, [value, modules]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(Boolean('matches' in e ? e.matches : (mq as any).matches));
    };

    // initial set
    handler(mq as any);

    // feature-detect and use safe any-casts to avoid TS DOM type differences
    const anyMq = mq as any;
    if (typeof anyMq.addEventListener === 'function') {
      anyMq.addEventListener('change', handler);
    } else if (typeof anyMq.addListener === 'function') {
      anyMq.addListener(handler);
    }

    return () => {
      if (typeof anyMq.removeEventListener === 'function') {
        anyMq.removeEventListener('change', handler);
      } else if (typeof anyMq.removeListener === 'function') {
        anyMq.removeListener(handler);
      }
    };
  }, []);

  const showBottom = (variant === 'bottom' || variant === 'auto') && isMobile;

  function handleSelect(id: string) {
    setSelected(id);
    onChange?.(id);
  }

  if (!showBottom) return null;

  return (
    <nav className="mobile-selector-root bottom-nav" role="navigation" aria-label="底部模块导航">
      {baseModules.map((m) => (
        <button
          key={m.id}
          className={`bottom-item ${selected === m.id ? 'active' : ''}`}
          onClick={() => handleSelect(m.id)}
          aria-current={selected === m.id ? 'page' : undefined}
        >
          <span className="icon">{m.icon}</span>
          <span className="label">{m.label}</span>
        </button>
      ))}
    </nav>
  );
}
