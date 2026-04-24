-- Drop all old SaaS platform tables and types
DROP TABLE IF EXISTS experiments CASCADE;
DROP TABLE IF EXISTS sandboxes CASCADE;
DROP TABLE IF EXISTS oauth_apps CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS search_indexes CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS analytics_pageviews CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS page_versions CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop old enum types
DROP TYPE IF EXISTS blog_post_status CASCADE;
DROP TYPE IF EXISTS site_status CASCADE;
DROP TYPE IF EXISTS page_status CASCADE;
DROP TYPE IF EXISTS membership_role CASCADE;
DROP TYPE IF EXISTS form_submission_status CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS sandbox_status CASCADE;
DROP TYPE IF EXISTS experiment_status CASCADE;

-- Create new website template tables

CREATE TYPE blog_post_status AS ENUM ('draft', 'published');

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL DEFAULT '',
  author text,
  cover_image_url text,
  status blog_post_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_slug_idx ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_status_idx ON blog_posts(status);

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  bio text,
  photo_url text,
  "order" integer NOT NULL DEFAULT 0,
  linkedin_url text,
  twitter_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS team_order_idx ON team_members("order");

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  company text,
  role text,
  quote text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  photo_url text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS testimonials_featured_idx ON testimonials(featured);

CREATE TYPE portfolio_status AS ENUM ('draft', 'published');

CREATE TABLE IF NOT EXISTS portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client text,
  description text,
  cover_image_url text,
  images jsonb DEFAULT '[]',
  tags text[] NOT NULL DEFAULT '{}',
  url text,
  "order" integer NOT NULL DEFAULT 0,
  status portfolio_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_status_idx ON portfolio_entries(status);
CREATE INDEX IF NOT EXISTS portfolio_order_idx ON portfolio_entries("order");

CREATE TYPE contact_status AS ENUM ('new', 'read', 'archived');

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status contact_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_status_idx ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS contacts_created_idx ON contact_submissions(created_at);

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'My Business',
  tagline text,
  email text,
  phone text,
  address text,
  logo_url text,
  primary_color text DEFAULT '#6366f1',
  accent_color text DEFAULT '#8b5cf6',
  font_heading text DEFAULT 'Inter',
  font_body text DEFAULT 'Inter',
  social_links jsonb DEFAULT '{}',
  seo_title text,
  seo_description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
