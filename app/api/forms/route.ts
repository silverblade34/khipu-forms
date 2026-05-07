import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createForm, getFormsByUser } from '@/lib/actions';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const forms = await getFormsByUser(session.id);
  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const form = await createForm(session.id, {
    title: body.title || 'Formulario sin título',
    description: body.description,
    presentation_mode: body.presentation_mode,
    is_quiz: body.is_quiz,
    gamification: body.gamification,
    show_hints: body.show_hints,
    initial_lives: body.initial_lives
  });

  return NextResponse.json(form, { status: 201 });
}
