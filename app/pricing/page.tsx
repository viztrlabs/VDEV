'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individual creators and small projects',
    price: '29',
    features: ['5 GB cloud storage', '100 renders per month', 'Basic materials', 'Community support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For teams and studios producing high-volume content',
    price: '99',
    features: ['50 GB cloud storage', '500 renders per month', 'Premium materials', 'Priority support', 'XR exports'],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 'Custom',
    features: ['Unlimited storage', 'Unlimited renders', 'Custom branding', 'Dedicated account manager', 'API access'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl font-bold font-display mb-6">Pricing</h1>
          <p className="text-xl text-zinc-300">
            Choose the plan that fits your workflow. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 bg-zinc-900/50 border rounded-xl transition-all ${
                plan.popular
                  ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold uppercase bg-emerald-500 text-black rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-zinc-500">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.price === 'Custom' ? '/contact' : `/app/register?plan=${plan.name.toLowerCase()}`}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
