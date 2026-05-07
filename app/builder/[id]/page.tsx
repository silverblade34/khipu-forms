import { getSession } from '@/lib/session';
import { getFormById, getFormFields } from '@/lib/actions';
import BuilderClient from './BuilderClient';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Constructor — Khipu Forms',
};

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const form = await getFormById(id);
  if (!form) notFound();
  if (form.user_id !== session.id) redirect('/dashboard');

  const fields = await getFormFields(id);

  return <BuilderClient form={form} fields={fields} />;
}
