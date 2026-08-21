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
  businessName: "S.R. Clarke",
  tagline: "Our People Build America.",
  primaryColor: "#0e2a4f",
  primaryForeground: "#ffffff",
  accentColor: "#d8261c",
  accentForeground: "#ffffff",
  fontHeading: "Inter",
  fontBody: "Inter",
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/s-r-clarke-inc",
  },
  email: "inquiry@srclarkecs.com",
  phone: "844-267-8787",
  address: "7331 Ponderosa Circle, Suite 2, Parker, CO 80138",
  features: {
    showPricing: false,
    showPortfolio: false,
    showTestimonials: true,
    showBlog: true,
    showTeam: true,
  },
};

export default brand;
