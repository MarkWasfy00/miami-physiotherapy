import { z } from "zod";
import { branches, clinic, services } from "./data";

export const TIME_ZONE = "Africa/Cairo";
/** How far ahead patients can book. */
export const BOOKING_WINDOW_DAYS = 21;
/** Bookings allowed per branch per time slot (several therapists work in parallel). */
export const SLOT_CAPACITY = 4;

/** All slot start times for a day, e.g. ["10:00", "11:00", ...]. */
export function daySlots(): string[] {
  const { open, close, slotMinutes } = clinic.hours;
  const slots: string[] = [];
  for (let m = open * 60; m + slotMinutes <= close * 60; m += slotMinutes) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return slots;
}

/** Current date ("YYYY-MM-DD") and minutes since midnight in Cairo. */
export function cairoNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function bookableDates(now = new Date()) {
  const today = cairoNow(now).date;
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => addDays(today, i));
}

/** True when the slot has already started (Cairo time). */
export function isPastSlot(date: string, time: string, now = new Date()) {
  const current = cairoNow(now);
  if (date !== current.date) return date < current.date;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m <= current.minutes;
}

export function formatTime(time: string, locale: "ar" | "en") {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h, m));
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

const slugs = <T extends { slug: string }>(items: T[]) =>
  items.map((i) => i.slug) as [string, ...string[]];

export const bookingSchema = z
  .object({
    service: z.enum(slugs(services)),
    branch: z.enum(slugs(branches)),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    name: z.string().trim().min(3).max(80),
    // Egyptian mobile (01xxxxxxxxx), optionally with +20 / 0020 prefix.
    phone: z
      .string()
      .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+20|0020)/, "0"))
      .pipe(z.string().regex(/^01[0125]\d{8}$/)),
    age: z.coerce.number().int().min(1).max(110).optional().or(z.literal("").transform(() => undefined)),
    notes: z.string().trim().max(500).optional(),
    firstVisit: z.enum(["yes", "no"]).default("yes"),
    locale: z.enum(["ar", "en"]).default("ar"),
  })
  .refine((v) => daySlots().includes(v.time), { path: ["time"] })
  .refine((v) => bookableDates().includes(v.date), { path: ["date"] })
  .refine((v) => !isPastSlot(v.date, v.time), { path: ["time"] });

export type BookingInput = z.infer<typeof bookingSchema>;

export type Booking = BookingInput & {
  id: string;
  reference: string;
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
};

export type BookingState =
  | { status: "idle" }
  | { status: "error"; fields: string[]; message?: "slotTaken" | "server"; values?: Record<string, string> }
  | {
      status: "success";
      booking: Pick<Booking, "reference" | "service" | "branch" | "date" | "time" | "name" | "phone">;
    };
