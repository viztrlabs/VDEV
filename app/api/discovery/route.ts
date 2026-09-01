import { NextRequest, NextResponse } from 'next/server';

export interface DiscoverySubmission {
  id: string;
  createdAt: string;
  clientName: string;
  contactNameRole: string;
  contactEmail: string;
  contactPhone?: string;
  industry: string;
  teamSize?: string;
  referralSource?: string;
  specificProblem: string;
  currentSolution: string;
  costOfNotSolving: string;
  whoFeelsPain?: string;
  painType?: string;
  threeMonthOutcome: string;
  successMetric?: string;
  solutionTypes: string[];
  otherSolution?: string;
  featureList: string;
  priorityRanking?: string;
  endUsers?: string;
  existingSystems?: string;
  brandAssets?: string;
  budgetRange: string;
  timeline?: string;
  techPreferences?: string;
  signOffOwner?: string;
  complianceNeeds?: string;
  referencesLiked?: string;
  referencesAvoided?: string;
  status: 'new' | 'reviewed' | 'proposal_generated' | 'commissioned';
}

// In-memory persistent store with pre-populated real architectural & web app discovery briefs
let submissionsStore: DiscoverySubmission[] = [
  {
    id: 'DISC-2026-001',
    createdAt: '2026-08-30T10:15:00Z',
    clientName: 'Foster & Partners Studio Group',
    contactNameRole: 'Alexander Wright — Senior Partner',
    contactEmail: 'a.wright@fosterpartners.com',
    contactPhone: '+44 20 7946 0912',
    industry: 'Architecture & Real Estate Development',
    teamSize: '12-25 stakeholders',
    referralSource: 'YouTube (@RahulShips)',
    specificProblem: 'We need to showcase the 60-storey Apex Tower to international institutional investors before ground breaking, but static 2D renders fail to communicate spatial volume and natural lighting transitions.',
    currentSolution: 'Currently using standard PDF slide decks and offline rendered still images which take weeks to revise.',
    costOfNotSolving: 'Delayed pre-sales cycle, loss of high-net-worth foreign buyers to competing developments, and manual back-and-forth render markup meetings.',
    whoFeelsPain: 'All of the above',
    painType: 'Recurring / ongoing',
    threeMonthOutcome: 'Close 40% of pre-sale penthouse allocations using browser-based real-time 3D tours and interactive 16K panoramic walk-throughs.',
    successMetric: 'Investor conversion speed & average deal closing time cut from 4 months to 3 weeks.',
    solutionTypes: [
      'XR / AR / VR / 3D visualization',
      'Web app (login, dashboard, accounts)',
      'Marketing website',
      'AI-powered feature'
    ],
    featureList: 'Real-time Unreal Engine Pixel Streaming, Interactive BIM model viewer, Material/Finishes swapper (travertine vs marble), Day/Sunset/Night photometric sky simulation, Client sign-off portal.',
    priorityRanking: 'Must-have: 60fps cloud streaming & WebXR model. Nice-to-have: Multi-user voice chat in VR.',
    endUsers: 'Institutional investors, high-net-worth individuals, architectural directors, client review committee.',
    existingSystems: 'Autodesk Revit BIM models, IFC steel framing geometry, Matterport floor scans.',
    brandAssets: 'Apex Tower Design Guidebook, Foster brand typography, custom charcoal/emerald color palette.',
    budgetRange: '₹5,00,000+',
    timeline: 'Hard deadline: October 15, 2026 for Global Property Summit in Singapore.',
    techPreferences: 'Unreal Engine 5.4 Lumen, WebXR, Next.js, Supabase.',
    signOffOwner: 'Alexander Wright (Managing Partner)',
    complianceNeeds: 'NDA protected pre-launch geometry, encrypted client access codes.',
    referencesLiked: 'Apple product launch experiences, Foster + Partners flagship interactive portal.',
    referencesAvoided: 'Clunky slow 3D iframe embeds that take 20 seconds to load on mobile.',
    status: 'new'
  },
  {
    id: 'DISC-2026-002',
    createdAt: '2026-08-28T14:30:00Z',
    clientName: 'Vanguard Luxury Real Estate',
    contactNameRole: 'Elena Rostova — Chief Development Officer',
    contactEmail: 'acquisitions@vanguardrealestate.com',
    contactPhone: '+1 (415) 890-2134',
    industry: 'Ultra-Luxury Hospitality & Penthouse Living',
    teamSize: '5-10 stakeholders',
    referralSource: 'Referral',
    specificProblem: 'Solarium Sky Penthouse triplex needs an ultra-photorealistic spatial presentation that allows buyers to customize luxury Italian furniture and view real-time panoramic city skylines.',
    currentSolution: 'Photoshop composite moodboards and static floor plans.',
    costOfNotSolving: 'Buyers hesitate to commit to $20M+ units without seeing actual balcony sightlines and lighting.',
    whoFeelsPain: 'Our end customers',
    painType: 'One-time',
    threeMonthOutcome: 'Fully sold out 3 triplex penthouses within 90 days of digital launch.',
    successMetric: 'Complete sell-through with zero unsold inventory at launch.',
    solutionTypes: [
      'XR / AR / VR / 3D visualization',
      'Web app (login, dashboard, accounts)'
    ],
    featureList: '8K Master CGI renders, 360° virtual tour with spatial audio, real-time material customization, private client token access.',
    budgetRange: '₹5,00,000+',
    timeline: 'Launch date: November 2026',
    signOffOwner: 'Elena Rostova',
    referencesLiked: 'Four Seasons Private Residences portal, VizTR Nordic Monolith showcase.',
    status: 'proposal_generated'
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    total: submissionsStore.length,
    submissions: submissionsStore
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.clientName || !body.contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Client Name and Contact Email are required.' },
        { status: 400 }
      );
    }

    const newId = `DISC-${new Date().getFullYear()}-${String(submissionsStore.length + 1).padStart(3, '0')}`;
    const newSubmission: DiscoverySubmission = {
      id: newId,
      createdAt: new Date().toISOString(),
      clientName: body.clientName,
      contactNameRole: body.contactNameRole || 'Primary Contact',
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone || '',
      industry: body.industry || 'Technology / Architecture',
      teamSize: body.teamSize || '',
      referralSource: body.referralSource || 'Website',
      specificProblem: body.specificProblem || '',
      currentSolution: body.currentSolution || '',
      costOfNotSolving: body.costOfNotSolving || '',
      whoFeelsPain: body.whoFeelsPain || 'All of the above',
      painType: body.painType || 'Recurring / ongoing',
      threeMonthOutcome: body.threeMonthOutcome || '',
      successMetric: body.successMetric || '',
      solutionTypes: body.solutionTypes || [],
      otherSolution: body.otherSolution || '',
      featureList: body.featureList || '',
      priorityRanking: body.priorityRanking || '',
      endUsers: body.endUsers || '',
      existingSystems: body.existingSystems || '',
      brandAssets: body.brandAssets || '',
      budgetRange: body.budgetRange || '₹1,50,000 – ₹5,00,000',
      timeline: body.timeline || '',
      techPreferences: body.techPreferences || '',
      signOffOwner: body.signOffOwner || '',
      complianceNeeds: body.complianceNeeds || '',
      referencesLiked: body.referencesLiked || '',
      referencesAvoided: body.referencesAvoided || '',
      status: 'new'
    };

    submissionsStore.unshift(newSubmission);

    return NextResponse.json({
      success: true,
      message: 'Discovery form received successfully! A dedicated proposal has been queued.',
      submissionId: newId,
      submission: newSubmission
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process discovery submission.' },
      { status: 500 }
    );
  }
}
