import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  border: string;
  inputBg: string;
  error: string;
  headerBg: string;
  headerText: string;
  statusBar: 'light' | 'dark';
}

const lightTheme: ThemeColors = {
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  primary: '#1E3A5F',
  primaryLight: '#EFF6FF',
  border: '#D1D5DB',
  inputBg: '#F3F4F6',
  error: '#EF4444',
  headerBg: '#1E3A5F',
  headerText: '#FFFFFF',
  statusBar: 'light',
};

const darkTheme: ThemeColors = {
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  primary: '#3B82F6',
  primaryLight: '#1E3A5F',
  border: '#374151',
  inputBg: '#374151',
  error: '#F87171',
  headerBg: '#0F172A',
  headerText: '#F9FAFB',
  statusBar: 'dark',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  function toggleTheme() {
    setIsDark((prev) => !prev);
  }

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
