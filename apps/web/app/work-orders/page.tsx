'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { RecordList } from '../../components/RecordList';
import { api } from '../../lib/api';

export default function Page() {
	const { t } = useI18n();
	const [rows, setRows] = useState<any[]>([]);
	const [oshaRules, setOshaRules] = useState<any[]>([]);
	const [selectedRuleByWorkOrder, setSelectedRuleByWorkOrder] = useState<Record<string, string>>({});
	const [title, setTitle] = useState('Install device');
	const [description, setDescription] = useState('');
	const [priority, setPriority] = useState('NORMAL');
	const [projectId, setProjectId] = useState('');
	const [assetId, setAssetId] = useState('');
	const [selectedId, setSelectedId] = useState('');

	async function load() {
		try {
			const [workOrders, rules] = await Promise.all([api('/work-orders'), api('/osha-rules')]);
			setRows(workOrders);
			setOshaRules(rules);
		} catch {
			setRows([]);
			setOshaRules([]);
		}
	}

	async function create() {
		const body: any = { title, description, priority, projectId, assetId };
		const path = selectedId ? `/work-orders/${selectedId}` : '/work-orders';
		const method = selectedId ? 'PATCH' : 'POST';
		await api(path, { method, body: JSON.stringify(body) });
		setSelectedId('');
		await load();
	}

	async function remove(row: any) {
		await api(`/work-orders/${row.id}`, { method: 'DELETE' });
		await load();
	}

	async function assignRule(workOrderId: string) {
		const ruleId = selectedRuleByWorkOrder[workOrderId];
		if (!ruleId) return;
		await api(`/osha-rules/${ruleId}/work-orders`, { method: 'POST', body: JSON.stringify({ workOrderId, status: 'REQUIRED' }) });
		await load();
	}

	function edit(row: any) {
		setSelectedId(row.id);
		setTitle(row.title || '');
		setDescription(row.description || '');
		setPriority(row.priority || 'NORMAL');
		setProjectId(row.projectId || '');
		setAssetId(row.assetId || '');
	}

	useEffect(() => {
		load();
	}, []);

	return (
		<AppShell>
			<h1>{t('workOrders.title')}</h1>
			<div className='card'>
				<input className='input' value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('workOrders.input.title')} />
				<input className='input' value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('workOrders.input.description')} />
				<input className='input' value={priority} onChange={(e) => setPriority(e.target.value)} placeholder={t('workOrders.input.priority')} />
				<input className='input' value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder={t('workOrders.input.projectId')} />
				<input className='input' value={assetId} onChange={(e) => setAssetId(e.target.value)} placeholder={t('workOrders.input.assetId')} />
				<button className='btn' onClick={create}>
					{selectedId ? t('projects.save') : t('projects.create')}
				</button>
				{selectedId ? (
					<button
						className='btn btn-secondary'
						onClick={() => {
							setSelectedId('');
							setTitle('Install device');
							setDescription('');
							setPriority('NORMAL');
							setProjectId('');
							setAssetId('');
						}}
					>
						{t('projects.cancel')}
					</button>
				) : null}
			</div>
			<RecordList
				title={t('workOrders.title')}
				rows={rows}
				onEdit={edit}
				onDelete={remove}
				renderExtra={(row) => (
					<div>
						<div className='button-row'>
							<select
								className='input'
								value={selectedRuleByWorkOrder[row.id] || ''}
								onChange={(e) =>
									setSelectedRuleByWorkOrder((current) => ({
										...current,
										[row.id]: e.target.value
									}))
								}
							>
								<option value=''>{t('workOrders.selectRule')}</option>
								{oshaRules.map((rule: any) => (
									<option key={rule.id} value={rule.id}>
										{rule.code} - {rule.title}
									</option>
								))}
							</select>
							<button className='btn btn-secondary' type='button' onClick={() => assignRule(row.id)} disabled={!selectedRuleByWorkOrder[row.id]}>
								{t('workOrders.assignRule')}
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
							<p>{t('workOrders.noRulesAssigned')}</p>
						)}
					</div>
				)}
			/>
		</AppShell>
	);
}
