export type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
};

export type BrandConfig = {
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

export function generateTokens(brand: BrandConfig): string {
  const primaryFg = brand.primaryForeground ?? "#ffffff";
  const accent = brand.accentColor ?? brand.primaryColor;
  const accentFg = brand.accentForeground ?? "#ffffff";
  const fontHeading = brand.fontHeading ?? "Inter";
  const fontBody = brand.fontBody ?? "Inter";

  return [
    `:root {`,
    `  --color-primary: ${brand.primaryColor};`,
    `  --color-primary-foreground: ${primaryFg};`,
    `  --color-accent: ${accent};`,
    `  --color-accent-foreground: ${accentFg};`,
    `  --font-heading: "${fontHeading}", sans-serif;`,
    `  --font-body: "${fontBody}", sans-serif;`,
    `}`,
  ].join("\n");
}
