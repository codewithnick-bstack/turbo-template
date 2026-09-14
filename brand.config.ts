type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
};

type BrandConfig = {
  businessName: string;
  tagline?: string;
  logoPath?: string;
  primaryColor: string;
  primaryForeground?: string;
  accentColor?: string;
  accentForeground?: string;
  fontHeading?: string;
  fontBody?: string;
  socialLinks?: SocialLinks;
  email?: string;
  phone?: string;
  address?: string;
  features?: {
    showPricing?: boolean;
    showPortfolio?: boolean;
    showTestimonials?: boolean;
    showBlog?: boolean;
    showTeam?: boolean;
  };
};

const brand: BrandConfig = {
  businessName: "Acme Studio",
  tagline: "We build digital experiences that grow businesses.",
  primaryColor: "#6366f1",
  primaryForeground: "#ffffff",
  accentColor: "#8b5cf6",
  accentForeground: "#ffffff",
  fontHeading: "Inter",
  fontBody: "Inter",
  socialLinks: {
    twitter: "https://twitter.com/acmestudio",
    linkedin: "https://linkedin.com/company/acmestudio",
    github: "https://github.com/acmestudio",
  },
  email: "hello@acmestudio.com",
  phone: "+1 (555) 123-4567",
  address: "123 Design Street, San Francisco, CA 94102",
  features: {
    showPricing: true,
    showPortfolio: true,
    showTestimonials: true,
    showBlog: true,
    showTeam: true,
  },
};

export default brand;
