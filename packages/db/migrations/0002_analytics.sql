CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  site_id uuid NOT NULL,
  session_id text,
  visitor_id text,
  event text NOT NULL,
  path text,
  referrer text,
  user_agent text,
  country text,
  props jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_tenant_idx ON analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS analytics_site_idx ON analytics_events(site_id);
CREATE INDEX IF NOT EXISTS analytics_created_idx ON analytics_events(created_at);

CREATE TABLE IF NOT EXISTS analytics_rollups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  site_id uuid NOT NULL,
  date text NOT NULL,
  path text,
  page_views integer NOT NULL DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  bounce_rate_pct integer
);

CREATE INDEX IF NOT EXISTS rollups_site_idx ON analytics_rollups(site_id, date);
