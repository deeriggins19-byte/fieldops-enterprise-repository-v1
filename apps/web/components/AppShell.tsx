 'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
const nav = [
	{ label: 'Marketing', href: '/marketing' },
	{ label: 'Buy', href: '/buy' },
	{ label: 'Purchases', href: '/purchases' },
	{ label: 'Dashboard', href: '/dashboard' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'Meetings', href: '/meetings' },
	{ label: 'Assets', href: '/assets' },
	{ label: 'Scan In', href: '/scan-in' },
	{ label: 'Work Orders', href: '/work-orders' },
	{ label: 'Training', href: '/training' },
	{ label: 'Inventory', href: '/inventory' },
	{ label: 'Forecasting', href: '/forecasting' },
	{ label: 'Amara', href: '/amara' },
	{ label: 'Customer Portal', href: '/customer-portal' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [timestamp, setTimestamp] = useState('');
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const menuRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
	}, []);

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
				return item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q);
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
					<p className='brand-kicker'>Field Service OS</p>
					<h2>FieldOps</h2>
					<p className='brand-copy'>Operational control for teams in motion.</p>
				</div>
				<nav className='nav'>
					{nav.map((item) => (
						<Link className={`nav-link ${pathname === item.href ? 'is-active' : ''}`} key={item.href} href={item.href}>
							{item.label}
						</Link>
					))}
				</nav>
			</aside>
			<main className='main'>
				<div className='status-rail card'>
					<div className='status-item'>
						<span className='status-dot status-live' />
						Live Ops
					</div>
					<div className='status-item'>Route: {pathname}</div>
					<div className='status-item'>Updated {timestamp || '--:--'}</div>
					<div className='shell-search' ref={searchRef}>
						<input
							className='shell-search-input'
							placeholder='Search pages...'
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
										<span>{item.label}</span>
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
							Commander
							<span className={`user-menu-arrow ${menuOpen ? 'open' : ''}`}>▾</span>
						</button>
						{menuOpen && (
							<div className='user-menu-panel'>
								<button className='user-menu-item' type='button' onClick={() => setMenuOpen(false)}>
									Profile
								</button>
								<button className='user-menu-item' type='button' onClick={() => setMenuOpen(false)}>
									Preferences
								</button>
								<button className='user-menu-item user-menu-item-warn' type='button' onClick={() => setMenuOpen(false)}>
									Sign out
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
