'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { api } from '../../lib/api';

const statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const conferenceProviders = ['Teams', 'Zoom', 'Google Meet', 'Webex', 'Other'];

function toLocalInputValue(value?: string) {
	if (!value) return '';
	const date = new Date(value);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDayKey(value: string) {
	const date = new Date(value);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dayHeading(value: string) {
	return new Date(value).toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'short',
		day: 'numeric'
	});
}

function reminderLabel(meeting: any, t: (key: string) => string) {
	if (!meeting?.reminderMinutes || meeting.status === 'COMPLETED' || meeting.status === 'CANCELLED') return '';
	const now = Date.now();
	const startsAt = new Date(meeting.startsAt).getTime();
	const reminderAt = startsAt - meeting.reminderMinutes * 60 * 1000;
	if (now < reminderAt) return '';
	if (now >= startsAt) return t('meetings.reminder.inProgressWindow');
	return `${t('meetings.reminder.dueNowPrefix')} (${meeting.reminderMinutes}m ${t('meetings.reminder.beforeStart')})`;
}

function normalizeConferenceUrl(value: string) {
	const trimmed = value.trim();
	if (!trimmed) return '';
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

function defaultDurationMinutes(startsAt: string, endsAt: string) {
	if (!startsAt) return 30;
	if (!endsAt) return 30;
	const duration = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);
	if (!Number.isFinite(duration) || duration <= 0) return 30;
	return duration;
}

function zoomDefaults(title: string, startsAt: string, endsAt: string) {
	const topic = (title || 'FieldOps Meeting').trim();
	const duration = defaultDurationMinutes(startsAt, endsAt);
	const startIso = startsAt ? new Date(startsAt).toISOString() : '';
	return { topic, duration, startIso };
}

function conferenceCreateUrl(provider: string, title: string, agenda: string, startsAt: string, endsAt: string) {
	const safeTitle = encodeURIComponent(title || 'FieldOps Meeting');
	const safeAgenda = encodeURIComponent(agenda || '');

	if (provider === 'Teams') {
		const startIso = startsAt ? new Date(startsAt).toISOString() : '';
		const fallbackEnd = startsAt ? new Date(new Date(startsAt).getTime() + 30 * 60 * 1000).toISOString() : '';
		const endIso = endsAt ? new Date(endsAt).toISOString() : fallbackEnd;
		const query = [`subject=${safeTitle}`, startIso ? `startTime=${encodeURIComponent(startIso)}` : '', endIso ? `endTime=${encodeURIComponent(endIso)}` : '', `content=${safeAgenda}`]
			.filter(Boolean)
			.join('&');
		return `https://teams.microsoft.com/l/meeting/new?${query}`;
	}

	if (provider === 'Google Meet') return 'https://meet.google.com/new';
	if (provider === 'Zoom') {
		const defaults = zoomDefaults(title, startsAt, endsAt);
		const query = [`topic=${encodeURIComponent(defaults.topic)}`, `duration=${defaults.duration}`, defaults.startIso ? `start_time=${encodeURIComponent(defaults.startIso)}` : '']
			.filter(Boolean)
			.join('&');
		return `https://zoom.us/meeting/schedule?${query}`;
	}
	if (provider === 'Webex') return 'https://web.webex.com/meetings/schedule';
	return '';
}

export default function MeetingsPage() {
	const { t } = useI18n();
	const [rows, setRows] = useState<any[]>([]);
	const [scope, setScope] = useState('upcoming');
	const [title, setTitle] = useState('Weekly Ops Sync');
	const [agenda, setAgenda] = useState('Review field blockers and schedule commitments.');
	const [location, setLocation] = useState('HQ Room B / Teams');
	const [attendees, setAttendees] = useState('Ops Lead, Dispatch, PM');
	const [conferenceProvider, setConferenceProvider] = useState('Teams');
	const [conferenceUrl, setConferenceUrl] = useState('');
	const [reminderMinutes, setReminderMinutes] = useState('15');
	const [startsAt, setStartsAt] = useState('');
	const [endsAt, setEndsAt] = useState('');
	const [status, setStatus] = useState('SCHEDULED');
	const [selectedId, setSelectedId] = useState('');
	const [error, setError] = useState('');
	const [copyStatus, setCopyStatus] = useState('');

	async function load() {
		setError('');
		try {
			setRows(await api(`/meetings?scope=${scope}`));
		} catch (err: any) {
			setRows([]);
			setError(err?.message || t('meetings.error.load'));
		}
	}

	async function saveMeeting() {
		if (!startsAt) {
				setError(t('meetings.error.startRequired'));
			return;
		}
		setError('');
		const body = {
			title,
			agenda,
			location,
			attendees,
			conferenceProvider,
			conferenceUrl: normalizeConferenceUrl(conferenceUrl),
			reminderMinutes,
			startsAt: new Date(startsAt).toISOString(),
			endsAt: endsAt ? new Date(endsAt).toISOString() : '',
			status
		};

		const path = selectedId ? `/meetings/${selectedId}` : '/meetings';
		const method = selectedId ? 'PATCH' : 'POST';
		await api(path, { method, body: JSON.stringify(body) });
		resetForm();
		await load();
	}

	async function removeMeeting(id: string) {
		setError('');
		await api(`/meetings/${id}`, { method: 'DELETE' });
		await load();
	}

	function openConferenceCreator() {
		const url = conferenceCreateUrl(conferenceProvider, title, agenda, startsAt, endsAt);
		if (!url) {
				setError(t('meetings.error.providerRequired'));
			return;
		}
		setCopyStatus('');
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	async function copyZoomSetupSummary() {
		const startsText = startsAt ? new Date(startsAt).toLocaleString() : t('common.notSet');
		const duration = defaultDurationMinutes(startsAt, endsAt);
		const lines = [
			`${t('meetings.zoom.summary')}`,
			`${t('meetings.field.title')}: ${title || t('meetings.defaultTitle')}`,
			`${t('meetings.field.starts')}: ${startsText}`,
			`${t('meetings.field.duration')}: ${duration} ${t('meetings.minutes')}`,
			`${t('meetings.field.attendees')}: ${attendees || t('common.na')}`,
			`${t('meetings.field.location')}: ${location || t('common.na')}`,
			`${t('meetings.field.agenda')}: ${agenda || t('common.na')}`,
			`${t('meetings.field.conferenceLink')}: ${conferenceUrl ? normalizeConferenceUrl(conferenceUrl) : t('meetings.addAfterScheduling')}`
		];

		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			setError('');
			setCopyStatus(t('meetings.zoom.copied'));
		} catch {
			setCopyStatus('');
			setError(t('meetings.error.clipboard'));
		}
	}

	function editMeeting(row: any) {
		setSelectedId(row.id);
		setTitle(row.title || '');
		setAgenda(row.agenda || '');
		setLocation(row.location || '');
		setAttendees(row.attendees || '');
		setConferenceProvider(row.conferenceProvider || 'Teams');
		setConferenceUrl(row.conferenceUrl || '');
		setReminderMinutes(row.reminderMinutes ? String(row.reminderMinutes) : '15');
		setStartsAt(toLocalInputValue(row.startsAt));
		setEndsAt(toLocalInputValue(row.endsAt));
		setStatus(row.status || 'SCHEDULED');
	}

	function resetForm() {
		setSelectedId('');
		setTitle('Weekly Ops Sync');
		setAgenda('Review field blockers and schedule commitments.');
		setLocation('HQ Room B / Teams');
		setAttendees('Ops Lead, Dispatch, PM');
		setConferenceProvider('Teams');
		setConferenceUrl('');
		setReminderMinutes('15');
		setStartsAt('');
		setEndsAt('');
		setStatus('SCHEDULED');
		setCopyStatus('');
	}

	useEffect(() => {
		load();
	}, [scope]);

	const stats = useMemo(() => {
		const total = rows.length;
		const scheduled = rows.filter((row) => row.status === 'SCHEDULED').length;
		const completed = rows.filter((row) => row.status === 'COMPLETED').length;
		const videoReady = rows.filter((row) => Boolean(row.conferenceUrl)).length;
		return { total, scheduled, completed, videoReady };
	}, [rows]);

	const groupedRows = useMemo(() => {
		const byDay: Record<string, any[]> = {};
		for (const row of rows) {
			const key = toDayKey(row.startsAt);
			if (!byDay[key]) byDay[key] = [];
			byDay[key].push(row);
		}

		return Object.entries(byDay)
			.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
			.map(([day, meetings]) => ({
				day,
				heading: dayHeading(`${day}T00:00:00`),
				meetings
			}));
	}, [rows]);

	const zoomPlan = useMemo(() => zoomDefaults(title, startsAt, endsAt), [title, startsAt, endsAt]);

	return (
		<AppShell>
			<section className='headline card'>
				<p className='eyebrow'>{t('meetings.eyebrow')}</p>
				<h1>{t('meetings.title')}</h1>
				<p>{t('meetings.subtitle')}</p>
			</section>

			<section className='grid'>
				<div className='card metric-card'>
					<p className='metric-label'>{t('meetings.visible')}</p>
					<h2 className='metric-value'>{stats.total}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('meetings.scheduled')}</p>
					<h2 className='metric-value'>{stats.scheduled}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('meetings.completed')}</p>
					<h2 className='metric-value'>{stats.completed}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('meetings.videoReady')}</p>
					<h2 className='metric-value'>{stats.videoReady}</h2>
				</div>
			</section>

			<section className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>{t('meetings.scheduler')}</p>
						<h2>{selectedId ? t('meetings.update') : t('meetings.create')}</h2>
					</div>
					<div className='button-row'>
						<select className='input stage-filter' value={scope} onChange={(event) => setScope(event.target.value)}>
							<option value='upcoming'>{t('meetings.scope.upcoming')}</option>
							<option value='all'>{t('meetings.scope.all')}</option>
							<option value='past'>{t('meetings.scope.past')}</option>
						</select>
						<button className='btn btn-secondary' type='button' onClick={load}>{t('meetings.refresh')}</button>
					</div>
				</div>

				<input className='input' placeholder={t('meetings.input.title')} value={title} onChange={(event) => setTitle(event.target.value)} />
				<textarea placeholder={t('meetings.input.agenda')} value={agenda} onChange={(event) => setAgenda(event.target.value)} />
				<input className='input' placeholder={t('meetings.input.location')} value={location} onChange={(event) => setLocation(event.target.value)} />
				<input className='input' placeholder={t('meetings.input.attendees')} value={attendees} onChange={(event) => setAttendees(event.target.value)} />
				<div className='grid'>
					<select className='input' value={conferenceProvider} onChange={(event) => setConferenceProvider(event.target.value)}>
						{conferenceProviders.map((option) => (
							<option value={option} key={option}>{option}</option>
						))}
					</select>
					<input
						className='input'
						placeholder={t('meetings.input.videoUrl')}
						value={conferenceUrl}
						onChange={(event) => setConferenceUrl(event.target.value)}
					/>
					<input
						className='input'
						type='number'
						min='0'
						step='5'
						placeholder={t('meetings.input.reminder')}
						value={reminderMinutes}
						onChange={(event) => setReminderMinutes(event.target.value)}
					/>
				</div>
				<div className='button-row'>
					<button className='btn btn-secondary' type='button' onClick={openConferenceCreator}>{t('meetings.createLink')}</button>
					{conferenceProvider === 'Zoom' ? <button className='btn btn-secondary' type='button' onClick={copyZoomSetupSummary}>{t('meetings.copyZoom')}</button> : null}
					{conferenceProvider === 'Zoom' ? (
						<p className='meeting-helper'>
							{t('meetings.zoom.schedulerPrefix')} "{zoomPlan.topic}" {t('meetings.zoom.schedulerDuration')} {zoomPlan.duration} {t('meetings.minutes')}.
						</p>
					) : null}
					{conferenceProvider === 'Zoom' && copyStatus ? <p className='meeting-helper meeting-helper-success'>{copyStatus}</p> : null}
				</div>
				<div className='grid'>
					<input className='input' type='datetime-local' value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
					<input className='input' type='datetime-local' value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
					<select className='input' value={status} onChange={(event) => setStatus(event.target.value)}>
						{statuses.map((option) => (
							<option value={option} key={option}>{option}</option>
						))}
					</select>
				</div>
				<div className='button-row'>
					<button className='btn' type='button' onClick={saveMeeting}>{selectedId ? t('meetings.saveChanges') : t('meetings.createMeeting')}</button>
					{selectedId ? <button className='btn btn-secondary' type='button' onClick={resetForm}>{t('meetings.cancelEdit')}</button> : null}
				</div>
				{error ? <p>{error}</p> : null}
			</section>

			<section className='card'>
				<p className='section-kicker'>{t('meetings.schedule')}</p>
				<h2>{t('meetings.weekView')}</h2>
				{!rows.length ? <p>{t('meetings.noRows')}</p> : null}
				{groupedRows.map((group) => (
					<div className='meeting-day-group' key={group.day}>
						<h3 className='meeting-day-heading'>{group.heading}</h3>
						{group.meetings.map((row) => {
							const reminder = reminderLabel(row, t);
							return (
								<article className='record-item meeting-item' key={row.id}>
									<div className='record-head'>
										<h3>{row.title}</h3>
										<span className='record-id'>{row.status}</span>
									</div>
									<p>{row.agenda || t('meetings.noAgenda')}</p>
									{reminder ? <p className='meeting-reminder'>{reminder}</p> : null}
									<dl className='record-meta'>
										<div>
											<dt>{t('meetings.field.starts')}</dt>
											<dd>{new Date(row.startsAt).toLocaleString()}</dd>
										</div>
										<div>
											<dt>{t('meetings.field.ends')}</dt>
											<dd>{row.endsAt ? new Date(row.endsAt).toLocaleString() : t('common.na')}</dd>
										</div>
										<div>
											<dt>{t('meetings.field.location')}</dt>
											<dd>{row.location || t('common.na')}</dd>
										</div>
										<div>
											<dt>{t('meetings.field.attendees')}</dt>
											<dd>{row.attendees || t('common.na')}</dd>
										</div>
										<div>
											<dt>{t('meetings.field.conference')}</dt>
											<dd>{row.conferenceProvider || t('common.na')}</dd>
										</div>
										<div>
											<dt>{t('meetings.field.reminder')}</dt>
											<dd>{row.reminderMinutes ? `${row.reminderMinutes} ${t('meetings.minutes')} ${t('meetings.reminder.before')}` : t('meetings.none')}</dd>
										</div>
									</dl>
									{row.conferenceUrl ? (
										<a className='meeting-link' href={row.conferenceUrl} target='_blank' rel='noreferrer'>
											{t('meetings.join')}
										</a>
									) : null}
									<div className='button-row'>
										<button className='btn btn-secondary' type='button' onClick={() => editMeeting(row)}>{t('record.edit')}</button>
										<button className='btn btn-secondary' type='button' onClick={() => removeMeeting(row.id)}>{t('record.delete')}</button>
									</div>
								</article>
							);
						})}
					</div>
				))}
			</section>
		</AppShell>
	);
}
