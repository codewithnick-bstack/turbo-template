import { SignJWT, jwtVerify } from "jose";

export type Session = {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "editor" | "viewer";
  expiresAt: number;
};

export async function signSession(session: Session, secret: string, ttlSeconds = 60 * 60): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({
    userId: session.userId,
    tenantId: session.tenantId,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(key);
}

export async function verifySession(token: string, secret: string): Promise<Session | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return {
      userId: payload.userId as string,
      tenantId: payload.tenantId as string,
      role: payload.role as Session["role"],
      expiresAt: (payload.exp as number) * 1000,
    };
  } catch {
    return null;
  }
}
