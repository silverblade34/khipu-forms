import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getFormById, updateForm, deleteForm } from '@/lib/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await getFormById(id);
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (form.user_id !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(form);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const form = await updateForm(id, session.id, body);
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(form);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await deleteForm(id, session.id);
  return NextResponse.json({ success: true });
}
