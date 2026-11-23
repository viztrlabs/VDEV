import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ProjectDetailClient from './ProjectDetailClient';
import { listProjectsSupabase, isSupabaseAdminReady } from '@/lib/supabase/repositories';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { projectId } = await params;
  return {
    title: `Project ${projectId} | VizTR Client Dashboard`,
    description: `View project details, files, feedback, and approvals for ${projectId}`,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/client-access');
  }

  const userEmail = session.user.email;
  const userRole = (session.user as any).role || 'client';

  let project = null;

  if (isSupabaseAdminReady()) {
    const rows = await listProjectsSupabase({
      clientEmail: userRole === 'client' ? userEmail : undefined,
      clientId: projectId,
    });
    if (rows && rows.length > 0) {
      project = rows[0];
    }
  }

  if (!project) {
    const { INITIAL_MANAGED_PROJECTS } = await import('@/lib/projects-data');
    const filtered = INITIAL_MANAGED_PROJECTS.filter(
      (p) => p.id === projectId && (userRole !== 'client' || p.clientEmail.toLowerCase() === userEmail.toLowerCase())
    );
    if (filtered.length > 0) {
      project = filtered[0];
    }
  }

  if (!project) {
    redirect('/client-dashboard?error=project_not_found');
  }

  return <ProjectDetailClient initialProject={project} userEmail={userEmail} userRole={userRole} />;
}