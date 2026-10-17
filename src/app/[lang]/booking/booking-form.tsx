"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Stethoscope,
  User,
} from "lucide-react";
import { branches, cities, clinic, services } from "@/lib/data";
import { bookableDates, daySlots, formatTime, isPastSlot, type BookingState } from "@/lib/booking";
import { href, t, type Locale } from "@/lib/i18n";
import { ServiceIcon, SocialIcon } from "@/components/ui/icons";
import { submitBooking } from "./actions";

const copy = {
  ar: {
    steps: ["الخدمة", "الفرع", "الموعد", "بياناتك"],
    service: "ما الذي تحتاج المساعدة فيه؟",
    notSure: "غير متأكد؟ اختر أقرب حالة وسيحدد الأخصائي الخطة المناسبة بعد التقييم.",
    branch: "اختر الفرع الأقرب لك",
    date: "اختر اليوم",
    time: "اختر الوقت",
    noSlots: "لا توجد مواعيد متاحة في هذا اليوم، جرّب يوماً آخر.",
    details: "بياناتك للتواصل",
    name: "الاسم بالكامل",
    phone: "رقم الموبايل",
    phoneHint: "سنتصل بك أو نرسل رسالة واتساب لتأكيد الموعد",
    age: "السن (اختياري)",
    firstVisit: "هل هذه زيارتك الأولى للمركز؟",
    yes: "نعم",
    no: "لا، متابعة",
    notes: "صف حالتك باختصار (اختياري)",
    notesPh: "مثال: ألم أسفل الظهر ممتد للساق اليسرى منذ شهرين، ومعي رنين مغناطيسي",
    next: "التالي",
    back: "السابق",
    confirm: "تأكيد الحجز",
    summary: "ملخص الحجز",
    errors: {
      name: "من فضلك اكتب اسمك (3 أحرف على الأقل)",
      phone: "رقم موبايل مصري غير صحيح، مثال: 01012345678",
      time: "هذا الموعد لم يعد متاحاً، اختر موعداً آخر",
      server: "حدث خطأ، حاول مرة أخرى أو تواصل معنا عبر واتساب",
      generic: "تحقق من البيانات المدخلة",
    },
    successTitle: "تم استلام طلب الحجز!",
    successText: "سيتواصل معك فريقنا قريباً لتأكيد الموعد. احتفظ برقم الحجز التالي:",
    reference: "رقم الحجز",
    addCal: "أضف للتقويم",
    sendWa: "أرسل التفاصيل على واتساب",
    home: "العودة للرئيسية",
    bring: "لا تنسَ إحضار الأشعة والتقارير الطبية، وارتداء ملابس مريحة.",
  },
  en: {
    steps: ["Service", "Branch", "Time", "Details"],
    service: "What do you need help with?",
    notSure: "Not sure? Pick the closest match — your therapist will tailor the plan after assessment.",
    branch: "Choose your nearest branch",
    date: "Pick a day",
    time: "Pick a time",
    noSlots: "No times left on this day — please try another day.",
    details: "Your contact details",
    name: "Full name",
    phone: "Mobile number",
    phoneHint: "We'll call or WhatsApp you to confirm the appointment",
    age: "Age (optional)",
    firstVisit: "Is this your first visit to the center?",
    yes: "Yes",
    no: "No, follow-up",
    notes: "Briefly describe your condition (optional)",
    notesPh: "e.g. Lower back pain spreading to my left leg for 2 months, I have an MRI",
    next: "Continue",
    back: "Back",
    confirm: "Confirm booking",
    summary: "Booking summary",
    errors: {
      name: "Please enter your name (at least 3 characters)",
      phone: "Invalid Egyptian mobile number, e.g. 01012345678",
      time: "That slot is no longer available — please choose another",
      server: "Something went wrong. Please try again or contact us on WhatsApp",
      generic: "Please check the details you entered",
    },
    successTitle: "Booking request received!",
    successText: "Our team will contact you shortly to confirm. Keep your booking reference:",
    reference: "Reference",
    addCal: "Add to calendar",
    sendWa: "Send details on WhatsApp",
    home: "Back to home",
    bring: "Remember to bring any scans and medical reports, and wear comfortable clothes.",
  },
};

function formatDay(date: string, locale: Locale, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { ...opts, timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

function icsFile(b: { reference: string; date: string; time: string; branch: string; service: string }, locale: Locale) {
  const branch = branches.find((x) => x.slug === b.branch)!;
  const service = services.find((x) => x.slug === b.service)!;
  const [h, m] = b.time.split(":").map(Number);
  // Cairo is UTC+2 (UTC+3 during summer time); store as floating local time with TZID.
  const start = `${b.date.replaceAll("-", "")}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
  const end = `${b.date.replaceAll("-", "")}T${String(h + 1).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Miami Clinic//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b.reference}@miamiclinic.net`,
    `DTSTART;TZID=Africa/Cairo:${start}`,
    `DTEND;TZID=Africa/Cairo:${end}`,
    `SUMMARY:${locale === "ar" ? "موعد علاج طبيعي" : "Physiotherapy appointment"} – Miami Clinic`,
    `DESCRIPTION:${t(service.title, locale)} (${b.reference})`,
    `LOCATION:${t(branch.address, locale)}\\, ${t(branch.landmark, locale)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

export function BookingForm({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const params = useSearchParams();
  const initialService = services.some((s) => s.slug === params.get("service")) ? params.get("service")! : "";
  const initialBranch = branches.some((b) => b.slug === params.get("branch")) ? params.get("branch")! : "";

  const [service, setService] = useState(initialService);
  const [branch, setBranch] = useState(initialBranch);
  const [step, setStep] = useState(() => (!initialService ? 0 : !initialBranch ? 1 : 2));
  const dates = useMemo(() => bookableDates(), []);
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState("");
  const [availability, setAvailability] = useState<{ key: string; taken: string[] }>({ key: "", taken: [] });

  const [state, formAction, pending] = useActionState<BookingState, FormData>(async (prev, formData) => {
    const result = await submitBooking(prev, formData);
    // Someone grabbed the slot first: send the patient back to pick another time.
    if (result.status === "error" && result.message === "slotTaken") {
      setTime("");
      setStep(2);
    }
    return result;
  }, { status: "idle" });
  const topRef = useRef<HTMLDivElement>(null);

  // Load fully-booked slots whenever the branch or date changes.
  const availabilityKey = `${branch}|${date}`;
  const loadingSlots = !!branch && availability.key !== availabilityKey;
  const taken = loadingSlots ? [] : availability.taken;
  useEffect(() => {
    if (!branch || !date) return;
    let ignore = false;
    fetch(`/api/availability?branch=${branch}&date=${date}`)
      .then((r) => (r.ok ? r.json() : { taken: [] }))
      .then((d: { taken: string[] }) => !ignore && setAvailability({ key: `${branch}|${date}`, taken: d.taken }))
      .catch(() => !ignore && setAvailability({ key: `${branch}|${date}`, taken: [] }));
    return () => {
      ignore = true;
    };
  }, [branch, date, state]);

  // Bring the form into view when moving between steps (but not on first load).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, state.status]);

  const slots = daySlots().map((s) => ({ time: s, disabled: isPastSlot(date, s) || taken.includes(s) }));
  const availableCount = slots.filter((s) => !s.disabled).length;
  const fieldError = (f: string) => state.status === "error" && state.fields.includes(f);
  const prev = (f: string) => (state.status === "error" ? state.values?.[f] : undefined);

  const selectedService = services.find((s) => s.slug === service);
  const selectedBranch = branches.find((b) => b.slug === branch);
  const canContinue = [!!service, !!branch, !!date && !!time, true][step];

  if (state.status === "success") {
    const b = state.booking;
    const bBranch = branches.find((x) => x.slug === b.branch)!;
    const bService = services.find((x) => x.slug === b.service)!;
    const waText =
      lang === "ar"
        ? `مرحباً، قمت بحجز موعد من الموقع.\nرقم الحجز: ${b.reference}\nالاسم: ${b.name}\nالخدمة: ${t(bService.title, lang)}\nالفرع: ${t(bBranch.name, lang)}\nالموعد: ${formatDay(b.date, lang, { weekday: "long", day: "numeric", month: "long" })} - ${formatTime(b.time, lang)}`
        : `Hello, I booked an appointment on the website.\nReference: ${b.reference}\nName: ${b.name}\nService: ${t(bService.title, lang)}\nBranch: ${t(bBranch.name, lang)}\nTime: ${formatDay(b.date, lang, { weekday: "long", day: "numeric", month: "long" })} - ${formatTime(b.time, lang)}`;

    return (
      <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-28 text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-lime-500/15 text-lime-600">
          <CheckCircle2 className="size-10" aria-hidden />
        </span>
        <h2 className="mt-6 text-3xl font-bold text-ink">{c.successTitle}</h2>
        <p className="mt-3 text-ink-soft">{c.successText}</p>
        <p className="mt-5 inline-block rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 px-6 py-3 font-mono text-2xl font-bold tracking-widest text-brand-700" dir="ltr">
          {b.reference}
        </p>
        <dl className="mt-8 grid gap-3 rounded-3xl border border-line p-6 text-start sm:grid-cols-2">
          <SummaryRow icon={<Stethoscope className="size-4" />} label={copy[lang].steps[0]} value={t(bService.title, lang)} />
          <SummaryRow icon={<MapPin className="size-4" />} label={copy[lang].steps[1]} value={t(bBranch.name, lang)} />
          <SummaryRow
            icon={<CalendarCheck className="size-4" />}
            label={copy[lang].steps[2]}
            value={`${formatDay(b.date, lang, { weekday: "long", day: "numeric", month: "long" })} · ${formatTime(b.time, lang)}`}
          />
          <SummaryRow icon={<User className="size-4" />} label={copy[lang].steps[3]} value={`${b.name} · ${b.phone}`} />
        </dl>
        <p className="mt-6 text-sm text-ink-soft">{c.bring}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn !bg-[#25D366] text-white hover:!bg-[#1fb457]"
          >
            <SocialIcon name="whatsapp" className="size-4" />
            {c.sendWa}
          </a>
          <a href={icsFile(b, lang)} download={`miami-clinic-${b.reference}.ics`} className="btn-outline">
            <CalendarPlus className="size-4" aria-hidden />
            {c.addCal}
          </a>
          <Link href={href(lang)} className="btn-outline">
            {c.home}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="grid scroll-mt-28 gap-8 lg:grid-cols-[1fr_20rem]">
      <form action={formAction} className="min-w-0" noValidate>
        <input type="hidden" name="service" value={service} />
        <input type="hidden" name="branch" value={branch} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="time" value={time} />
        <input type="hidden" name="locale" value={lang} />

        {/* Stepper */}
        <ol className="mb-8 grid grid-cols-4 gap-2">
          {c.steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i)}
                className="group w-full text-start disabled:cursor-default"
              >
                <span className={`block h-1.5 rounded-full transition ${i <= step ? "bg-brand-600" : "bg-line"}`} />
                <span className={`mt-2 flex items-center gap-1.5 text-xs font-semibold sm:text-sm ${i <= step ? "text-ink" : "text-ink-soft/60"}`}>
                  {i < step ? (
                    <Check className="size-4 text-lime-600" aria-hidden />
                  ) : (
                    <span className="hidden sm:inline">{i + 1}.</span>
                  )}
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* Step 1: service */}
        {step === 0 && (
          <fieldset className="min-w-0">
            <legend className="text-xl font-bold text-ink">{c.service}</legend>
            <p className="mt-1 text-sm text-ink-soft">{c.notSure}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <OptionCard
                  key={s.slug}
                  selected={service === s.slug}
                  onSelect={() => {
                    setService(s.slug);
                    setStep(branch ? 2 : 1);
                  }}
                  icon={<ServiceIcon name={s.icon} className="size-5" />}
                  title={t(s.title, lang)}
                  text={t(s.short, lang)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 2: branch */}
        {step === 1 && (
          <fieldset className="min-w-0">
            <legend className="text-xl font-bold text-ink">{c.branch}</legend>
            {cities.map((city) => (
              <div key={city.id} className="mt-6">
                <p className="mb-3 text-sm font-semibold text-ink-soft">{t(city.name, lang)}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {branches
                    .filter((b) => b.city === city.id)
                    .map((b) => (
                      <OptionCard
                        key={b.slug}
                        selected={branch === b.slug}
                        onSelect={() => {
                          setBranch(b.slug);
                          setTime("");
                          setStep(2);
                        }}
                        icon={<MapPin className="size-5" />}
                        title={t(b.name, lang)}
                        text={`${t(b.address, lang)} – ${t(b.landmark, lang)}`}
                      />
                    ))}
                </div>
              </div>
            ))}
          </fieldset>
        )}

        {/* Step 3: date & time */}
        {step === 2 && (
          <fieldset className="min-w-0">
            <legend className="text-xl font-bold text-ink">{c.date}</legend>
            <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2">
              {dates.map((d) => {
                const active = d === date;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDate(d);
                      setTime("");
                    }}
                    className={`flex w-18 shrink-0 snap-start flex-col items-center rounded-2xl border px-2 py-3 transition ${
                      active ? "border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-600/25" : "border-line bg-white hover:border-brand-300"
                    }`}
                    aria-pressed={active}
                  >
                    <span className={`text-xs ${active ? "text-white/80" : "text-ink-soft"}`}>
                      {formatDay(d, lang, { weekday: "short" })}
                    </span>
                    <span className="mt-1 text-xl font-bold">{formatDay(d, lang, { day: "numeric" })}</span>
                    <span className={`text-xs ${active ? "text-white/80" : "text-ink-soft"}`}>
                      {formatDay(d, lang, { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-xl font-bold text-ink">{c.time}</p>
              {loadingSlots && <Loader2 className="size-5 animate-spin text-brand-600" aria-hidden />}
            </div>
            {fieldError("time") && <p className="mt-2 text-sm font-medium text-red-600">{c.errors.time}</p>}
            {availableCount === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist p-5 text-sm text-ink-soft">{c.noSlots}</p>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={s.disabled}
                    onClick={() => setTime(s.time)}
                    aria-pressed={time === s.time}
                    className={`rounded-xl border px-2 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-transparent disabled:bg-mist disabled:text-ink-soft/40 disabled:line-through ${
                      time === s.time
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-line bg-white text-ink hover:border-brand-300"
                    }`}
                  >
                    {formatTime(s.time, lang)}
                  </button>
                ))}
              </div>
            )}
          </fieldset>
        )}

        {/* Step 4: details */}
        {step === 3 && (
          <fieldset key={prev("submittedAt") ?? "fresh"} className="min-w-0 space-y-5">
            <legend className="text-xl font-bold text-ink">{c.details}</legend>
            {state.status === "error" && (
              <p className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">
                {state.message === "server" ? c.errors.server : c.errors.generic}
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">{c.name} *</span>
                <input name="name" defaultValue={prev("name")} required minLength={3} autoComplete="name" className="field" aria-invalid={fieldError("name")} />
                {fieldError("name") && <span className="mt-1 block text-xs text-red-600">{c.errors.name}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">{c.phone} *</span>
                <input
                  name="phone"
                  defaultValue={prev("phone")}
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  placeholder="01X XXXX XXXX"
                  dir="ltr"
                  className="field text-start rtl:text-end"
                  aria-invalid={fieldError("phone")}
                />
                <span className={`mt-1 block text-xs ${fieldError("phone") ? "text-red-600" : "text-ink-soft"}`}>
                  {fieldError("phone") ? c.errors.phone : c.phoneHint}
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">{c.age}</span>
                <input name="age" defaultValue={prev("age")} type="number" inputMode="numeric" min={1} max={110} className="field" />
              </label>
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-ink">{c.firstVisit}</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["yes", "no"] as const).map((v) => (
                    <label
                      key={v}
                      className="flex cursor-pointer items-center justify-center rounded-2xl border border-line px-3 py-3 text-sm font-medium has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:text-brand-700"
                    >
                      <input type="radio" name="firstVisit" value={v} defaultChecked={v === (prev("firstVisit") || "yes")} className="sr-only" />
                      {c[v]}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">{c.notes}</span>
              <textarea name="notes" defaultValue={prev("notes")} rows={4} maxLength={500} placeholder={c.notesPh} className="field resize-none" />
            </label>
          </fieldset>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={`btn-outline ${step === 0 ? "invisible" : ""}`}
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
            {c.back}
          </button>
          {step < 3 ? (
            step >= 2 && (
              <button type="button" disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className="btn-primary">
                {c.next}
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
              </button>
            )
          ) : (
            <button type="submit" disabled={pending} className="btn-primary !px-8">
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CalendarCheck className="size-4" aria-hidden />}
              {c.confirm}
            </button>
          )}
        </div>
      </form>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-4xl bg-mist p-6">
          <p className="font-bold text-ink">{c.summary}</p>
          <dl className="mt-5 space-y-4">
            <SummaryRow icon={<Stethoscope className="size-4" />} label={c.steps[0]} value={selectedService ? t(selectedService.title, lang) : "—"} />
            <SummaryRow icon={<MapPin className="size-4" />} label={c.steps[1]} value={selectedBranch ? t(selectedBranch.name, lang) : "—"} />
            <SummaryRow
              icon={<Clock className="size-4" />}
              label={c.steps[2]}
              value={step >= 2 && time ? `${formatDay(date, lang, { weekday: "long", day: "numeric", month: "long" })} · ${formatTime(time, lang)}` : "—"}
            />
          </dl>
          <div className="mt-6 border-t border-line pt-5 text-sm text-ink-soft">
            <p>{lang === "ar" ? "تفضل الحجز عبر الهاتف أو واتساب؟" : "Prefer to book by phone or WhatsApp?"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${clinic.phone}`} className="btn-outline !px-4 !py-2 text-xs" dir="ltr">
                {clinic.phone}
              </a>
              <a
                href={`https://wa.me/${clinic.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline !px-4 !py-2 text-xs"
              >
                <SocialIcon name="whatsapp" className="size-3.5 text-[#25D366]" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  text,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-start gap-4 rounded-3xl border p-5 text-start transition ${
        selected ? "border-brand-600 bg-brand-50 ring-4 ring-brand-100" : "border-line bg-white hover:border-brand-300"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
          selected ? "bg-brand-600 text-white" : "bg-mist text-brand-600"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block font-bold text-ink">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-ink-soft">{text}</span>
      </span>
    </button>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-ink-soft">{label}</dt>
        <dd className="text-sm font-semibold break-words text-ink">{value}</dd>
      </div>
    </div>
  );
}
