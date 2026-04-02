export function generateICSFile(event: {
  title: string;
  date: Date;
  endDate?: Date;
  location: string;
  description: string;
}) {
  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const endDate =
    event.endDate || new Date(event.date.getTime() + 2 * 60 * 60 * 1000);

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SIT Studievereniging ICT//NL",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(event.date)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${event.description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export function generateAllICSFiles(
  events: {
    title: string;
    date: Date;
    endDate?: Date;
    location: string;
    description: string;
  }[]
) {
  const formatICSDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const vevents = events.map((event) => {
    const endDate =
      event.endDate || new Date(event.date.getTime() + 2 * 60 * 60 * 1000);
    return [
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(event.date)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.location}`,
      `DESCRIPTION:${event.description}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SIT Studievereniging ICT//NL",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "SIT_Alle_Events.ics";
  link.click();
  URL.revokeObjectURL(url);
}
