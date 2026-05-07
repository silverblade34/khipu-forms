import { NextRequest, NextResponse } from 'next/server';
import { getFormById, getFormFields, submitResponse } from '@/lib/actions';
import { submitResponseSchema } from '@/lib/validations';

// GET public form info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await getFormById(id);
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!form.is_public) return NextResponse.json({ error: 'Form is private' }, { status: 403 });

  const fields = await getFormFields(id);

  // Strip correct_answer from public response (don't expose answers)
  const safeFields = fields.map((f) => ({ ...f, correct_answer: null }));

  return NextResponse.json({ form, fields: safeFields });
}

// POST submit response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const form = await getFormById(id);
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check access code if required
  if (form.access_code) {
    if (!body.access_code || body.access_code !== form.access_code) {
      return NextResponse.json({ error: 'Código de acceso incorrecto' }, { status: 403 });
    }
  }

  // Validate respondent email if required
  if (form.require_email) {
    const email = body.respondent_email;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Se requiere un email válido para responder este formulario' }, { status: 400 });
    }
  }

  const validated = submitResponseSchema.safeParse({ ...body, form_id: id });
  if (!validated.success) {
    return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
  }

  try {
    const result = await submitResponse(
      id,
      validated.data.answers.map((a) => ({
        field_id: a.field_id,
        value: a.value || '',
      })),
      form.require_email ? body.respondent_email : undefined
    );

    return NextResponse.json(
      {
        success: true,
        response_id: result.responseId,
        score: result.score,
        max_score: result.maxScore,
        results: result.results,
        quiz_message: form.quiz_message,
        show_score: form.show_score,
        is_quiz: form.is_quiz,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'DUPLICATE_EMAIL') {
      return NextResponse.json(
        { error: 'Este email ya respondió este formulario anteriormente.' },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: 'Error al procesar la respuesta' }, { status: 500 });
  }
}
