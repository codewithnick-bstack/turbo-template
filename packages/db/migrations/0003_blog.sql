CREATE TYPE IF NOT EXISTS blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  site_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL DEFAULT '',
  cover_image_id uuid,
  author_id uuid,
  status blog_post_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  tags text[] NOT NULL DEFAULT '{}',
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_tenant_idx ON blog_posts(tenant_id, site_id);
CREATE INDEX IF NOT EXISTS blog_slug_idx ON blog_posts(site_id, slug);
CREATE INDEX IF NOT EXISTS blog_status_idx ON blog_posts(tenant_id, status);
