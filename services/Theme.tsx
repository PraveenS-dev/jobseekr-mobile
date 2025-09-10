import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeName = 'light' | 'dark' | 'system';

export type ThemeColors = {
	background: string;
	surface: string;
	textPrimary: string;
	textSecondary: string;
	border: string;

	accent: string;
	accentText: string;

	// Semantic/utility colors
	yellow: string;
	orange: string;
	blue: string;
	green: string;
	red: string;

	success: string;
	primary: string;
	danger: string;

	cardShadow: string;
	inputBackground: string;
	inputText: string;
	inputPlaceholder: string;

	tagLight?: string;
	tagDark?: string;
};


export type ThemeContextValue = {
	current: Exclude<ThemeName, 'system'>; // resolved theme
	preference: ThemeName; // user preference
	colors: ThemeColors;
	setPreference: (name: ThemeName) => void;
	toggle: () => void;
	isDark: boolean; // added boolean for convenience
};

const THEME_STORAGE_KEY = 'theme_preference_v1';

const lightColors: ThemeColors = {
	background: '#F9FAFB',
	surface: '#ffffff',
	textPrimary: '#111827',
	textSecondary: '#6b7280',
	border: '#e5e7eb',

	accent: '#3B82F6',
	accentText: '#ffffff',

	yellow: '#FACC15',
	orange: '#F97316',
	blue: '#3B82F6',
	green: '#22C55E',
	red: '#EF4444',

	success: '#22C55E',
	primary: '#3B82F6',
	danger: '#EF4444',

	cardShadow: 'rgba(0,0,0,0.08)',
	inputBackground: '#ffffff',
	inputText: '#111827',
	inputPlaceholder: '#9ca3af',

	tagLight: '#E0F2FF',
};

const darkColors: ThemeColors = {
	background: '#0b0f14',
	surface: '#1F2937',
	textPrimary: '#f3f4f6',
	textSecondary: '#9ca3af',
	border: '#dceeef',

	accent: '#3B82F6',
	accentText: '#0b0f14',

	yellow: '#FACC15',
	orange: '#FB923C',
	blue: '#3B82F6',
	green: '#22C55E',
	red: '#EF4444',

	success: '#22C55E',
	primary: '#3B82F6',
	danger: '#EF4444',

	cardShadow: 'rgba(0,0,0,0.6)',
	inputBackground: '#0f172a',
	inputText: '#f3f4f6',
	inputPlaceholder: '#9ca3af',

	tagDark: '#1E40AF',
};


export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveColors(scheme: Exclude<ThemeName, 'system'>): ThemeColors {
	return scheme === 'dark' ? darkColors : lightColors;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const systemScheme = Appearance.getColorScheme();
	const [preference, setPreferenceState] = useState<ThemeName>('system');
	const [resolved, setResolved] = useState<Exclude<ThemeName, 'system'>>(systemScheme === 'dark' ? 'dark' : 'light');

	// Load saved preference
	useEffect(() => {
		AsyncStorage.getItem(THEME_STORAGE_KEY).then(stored => {
			if (stored === 'light' || stored === 'dark' || stored === 'system') {
				setPreferenceState(stored as ThemeName);
			}
		});
	}, []);

	// Listen for system changes
	useEffect(() => {
		const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
			if (preference === 'system') {
				setResolved(colorScheme === 'dark' ? 'dark' : 'light');
			}
		};
		// @ts-ignore different RN versions
		const subscription = Appearance.addChangeListener(listener);
		return () => {
			// @ts-ignore legacy API
			if (typeof Appearance.removeChangeListener === 'function') {
				// @ts-ignore
				Appearance.removeChangeListener(listener);
			}
			// @ts-ignore modern API
			if (subscription && typeof subscription.remove === 'function') {
				subscription.remove();
			}
		};
	}, [preference]);

	// Resolve theme whenever preference changes
	useEffect(() => {
		if (preference === 'system') {
			setResolved(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
		} else {
			setResolved(preference);
		}
	}, [preference]);

	const colors = useMemo(() => resolveColors(resolved), [resolved]);

	const setPreference = useCallback((name: ThemeName) => {
		setPreferenceState(name);
		AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch(() => { });
	}, []);

	const toggle = useCallback(() => {
		setPreferenceState(prev => {
			const next: ThemeName =
				prev === 'dark' ? 'light' : prev === 'light' ? 'dark' : resolved === 'dark' ? 'light' : 'dark';
			AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => { });
			return next;
		});
	}, [resolved]);

	const value: ThemeContextValue = {
		current: resolved,
		preference,
		colors,
		setPreference,
		toggle,
		isDark: resolved === 'dark',
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
	const ctx = React.useContext(ThemeContext);
	if (!ctx) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return ctx;
}
