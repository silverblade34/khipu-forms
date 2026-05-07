import { getSession } from '@/lib/session';
import { getFormById, getFormFields, getResponses } from '@/lib/actions';
import ResponsesClient from './ResponsesClient';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Respuestas — Khipu Forms',
};

export default async function ResponsesPage({
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
  const responses = await getResponses(id, session.id);

  return <ResponsesClient form={form} fields={fields} responses={responses} />;
}
