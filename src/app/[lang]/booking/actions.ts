"use server";

import { bookingSchema, type BookingState } from "@/lib/booking";
import { createBooking } from "@/lib/booking-store";

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const raw = Object.fromEntries(formData);
  // React resets the form after an action, so echo the patient's input back on errors.
  const values: Record<string, string> = {
    ...Object.fromEntries(["name", "phone", "age", "notes", "firstVisit"].map((k) => [k, typeof raw[k] === "string" ? String(raw[k]) : ""])),
    submittedAt: String(Date.now()),
  };
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))], values };
  }

  try {
    const booking = await createBooking(parsed.data);
    if (booking === "slotTaken") return { status: "error", fields: ["time"], message: "slotTaken", values };

    const { reference, service, branch, date, time, name, phone } = booking;
    return { status: "success", booking: { reference, service, branch, date, time, name, phone } };
  } catch (err) {
    console.error("[booking] failed", err);
    return { status: "error", fields: [], message: "server", values };
  }
}
