import { NextResponse } from "next/server";
import { getApiClient } from "../../../../lib/api";

export async function DELETE() {
  const api = getApiClient();
  const result = await api.compliance.deleteTenant();
  return NextResponse.json(result);
}
