// components/admin/DocStudioPreview.tsx
'use client';

import React, { useRef } from 'react';
import { Printer, Copy, Check } from 'lucide-react';
import { useDocStudioStore } from './DocStudioStore';
import type {
  RateCardContent, ProposalContent, AgreementContent, NDAContent,
  InvoiceContent, OnboardingContent, ReleaseContent, CaseStudyContent
} from './types/doc-studio';

const LOGO_MARK = `<svg viewBox="0 0 300 300" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(150,150)">
    <path d="M -110,-90 L -110,-120 L -80,-120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M 110,-90 L 110,-120 L 80,-120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M -110,90 L -110,120 L -80,120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M 110,90 L 110,120 L 80,120" stroke="#8a7433" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M -45,-55 L 0,55 L 45,-55" stroke="#8a7433" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
}

function BrandBlock({ profile }: { profile: any }) {
  return (
    <div className="text-right text-[11px] text-[#4a4438] leading-150">
      <b className="text-[14px] text-[#1a1712] block">{escapeHtml(profile.name)}</b>
      {escapeHtml(profile.owner)}<br />
      {escapeHtml(profile.phone)}{profile.phone && profile.email ? ' · ' : ''}{escapeHtml(profile.email)}<br />
      {escapeHtml(profile.address)}
      {profile.gstin ? <><br />GSTIN: {escapeHtml(profile.gstin)}</> : null}
    </div>
  );
}

function LogoRow({ profile }: { profile: any }) {
  if (profile.show_logo === false) return null;
  return (
    <div className="flex items-center gap-2 mb-2">
      <span dangerouslySetInnerHTML={{ __html: LOGO_MARK }} />
      <span className="font-serif text-[15px] font-bold tracking-wide text-[#1a1712]">
        {escapeHtml(profile.name)}
      </span>
    </div>
  );
}

function DocHeader({ profile, title, subtitle }: { profile: any; title: string; subtitle?: string }) {
  return (
    <div className="flex justify-between items-start border-b-2 border-[#8a7433] pb-3 mb-4">
      <div>
        <p className="font-serif text-[22px] font-bold tracking-wide text-[#1a1712] m-0">{title}</p>
        {subtitle && (
          <p className="text-[11px] tracking-widest uppercase text-[#8a7433] mt-0.5">{subtitle}</p>
        )}
      </div>
      <BrandBlock profile={profile} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] uppercase tracking-wider text-[#8a7433] border-b border-[#ddd4bf] pb-1 mb-2 mt-6">
      {children}
    </h3>
  );
}

function QuoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-3 border-[#8a7433] pl-3 my-3 italic text-[13.5px] text-[#1a1712]">
      {children}
    </blockquote>
  );
}

function SignBlock() {
  return (
    <div className="flex justify-between mt-12 gap-4">
      <div className="flex-1 border-t border-[#4a4438] pt-1.5 text-[11px] text-[#4a4438]"></div>
      <div className="flex-1 border-t border-[#4a4438] pt-1.5 text-[11px] text-[#4a4438] text-right"></div>
    </div>
  );
}

export default function DocStudioPreview() {
  const { activeDocument, profile } = useDocStudioStore();
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const handleCopy = async () => {
    if (!printRef.current) return;
    const text = printRef.current.innerText.replace(/\n{3,}/g, '\n\n').trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };
  
  const handlePrint = () => window.print();
  
  if (!activeDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-[var(--text-muted)] text-xs">
          Select or create a document to see preview
        </p>
      </div>
    );
  }
  
  const content = activeDocument.content;
  const docType = activeDocument.type;
  const paperClass = profile.paper_size === 'Letter' ? 'max-w-[816px]' : 'max-w-[800px]';
  
  return (
    <div className="space-y-3">
      <div className="flex gap-2 px-1">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-black text-xs font-mono font-bold hover:bg-[var(--primary-hover)] transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] hover:border-[var(--primary)] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--primary)]" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy as Text'}
        </button>
      </div>
      
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 overflow-auto max-h-[600px]">
        <div
          ref={printRef}
          className={`bg-[#faf7f0] text-[#1a1712] rounded-lg p-8 mx-auto shadow-lg font-serif ${paperClass}`}
          style={{ minHeight: '400px' }}
        >
          {/* Rate Card */}
          {docType === 'ratecard' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Rate Card" subtitle="Studio & XR World Services" />
              <table className="w-full border-collapse mt-2">
                <thead>
                  <tr>
                    <th className="text-left text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Service</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Starting Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(content as RateCardContent).items.map((item, i) => (
                    <tr key={i} className="border-b border-[#ece6d6]">
                      <td className="py-2 text-[13px] font-sans">{escapeHtml(item.name)}</td>
                      <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-[11.5px] text-[#7a6f52] font-sans">
                Final pricing depends on scope, complexity, and turnaround. Get a custom quote on a discovery call.
              </p>
              <div className="mt-8 text-center text-[10.5px] text-[#8a8168] tracking-wide">
                {escapeHtml(profile.name)} — {escapeHtml(profile.phone)} · {escapeHtml(profile.email)}
              </div>
            </>
          )}
          
          {/* Proposal */}
          {docType === 'proposal' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader 
                profile={profile} 
                title="Proposal" 
                subtitle={`${escapeHtml((content as ProposalContent).project || 'Untitled')} for ${escapeHtml((content as ProposalContent).client || 'Client')}`} 
              />
              <p className="text-[13px] font-sans mb-4">
                <b>Prepared by:</b> {escapeHtml(profile.owner)} — {escapeHtml(profile.name)} &nbsp; <b>Date:</b> {escapeHtml((content as ProposalContent).date)}
              </p>
              <SectionTitle>1. Understanding Your Challenge</SectionTitle>
              <QuoteBlock>{escapeHtml((content as ProposalContent).challengeQuote)}</QuoteBlock>
              <SectionTitle>2. Proposed Solution</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as ProposalContent).solutionWhat)}</p>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as ProposalContent).solutionWhy)}</p>
              <SectionTitle>3. What&apos;s Included</SectionTitle>
              <p className="text-[13px] font-sans font-bold mb-1">Phase 1 — Core Build</p>
              <ul className="my-2 pl-5 font-sans">
                {(content as ProposalContent).phase1.split('\n').filter(x => x.trim()).map((line, i) => (
                  <li key={i} className="text-[13px] leading-relaxed">{escapeHtml(line)}</li>
                ))}
              </ul>
              <SectionTitle>5. Investment</SectionTitle>
              <table className="w-full border-collapse mt-2">
                <tbody>
                  {(content as ProposalContent).investmentItems.filter(i => i.item).map((item, i) => (
                    <tr key={i} className="border-b border-[#ece6d6]">
                      <td className="py-2 text-[13px] font-sans">{escapeHtml(item.item)}</td>
                      <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[13px] font-sans"><b>Payment terms:</b> {escapeHtml((content as ProposalContent).payment)}</p>
              <SectionTitle>6. Why VizTR</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as ProposalContent).whyViztr)}</p>
              <SectionTitle>7. Next Steps</SectionTitle>
              <ul className="my-2 pl-5 font-sans">
                {(content as ProposalContent).nextSteps.split('\n').filter(x => x.trim()).map((line, i) => (
                  <li key={i} className="text-[13px] leading-relaxed">{escapeHtml(line)}</li>
                ))}
              </ul>
              <p className="mt-4 text-[11.5px] text-[#7a6f52] font-sans">{escapeHtml((content as ProposalContent).validity)}</p>
              <SignBlock />
            </>
          )}
          
          {/* Agreement */}
          {docType === 'agreement' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Service Agreement" subtitle={escapeHtml((content as AgreementContent).project || 'Untitled')} />
              <p className="text-[13px] font-sans mb-4">
                <b>Between:</b> {escapeHtml(profile.name)} (&quot;Studio&quot;) and {escapeHtml((content as AgreementContent).client || 'Client')} (&quot;Client&quot;) &nbsp; <b>Date:</b> {escapeHtml((content as AgreementContent).date)}
              </p>
              <SectionTitle>1. Scope of Work</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).scope)}</p>
              <SectionTitle>2. Revisions</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).revisions)}</p>
              <SectionTitle>3. Timeline</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).timeline)}</p>
              <SectionTitle>4. Payment</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).payment)}</p>
              <SectionTitle>5. IP & Usage Rights</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).ip)}</p>
              <SectionTitle>6. Cancellation</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).cancel)}</p>
              <SectionTitle>7. Governing Law</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as AgreementContent).law)}</p>
              <SignBlock />
            </>
          )}
          
          {/* NDA */}
          {docType === 'nda' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Mutual Non-Disclosure Agreement" subtitle="Confidential" />
              <p className="text-[13px] font-sans mb-4">
                This agreement is made on {escapeHtml((content as NDAContent).date)} between <b>{escapeHtml((content as NDAContent).partyA)}</b> and <b>{escapeHtml((content as NDAContent).partyB || 'Client')}</b> for the purpose of {escapeHtml((content as NDAContent).purpose)}.
              </p>
              <SectionTitle>1. Confidential Information</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">Includes any project files, drawings, floor plans, business or design information shared by either party.</p>
              <SectionTitle>2. Obligations</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">Both parties agree not to disclose, copy, or use confidential information for any purpose outside this project.</p>
              <SectionTitle>3. Term</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">This agreement remains in effect for {escapeHtml((content as NDAContent).term)}.</p>
              <SignBlock />
            </>
          )}
          
          {/* Invoice */}
          {docType === 'invoice' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Invoice" subtitle={escapeHtml((content as InvoiceContent).number)} />
              <p className="text-[13px] font-sans mb-4">
                <b>Billed to:</b> {escapeHtml((content as InvoiceContent).client || '—')}<br />
                <b>Date:</b> {escapeHtml((content as InvoiceContent).date)} &nbsp; <b>Due:</b> {escapeHtml((content as InvoiceContent).due || 'On receipt')}
              </p>
              <table className="w-full border-collapse mt-2">
                <thead>
                  <tr>
                    <th className="text-left text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Description</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Qty</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Rate (₹)</th>
                    <th className="text-right text-[10.5px] uppercase tracking-wider text-[#7a6f52] border-b border-[#ddd4bf] pb-1.5 font-sans">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(content as InvoiceContent).items.map((item, i) => {
                    const qty = parseFloat(item.qty) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    return (
                      <tr key={i} className="border-b border-[#ece6d6]">
                        <td className="py-2 text-[13px] font-sans">{escapeHtml(item.desc)}</td>
                        <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.qty)}</td>
                        <td className="py-2 text-[13px] font-sans text-right">{escapeHtml(item.rate)}</td>
                        <td className="py-2 text-[13px] font-sans text-right">₹{(qty * rate).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={3} className="py-2 text-[13px] font-sans text-right font-bold border-t-2 border-[#8a7433]">Total Due</td>
                    <td className="py-2 text-[13px] font-sans text-right font-bold border-t-2 border-[#8a7433]">
                      ₹{(content as InvoiceContent).items.reduce((sum, item) => {
                        const qty = parseFloat(item.qty) || 0;
                        const rate = parseFloat(item.rate) || 0;
                        return sum + (qty * rate);
                      }, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
              <SectionTitle>Payment Details</SectionTitle>
              <p className="text-[13px] font-sans">
                UPI: {escapeHtml(profile.upi_id || '—')}<br />
                Bank: {escapeHtml(profile.bank_details || '—')}
              </p>
              <p className="mt-2 text-[12px] text-[#5a533f] font-sans">{escapeHtml((content as InvoiceContent).notes)}</p>
            </>
          )}
          
          {/* Onboarding */}
          {docType === 'onboarding' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Client Onboarding Brief" subtitle={escapeHtml((content as OnboardingContent).project) || 'Please complete before we begin'} />
              {[
                'Project name', 'Location / plot address', 'Plot size / built-up area',
                'Number of rooms / views needed', 'Reference images or links',
                'Preferred style', 'Any Vastu or specific compliance requirements',
                'Budget band', 'Deadline / target date', 'Preferred delivery format',
                'Best contact person & time to call'
              ].map((q, i) => (
                <p key={i} className="mb-4 text-[13px] font-sans">
                  <b>{escapeHtml(q)}:</b><br />
                  <span className="inline-block w-full border-b border-[#ccc3a8] h-4 mt-1"></span>
                </p>
              ))}
            </>
          )}
          
          {/* Release */}
          {docType === 'release' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Portfolio Release Form" subtitle={escapeHtml((content as ReleaseContent).project || 'Untitled')} />
              <p className="text-[13px] font-sans leading-relaxed mb-4">
                I, <b>{escapeHtml((content as ReleaseContent).client || '_______________')}</b>, give {escapeHtml(profile.name)} permission to use renders, animations, videos, and related materials from the project <b>{escapeHtml((content as ReleaseContent).project || 'above')}</b> for portfolio, marketing, website, and social media purposes.
              </p>
              <p className="text-[13px] font-sans leading-relaxed">
                {(content as ReleaseContent).showName 
                  ? 'My name / project name may be publicly credited alongside the work.'
                  : 'I request that my name and project details remain confidential — the work may be shown without attribution to me.'}
              </p>
              <p className="text-[13px] font-sans leading-relaxed mt-4">
                This permission does not transfer ownership of the design or property itself.
              </p>
              <SignBlock />
            </>
          )}
          
          {/* Case Study */}
          {docType === 'casestudy' && (
            <>
              <LogoRow profile={profile} />
              <DocHeader profile={profile} title="Case Study" subtitle={escapeHtml((content as CaseStudyContent).project || 'Untitled')} />
              <p className="text-[13px] font-sans mb-4">
                <b>Client:</b> {escapeHtml((content as CaseStudyContent).client || '—')} &nbsp; <b>Location:</b> {escapeHtml((content as CaseStudyContent).location || '—')}<br />
                <b>Services used:</b> {escapeHtml((content as CaseStudyContent).services)}
              </p>
              <SectionTitle>The Challenge</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as CaseStudyContent).challenge)}</p>
              <SectionTitle>The Approach</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as CaseStudyContent).approach)}</p>
              <SectionTitle>The Result</SectionTitle>
              <p className="text-[13px] font-sans leading-relaxed">{escapeHtml((content as CaseStudyContent).result)}</p>
              {(content as CaseStudyContent).testimonial && (
                <QuoteBlock>
                  &ldquo;{escapeHtml((content as CaseStudyContent).testimonial)}&rdquo;
                  {content.author && <><br />— {escapeHtml((content as CaseStudyContent).author)}</>}
                </QuoteBlock>
              )}
              <div className="mt-8 text-center text-[10.5px] text-[#8a8168] tracking-wide">
                Want results like this for your project? {escapeHtml(profile.phone)} · {escapeHtml(profile.email)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
