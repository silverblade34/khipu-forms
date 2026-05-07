import { query, queryOne } from './db';
import { Form, FormField, User, ResponseWithAnswers } from './types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// USER ACTIONS
// ============================================

export async function findOrCreateUserByGoogle(data: {
  google_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}): Promise<User> {
  let user = await queryOne<User>(
    'SELECT * FROM users WHERE google_id = $1',
    [data.google_id]
  );

  if (!user) {
    user = await queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    if (user) {
      user = await queryOne<User>(
        'UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [data.google_id, data.avatar_url ?? null, user.id]
      );
    } else {
      user = await queryOne<User>(
        `INSERT INTO users (id, google_id, email, name, avatar_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [uuidv4(), data.google_id, data.email, data.name ?? null, data.avatar_url ?? null]
      );
    }
  }

  if (!user) throw new Error('Failed to create or find user');
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
}

export async function createGuestUser(): Promise<User> {
  const guestId = uuidv4();
  const guestEmail = `guest_${guestId}@khipu.guest`;
  const user = await queryOne<User>(
    `INSERT INTO users (id, email, name, is_guest)
     VALUES ($1, $2, $3, true) RETURNING *`,
    [guestId, guestEmail, 'Invitado']
  );
  if (!user) throw new Error('Failed to create guest user');
  return user;
}


// ============================================
// FORM ACTIONS
// ============================================

export async function createForm(userId: string, data: {
  title?: string;
  description?: string;
}): Promise<Form> {
  const form = await queryOne<Form>(
    `INSERT INTO forms (id, user_id, title, description)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [uuidv4(), userId, data.title ?? 'Formulario sin título', data.description ?? null]
  );
  if (!form) throw new Error('Failed to create form');
  return form;
}

export async function getFormsByUser(userId: string): Promise<Form[]> {
  return query<Form>(
    `SELECT f.*,
      COUNT(DISTINCT ff.id)::int AS field_count,
      COUNT(DISTINCT r.id)::int AS response_count
     FROM forms f
     LEFT JOIN form_fields ff ON ff.form_id = f.id
     LEFT JOIN responses r ON r.form_id = f.id
     WHERE f.user_id = $1
     GROUP BY f.id
     ORDER BY f.created_at DESC`,
    [userId]
  );
}

export async function getFormById(formId: string): Promise<Form | null> {
  return queryOne<Form>('SELECT * FROM forms WHERE id = $1', [formId]);
}

export async function updateForm(formId: string, userId: string, data: {
  title?: string;
  description?: string;
  is_public?: boolean;
  access_code?: string | null;
  is_quiz?: boolean;
  show_score?: boolean;
  quiz_message?: string;
  require_email?: boolean;
  step_by_step?: boolean;
  informed_consent?: string | null;
  presentation_mode?: 'classic' | 'cards' | 'duolingo';
}): Promise<Form | null> {
  const form = await queryOne<Form>('SELECT * FROM forms WHERE id = $1 AND user_id = $2', [formId, userId]);
  if (!form) return null;

  return queryOne<Form>(
    `UPDATE forms SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      is_public = COALESCE($3, is_public),
      access_code = $4,
      is_quiz = COALESCE($5, is_quiz),
      show_score = COALESCE($6, show_score),
      quiz_message = COALESCE($7, quiz_message),
      require_email = COALESCE($8, require_email),
      step_by_step = COALESCE($9, step_by_step),
      informed_consent = $10,
      presentation_mode = COALESCE($11, presentation_mode),
      updated_at = NOW()
     WHERE id = $12 AND user_id = $13 RETURNING *`,
    [
      data.title ?? null,
      data.description !== undefined ? data.description : null,
      data.is_public ?? null,
      data.access_code !== undefined ? data.access_code : form.access_code,
      data.is_quiz ?? null,
      data.show_score ?? null,
      data.quiz_message ?? null,
      data.require_email ?? null,
      data.step_by_step ?? null,
      data.informed_consent !== undefined ? data.informed_consent : form.informed_consent,
      data.presentation_mode ?? null,
      formId,
      userId,
    ]
  );
}

export async function deleteForm(formId: string, userId: string): Promise<boolean> {
  await query(
    'DELETE FROM forms WHERE id = $1 AND user_id = $2',
    [formId, userId]
  );
  return true;
}

// ============================================
// FORM FIELDS ACTIONS
// ============================================

export async function getFormFields(formId: string): Promise<FormField[]> {
  return query<FormField>(
    'SELECT * FROM form_fields WHERE form_id = $1 ORDER BY order_index ASC',
    [formId]
  );
}

export async function saveFields(formId: string, userId: string, fields: Array<{
  id?: string;
  type: string;
  label: string;
  required: boolean;
  options: string[];
  correct_answer?: string | null;
  order_index: number;
}>): Promise<FormField[]> {
  const form = await queryOne<Form>('SELECT id FROM forms WHERE id = $1 AND user_id = $2', [formId, userId]);
  if (!form) throw new Error('Form not found or unauthorized');

  await query('DELETE FROM form_fields WHERE form_id = $1', [formId]);

  for (const field of fields) {
    await query(
      `INSERT INTO form_fields (id, form_id, type, label, required, options, correct_answer, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        field.id || uuidv4(),
        formId,
        field.type,
        field.label,
        field.required,
        JSON.stringify(field.options || []),
        field.correct_answer ?? null,
        field.order_index,
      ]
    );
  }

  return getFormFields(formId);
}

// ============================================
// RESPONSE ACTIONS
// ============================================

export async function submitResponse(
  formId: string,
  answers: Array<{ field_id: string; value: string }>,
  respondentEmail?: string
): Promise<{ responseId: string; score?: number; maxScore?: number; results?: Record<string, boolean> }> {
  const responseId = uuidv4();

  // Check for duplicate email submission
  if (respondentEmail) {
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM responses WHERE form_id = $1 AND respondent_email = $2',
      [formId, respondentEmail]
    );
    if (existing) {
      throw new Error('DUPLICATE_EMAIL');
    }
  }

  // Get form fields to compute quiz score
  const fields = await query<FormField>(
    'SELECT * FROM form_fields WHERE form_id = $1',
    [formId]
  );

  // Compute score for quiz mode
  const gradedFields = fields.filter((f) => f.correct_answer !== null && f.correct_answer !== '');
  let score = 0;
  let maxScore = gradedFields.length;
  const results: Record<string, boolean> = {};

  for (const answer of answers) {
    const field = fields.find((f) => f.id === answer.field_id);
    if (field && field.correct_answer !== null && field.correct_answer !== '') {
      const isCorrect = answer.value.trim().toLowerCase() === field.correct_answer.trim().toLowerCase();
      results[answer.field_id] = isCorrect;
      if (isCorrect) score++;
    }
  }

  await query(
    `INSERT INTO responses (id, form_id, respondent_email, score, max_score)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      responseId,
      formId,
      respondentEmail ?? null,
      maxScore > 0 ? score : null,
      maxScore > 0 ? maxScore : null,
    ]
  );

  for (const answer of answers) {
    const isCorrect = results[answer.field_id] ?? null;
    await query(
      `INSERT INTO response_answers (id, response_id, field_id, value, is_correct)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), responseId, answer.field_id, answer.value || '', isCorrect]
    );
  }

  return {
    responseId,
    score: maxScore > 0 ? score : undefined,
    maxScore: maxScore > 0 ? maxScore : undefined,
    results: maxScore > 0 ? results : undefined,
  };
}

export async function getResponses(formId: string, userId: string): Promise<ResponseWithAnswers[]> {
  const form = await queryOne<Form>('SELECT id FROM forms WHERE id = $1 AND user_id = $2', [formId, userId]);
  if (!form) throw new Error('Form not found or unauthorized');

  const responses = await query<{
    id: string;
    form_id: string;
    respondent_email: string | null;
    score: number | null;
    max_score: number | null;
    created_at: string;
  }>(
    'SELECT * FROM responses WHERE form_id = $1 ORDER BY created_at DESC',
    [formId]
  );

  const result: ResponseWithAnswers[] = [];

  for (const response of responses) {
    const answers = await query<{
      id: string;
      response_id: string;
      field_id: string;
      value: string;
      is_correct: boolean | null;
      created_at: string;
      field_label: string;
      field_type: string;
    }>(
      `SELECT ra.*, ff.label as field_label, ff.type as field_type
       FROM response_answers ra
       JOIN form_fields ff ON ff.id = ra.field_id
       WHERE ra.response_id = $1`,
      [response.id]
    );

    result.push({ ...response, answers });
  }

  return result;
}
