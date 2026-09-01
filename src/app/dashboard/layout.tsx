import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/firebase/session';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cryptographic session verification — the authoritative security gate.
  // The middleware cookie-presence check is a UX layer only; this is what
  // actually enforces authentication for all server-rendered dashboard pages.
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:pl-64">
        <main>{children}</main>
      </div>
    </div>
  );
}
