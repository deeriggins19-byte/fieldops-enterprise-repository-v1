import { AppShell } from '../../components/AppShell';

const cards = [
	{ label: 'Active Projects', value: '12', trend: '+2 this week' },
	{ label: 'Assets Tracked', value: '248', trend: '+14 this week' },
	{ label: 'Open Work Orders', value: '37', trend: '-5 since yesterday' },
	{ label: 'Scans Today', value: '186', trend: '+21% vs avg' },
	{ label: 'Labor Hours', value: '423h', trend: 'On target' },
	{ label: 'Forecast Risk', value: 'Low', trend: '2 projects flagged' },
	{ label: 'AI Actions', value: '59', trend: '+9 this week' },
	{ label: 'Inventory Alerts', value: '8', trend: 'Needs review' }
];

export default function Dashboard() {
	return (
		<AppShell>
			<section className='headline card'>
				<p className='eyebrow'>Operational Snapshot</p>
				<h1>Dashboard</h1>
				<p>Live metrics and guidance for daily field execution.</p>
			</section>
			<section className='grid'>
				{cards.map((card) => (
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
