'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { api } from '../../lib/api';

export default function TrainingPage() {
	const { t } = useI18n();
	const [courses, setCourses] = useState<any[]>([]);
	const [records, setRecords] = useState<any[]>([]);
	const [code, setCode] = useState('OSHA-10');
	const [title, setTitle] = useState('OSHA 10-Hour Safety Orientation');
	const [description, setDescription] = useState('Baseline jobsite hazard awareness for field teams.');
	const [durationMinutes, setDurationMinutes] = useState('600');
	const [requiredRenewalMonths, setRequiredRenewalMonths] = useState('12');
	const [error, setError] = useState('');

	async function load() {
		setError('');
		try {
			const [courseRows, recordRows] = await Promise.all([api('/training/courses'), api('/training/records')]);
			setCourses(courseRows);
			setRecords(recordRows);
		} catch (err: any) {
			setError(err?.message || t('training.error.load'));
			setCourses([]);
			setRecords([]);
		}
	}

	async function createCourse() {
		setError('');
		try {
			await api('/training/courses', {
				method: 'POST',
				body: JSON.stringify({
					code,
					title,
					description,
					durationMinutes: Number(durationMinutes) || undefined,
					requiredRenewalMonths: Number(requiredRenewalMonths) || undefined
				})
			});
			setCode('');
			setTitle('');
			setDescription('');
			setDurationMinutes('');
			setRequiredRenewalMonths('');
			await load();
		} catch (err: any) {
			setError(err?.message || t('training.error.create'));
		}
	}

	async function completeCourse(courseId: string) {
		setError('');
		try {
			await api(`/training/courses/${courseId}/complete`, { method: 'POST', body: JSON.stringify({}) });
			await load();
		} catch (err: any) {
			setError(err?.message || t('training.error.complete'));
		}
	}

	useEffect(() => {
		load();
	}, []);

	const stats = useMemo(() => {
		const completed = records.filter((row) => row.status === 'COMPLETED').length;
		const expiring = records.filter((row) => row.expiresAt && new Date(row.expiresAt).getTime() < Date.now() + 1000 * 60 * 60 * 24 * 30).length;
		return { completed, expiring };
	}, [records]);

	return (
		<AppShell>
			<section className='headline card'>
				<p className='eyebrow'>{t('training.eyebrow')}</p>
				<h1>{t('training.title')}</h1>
				<p>{t('training.subtitle')}</p>
			</section>

			<section className='grid'>
				<div className='card metric-card'>
					<p className='metric-label'>{t('training.courses')}</p>
					<h2 className='metric-value'>{courses.length}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('training.completedRecords')}</p>
					<h2 className='metric-value'>{stats.completed}</h2>
				</div>
				<div className='card metric-card'>
					<p className='metric-label'>{t('training.expiring')}</p>
					<h2 className='metric-value'>{stats.expiring}</h2>
				</div>
			</section>

			<section className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>{t('training.catalog')}</p>
						<h2>{t('training.createCourse')}</h2>
					</div>
					<button className='btn btn-secondary' type='button' onClick={load}>
						{t('meetings.refresh')}
					</button>
				</div>
				<input className='input' value={code} onChange={(event) => setCode(event.target.value)} placeholder={t('training.courseCode')} />
				<input className='input' value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('training.courseTitle')} />
				<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t('training.description')} />
				<input className='input' value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} inputMode='numeric' placeholder={t('training.duration')} />
				<input className='input' value={requiredRenewalMonths} onChange={(event) => setRequiredRenewalMonths(event.target.value)} inputMode='numeric' placeholder={t('training.renewal')} />
				<button className='btn' type='button' onClick={createCourse}>
					{t('training.createCourseCta')}
				</button>
				{error ? <p>{error}</p> : null}
			</section>

			<section className='card'>
				<p className='section-kicker'>{t('training.assignments')}</p>
				<h2>{t('training.completeForUser')}</h2>
				{!courses.length ? <p>{t('training.noCourses')}</p> : null}
				{courses.map((course) => {
					const mine = records.find((record) => record.courseId === course.id);
					return (
						<article className='record-item' key={course.id}>
							<div className='record-head'>
								<h3>{course.code} - {course.title}</h3>
								<span className='record-id'>{mine ? mine.status : t('training.notCompleted')}</span>
							</div>
							<p>{course.description || t('training.noDescription')}</p>
							<div className='button-row'>
								<button className='btn btn-secondary' type='button' onClick={() => completeCourse(course.id)}>
									{t('training.markCompleted')}
								</button>
							</div>
							{mine ? (
								<p>
									{t('training.completedOn')}: {mine.completedAt ? new Date(mine.completedAt).toLocaleDateString() : t('common.na')}
									{mine.expiresAt ? ` | ${t('training.expiresOn')}: ${new Date(mine.expiresAt).toLocaleDateString()}` : ''}
								</p>
							) : null}
						</article>
					);
				})}
			</section>
		</AppShell>
	);
}
