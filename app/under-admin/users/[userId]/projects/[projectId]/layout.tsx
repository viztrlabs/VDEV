import { requireUnderAdminSession } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function UnderAdminProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string; projectId: string }>;
}) {
  const { userId, projectId } = await params;

  try {
    await requireUnderAdminSession();
  } catch {
    redirect('/admin/dashboard');
  }

  if (!userId || !projectId) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="px-4 sm:px-6 py-2 border-b border-[#27272A] flex items-center justify-between">
        <div className="text-[10px] font-mono text-[#71717A]">
          Under Admin
        </div>
        <div className="text-[10px] font-mono text-[#71717A]">
          {userId} / {projectId}
        </div>
      </div>
      {children}
    </div>
  );
}
