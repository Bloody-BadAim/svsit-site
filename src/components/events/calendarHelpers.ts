import type { SitEvent, EventStatus, EventResponse } from "./types";
import { BRAND } from "./types";

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function toSitEvent(e: EventResponse): SitEvent {
  const statusMap: Record<EventResponse["status"], EventStatus> = {
    done: "DONE",
    next: "NEXT",
    tba: "TBA",
  };
  return {
    id: e.id,
    title: e.name,
    date: new Date(e.date),
    endDate: e.dateEnd ? new Date(e.dateEnd) : undefined,
    location: e.location || "TBA",
    time: e.time,
    description: e.description,
    link: e.link,
    isPaid: e.isPaid,
    status: statusMap[e.status] ?? "TBA",
    type: e.type || "SIT eigen",
    category: e.category || "Social",
    color: e.color || BRAND.gold,
  };
}

export function ticketLabel(event: SitEvent): { text: string; color: string; clickable: boolean } {
  if (event.status === "DONE") {
    return { text: "AFGEROND", color: "rgba(255,255,255,0.2)", clickable: false };
  }
  if (event.link) {
    const label = event.isPaid ? "TICKETS OPEN" : "AANMELDEN";
    return { text: label, color: BRAND.green, clickable: true };
  }
  return { text: "BINNENKORT", color: BRAND.gold, clickable: false };
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtIcal = (d: Date) =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
  `T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;

function eventEndDate(e: SitEvent): Date {
  return e.endDate ?? new Date(e.date.getTime() + 2 * 60 * 60 * 1000);
}

export function downloadIcs(e: SitEvent) {
  const start = fmtIcal(e.date);
  const end = fmtIcal(eventEndDate(e));

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SIT//svsit.nl//NL",
    "BEGIN:VEVENT",
    `UID:${e.id}@svsit.nl`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${e.location}`,
    e.description ? `DESCRIPTION:${e.description.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}-sit.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(e: SitEvent): string {
  const start = fmtIcal(e.date);
  const end = fmtIcal(eventEndDate(e));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${start}/${end}`,
    location: e.location,
    details: e.description ?? `Event van SIT — ${e.title}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(e: SitEvent): string {
  const startIso = e.date.toISOString();
  const endIso = eventEndDate(e).toISOString();
  const params = new URLSearchParams({
    subject: e.title,
    startdt: startIso,
    enddt: endIso,
    location: e.location,
    body: e.description ?? `Event van SIT — ${e.title}`,
    path: "/calendar/action/compose",
    rru: "addevent",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}
