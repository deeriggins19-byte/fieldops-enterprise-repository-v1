 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
const nav = [
	{ label: 'Dashboard', href: '/dashboard' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'Assets', href: '/assets' },
	{ label: 'Work Orders', href: '/work-orders' },
	{ label: 'Inventory', href: '/inventory' },
	{ label: 'Forecasting', href: '/forecasting' },
	{ label: 'Amara', href: '/amara' },
	{ label: 'Customer Portal', href: '/customer-portal' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function onDocumentClick(event: MouseEvent) {
			if (!menuRef.current) return;
			if (!menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		}

		document.addEventListener('mousedown', onDocumentClick);
		return () => document.removeEventListener('mousedown', onDocumentClick);
	}, []);

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
					<div className='status-item'>Updated {timestamp}</div>
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
