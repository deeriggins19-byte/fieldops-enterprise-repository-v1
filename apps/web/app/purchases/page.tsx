'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { api } from '../../lib/api';

const statuses = ['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'EXPIRED'];

export default function PurchasesPage() {
	const { t } = useI18n();
	const [rows, setRows] = useState<any[]>([]);
	const [status, setStatus] = useState('ALL');
	const [error, setError] = useState('');

	async function load() {
		setError('');
		try {
			const query = status === 'ALL' ? '' : `?status=${status}`;
			setRows(await api(`/payments/purchases${query}`));
		} catch (err: any) {
			setRows([]);
			setError(err?.message || t('purchases.error.load'));
		}
	}

	useEffect(() => {
		load();
	}, [status]);

	const metrics = useMemo(() => {
		const total = rows.length;
		const completed = rows.filter((row) => row.status === 'COMPLETED').length;
		const pending = rows.filter((row) => row.status === 'PENDING').length;
		const volume = rows
			.filter((row) => row.status === 'COMPLETED')
			.reduce((sum, row) => sum + Number(row.amountCents || 0), 0);
		return { total, completed, pending, volume };
	}, [rows]);

	return (
		<AppShell>
			<section className='headline card'>
				<p className='eyebrow'>{t('purchases.eyebrow')}</p>
				<h1>{t('purchases.title')}</h1>
				<p>{t('purchases.subtitle')}</p>
			</section>

			<section className='grid'>
				<div className='card metric-card'>
					<p className='metric-label'>{t('purchases.visible')}</p>
					<h2 className='metric-value'>{metrics.total}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('purchases.completed')}</p>
					<h2 className='metric-value'>{metrics.completed}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('purchases.pending')}</p>
					<h2 className='metric-value'>{metrics.pending}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('purchases.completedVolume')}</p>
					<h2 className='metric-value'>${(metrics.volume / 100).toFixed(2)}</h2>
				</div>
			</section>

			<section className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>{t('purchases.logKicker')}</p>
						<h2>{t('purchases.logTitle')}</h2>
					</div>
					<div className='button-row'>
						<select className='input stage-filter' value={status} onChange={(event) => setStatus(event.target.value)}>
							{statuses.map((value) => (
								<option value={value} key={value}>{value}</option>
							))}
						</select>
						<button className='btn btn-secondary' type='button' onClick={load}>{t('meetings.refresh')}</button>
					</div>
				</div>

				{error ? <p>{error}</p> : null}
				{!error && !rows.length ? <p>{t('purchases.noRows')}</p> : null}
				{rows.map((row) => (
					<article className='record-item' key={row.id}>
						<div className='record-head'>
							<h3>{String(row.planId || t('common.unknown')).toUpperCase()}</h3>
							<span className={`purchase-status purchase-status-${String(row.status || '').toLowerCase()}`}>{row.status}</span>
						</div>
						<dl className='record-meta'>
							<div>
								<dt>{t('purchases.field.amount')}</dt>
								<dd>${(Number(row.amountCents || 0) / 100).toFixed(2)} {String(row.currency || 'usd').toUpperCase()}</dd>
							</div>
							<div>
								<dt>{t('buy.billing')}</dt>
								<dd>{row.billingCycle}</dd>
							</div>
							<div>
								<dt>{t('purchases.field.paymentMethod')}</dt>
								<dd>{row.paymentMethod}</dd>
							</div>
							<div>
								<dt>{t('purchases.field.customerEmail')}</dt>
								<dd>{row.customerEmail || t('common.na')}</dd>
							</div>
							<div>
								<dt>{t('purchases.field.session')}</dt>
								<dd>{row.stripeSessionId}</dd>
							</div>
							<div>
								<dt>{t('purchases.field.created')}</dt>
								<dd>{new Date(row.createdAt).toLocaleString()}</dd>
							</div>
						</dl>
					</article>
				))}
			</section>
		</AppShell>
	);
}
