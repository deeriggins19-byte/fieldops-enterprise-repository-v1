'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLocale, localeOptions, localeStorageKey, type LocaleCode, translate } from '../lib/i18n';

type I18nContextValue = {
	locale: LocaleCode;
	setLocale: (locale: LocaleCode) => void;
	t: (key: string) => string;
	locales: typeof localeOptions;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<LocaleCode>(defaultLocale);

	useEffect(() => {
		const saved = localStorage.getItem(localeStorageKey) as LocaleCode | null;
		if (!saved) return;
		if (!localeOptions.some((option) => option.code === saved)) return;
		setLocaleState(saved);
	}, []);

	useEffect(() => {
		document.documentElement.lang = locale;
		localStorage.setItem(localeStorageKey, locale);
	}, [locale]);

	const value = useMemo<I18nContextValue>(
		() => ({
			locale,
			setLocale: setLocaleState,
			t: (key: string) => translate(locale, key),
			locales: localeOptions
		}),
		[locale]
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error('useI18n must be used inside I18nProvider.');
	}

	return context;
}
