export type FlagContext = {
  tenantId?: string;
  userId?: string;
  plan?: "starter" | "pro" | "agency";
  env: "development" | "test" | "production";
};

export interface FlagsProvider {
  boolean(key: string, defaultValue: boolean, ctx: FlagContext): Promise<boolean>;
  number(key: string, defaultValue: number, ctx: FlagContext): Promise<number>;
  string(key: string, defaultValue: string, ctx: FlagContext): Promise<string>;
}

class EnvFlagsProvider implements FlagsProvider {
  async boolean(key: string, defaultValue: boolean): Promise<boolean> {
    const v = process.env[`FLAG_${key.toUpperCase().replaceAll(".", "_")}`];
    if (v === undefined) return defaultValue;
    return ["1", "true", "yes", "on"].includes(v.toLowerCase());
  }
  async number(key: string, defaultValue: number): Promise<number> {
    const v = process.env[`FLAG_${key.toUpperCase().replaceAll(".", "_")}`];
    if (!v) return defaultValue;
    const n = Number(v);
    return Number.isFinite(n) ? n : defaultValue;
  }
  async string(key: string, defaultValue: string): Promise<string> {
    const v = process.env[`FLAG_${key.toUpperCase().replaceAll(".", "_")}`];
    return v ?? defaultValue;
  }
}

let provider: FlagsProvider = new EnvFlagsProvider();

export function setFlagsProvider(next: FlagsProvider) {
  provider = next;
}

export const flags = {
  boolean: (key: string, def: boolean, ctx: FlagContext) => provider.boolean(key, def, ctx),
  number: (key: string, def: number, ctx: FlagContext) => provider.number(key, def, ctx),
  string: (key: string, def: string, ctx: FlagContext) => provider.string(key, def, ctx),
};
