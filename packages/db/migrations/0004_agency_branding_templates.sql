-- Phase 4-5: agency workspaces, branding, template marketplace

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS branding jsonb NOT NULL DEFAULT '{}';

CREATE TYPE IF NOT EXISTS invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  token text NOT NULL UNIQUE,
  status invite_status NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invites_tenant_idx ON invites(tenant_id);
CREATE INDEX IF NOT EXISTS invites_email_tenant_idx ON invites(email, tenant_id);

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  thumbnail_url text,
  preview_url text,
  category text NOT NULL DEFAULT 'general',
  tags text[] NOT NULL DEFAULT '{}',
  page_tree jsonb NOT NULL DEFAULT '{}',
  is_public boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS templates_category_idx ON templates(category);
CREATE INDEX IF NOT EXISTS templates_public_idx ON templates(is_public);
