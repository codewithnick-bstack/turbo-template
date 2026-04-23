import { NextResponse } from "next/server";
import { getApiClient } from "../../../lib/api";

export async function GET() {
  const api = getApiClient();
  const data = await api.templates.list();
  return NextResponse.json(data);
}
