'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { api } from '../../lib/api';

type ComplianceSummary = {
	openAssetRequirements: number;
	openWorkOrderRequirements: number;
	totalOpenRequirements: number;
	overdueRequirements: number;
};

export default function Dashboard() {
	const { t } = useI18n();
	const [compliance, setCompliance] = useState<ComplianceSummary | null>(null);
	const topRowCards = [
		{ label: t('dashboard.kpi.activeProjects'), value: '12', trend: t('dashboard.kpi.activeProjectsTrend') },
		{ label: t('dashboard.kpi.scansToday'), value: '186', trend: t('dashboard.kpi.scansTodayTrend') },
		{ label: t('dashboard.kpi.openWorkOrders'), value: '37', trend: t('dashboard.kpi.openWorkOrdersTrend') }
	];

	const opsCards = [
		{ label: t('dashboard.ops.assetsTracked'), value: '248', trend: t('dashboard.ops.assetsTrackedTrend') },
		{ label: t('dashboard.ops.laborHours'), value: '423h', trend: t('dashboard.ops.laborHoursTrend') },
		{ label: t('dashboard.ops.aiActions'), value: '59', trend: t('dashboard.ops.aiActionsTrend') },
		{ label: t('dashboard.ops.inventoryAlerts'), value: '8', trend: t('dashboard.ops.inventoryAlertsTrend') }
	];

	useEffect(() => {
		let cancelled = false;
		async function loadCompliance() {
			try {
				const result = (await api('/osha-rules/summary')) as ComplianceSummary;
				if (!cancelled) setCompliance(result);
			} catch {
				if (!cancelled) setCompliance(null);
			}
		}
		loadCompliance();
		return () => {
			cancelled = true;
		};
	}, []);

	const complianceCard = useMemo(() => {
		if (!compliance) {
			return {
				label: t('dashboard.complianceLabel'),
				value: '--',
				trend: t('dashboard.complianceUnavailable')
			};
		}

		return {
			label: t('dashboard.complianceLabel'),
			value: String(compliance.totalOpenRequirements),
			trend: `Assets ${compliance.openAssetRequirements} | Work Orders ${compliance.openWorkOrderRequirements} | Overdue ${compliance.overdueRequirements}`
		};
	}, [compliance, t]);

	return (
		<AppShell>
			<section className='headline card dashboard-hero'>
				<p className='eyebrow'>{t('dashboard.eyebrow')}</p>
				<h1>{t('dashboard.title')}</h1>
				<p>{t('dashboard.subtitle')}</p>
				<div className='kpi-band'>
					{topRowCards.map((card) => (
						<article className='kpi-chip' key={card.label}>
							<p>{card.label}</p>
							<strong>{card.value}</strong>
							<span>{card.trend}</span>
						</article>
					))}
				</div>
			</section>

			<section className='dashboard-grid-balanced'>
				<div className='card metric-card spotlight-card'>
					<p className='metric-label'>{complianceCard.label}</p>
					<h2 className='metric-value'>{complianceCard.value}</h2>
					<p className='metric-trend'>{complianceCard.trend}</p>
				</div>
				<div className='card risk-card'>
					<p className='section-kicker'>{t('dashboard.signals.kicker')}</p>
					<h2>{t('dashboard.signals.title')}</h2>
					<ul className='signal-list'>
						<li>{t('dashboard.signals.one')}</li>
						<li>{t('dashboard.signals.two')}</li>
						<li>{t('dashboard.signals.three')}</li>
					</ul>
				</div>
			</section>

			<section className='grid'>
				{opsCards.map((card) => (
					<div className='card metric-card' key={card.label}>
						<p className='metric-label'>{card.label}</p>
						<h2 className='metric-value'>{card.value}</h2>
						<p className='metric-trend'>{card.trend}</p>
					</div>
				))}
			</section>
		</AppShell>
	);
}
