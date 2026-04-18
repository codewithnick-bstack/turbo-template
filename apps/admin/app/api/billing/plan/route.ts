import { NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(async () => {
    const form = await req.formData().catch(() => new FormData());
    return { plan: form.get("plan") };
  });
  const api = getApiClient();
  const result = await api.billing.setPlan(body.plan as "starter" | "pro" | "agency");
  return NextResponse.json(result);
}
