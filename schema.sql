-- ============================================
-- KHIPU FORMS - Database Schema v2.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FORMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL DEFAULT 'Formulario sin título',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  access_code VARCHAR(100),
  -- Quiz mode
  is_quiz BOOLEAN DEFAULT false,
  show_score BOOLEAN DEFAULT true,
  quiz_message TEXT DEFAULT '¡Gracias por participar!',
  -- Anti-duplicate email gate
  require_email BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FORM FIELDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'textarea', 'number', 'email', 'select', 'checkbox', 'radio')),
  label VARCHAR(500) NOT NULL DEFAULT 'Campo sin título',
  required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  respondent_email VARCHAR(255),
  score INTEGER,
  max_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESPONSE ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS response_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  value TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_order ON form_fields(form_id, order_index);
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);
CREATE INDEX IF NOT EXISTS idx_response_answers_response_id ON response_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_response_answers_field_id ON response_answers(field_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
-- Unique: same email can't answer same form twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_unique_email
  ON responses(form_id, respondent_email)
  WHERE respondent_email IS NOT NULL;

-- ============================================
-- MIGRATION: Add new columns if they don't exist
-- (Safe to run on existing databases)
-- ============================================
DO $$
BEGIN
  -- forms table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='is_quiz') THEN
    ALTER TABLE forms ADD COLUMN is_quiz BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='show_score') THEN
    ALTER TABLE forms ADD COLUMN show_score BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='quiz_message') THEN
    ALTER TABLE forms ADD COLUMN quiz_message TEXT DEFAULT '¡Gracias por participar!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forms' AND column_name='require_email') THEN
    ALTER TABLE forms ADD COLUMN require_email BOOLEAN DEFAULT false;
  END IF;
  -- form_fields table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='form_fields' AND column_name='correct_answer') THEN
    ALTER TABLE form_fields ADD COLUMN correct_answer TEXT;
  END IF;
  -- responses table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responses' AND column_name='respondent_email') THEN
    ALTER TABLE responses ADD COLUMN respondent_email VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responses' AND column_name='score') THEN
    ALTER TABLE responses ADD COLUMN score INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='responses' AND column_name='max_score') THEN
    ALTER TABLE responses ADD COLUMN max_score INTEGER;
  END IF;
  -- response_answers table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='response_answers' AND column_name='is_correct') THEN
    ALTER TABLE response_answers ADD COLUMN is_correct BOOLEAN;
  END IF;
  -- Update type CHECK constraint to allow 'radio'
  -- Drop old constraint and recreate
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'form_fields' AND constraint_name LIKE '%type%'
  ) THEN
    BEGIN
      ALTER TABLE form_fields DROP CONSTRAINT IF EXISTS form_fields_type_check;
      ALTER TABLE form_fields ADD CONSTRAINT form_fields_type_check
        CHECK (type IN ('text', 'textarea', 'number', 'email', 'select', 'checkbox', 'radio'));
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
  -- Unique index for email anti-duplicate
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_responses_unique_email'
  ) THEN
    CREATE UNIQUE INDEX idx_responses_unique_email
      ON responses(form_id, respondent_email)
      WHERE respondent_email IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
