const CAL_BASE = "https://api.cal.com/v1";

type CalSlots = Record<string, Array<{ time: string }>>;

export async function getAvailableSlots(
  apiKey: string,
  eventTypeId: number,
  startDate: string,
  endDate: string,
): Promise<string> {
  const params = new URLSearchParams({
    apiKey,
    eventTypeId: String(eventTypeId),
    startTime: startDate,
    endTime: endDate,
    timeZone: "UTC",
  });
  const res = await fetch(`${CAL_BASE}/slots?${params}`, {
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) throw new Error(`Cal.com slots error ${res.status}`);

  const data = await res.json() as { slots: CalSlots };
  const slots = data.slots ?? {};

  const lines: string[] = [];
  for (const [date, times] of Object.entries(slots)) {
    if (!times?.length) continue;
    const timeStrings = times
      .slice(0, 5)
      .map((t) => new Date(t.time).toISOString().slice(11, 16) + " UTC");
    lines.push(`${date}: ${timeStrings.join(", ")}`);
  }
  return lines.length > 0 ? lines.join("\n") : "No availability found for that period.";
}

export async function createBooking(
  apiKey: string,
  eventTypeId: number,
  params: {
    name: string;
    email: string;
    startTime: string;
    timeZone?: string;
    notes?: string;
  },
): Promise<string> {
  const res = await fetch(`${CAL_BASE}/bookings?apiKey=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      eventTypeId,
      start: params.startTime,
      responses: {
        name: params.name,
        email: params.email,
        notes: params.notes ?? "",
      },
      timeZone: params.timeZone ?? "UTC",
      language: "en",
      metadata: {},
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Cal.com booking error ${res.status}`);
  }

  const booking = await res.json() as {
    uid?: string;
    title?: string;
    startTime?: string;
    description?: string;
  };

  return JSON.stringify({
    uid: booking.uid,
    title: booking.title,
    startTime: booking.startTime,
    message: "Booking confirmed! A calendar invitation has been sent to your email.",
  });
}
