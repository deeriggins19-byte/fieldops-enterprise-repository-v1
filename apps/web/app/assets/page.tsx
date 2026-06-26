'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { RecordList } from '../../components/RecordList';
import { api } from '../../lib/api';

export default function Page() {
	const { t } = useI18n();
	const [rows, setRows] = useState<any[]>([]);
	const [oshaRules, setOshaRules] = useState<any[]>([]);
	const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
	const [selectedRuleByAsset, setSelectedRuleByAsset] = useState<Record<string, string>>({});

	const [code, setCode] = useState('PNL-001');
	const [serialNumber, setSerialNumber] = useState('');
	const [qrCodeValue, setQrCodeValue] = useState('');
	const [name, setName] = useState('Main Panel');
	const [category, setCategory] = useState('General');
	const [projectId, setProjectId] = useState('');
	const [selectedId, setSelectedId] = useState('');

	const [ruleCode, setRuleCode] = useState('1910.147');
	const [ruleTitle, setRuleTitle] = useState('Control of Hazardous Energy (Lockout/Tagout)');
	const [ruleSeverity, setRuleSeverity] = useState('HIGH');

	async function load() {
		try {
			const [assets, rules] = await Promise.all([api('/assets'), api('/osha-rules')]);
			setRows(assets);
			setOshaRules(rules);
		} catch {
			setRows([]);
			setOshaRules([]);
		}
	}

	async function create() {
		const body: any = { code, qrCodeValue, serialNumber, name, category, projectId };
		const path = selectedId ? `/assets/${selectedId}` : '/assets';
		const method = selectedId ? 'PATCH' : 'POST';
		await api(path, { method, body: JSON.stringify(body) });
		setSelectedId('');
		await load();
	}

	async function remove(row: any) {
		await api(`/assets/${row.id}`, { method: 'DELETE' });
		await load();
	}

	async function createRule() {
		await api('/osha-rules', { method: 'POST', body: JSON.stringify({ code: ruleCode, title: ruleTitle, severity: ruleSeverity }) });
		setRuleCode('');
		setRuleTitle('');
		setRuleSeverity('MEDIUM');
		await load();
	}

	async function assignRule(assetId: string) {
		const ruleId = selectedRuleByAsset[assetId];
		if (!ruleId) return;
		await api(`/osha-rules/${ruleId}/assets`, { method: 'POST', body: JSON.stringify({ assetId, status: 'REQUIRED' }) });
		await load();
	}

	function edit(row: any) {
		setSelectedId(row.id);
		setCode(row.code || '');
		setSerialNumber(row.serialNumber || '');
		setQrCodeValue(row.qrCodeValue || '');
		setName(row.name || '');
		setCategory(row.category || 'General');
		setProjectId(row.projectId || '');
	}

	useEffect(() => {
		load();
	}, []);

	useEffect(() => {
		let cancelled = false;
		async function buildQrCodes() {
			const entries = await Promise.all(
				rows.map(async (row) => [row.id, await QRCode.toDataURL(row.qrCodeValue || row.code, { errorCorrectionLevel: 'M', margin: 1, width: 160 })] as const)
			);
			if (!cancelled) setQrCodes(Object.fromEntries(entries));
		}

		if (rows.length) {
			buildQrCodes();
		} else {
			setQrCodes({});
		}

		return () => {
			cancelled = true;
		};
	}, [rows]);

	return (
		<AppShell>
			<h1>{t('assets.title')}</h1>
			<div className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>{t('assets.registryKicker')}</p>
						<h2>{t('assets.registryTitle')}</h2>
					</div>
					<Link className='btn btn-secondary' href='/scan-in'>
						{t('assets.openScan')}
					</Link>
				</div>
				<input className='input' value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('assets.input.code')} />
				<input className='input' value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder={t('assets.input.serialNumber')} />
				<input className='input' value={qrCodeValue} onChange={(e) => setQrCodeValue(e.target.value)} placeholder={t('assets.input.qrPayload')} />
				<input className='input' value={name} onChange={(e) => setName(e.target.value)} placeholder={t('assets.input.name')} />
				<input className='input' value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('assets.input.category')} />
				<input className='input' value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder={t('assets.input.projectId')} />
				<button className='btn' onClick={create}>
					{selectedId ? t('projects.save') : t('projects.create')}
				</button>
				{selectedId ? (
					<button
						className='btn btn-secondary'
						onClick={() => {
							setSelectedId('');
							setCode('PNL-001');
							setSerialNumber('');
							setQrCodeValue('');
							setName('Main Panel');
							setCategory('General');
							setProjectId('');
						}}
					>
						{t('projects.cancel')}
					</button>
				) : null}
			</div>

			<div className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>{t('assets.complianceKicker')}</p>
						<h2>{t('assets.complianceTitle')}</h2>
					</div>
				</div>
				<input className='input' value={ruleCode} onChange={(e) => setRuleCode(e.target.value)} placeholder={t('assets.ruleCode')} />
				<input className='input' value={ruleTitle} onChange={(e) => setRuleTitle(e.target.value)} placeholder={t('assets.ruleTitle')} />
				<input className='input' value={ruleSeverity} onChange={(e) => setRuleSeverity(e.target.value)} placeholder={t('assets.ruleSeverity')} />
				<button className='btn' onClick={createRule}>
					{t('assets.addRule')}
				</button>
				<p>
					{oshaRules.length} {t('assets.ruleCount')}
				</p>
			</div>

			<RecordList
				title={t('assets.title')}
				rows={rows}
				onEdit={edit}
				onDelete={remove}
				renderExtra={(row) => (
					<div>
						<div className='qr-card'>
							{qrCodes[row.id] ? <img src={qrCodes[row.id]} alt={row.code || row.name || 'QR'} /> : null}
							<div>
								<p className='qr-label'>QR</p>
								<p>{row.qrCodeValue || row.code}</p>
							</div>
						</div>
						<div className='button-row'>
							<select
								className='input'
								value={selectedRuleByAsset[row.id] || ''}
								onChange={(e) =>
									setSelectedRuleByAsset((current) => ({
										...current,
										[row.id]: e.target.value
									}))
								}
							>
								<option value=''>{t('assets.selectRule')}</option>
								{oshaRules.map((rule: any) => (
									<option key={rule.id} value={rule.id}>
										{rule.code} - {rule.title}
									</option>
								))}
							</select>
							<button className='btn btn-secondary' type='button' onClick={() => assignRule(row.id)} disabled={!selectedRuleByAsset[row.id]}>
								{t('assets.assignRule')}
							</button>
						</div>
						{row.oshaRules?.length ? (
							<ul className='pricing-list'>
								{row.oshaRules.map((link: any) => (
									<li key={link.id}>
										<strong>{link.rule?.code || 'RULE'}</strong> {link.rule?.title} ({link.status})
									</li>
								))}
							</ul>
						) : (
							<p>{t('assets.noRulesAssigned')}</p>
						)}
					</div>
				)}
			/>
		</AppShell>
	);
}
