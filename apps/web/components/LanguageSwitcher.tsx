'use client';

import { useI18n } from './I18nProvider';

export function LanguageSwitcher() {
	const { locale, setLocale, locales, t } = useI18n();

	return (
		<div className='language-switcher'>
			<label className='language-switcher-label' htmlFor='language-select'>
				{t('language.label')}
			</label>
			<select
				id='language-select'
				className='language-select'
				value={locale}
				onChange={(event) => setLocale(event.target.value as typeof locale)}
			>
				{locales.map((option) => (
					<option key={option.code} value={option.code}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
