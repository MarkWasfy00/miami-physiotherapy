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
  MapPin,
  Stethoscope,
  User,
} from "lucide-react";
import { branches, cities, clinic, services } from "@/lib/data";
import { bookableDates, daySlots, formatTime, isPastSlot, type BookingState } from "@/lib/booking";
import { href, t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { ServiceIcon, SocialIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
        <h2 className="mt-6 text-2xl font-bold text-ink sm:text-3xl">{c.successTitle}</h2>
        <p className="mt-3 text-ink-soft">{c.successText}</p>
        <p className="mt-5 inline-block rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 px-5 py-3 font-mono text-xl font-bold tracking-widest break-all text-brand-700 sm:px-6 sm:text-2xl" dir="ltr">
          {b.reference}
        </p>
        <dl className="mt-8 grid gap-4 rounded-3xl border p-5 text-start sm:grid-cols-2 sm:p-6">
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
          <Button asChild variant="whatsapp">
            <a href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">
              <SocialIcon name="whatsapp" className="size-4" />
              {c.sendWa}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={icsFile(b, lang)} download={`miami-clinic-${b.reference}.ics`}>
              <CalendarPlus aria-hidden />
              {c.addCal}
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href={href(lang)}>{c.home}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} data-hide-fab className="grid scroll-mt-24 gap-8 lg:grid-cols-[1fr_20rem]">
      <form action={formAction} className="min-w-0" noValidate>
        <input type="hidden" name="service" value={service} />
        <input type="hidden" name="branch" value={branch} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="time" value={time} />
        <input type="hidden" name="locale" value={lang} />

        {/* Stepper */}
        <ol className="mb-6 grid grid-cols-4 gap-2 sm:mb-8">
          {c.steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i)}
                className="group w-full touch-manipulation py-1 text-start disabled:cursor-default"
              >
                <span className={`block h-1.5 rounded-full transition ${i <= step ? "bg-brand-600" : "bg-line"}`} />
                <span className={cn("mt-2 flex items-center gap-1 text-[11px] font-semibold min-[380px]:text-xs sm:gap-1.5 sm:text-sm", i <= step ? "text-ink" : "text-ink-soft/60")}>
                  {i < step ? (
                    <Check className="size-3.5 shrink-0 text-lime-600 sm:size-4" aria-hidden />
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
            <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
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
            <ToggleGroup
              type="single"
              value={date}
              onValueChange={(d) => {
                if (!d) return;
                setDate(d);
                setTime("");
              }}
              spacing={2}
              aria-label={c.date}
              className="no-scrollbar -mx-4 mt-4 w-auto snap-x overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
            >
              {dates.map((d) => (
                <ToggleGroupItem
                  key={d}
                  value={d}
                  className="group/day h-auto w-18 snap-start flex-col gap-0 rounded-2xl border bg-white px-2 py-3 hover:border-brand-300 hover:bg-white data-[state=on]:border-brand-600 data-[state=on]:bg-brand-600 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-brand-600/25"
                >
                  <span className="text-xs font-normal text-ink-soft group-data-[state=on]/day:text-white/80">
                    {formatDay(d, lang, { weekday: "short" })}
                  </span>
                  <span className="mt-1 text-xl font-bold">{formatDay(d, lang, { day: "numeric" })}</span>
                  <span className="text-xs font-normal text-ink-soft group-data-[state=on]/day:text-white/80">
                    {formatDay(d, lang, { month: "short" })}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="mt-8 flex items-center justify-between">
              <p id="time-label" className="text-xl font-bold text-ink">
                {c.time}
              </p>
              {loadingSlots && <Spinner className="size-5 text-brand-600" />}
            </div>
            {fieldError("time") && (
              <Alert variant="destructive" className="mt-3">
                <AlertDescription>{c.errors.time}</AlertDescription>
              </Alert>
            )}
            {availableCount === 0 ? (
              <p className="mt-4 rounded-2xl bg-mist p-5 text-sm text-ink-soft">{c.noSlots}</p>
            ) : (
              <ToggleGroup
                type="single"
                value={time}
                onValueChange={setTime}
                spacing={2}
                aria-labelledby="time-label"
                className="mt-4 grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5"
              >
                {slots.map((s) => (
                  <ToggleGroupItem
                    key={s.time}
                    value={s.time}
                    disabled={s.disabled}
                    className="h-12 rounded-xl border bg-white text-sm font-semibold text-ink hover:border-brand-300 hover:bg-white disabled:border-transparent disabled:bg-mist disabled:text-ink-soft/40 disabled:line-through disabled:opacity-100 data-[state=on]:border-brand-600 data-[state=on]:bg-brand-600 data-[state=on]:text-white"
                  >
                    {formatTime(s.time, lang)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          </fieldset>
        )}

        {/* Step 4: details */}
        {step === 3 && (
          <fieldset key={prev("submittedAt") ?? "fresh"} className="min-w-0 space-y-5">
            <legend className="text-xl font-bold text-ink">{c.details}</legend>
            {state.status === "error" && (
              <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-red-50 p-4">
                <AlertDescription className="font-medium text-red-700">
                  {state.message === "server" ? c.errors.server : c.errors.generic}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={fieldError("name") || undefined}>
                <FieldLabel htmlFor="bk-name" className="font-semibold text-ink">
                  {c.name} *
                </FieldLabel>
                <Input
                  id="bk-name"
                  name="name"
                  defaultValue={prev("name")}
                  required
                  minLength={3}
                  autoComplete="name"
                  enterKeyHint="next"
                  aria-invalid={fieldError("name")}
                />
                {fieldError("name") && <FieldError>{c.errors.name}</FieldError>}
              </Field>
              <Field data-invalid={fieldError("phone") || undefined}>
                <FieldLabel htmlFor="bk-phone" className="font-semibold text-ink">
                  {c.phone} *
                </FieldLabel>
                <Input
                  id="bk-phone"
                  name="phone"
                  defaultValue={prev("phone")}
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  enterKeyHint="next"
                  placeholder="01X XXXX XXXX"
                  dir="ltr"
                  className="text-start rtl:text-end"
                  aria-invalid={fieldError("phone")}
                />
                {fieldError("phone") ? <FieldError>{c.errors.phone}</FieldError> : <FieldDescription className="text-xs">{c.phoneHint}</FieldDescription>}
              </Field>
              <Field>
                <FieldLabel htmlFor="bk-age" className="font-semibold text-ink">
                  {c.age}
                </FieldLabel>
                <Input id="bk-age" name="age" defaultValue={prev("age")} type="number" inputMode="numeric" min={1} max={110} />
              </Field>
              <Field>
                <Label id="bk-first" className="font-semibold text-ink">
                  {c.firstVisit}
                </Label>
                <RadioGroup name="firstVisit" defaultValue={prev("firstVisit") || "yes"} aria-labelledby="bk-first" className="grid-cols-2">
                  {(["yes", "no"] as const).map((v) => (
                    <Label
                      key={v}
                      className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium has-data-[state=checked]:border-brand-600 has-data-[state=checked]:bg-brand-50 has-data-[state=checked]:text-brand-700"
                    >
                      <RadioGroupItem value={v} />
                      {c[v]}
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="bk-notes" className="font-semibold text-ink">
                {c.notes}
              </FieldLabel>
              <Textarea id="bk-notes" name="notes" defaultValue={prev("notes")} rows={4} maxLength={500} placeholder={c.notesPh} className="resize-none" />
            </Field>
          </fieldset>
        )}

        {/* Navigation */}
        {/* Sticks to the bottom of the screen on phones so the next action is always in reach */}
        <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 border-t bg-white/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:mt-10 sm:bg-transparent sm:px-0 sm:pt-6 sm:pb-0 sm:backdrop-blur-none">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(step === 0 && "invisible")}
          >
            <ArrowLeft className="rtl:-scale-x-100" aria-hidden />
            {c.back}
          </Button>
          {step < 3 ? (
            step >= 2 && (
              <Button type="button" disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className="flex-1 sm:flex-none">
                {c.next}
                <ArrowRight className="rtl:-scale-x-100" aria-hidden />
              </Button>
            )
          ) : (
            <Button type="submit" disabled={pending} className="flex-1 sm:flex-none sm:px-8">
              {pending ? <Spinner /> : <CalendarCheck aria-hidden />}
              {c.confirm}
            </Button>
          )}
        </div>
      </form>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-4xl bg-mist p-5 sm:p-6">
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
              <Button asChild variant="outline" size="sm">
                <a href={`tel:${clinic.phone}`} dir="ltr">
                  {clinic.phone}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="whatsapp" className="size-3.5 text-[#25D366]" />
                  WhatsApp
                </a>
              </Button>
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
    <Card
      className={cn(
        "gap-0 p-0 transition hover:border-brand-300",
        selected && "border-brand-600 bg-brand-50 ring-4 ring-brand-100 hover:border-brand-600",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex h-full touch-manipulation items-start gap-4 p-4 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5"
      >
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            selected ? "bg-brand-600 text-white" : "bg-mist text-brand-600",
          )}
        >
          {icon}
        </span>
        <span>
          <span className="block font-bold text-ink">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-ink-soft">{text}</span>
        </span>
      </button>
    </Card>
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
