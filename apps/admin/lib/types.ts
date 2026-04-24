export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  coverImageUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  photoUrl: string | null;
  order: number;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  id: string;
  authorName: string;
  company: string | null;
  role: string | null;
  quote: string;
  rating: number;
  photoUrl: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioEntry = {
  id: string;
  title: string;
  client: string | null;
  description: string | null;
  coverImageUrl: string | null;
  images: string[];
  tags: string[];
  url: string | null;
  order: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
};

export type SiteSettings = {
  id: string;
  businessName: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  fontHeading: string | null;
  fontBody: string | null;
  socialLinks: Record<string, string> | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string | null;
};
