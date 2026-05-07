-- SIFo Medical Process Hub - Initial Schema
-- Created: 2025-05-06

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_by VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================
-- Processes Table
-- ============================================================
CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  category VARCHAR(50) NOT NULL, -- marketing, sales, operations, hr, quality, finance
  description TEXT,
  purpose TEXT,
  scope TEXT,

  -- Goals and Inputs
  goals TEXT[] DEFAULT '{}',
  inputs TEXT[] DEFAULT '{}',

  -- Responsibilities and Definitions
  responsibilities TEXT[] DEFAULT '{}',
  definitions JSONB DEFAULT '{}',

  -- Process Steps (recursive structure)
  steps JSONB NOT NULL DEFAULT '[]',

  -- Risks and Outputs
  risks_and_controls JSONB DEFAULT '[]',
  outputs TEXT[] DEFAULT '{}',
  records TEXT[] DEFAULT '{}',

  -- Tools and Metadata
  tools JSONB DEFAULT '[]',
  owner VARCHAR(255),
  frequency VARCHAR(255),
  tags TEXT[] DEFAULT '{}',

  -- Diagrams and Media
  mermaid_diagram TEXT,
  process_video_url VARCHAR(500),

  -- Status and Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, active, archived
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Versioning
  version_number INTEGER DEFAULT 1,

  CONSTRAINT valid_category CHECK (category IN ('marketing', 'sales', 'operations', 'hr', 'quality', 'finance')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'archived'))
);

CREATE INDEX idx_processes_slug ON processes(slug);
CREATE INDEX idx_processes_category ON processes(category);
CREATE INDEX idx_processes_status ON processes(status);
CREATE INDEX idx_processes_tags ON processes USING GIN(tags);
CREATE INDEX idx_processes_owner ON processes(owner);
CREATE INDEX idx_processes_created_at ON processes(created_at DESC);
CREATE INDEX idx_processes_updated_at ON processes(updated_at DESC);

-- ============================================================
-- Attachments Table
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- pdf, image, document, video
  file_size INTEGER NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_file_type CHECK (file_type IN ('pdf', 'image', 'document', 'video', 'other'))
);

CREATE INDEX idx_attachments_process_id ON attachments(process_id);
CREATE INDEX idx_attachments_created_at ON attachments(created_at DESC);

-- ============================================================
-- Process History/Audit Trail
-- ============================================================
CREATE TABLE IF NOT EXISTS process_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_type VARCHAR(50), -- created, updated, approved, rejected
  changes_json JSONB,

  UNIQUE(process_id, version_number)
);

CREATE INDEX idx_process_history_process_id ON process_history(process_id);
CREATE INDEX idx_process_history_changed_at ON process_history(changed_at DESC);

-- ============================================================
-- Audit Log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50), -- process, user, attachment
  resource_id VARCHAR(255),
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);

-- ============================================================
-- Enable RLS (Row Level Security)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for Processes (Active Processes - Public Read)
-- ============================================================
CREATE POLICY "Active processes are publicly readable"
ON processes FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can create processes"
ON processes FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Process authors can update their own"
ON processes FOR UPDATE
USING (auth.uid() = created_by AND status = 'draft')
WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- RLS Policies for Attachments
-- ============================================================
CREATE POLICY "Attachments for active processes readable"
ON attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM processes
    WHERE processes.id = attachments.process_id
    AND processes.status = 'active'
  )
);

CREATE POLICY "Users can upload attachments"
ON attachments FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- ============================================================
-- RLS Policies for Users
-- ============================================================
CREATE POLICY "Users can read their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- ============================================================
-- Function: Update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_processes_updated_at
BEFORE UPDATE ON processes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Function: Log to audit_log on process changes
-- ============================================================
CREATE OR REPLACE FUNCTION log_process_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    auth.uid(),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
    END,
    'process',
    NEW.id::TEXT,
    jsonb_build_object(
      'title', NEW.title,
      'status', NEW.status,
      'updated_at', NEW.updated_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_process_changes
AFTER INSERT OR UPDATE OR DELETE ON processes
FOR EACH ROW
EXECUTE FUNCTION log_process_change();
