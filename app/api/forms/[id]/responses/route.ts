import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getResponses } from '@/lib/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const responses = await getResponses(id, session.id);
  return NextResponse.json(responses);
}
