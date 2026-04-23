-- sandboxes
CREATE TYPE sandbox_status AS ENUM ('active', 'promoting', 'promoted', 'deleted');

CREATE TABLE IF NOT EXISTS sandboxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  parent_site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  status sandbox_status NOT NULL DEFAULT 'active',
  promoted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS sandboxes_tenant_idx ON sandboxes(tenant_id);
CREATE INDEX IF NOT EXISTS sandboxes_site_idx ON sandboxes(parent_site_id);

-- experiments
CREATE TYPE experiment_status AS ENUM ('draft', 'running', 'paused', 'concluded');

CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status experiment_status NOT NULL DEFAULT 'draft',
  variants jsonb NOT NULL DEFAULT '[]',
  traffic_percent integer NOT NULL DEFAULT 100,
  goal_event text NOT NULL DEFAULT 'form_submit',
  goal_path text,
  started_at timestamptz,
  concluded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS experiments_tenant_idx ON experiments(tenant_id);
CREATE INDEX IF NOT EXISTS experiments_site_idx ON experiments(site_id);

CREATE TABLE IF NOT EXISTS experiment_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id text NOT NULL,
  session_id text NOT NULL,
  visitor_id text,
  converted integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz
);

CREATE INDEX IF NOT EXISTS impressions_experiment_idx ON experiment_impressions(experiment_id);
CREATE INDEX IF NOT EXISTS impressions_session_idx ON experiment_impressions(experiment_id, session_id);
