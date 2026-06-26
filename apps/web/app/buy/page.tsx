 'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useI18n } from '../../components/I18nProvider';
import { api } from '../../lib/api';

const softwarePlans = [
	{
		name: 'Starter',
		id: 'starter',
		monthlyPrice: 99,
		yearlyPrice: 950,
		description: 'For small teams starting digital field operations.',
		features: ['Up to 5 users', 'Projects + Assets + Work Orders', 'Basic scan-in and reporting'],
		cta: 'Buy Starter'
	},
	{
		name: 'Professional',
		id: 'professional',
		monthlyPrice: 299,
		yearlyPrice: 2870,
		popular: true,
		description: 'For growing operations that need scheduling and compliance visibility.',
		features: ['Up to 25 users', 'Meetings + Training + OSHA tracking', 'Priority email support'],
		cta: 'Buy Professional'
	},
	{
		name: 'Enterprise',
		id: 'enterprise',
		monthlyPrice: 799,
		yearlyPrice: 7670,
		description: 'For multi-location operations requiring scale and governance.',
		features: ['Unlimited users', 'Advanced workflow support', 'Dedicated onboarding + success manager'],
		cta: 'Contact Sales'
	}
];

const paymentOptions = [
	{ id: 'card', label: 'Credit or debit card', detail: 'Instant activation after payment confirmation' },
	{ id: 'ach', label: 'ACH bank transfer', detail: 'Low-fee transfer for US-based accounts' },
	{ id: 'wire', label: 'Bank wire', detail: 'Recommended for large annual contracts' },
	{ id: 'invoice', label: 'Invoice / Net-30', detail: 'Available for approved business accounts' }
];

export default function BuyPage() {
	const { t } = useI18n();
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
	const [selectedPlanId, setSelectedPlanId] = useState('professional');
	const [selectedPaymentId, setSelectedPaymentId] = useState('card');
	const [checkoutPending, setCheckoutPending] = useState(false);
	const [checkoutError, setCheckoutError] = useState('');

	const selectedPlan = softwarePlans.find((plan) => plan.id === selectedPlanId) || softwarePlans[1];
	const selectedPrice = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
	const selectedPayment = paymentOptions.find((option) => option.id === selectedPaymentId) || paymentOptions[0];

	async function proceedToCheckout() {
		setCheckoutError('');
		setCheckoutPending(true);
		try {
			const result = await api('/payments/checkout-session', {
				method: 'POST',
				body: JSON.stringify({
					planId: selectedPlanId,
					billingCycle,
					paymentMethod: selectedPaymentId
				})
			});

			if (!result?.checkoutUrl) {
				throw new Error(t('buy.error.checkoutUrlMissing'));
			}

			window.location.href = String(result.checkoutUrl);
		} catch (error: any) {
			setCheckoutError(error?.message || t('buy.error.startCheckout'));
			setCheckoutPending(false);
		}
	}

	return (
		<AppShell>
			<section className='card marketing-hero'>
				<p className='eyebrow'>{t('buy.eyebrow')}</p>
				<h1>{t('buy.title')}</h1>
				<p className='marketing-subhead'>{t('buy.subtitle')}</p>
				<div className='button-row'>
					<Link className='btn' href='/register'>{t('buy.cta.trial')}</Link>
					<Link className='btn btn-secondary' href='/marketing'>{t('buy.cta.marketing')}</Link>
				</div>
			</section>

			<section className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>{t('buy.plans.kicker')}</p>
						<h2>{t('buy.plans.title')}</h2>
					</div>
					<div className='buy-toggle' role='tablist' aria-label={t('buy.billingCycle')}>
						<button
							type='button'
							className={`btn btn-secondary buy-toggle-btn ${billingCycle === 'monthly' ? 'buy-toggle-btn-active' : ''}`}
							onClick={() => setBillingCycle('monthly')}
						>
							{t('buy.monthly')}
						</button>
						<button
							type='button'
							className={`btn btn-secondary buy-toggle-btn ${billingCycle === 'yearly' ? 'buy-toggle-btn-active' : ''}`}
							onClick={() => setBillingCycle('yearly')}
						>
							{t('buy.yearly')}
						</button>
					</div>
				</div>
				<div className='pricing-grid'>
					{softwarePlans.map((plan) => (
						<article className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`} key={plan.name}>
							{plan.popular ? <p className='popular-pill'>{t('buy.mostPopular')}</p> : null}
							<p className='pricing-tier'>{plan.name}</p>
							<h3 className='pricing-price'>
								${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
								{billingCycle === 'monthly' ? '/mo' : '/yr'}
							</h3>
							<p className='pricing-meta'>
								{billingCycle === 'monthly' ? t('buy.billedMonthly') : t('buy.billedYearly')}
							</p>
							<p className='pricing-copy'>{plan.description}</p>
							<ul className='pricing-list'>
								{plan.features.map((feature) => (
									<li key={feature}>{feature}</li>
								))}
							</ul>
							<Link className='btn btn-secondary' href='/register'>
								{plan.cta}
							</Link>
							<button
								className={`btn btn-secondary buy-select-btn ${selectedPlanId === plan.id ? 'buy-select-btn-active' : ''}`}
								type='button'
								onClick={() => setSelectedPlanId(plan.id)}
							>
								{selectedPlanId === plan.id ? t('buy.selected') : t('buy.selectForCheckout')}
							</button>
						</article>
					))}
				</div>
				<p className='pricing-notes'>{t('buy.notes')}</p>
			</section>

			<section className='card'>
				<div className='card-header'>
					<div>
						<p className='section-kicker'>{t('buy.checkout.kicker')}</p>
						<h2>{t('buy.checkout.title')}</h2>
					</div>
				</div>
				<div className='checkout-layout'>
					<div className='checkout-options'>
						{paymentOptions.map((option) => (
							<button
								type='button'
								key={option.id}
								className={`checkout-option ${selectedPaymentId === option.id ? 'checkout-option-active' : ''}`}
								onClick={() => setSelectedPaymentId(option.id)}
							>
								<strong>{option.label}</strong>
								<span>{option.detail}</span>
							</button>
						))}
					</div>
					<div className='checkout-summary'>
						<p className='pricing-tier'>{t('buy.orderSummary')}</p>
						<h3>{selectedPlan.name}</h3>
						<p className='checkout-line'>{t('buy.billing')}: {billingCycle === 'monthly' ? t('buy.monthly') : t('buy.yearly')}</p>
						<p className='checkout-line'>{t('buy.payment')}: {selectedPayment.label}</p>
						<p className='checkout-total'>
							{t('buy.totalDue')}: ${selectedPrice}
							{billingCycle === 'monthly' ? '/mo' : '/yr'}
						</p>
						<div className='button-row'>
							<button className='btn' type='button' onClick={proceedToCheckout} disabled={checkoutPending}>
								{checkoutPending ? t('buy.startingCheckout') : t('buy.proceed')}
							</button>
							<Link className='btn btn-secondary' href='/marketing/leads'>{t('buy.talkToSales')}</Link>
						</div>
						{checkoutError ? <p className='checkout-error'>{checkoutError}</p> : null}
					</div>
				</div>
			</section>
		</AppShell>
	);
}
