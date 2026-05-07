import { z } from 'zod';

// Form schemas
export const createFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(500),
  description: z.string().max(2000).optional(),
  is_public: z.boolean().default(true),
  access_code: z.string().max(100).optional().nullable(),
});

export const updateFormSchema = createFormSchema.partial();

// Field schemas
export const fieldTypeSchema = z.enum(['text', 'textarea', 'number', 'email', 'select', 'checkbox']);

export const formFieldSchema = z.object({
  id: z.string().uuid().optional(),
  type: fieldTypeSchema,
  label: z.string().min(1, 'El label es requerido').max(500),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  order_index: z.number().int().min(0),
});

export const saveFieldsSchema = z.object({
  form_id: z.string().uuid(),
  fields: z.array(formFieldSchema),
});

// Response submission schema
export const submitResponseSchema = z.object({
  form_id: z.string().uuid(),
  answers: z.array(z.object({
    field_id: z.string().uuid(),
    value: z.string().optional().default(''),
  })),
  access_code: z.string().optional(),
});

// Auth schemas
export const googleUserSchema = z.object({
  google_id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type FormFieldInput = z.infer<typeof formFieldSchema>;
export type FieldType = z.infer<typeof fieldTypeSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type GoogleUserInput = z.infer<typeof googleUserSchema>;
