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
  return NextResponse.json({ form, fields });
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
      return NextResponse.json({ error: 'Invalid access code' }, { status: 403 });
    }
  }

  const validated = submitResponseSchema.safeParse({ ...body, form_id: id });
  if (!validated.success) {
    return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
  }

  const responseId = await submitResponse(id, validated.data.answers.map(a => ({
    field_id: a.field_id,
    value: a.value || '',
  })));

  return NextResponse.json({ success: true, response_id: responseId }, { status: 201 });
}
