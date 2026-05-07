'use client';

import { create } from 'zustand';
import { FormField } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface BuilderState {
  formId: string | null;
  title: string;
  description: string;
  isPublic: boolean;
  accessCode: string;
  isQuiz: boolean;
  showScore: boolean;
  quizMessage: string;
  requireEmail: boolean;
  stepByStep: boolean;
  informedConsent: string;
  presentationMode: 'classic' | 'cards' | 'duolingo';
  showHints: boolean;
  gamification: boolean;
  initialLives: number;
  fields: FormField[];
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  setFormId: (id: string) => void;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setAccessCode: (code: string) => void;
  setIsQuiz: (v: boolean) => void;
  setShowScore: (v: boolean) => void;
  setQuizMessage: (v: string) => void;
  setRequireEmail: (v: boolean) => void;
  setStepByStep: (v: boolean) => void;
  setInformedConsent: (v: string) => void;
  setPresentationMode: (v: 'classic' | 'cards' | 'duolingo') => void;
  setShowHints: (v: boolean) => void;
  setGamification: (v: boolean) => void;
  setInitialLives: (v: number) => void;
  setFields: (fields: FormField[]) => void;
  addField: (type: FormField['type']) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  moveFieldUp: (id: string) => void;
  moveFieldDown: (id: string) => void;
  setIsSaving: (saving: boolean) => void;
  markClean: () => void;
  reset: () => void;
}

const initialState = {
  formId: null,
  title: 'Formulario sin título',
  description: '',
  isPublic: true,
  accessCode: '',
  isQuiz: false,
  showScore: true,
  quizMessage: '¡Gracias por participar!',
  requireEmail: false,
  stepByStep: false,
  informedConsent: '',
  presentationMode: 'classic' as const,
  showHints: false,
  gamification: false,
  initialLives: 3,
  fields: [],
  isDirty: false,
  isSaving: false,
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...initialState,

  setFormId: (id) => set({ formId: id }),
  setTitle: (title) => set({ title, isDirty: true }),
  setDescription: (description) => set({ description, isDirty: true }),
  setIsPublic: (isPublic) => set({ isPublic, isDirty: true }),
  setAccessCode: (accessCode) => set({ accessCode, isDirty: true }),
  setIsQuiz: (isQuiz) => set({ isQuiz, isDirty: true }),
  setShowScore: (showScore) => set({ showScore, isDirty: true }),
  setQuizMessage: (quizMessage) => set({ quizMessage, isDirty: true }),
  setRequireEmail: (requireEmail) => set({ requireEmail, isDirty: true }),
  setStepByStep: (stepByStep) => set({ stepByStep, isDirty: true }),
  setInformedConsent: (informedConsent) => set({ informedConsent, isDirty: true }),
  setPresentationMode: (presentationMode) => set({ presentationMode, isDirty: true }),
  setShowHints: (showHints) => set({ showHints, isDirty: true }),
  setGamification: (gamification) => set({ gamification, isDirty: true }),
  setInitialLives: (initialLives) => set({ initialLives, isDirty: true }),
  setFields: (fields) => set({ fields, isDirty: false }),

  addField: (type) => {
    const { fields } = get();
    const newField: FormField = {
      id: uuidv4(),
      form_id: get().formId || '',
      type,
      label: getDefaultLabel(type),
      required: false,
      options: (type === 'select' || type === 'radio' || type === 'checkbox') ? ['Opción 1', 'Opción 2'] : [],
      correct_answer: null,
      hint: null,
      explanation: null,
      time_limit: 0,
      order_index: fields.length,
      created_at: new Date().toISOString(),
    };
    set({ fields: [...fields, newField], isDirty: true });
  },

  removeField: (id) => {
    const { fields } = get();
    const updated = fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, order_index: i }));
    set({ fields: updated, isDirty: true });
  },

  updateField: (id, updates) => {
    const { fields } = get();
    const updated = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    set({ fields: updated, isDirty: true });
  },

  moveFieldUp: (id) => {
    const { fields } = get();
    const idx = fields.findIndex((f) => f.id === id);
    if (idx <= 0) return;
    const updated = [...fields];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    set({ fields: updated.map((f, i) => ({ ...f, order_index: i })), isDirty: true });
  },

  moveFieldDown: (id) => {
    const { fields } = get();
    const idx = fields.findIndex((f) => f.id === id);
    if (idx >= fields.length - 1) return;
    const updated = [...fields];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    set({ fields: updated.map((f, i) => ({ ...f, order_index: i })), isDirty: true });
  },

  setIsSaving: (isSaving) => set({ isSaving }),
  markClean: () => set({ isDirty: false }),
  reset: () => set(initialState),
}));

function getDefaultLabel(type: FormField['type']): string {
  const labels: Record<FormField['type'], string> = {
    text: 'Texto corto',
    textarea: 'Texto largo',
    number: 'Número',
    email: 'Correo electrónico',
    select: 'Desplegable (Lista)',
    radio: 'Opción única (Radio)',
    checkbox: 'Opción múltiple (Casillas)',
  };
  return labels[type];
}
