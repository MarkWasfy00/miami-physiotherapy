import "server-only";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { SLOT_CAPACITY, type Booking, type BookingInput } from "./booking";

/**
 * Minimal booking persistence.
 *
 * Bookings are appended to `data/bookings.json` and, when BOOKING_WEBHOOK_URL is
 * set, forwarded as JSON (e.g. to Zapier / Make / n8n → Google Sheets, WhatsApp
 * Business or email). On serverless hosts with a read-only filesystem, set the
 * webhook or swap these functions for a database (Postgres, Supabase, Firebase).
 */
// Vercel's filesystem is read-only apart from the (per-instance, ephemeral) temp dir.
const FILE =
  process.env.BOOKINGS_FILE ??
  (process.env.VERCEL
    ? path.join(os.tmpdir(), "bookings.json")
    : path.join(/* turbopackIgnore: true */ process.cwd(), "data", "bookings.json"));

let memory: Booking[] | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<Booking[]> {
  if (memory) return memory;
  try {
    memory = JSON.parse(await fs.readFile(FILE, "utf8")) as Booking[];
  } catch {
    memory = [];
  }
  return memory;
}

async function persist(all: Booking[]) {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  } catch (err) {
    console.warn("[bookings] could not write bookings file, keeping in memory only", err);
  }
}

export async function takenSlots(branch: string, date: string) {
  const all = await readAll();
  const counts = new Map<string, number>();
  for (const b of all) {
    if (b.branch === branch && b.date === date && b.status !== "cancelled") {
      counts.set(b.time, (counts.get(b.time) ?? 0) + 1);
    }
  }
  return [...counts].filter(([, n]) => n >= SLOT_CAPACITY).map(([time]) => time);
}

function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "MC-";
  for (let i = 0; i < 6; i++) ref += alphabet[Math.floor(Math.random() * alphabet.length)];
  return ref;
}

/** Saves a booking unless the slot filled up in the meantime. */
export async function createBooking(input: BookingInput): Promise<Booking | "slotTaken"> {
  const run = async () => {
    if ((await takenSlots(input.branch, input.date)).includes(input.time)) return "slotTaken" as const;

    const booking: Booking = {
      ...input,
      id: randomUUID(),
      reference: makeReference(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    const all = await readAll();
    all.push(booking);
    await persist(all);
    return booking;
  };

  // Serialise writes so two simultaneous requests can't overbook a slot.
  const result = writeQueue.then(run, run);
  writeQueue = result.catch(() => undefined);
  const booking = await result;

  if (booking !== "slotTaken") await notify(booking);
  return booking;
}

async function notify(booking: Booking) {
  const url = process.env.BOOKING_WEBHOOK_URL;
  if (!url) {
    if (process.env.VERCEL) console.warn("[bookings] BOOKING_WEBHOOK_URL is not set — booking %s is not stored durably", booking.reference);
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(booking),
    });
  } catch (err) {
    console.error("[bookings] webhook failed", err);
  }
}
