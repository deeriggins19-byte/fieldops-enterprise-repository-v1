'use client';

import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { useI18n } from '../components/I18nProvider';

export default function Page() {
	const { t } = useI18n();
	const highlights = [
		{ title: t('home.highlight.scan.title'), copy: t('home.highlight.scan.copy') },
		{ title: t('home.highlight.ops.title'), copy: t('home.highlight.ops.copy') },
		{ title: t('home.highlight.closeout.title'), copy: t('home.highlight.closeout.copy') }
	];

	return (
		<AppShell>
			<section className='card marketing-hero'>
				<p className='eyebrow'>{t('home.eyebrow')}</p>
				<h1>{t('home.title')}</h1>
				<p className='marketing-subhead'>{t('home.subtitle')}</p>
				<div className='button-row'>
					<Link className='btn' href='/marketing'>
						{t('home.cta.explore')}
					</Link>
					<Link className='btn btn-secondary' href='/register'>
						{t('home.cta.pilot')}
					</Link>
				</div>
			</section>
			<section className='grid'>
				{highlights.map((item) => (
					<article className='card marketing-tile' key={item.title}>
						<h2>{item.title}</h2>
						<p>{item.copy}</p>
					</article>
				))}
			</section>
		</AppShell>
	);
}
