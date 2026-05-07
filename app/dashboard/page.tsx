import type { Metadata } from 'next';
import { getSession } from '@/lib/session';
import { getFormsByUser, getUserById } from '@/lib/actions';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard — Khipu Forms',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [forms, user] = await Promise.all([
    getFormsByUser(session.id),
    getUserById(session.id),
  ]);

  return <DashboardClient user={session} forms={forms} isGuest={user?.is_guest ?? false} />;
}

