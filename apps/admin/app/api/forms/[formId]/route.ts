import { NextRequest, NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const api = getApiClient();
  const data = await api.forms.get(formId);
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const api = getApiClient();
  const data = await api.forms.delete(formId);
  return NextResponse.json(data);
}
