import { NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function POST() {
  const api = getApiClient();
  const result = await api.compliance.exportData();
  return NextResponse.json(result);
}
