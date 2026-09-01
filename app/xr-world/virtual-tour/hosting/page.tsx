'use client';

import React, { useState } from 'react';
import { Server, Cloud, Key, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';

export default function StaticHostingPage() {
  const [tab, setTab] = useState<'self' | 'cloud'>('self');
  const [region, setRegion] = useState('ap-southeast-1');
  const [awsKey, setAwsKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [bucket, setBucket] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    try {
      localStorage.setItem(
        'viztr-s3-credentials',
        JSON.stringify({ region, awsKey, secretKey, bucket }),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // localStorage unavailable
    }
  };

  const PRICING = [
    { name: 'Hostinger', storage: 0.2, monthly: 6.4 },
    { name: 'Godaddy', storage: 0.4, monthly: 12.8 },
    { name: 'Wix', storage: 0.68, monthly: 21.76 },
    { name: 'Linode (1 CPU / 1 GB)', storage: 0.2, monthly: 6.4 },
    { name: 'PanoZVR Cloud', storage: 10, monthly: 320 },
    { name: '3DVista Cloud', storage: 8, monthly: 256 },
    { name: 'AWS S3', storage: 0.025, monthly: 0.8, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-mono font-bold text-[#3ECF8E] flex items-center gap-2">
          <Server className="w-5 h-5" />
          Static Hosting
        </h1>
        <p className="text-xs font-mono text-[#A1A1AA]">
          Host your 360° virtual tours 100× cheaper than SaaS providers by connecting your own S3 bucket.
        </p>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0c0c0f] border border-[#27272A]">
          <TabBtn id="self" active={tab} setActive={setTab} icon={<Server className="w-3 h-3" />}>Self-hosted</TabBtn>
          <TabBtn id="cloud" active={tab} setActive={setTab} icon={<Cloud className="w-3 h-3" />}>Panoee Cloud</TabBtn>
        </div>

        {tab === 'self' && (
          <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
            <div className="text-[10px] font-mono text-[#71717A]">
              Your key is stored locally on your browser and never sent anywhere else.
            </div>
            <a
              href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[10px] font-mono text-[#3ECF8E] hover:underline"
            >
              Learn how to get your S3 Credential in 3 minutes →
            </a>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
              >
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="us-east-1">US East (Virginia)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-east-1">Asia Pacific (Hong Kong)</option>
                <option value="af-south-1">Africa (Cape Town)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                AWS Key
              </label>
              <input
                value={awsKey}
                onChange={(e) => setAwsKey(e.target.value)}
                placeholder="AKIA..."
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                Secret Key
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="p-1.5 rounded bg-[#27272A] hover:bg-[#3f3f46] text-white"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-1">
                Bucket Name
              </label>
              <input
                value={bucket}
                onChange={(e) => setBucket(e.target.value)}
                placeholder="my-virtual-tours"
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-2 py-1.5 text-xs font-mono text-white"
              />
              <p className="text-[9px] font-mono text-[#71717A] mt-0.5">
                Enter the name of your existing S3 bucket. The bucket must be created by you in your AWS account.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {saved && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#3ECF8E]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
              <button
                type="button"
                onClick={save}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-bold font-mono"
              >
                <Save className="w-3.5 h-3.5" />
                Save Credentials
              </button>
            </div>
          </div>
        )}

        {tab === 'cloud' && (
          <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">Current plan</span>
              <span className="px-2 py-0.5 rounded bg-[#3ECF8E]/15 text-[#3ECF8E] text-[10px] font-mono">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">Storage used</span>
              <span className="text-sm font-mono">0.02 GB / 5 GB</span>
            </div>
            <div className="w-full h-2 rounded bg-[#27272A] overflow-hidden">
              <div className="h-full bg-[#3ECF8E]" style={{ width: '0.4%' }} />
            </div>
            <button className="w-full px-3 py-1.5 rounded bg-[#3ECF8E] hover:bg-[#34b876] text-black text-xs font-mono font-bold">
              Buy more Storage
            </button>
          </div>
        )}

        {/* Cost comparison */}
        <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            Cost comparison (per GB / per month at 32 GB)
          </div>
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="text-[#71717A] border-b border-[#27272A]">
                <th className="text-left p-1.5">Provider</th>
                <th className="text-right p-1.5">$/GB</th>
                <th className="text-right p-1.5">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {PRICING.map((p) => (
                <tr
                  key={p.name}
                  className={`border-b border-[#18181B] last:border-0 ${
                    p.highlight ? 'bg-[#3ECF8E]/5 text-[#3ECF8E]' : 'text-white'
                  }`}
                >
                  <td className="p-1.5">{p.name}</td>
                  <td className="p-1.5 text-right">${p.storage.toFixed(3)}</td>
                  <td className="p-1.5 text-right">${p.monthly.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3 simple steps */}
        <div className="rounded-xl border border-[#27272A] bg-[#0c0c0f] p-4 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
            3 simple steps
          </div>
          {[
            { n: 1, title: 'Create AWS Credential', body: 'Tutorial link to create AWS Account & S3 credential.' },
            { n: 2, title: 'Connect your AWS Storage', body: 'Using credentials (access key & secret key).' },
            { n: 3, title: 'Upload your 360 Virtual Tours', body: 'Start creating & uploading tours.' },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-2 p-2 rounded bg-[#09090B] border border-[#27272A]">
              <div className="w-6 h-6 rounded-full bg-[#3ECF8E]/15 text-[#3ECF8E] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                {s.n}
              </div>
              <div>
                <div className="text-xs font-mono font-bold">{s.title}</div>
                <div className="text-[10px] font-mono text-[#A1A1AA]">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ id, active, setActive, icon, children }: { id: 'self' | 'cloud'; active: string; setActive: (id: any) => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active === id}
      onClick={() => setActive(id)}
      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-mono ${
        active === id
          ? 'bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30'
          : 'text-[#71717A] hover:text-white border border-transparent'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
