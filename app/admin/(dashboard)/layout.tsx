import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import AdminLayoutClient from '../components/AdminLayoutClient';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Check admin access
  const isAdmin = user.user_metadata?.role === 'admin' || user.email?.endsWith('@mangozzz.com');

  if (!isAdmin) {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <AdminLayoutClient userEmail={user.email}>
      {children}
    </AdminLayoutClient>
  );
}
