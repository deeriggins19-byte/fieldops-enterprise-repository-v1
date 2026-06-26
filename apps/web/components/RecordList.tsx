'use client';

import { useI18n } from './I18nProvider';

export function RecordList({ title, rows, onEdit, onDelete, renderExtra }: { title: string; rows: any[]; onEdit?: (row: any) => void; onDelete?: (row: any) => void; renderExtra?: (row: any) => any }) {
	const { t } = useI18n();

	return (
		<section className='card'>
			<h2>{title}</h2>
			{rows?.length ? (
				rows.map((r) => (
					<article className='record-item' key={r.id || `${title}-${JSON.stringify(r)}`}>
						<div className='record-head'>
							<h3>{r.name || r.title || r.code || t('record.fallbackTitle')}</h3>
							<span className='record-id'>{r.id || t('record.noId')}</span>
						</div>
						<dl className='record-meta'>
							{Object.entries(r)
								.filter(([k]) => !['id', 'name', 'title'].includes(k))
								.slice(0, 5)
								.map(([k, v]) => (
									<div key={k}>
										<dt>{k}</dt>
										<dd>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
									</div>
								))}
						</dl>
						<div className='record-actions'>
							{onEdit ? (
								<button className='btn btn-secondary' onClick={() => onEdit(r)}>
									{t('record.edit')}
								</button>
							) : null}
							{onDelete ? (
								<button className='btn btn-secondary' onClick={() => onDelete(r)}>
									{t('record.delete')}
								</button>
							) : null}
						</div>
						{renderExtra ? <div className='record-extra'>{renderExtra(r)}</div> : null}
						<details>
							<summary className='drop-summary'>
								<span>{t('record.fullPayload')}</span>
								<span className='drop-arrow'>▾</span>
							</summary>
							<pre>{JSON.stringify(r, null, 2)}</pre>
						</details>
					</article>
				))
			) : (
				<p>{t('record.empty')}</p>
			)}
		</section>
	);
}
