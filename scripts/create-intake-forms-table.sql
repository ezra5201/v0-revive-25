-- Create intake_forms table to store client intake form data
CREATE TABLE IF NOT EXISTS intake_forms (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Basic Information Section
  name VARCHAR(255),
  pronouns VARCHAR(50),
  date_of_birth DATE,
  birth_year INTEGER,
  program VARCHAR(100),
  how_heard_about_us TEXT,
  
  -- Support Needs Section (stored as JSON arrays)
  needs JSONB DEFAULT '[]'::jsonb,
  see_staff JSONB DEFAULT '[]'::jsonb,
  other_support TEXT,
  
  -- Language Section
  languages TEXT[],
  
  -- Housing Status Section
  current_housing_status JSONB DEFAULT '[]'::jsonb,
  past_housing_status JSONB DEFAULT '[]'::jsonb,
  
  -- Demographics Section
  race VARCHAR(100),
  ethnicity VARCHAR(50),
  gender VARCHAR(50),
  is_disabled BOOLEAN,
  is_veteran BOOLEAN,
  
  -- Employment and Income Section
  employment_status VARCHAR(50),
  income_sources JSONB DEFAULT '[]'::jsonb,
  
  -- Goals Section
  goal_1 TEXT,
  goal_2 TEXT,
  goal_3 TEXT,
  
  -- Contact Information Section
  phone VARCHAR(20),
  email VARCHAR(255),
  preferred_contact_method VARCHAR(100),
  
  -- Emergency Contact Section
  emergency_contact_name VARCHAR(255),
  emergency_contact_relationship VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  -- Form Metadata
  completion_percentage INTEGER DEFAULT 0,
  section_completion JSONB DEFAULT '{}'::jsonb,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_intake_forms_client_id ON intake_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_completion ON intake_forms(completion_percentage);
