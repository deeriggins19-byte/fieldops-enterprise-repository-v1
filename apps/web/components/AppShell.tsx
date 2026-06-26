 'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from './I18nProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
const nav = [
	{ labelKey: 'nav.marketing', href: '/marketing' },
	{ labelKey: 'nav.buy', href: '/buy' },
	{ labelKey: 'nav.purchases', href: '/purchases' },
	{ labelKey: 'nav.dashboard', href: '/dashboard' },
	{ labelKey: 'nav.projects', href: '/projects' },
	{ labelKey: 'nav.meetings', href: '/meetings' },
	{ labelKey: 'nav.assets', href: '/assets' },
	{ labelKey: 'nav.scanIn', href: '/scan-in' },
	{ labelKey: 'nav.workOrders', href: '/work-orders' },
	{ labelKey: 'nav.training', href: '/training' },
	{ labelKey: 'nav.inventory', href: '/inventory' },
	{ labelKey: 'nav.forecasting', href: '/forecasting' },
	{ labelKey: 'nav.amara', href: '/amara' },
	{ labelKey: 'nav.customerPortal', href: '/customer-portal' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
	const { locale, t } = useI18n();
	const pathname = usePathname();
	const router = useRouter();
	const [timestamp, setTimestamp] = useState('');
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const menuRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setTimestamp(new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }));
	}, [locale]);

	useEffect(() => {
		function onDocumentClick(event: MouseEvent) {
			if (!menuRef.current) return;
			if (!menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setSearchTerm('');
			}
		}

		document.addEventListener('mousedown', onDocumentClick);
		return () => document.removeEventListener('mousedown', onDocumentClick);
	}, []);

	const searchResults = searchTerm.trim()
		? nav.filter((item) => {
				const q = searchTerm.toLowerCase();
				const label = t(item.labelKey).toLowerCase();
				return label.includes(q) || item.href.toLowerCase().includes(q);
		  })
		: [];

	function goToFirstMatch() {
		if (!searchResults.length) return;
		router.push(searchResults[0].href);
		setSearchTerm('');
	}

	return (
		<div className='shell'>
			<aside className='side'>
				<div className='brand'>
					<p className='brand-kicker'>{t('brand.kicker')}</p>
					<h2>FieldOps</h2>
					<p className='brand-copy'>{t('brand.copy')}</p>
				</div>
				<nav className='nav'>
					{nav.map((item) => (
						<Link className={`nav-link ${pathname === item.href ? 'is-active' : ''}`} key={item.href} href={item.href}>
							{t(item.labelKey)}
						</Link>
					))}
				</nav>
			</aside>
			<main className='main'>
				<div className='status-rail card'>
					<div className='status-item'>
						<span className='status-dot status-live' />
						{t('status.live')}
					</div>
					<div className='status-item'>
						{t('status.route')}: {pathname}
					</div>
					<div className='status-item'>
						{t('status.updated')} {timestamp || '--:--'}
					</div>
					<div className='shell-search' ref={searchRef}>
						<input
							className='shell-search-input'
							placeholder={t('search.placeholder')}
							onChange={(event) => setSearchTerm(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') goToFirstMatch();
							}}
							value={searchTerm}
						/>
						{searchResults.length ? (
							<div className='shell-search-results'>
								{searchResults.slice(0, 6).map((item) => (
									<button
										className='shell-search-result'
										onClick={() => {
											router.push(item.href);
											setSearchTerm('');
										}}
										type='button'
										key={item.href}
									>
										<span>{t(item.labelKey)}</span>
										<small>{item.href}</small>
									</button>
								))}
							</div>
						) : null}
					</div>
					<div className='language-slot'>
						<LanguageSwitcher />
					</div>
					<div className='user-menu' ref={menuRef}>
						<button className='user-menu-trigger' onClick={() => setMenuOpen((v) => !v)} type='button'>
							<span className='user-menu-avatar'>FO</span>
							{t('user.commander')}
							<span className={`user-menu-arrow ${menuOpen ? 'open' : ''}`}>▾</span>
						</button>
						{menuOpen && (
							<div className='user-menu-panel'>
								<button className='user-menu-item' type='button' onClick={() => setMenuOpen(false)}>
									{t('user.profile')}
								</button>
								<button className='user-menu-item' type='button' onClick={() => setMenuOpen(false)}>
									{t('user.preferences')}
								</button>
								<button className='user-menu-item user-menu-item-warn' type='button' onClick={() => setMenuOpen(false)}>
									{t('user.signout')}
								</button>
							</div>
						)}
					</div>
				</div>
				<div className='content'>{children}</div>
			</main>
		</div>
	);
}
