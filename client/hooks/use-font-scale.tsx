import React, { createContext, useContext, useState, useEffect } from 'react';

type FontScale = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

interface FontScaleContextType {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  applyScale: (element?: HTMLElement) => void;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

const FONT_SCALE_VALUES = {
  xs: 0.75,
  sm: 0.85,
  base: 0.9,
  lg: 1.0,
  xl: 1.15,
  '2xl': 1.3,
};

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>('base');

  const applyScale = (element?: HTMLElement) => {
    const target = element || document.documentElement;
    const scaleValue = FONT_SCALE_VALUES[fontScale];
    const spacingScale = scaleValue;

    target.style.setProperty('--font-scale', scaleValue.toString());
    target.style.setProperty('--spacing-scale', spacingScale.toString());
    
    // Apply the scale class to body for immediate effect
    document.body.className = document.body.className.replace(/font-scale-\w+/g, '');
    document.body.classList.add(`font-scale-${fontScale}`);
  };

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
    // Save to localStorage
    localStorage.setItem('excel-explorer-font-scale', scale);
  };

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('excel-explorer-font-scale') as FontScale;
    if (saved && saved in FONT_SCALE_VALUES) {
      setFontScaleState(saved);
    }
  }, []);

  useEffect(() => {
    applyScale();
  }, [fontScale]);

  return (
    <FontScaleContext.Provider value={{ fontScale, setFontScale, applyScale }}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const context = useContext(FontScaleContext);
  if (context === undefined) {
    throw new Error('useFontScale must be used within a FontScaleProvider');
  }
  return context;
}

export const FONT_SCALE_OPTIONS = [
  { value: 'xs' as FontScale, label: 'Extra Peque��o', percentage: '75%' },
  { value: 'sm' as FontScale, label: 'Pequeño', percentage: '85%' },
  { value: 'base' as FontScale, label: 'Compacto (Base)', percentage: '90%' },
  { value: 'lg' as FontScale, label: 'Normal', percentage: '100%' },
  { value: 'xl' as FontScale, label: 'Grande', percentage: '115%' },
  { value: '2xl' as FontScale, label: 'Extra Grande', percentage: '130%' },
];
