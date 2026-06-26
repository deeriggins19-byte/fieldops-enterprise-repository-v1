'use client';

import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';

const proofPoints = [
	'Centralized projects, assets, work orders, and scan logs',
	'Live scan-in flow with camera and manual fallback',
	'Operational dashboards designed for dispatch and executives',
	'Tenant-scoped APIs ready for secure enterprise rollout'
];

const pricingTiers = [
	{
		name: 'Pilot',
		price: '$1,250/mo',
		billing: 'Billed monthly, cancel anytime',
		fit: 'Best for single branch or first regional rollout',
		description: 'Fast launch for teams proving field workflow and reporting value in under 30 days.',
		includes: ['Up to 15 users', 'Projects, assets, work orders, scan-in', 'Lead pipeline + stage tracking'],
		cta: 'Start pilot'
	},
	{
		name: 'Growth',
		price: '$2,900/mo',
		billing: 'Billed monthly or annual (save 12%)',
		fit: 'Best for multi-crew operations scaling throughput',
		description: 'Built for teams needing tighter dispatch coordination and KPI visibility across active crews.',
		includes: ['Up to 50 users', 'Forecasting + AI troubleshoot workspace', 'Priority support and monthly ops review'],
		cta: 'Choose growth'
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		billing: 'Annual agreement',
		fit: 'Best for multi-region enterprise deployments',
		description: 'Portfolio-scale rollout with security controls, governance, and standardized execution.',
		includes: ['Unlimited users and locations', 'Custom integrations + SSO roadmap', 'Dedicated success and governance cadence'],
		cta: 'Talk to sales'
	}
];

const packageOptions = [
	{
		title: 'Launch Package',
		fee: '$4,000 one-time',
		scope: '2-week setup',
		deliverables: ['Environment setup + role templates', 'Operator onboarding workshops', 'Production go-live checklist'],
		details: 'Best when you need fast activation and clear ownership by week two.'
	},
	{
		title: 'Acceleration Package',
		fee: '$9,500 one-time',
		scope: '4-week rollout',
		deliverables: ['Everything in Launch Package', 'KPI dashboard tuning', 'Crew role playbooks + scan compliance program'],
		details: 'Best when you need adoption consistency across multiple teams.'
	},
	{
		title: 'Enterprise Rollout Package',
		fee: 'Custom SOW',
		scope: 'Phased rollout',
		deliverables: ['Change management plan', 'Process workshops by business unit', 'Integration and governance roadmap'],
		details: 'Best when execution standards and controls must scale across regions.'
	}
];

const commercialTerms = [
	'Annual prepay discount: 12% on Growth and Enterprise software subscriptions.',
	'Onboarding fee policy: waived on annual Growth contracts and all Enterprise agreements.',
	'Enterprise minimum term: 12 months with quarterly business reviews included.'
];

const pricingFaq = [
	{
		question: 'Is there a long-term contract for Pilot?',
		answer: 'No. Pilot is month-to-month so teams can validate fit quickly before scaling.'
	},
	{
		question: 'How does annual pricing work?',
		answer: 'Growth and Enterprise annual prepay plans receive a 12% software discount.'
	},
	{
		question: 'When is onboarding waived?',
		answer: 'Onboarding fees are waived for annual Growth agreements and all Enterprise plans.'
	},
	{
		question: 'What is the Enterprise minimum term?',
		answer: 'Enterprise agreements have a 12-month minimum term with quarterly business reviews.'
	}
];

export default function MarketingPage() {
	const { t } = useI18n();

	const valueBlocks = [
		{ title: t('marketing.value.deploy.title'), copy: t('marketing.value.deploy.copy') },
		{ title: t('marketing.value.prove.title'), copy: t('marketing.value.prove.copy') },
		{ title: t('marketing.value.scale.title'), copy: t('marketing.value.scale.copy') }
	];

	return (
		<AppShell>
			<section className='card marketing-hero marketing-hero-lg'>
				<p className='eyebrow'>{t('marketing.eyebrow')}</p>
				<h1>{t('marketing.title')}</h1>
				<p className='marketing-subhead'>{t('marketing.subtitle')}</p>
				<div className='button-row'>
					<Link className='btn' href='/register'>{t('marketing.cta.pilot')}</Link>
					<Link className='btn btn-secondary' href='/dashboard'>{t('marketing.cta.demo')}</Link>
					<Link className='btn btn-secondary' href='/marketing/leads'>{t('marketing.cta.pipeline')}</Link>
				</div>
			</section>

			<section className='grid'>
				{valueBlocks.map((block) => (
					<article className='card marketing-tile' key={block.title}>
						<h2>{block.title}</h2>
						<p>{block.copy}</p>
					</article>
				))}
			</section>

			<section className='card marketing-proof'>
				<div>
					<p className='section-kicker'>{t('marketing.proof.kicker')}</p>
					<h2>{t('marketing.proof.title')}</h2>
					<p>{t('marketing.proof.subtitle')}</p>
				</div>
				<ul className='marketing-list'>
					{proofPoints.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</section>

			<section className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>Pricing</p>
						<h2>Simple tiers by operational scale</h2>
					</div>
				</div>
				<div className='pricing-grid'>
					{pricingTiers.map((tier) => (
						<article className='pricing-card' key={tier.name}>
							<p className='pricing-tier'>{tier.name}</p>
							<h3 className='pricing-price'>{tier.price}</h3>
							<p className='pricing-meta'>{tier.billing}</p>
							<p className='pricing-fit'>{tier.fit}</p>
							<p className='pricing-copy'>{tier.description}</p>
							<ul className='pricing-list'>
								{tier.includes.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<Link className='btn btn-secondary' href='/register'>{tier.cta}</Link>
						</article>
					))}
				</div>
				<p className='pricing-notes'>All plans include tenant isolation, role-based access control, and API support.</p>
				<ul className='commercial-terms'>
					{commercialTerms.map((term) => (
						<li key={term}>{term}</li>
					))}
				</ul>
			</section>

			<section className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>Packaging</p>
						<h2>Implementation options for every rollout pace</h2>
					</div>
				</div>
				<div className='package-grid'>
					{packageOptions.map((item) => (
						<article className='package-card' key={item.title}>
							<h3>{item.title}</h3>
							<p className='package-fee'>{item.fee}</p>
							<p className='package-scope'>{item.scope}</p>
							<ul className='pricing-list'>
								{item.deliverables.map((deliverable) => (
									<li key={deliverable}>{deliverable}</li>
								))}
							</ul>
							<p>{item.details}</p>
						</article>
					))}
				</div>
			</section>

			<section className='card faq-card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>FAQ</p>
						<h2>Pricing and packaging FAQ</h2>
					</div>
				</div>
				<div className='faq-grid'>
					{pricingFaq.map((item) => (
						<article className='faq-item' key={item.question}>
							<h3>{item.question}</h3>
							<p>{item.answer}</p>
						</article>
					))}
				</div>
			</section>

		</AppShell>
	);
}
