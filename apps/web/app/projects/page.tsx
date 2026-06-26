'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { RecordList } from '../../components/RecordList';
import { api } from '../../lib/api';

export default function Page() {
	const { t } = useI18n();
	const [rows, setRows] = useState<any[]>([]);
	const [name, setName] = useState('New Project');
	const [customerName, setCustomerName] = useState('');
	const [estimatedHours, setEstimatedHours] = useState('0');
	const [selectedId, setSelectedId] = useState('');

	async function load() {
		try {
			setRows(await api('/projects'));
		} catch {
			setRows([]);
		}
	}

	async function create() {
		const body: any = { name, customerName, estimatedHours: Number(estimatedHours) || 0 };
		const path = selectedId ? `/projects/${selectedId}` : '/projects';
		const method = selectedId ? 'PATCH' : 'POST';
		await api(path, { method, body: JSON.stringify(body) });
		setSelectedId('');
		await load();
	}

	async function remove(row: any) {
		await api(`/projects/${row.id}`, { method: 'DELETE' });
		await load();
	}

	function edit(row: any) {
		setSelectedId(row.id);
		setName(row.name || '');
		setCustomerName(row.customerName || '');
		setEstimatedHours(String(row.estimatedHours ?? '0'));
	}

	useEffect(() => {
		load();
	}, []);

	return (
		<AppShell>
			<h1>{t('projects.title')}</h1>
			<div className='card'>
				<input className='input' value={name} onChange={(e) => setName(e.target.value)} placeholder={t('projects.input.name')} />
				<input className='input' value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('projects.input.customerName')} />
				<input
					className='input'
					value={estimatedHours}
					onChange={(e) => setEstimatedHours(e.target.value)}
					placeholder={t('projects.input.estimatedHours')}
					inputMode='decimal'
				/>
				<button className='btn' onClick={create}>
					{selectedId ? t('projects.save') : t('projects.create')}
				</button>
				{selectedId ? (
					<button
						className='btn btn-secondary'
						onClick={() => {
							setSelectedId('');
							setName('New Project');
							setCustomerName('');
							setEstimatedHours('0');
						}}
					>
						{t('projects.cancel')}
					</button>
				) : null}
			</div>
			<RecordList title={t('projects.title')} rows={rows} onEdit={edit} onDelete={remove} />
		</AppShell>
	);
}
