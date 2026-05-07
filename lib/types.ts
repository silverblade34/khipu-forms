export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  google_id: string | null;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  access_code: string | null;
  // Quiz mode
  is_quiz: boolean;
  show_score: boolean;
  quiz_message: string | null;
  // Anti-duplicate
  require_email: boolean;
  // v2.1
  step_by_step: boolean;
  informed_consent: string | null;
  // v2.2 Presentation modes
  presentation_mode: 'classic' | 'cards' | 'duolingo';
  show_hints: boolean;
  gamification: boolean;
  created_at: string;
  updated_at: string;
  field_count?: number;
  response_count?: number;
}

export interface FormField {
  id: string;
  form_id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  options: string[];
  correct_answer: string | null;
  // v2.2
  hint: string | null;
  explanation: string | null;
  time_limit: number | null;
  order_index: number;
  created_at: string;
}

export interface Response {
  id: string;
  form_id: string;
  respondent_email: string | null;
  score: number | null;
  max_score: number | null;
  created_at: string;
}

export interface ResponseAnswer {
  id: string;
  response_id: string;
  field_id: string;
  value: string | null;
  is_correct: boolean | null;
  created_at: string;
}

export interface ResponseWithAnswers extends Response {
  answers: (ResponseAnswer & { field_label: string; field_type: string })[];
}
