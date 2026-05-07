import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getFormFields, saveFields } from '@/lib/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fields = await getFormFields(id);
  return NextResponse.json(fields);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fields = await saveFields(id, session.id, body.fields || []);
  return NextResponse.json(fields);
}
