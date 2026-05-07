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
  // Try to find by google_id
  let user = await queryOne<User>(
    'SELECT * FROM users WHERE google_id = $1',
    [data.google_id]
  );

  if (!user) {
    // Try to find by email
    user = await queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    if (user) {
      // Update google_id
      user = await queryOne<User>(
        'UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [data.google_id, data.avatar_url ?? null, user.id]
      );
    } else {
      // Create new user
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
}): Promise<Form | null> {
  const form = await queryOne<Form>('SELECT * FROM forms WHERE id = $1 AND user_id = $2', [formId, userId]);
  if (!form) return null;

  return queryOne<Form>(
    `UPDATE forms SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      is_public = COALESCE($3, is_public),
      access_code = $4,
      updated_at = NOW()
     WHERE id = $5 AND user_id = $6 RETURNING *`,
    [
      data.title ?? null,
      data.description ?? null,
      data.is_public ?? null,
      data.access_code !== undefined ? data.access_code : form.access_code,
      formId,
      userId
    ]
  );
}

export async function deleteForm(formId: string, userId: string): Promise<boolean> {
  const result = await query(
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
  order_index: number;
}>): Promise<FormField[]> {
  // Verify ownership
  const form = await queryOne<Form>('SELECT id FROM forms WHERE id = $1 AND user_id = $2', [formId, userId]);
  if (!form) throw new Error('Form not found or unauthorized');

  // Delete all existing fields
  await query('DELETE FROM form_fields WHERE form_id = $1', [formId]);

  // Insert new fields
  for (const field of fields) {
    await query(
      `INSERT INTO form_fields (id, form_id, type, label, required, options, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        field.id || uuidv4(),
        formId,
        field.type,
        field.label,
        field.required,
        JSON.stringify(field.options || []),
        field.order_index,
      ]
    );
  }

  return getFormFields(formId);
}

// ============================================
// RESPONSE ACTIONS
// ============================================

export async function submitResponse(formId: string, answers: Array<{
  field_id: string;
  value: string;
}>): Promise<string> {
  const responseId = uuidv4();

  await query(
    'INSERT INTO responses (id, form_id) VALUES ($1, $2)',
    [responseId, formId]
  );

  for (const answer of answers) {
    await query(
      `INSERT INTO response_answers (id, response_id, field_id, value)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), responseId, answer.field_id, answer.value || '']
    );
  }

  return responseId;
}

export async function getResponses(formId: string, userId: string): Promise<ResponseWithAnswers[]> {
  // Verify ownership
  const form = await queryOne<Form>('SELECT id FROM forms WHERE id = $1 AND user_id = $2', [formId, userId]);
  if (!form) throw new Error('Form not found or unauthorized');

  const responses = await query<{ id: string; form_id: string; created_at: string }>(
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

    result.push({
      ...response,
      answers,
    });
  }

  return result;
}
