'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

declare global {
	interface Window {
		googleTranslateElementInit?: () => void;
		google?: {
			translate?: {
				TranslateElement?: new (
					options: { pageLanguage: string; autoDisplay?: boolean },
					elementId: string
				) => unknown;
			};
		};
	}
}

const elementId = 'google_translate_element';

export function LanguageSwitcher() {
	const [ready, setReady] = useState(false);
	const initializedRef = useRef(false);

	const storageKey = useMemo(() => 'fieldops_preferred_lang', []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (initializedRef.current) return;

		initializedRef.current = true;
		window.googleTranslateElementInit = () => {
			if (!window.google?.translate?.TranslateElement) return;
			new window.google.translate.TranslateElement(
				{
					pageLanguage: 'en',
					autoDisplay: false
				},
				elementId
			);
			setReady(true);
		};

		const existingScript = document.querySelector('script[data-google-translate="true"]');
		if (!existingScript) {
			const script = document.createElement('script');
			script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
			script.async = true;
			script.setAttribute('data-google-translate', 'true');
			document.body.appendChild(script);
		} else if (window.google?.translate?.TranslateElement) {
			window.googleTranslateElementInit?.();
		}
	}, []);

	useEffect(() => {
		if (!ready) return;

		const saved = localStorage.getItem(storageKey);
		if (!saved) return;

		const interval = window.setInterval(() => {
			const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
			if (!select) return;
			select.value = saved;
			select.dispatchEvent(new Event('change'));
			window.clearInterval(interval);
		}, 200);

		return () => window.clearInterval(interval);
	}, [ready, storageKey]);

	useEffect(() => {
		if (!ready) return;

		let attachedSelect: HTMLSelectElement | null = null;
		let onChange: (() => void) | null = null;
		const interval = window.setInterval(() => {
			const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
			if (!select) return;
			onChange = () => localStorage.setItem(storageKey, select.value);
			select.addEventListener('change', onChange);
			attachedSelect = select;
			window.clearInterval(interval);
		}, 200);

		return () => {
			window.clearInterval(interval);
			if (attachedSelect && onChange) {
				attachedSelect.removeEventListener('change', onChange);
			}
		};
	}, [ready, storageKey]);

	return (
		<div className='language-switcher'>
			<div className='language-switcher-label'>Language</div>
			<div id={elementId} />
		</div>
	);
}