import type { Localized } from "./i18n";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miamiclinic.net";

export const clinic = {
  founded: 2020,
  phone: "0233362623",
  whatsapp: "201501010194",
  email: "Miamislimmingcenter@gmail.com",
  social: {
    facebook: "https://www.facebook.com/share/1aUQaiUqwP/",
    instagram: "https://www.instagram.com/miamiphysicaltherapycenter",
    youtube: "https://www.youtube.com/channel/UCPfo2m8Kku1DqGYw6Ij-61A",
  },
  /** Booking slots are generated between these hours (24h clock). */
  hours: { open: 10, close: 24, slotMinutes: 60 },
};

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${clinic.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/* ------------------------------------------------------------------ */
/* Branches                                                            */
/* ------------------------------------------------------------------ */

export type City = "cairo" | "alexandria";

export type Branch = {
  slug: string;
  city: City;
  name: Localized;
  address: Localized;
  landmark: Localized;
  phones: string[];
  mapQuery: string;
};

export const branches: Branch[] = [
  {
    slug: "miami",
    city: "alexandria",
    name: { ar: "فرع ميامي", en: "Miami Branch" },
    address: { ar: "248 شارع جمال عبد الناصر", en: "248 Gamal Abdel Nasser St." },
    landmark: { ar: "بعد ميدان جيهان", en: "After Gihan Square" },
    phones: ["035571448", "01552541151"],
    mapQuery: "248 Gamal Abdel Nasser St, Miami, Alexandria, Egypt",
  },
  {
    slug: "camp-shezar",
    city: "alexandria",
    name: { ar: "فرع كامب شيزار", en: "Camp Shezar Branch" },
    address: { ar: "21 طريق الجيش (البحر)", en: "21 El Geish Road (Corniche)" },
    landmark: {
      ar: "بجوار مسرح عبد المنعم جابر – بالقرب من إشارة الشاطبي",
      en: "Next to Abdel Moneim Gaber Theatre, near El Shatby signal",
    },
    phones: ["01501046466"],
    mapQuery: "21 El Geish Road, Camp Shezar, Alexandria, Egypt",
  },
  {
    slug: "moharam-bek",
    city: "alexandria",
    name: { ar: "فرع محرم بك", en: "Moharam Bek Branch" },
    address: { ar: "72 شارع محرم بك", en: "72 Moharam Bek St." },
    landmark: { ar: "محرم بك – الإسكندرية", en: "Moharam Bek, Alexandria" },
    phones: ["033933060", "01501010192"],
    mapQuery: "72 Moharam Bek St, Alexandria, Egypt",
  },
  {
    slug: "dokki",
    city: "cairo",
    name: { ar: "فرع الدقي", en: "Dokki Branch" },
    address: { ar: "70 شارع مصدق، الدقي", en: "70 Mosadak St., Dokki" },
    landmark: { ar: "أمام فودافون", en: "Opposite Vodafone" },
    phones: ["01501010194", "0233362623"],
    mapQuery: "70 Mosadak St, Dokki, Giza, Egypt",
  },
  {
    slug: "sheikh-zayed",
    city: "cairo",
    name: { ar: "فرع الشيخ زايد", en: "Sheikh Zayed Branch" },
    address: { ar: "مول السرايا", en: "El Saraya Mall" },
    landmark: {
      ar: "بجوار السعودي ماركت – بالقرب من أركان",
      en: "Next to Saudi Market, near Arkan Plaza",
    },
    phones: ["01514115144"],
    mapQuery: "El Saraya Mall, Sheikh Zayed City, Giza, Egypt",
  },
];

export const cities: { id: City; name: Localized }[] = [
  { id: "alexandria", name: { ar: "الإسكندرية", en: "Alexandria" } },
  { id: "cairo", name: { ar: "القاهرة والجيزة", en: "Cairo & Giza" } },
];

export function mapEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export function mapLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export type Service = {
  slug: string;
  icon: "spine" | "brain" | "knee" | "shoulder" | "foot" | "bandage";
  image: string;
  title: Localized;
  short: Localized;
  intro: Localized;
  conditions: Localized<string[]>;
  approach: Localized<string[]>;
  techniques: Localized<string[]>;
  sessions: Localized;
};

export const services: Service[] = [
  {
    slug: "spine",
    icon: "spine",
    image: "/images/services/spine.webp",
    title: { ar: "آلام العمود الفقري والرقبة", en: "Back & Neck Pain" },
    short: {
      ar: "برامج علاج الانزلاق الغضروفي وخشونة الفقرات والانزلاق الفقاري بدون جراحة.",
      en: "Non-surgical programs for disc herniation, spinal arthritis and spondylolisthesis.",
    },
    intro: {
      ar: "آلام أسفل الظهر والرقبة من أكثر الأسباب شيوعاً لزيارة أخصائي العلاج الطبيعي. نبدأ دائماً بمراجعة صور الرنين المغناطيسي، ثم اختبارات الحركة والقوة وتقييم الألم، لنصمم برنامجاً يعالج السبب وليس العَرَض فقط.",
      en: "Lower back and neck pain are among the most common reasons people see a physiotherapist. Every program starts with a review of your MRI, followed by movement, strength and pain testing, so we treat the cause and not just the symptom.",
    },
    conditions: {
      ar: [
        "الانزلاق الغضروفي القطني والعنقي",
        "خشونة الفقرات",
        "الانزلاق الفقاري",
        "عرق النسا وتنميل الأطراف",
        "آلام الرقبة وتيبسها",
        "ضيق القناة العصبية",
      ],
      en: [
        "Lumbar & cervical disc herniation",
        "Spinal osteoarthritis",
        "Spondylolisthesis",
        "Sciatica and limb numbness",
        "Neck pain and stiffness",
        "Spinal canal stenosis",
      ],
    },
    approach: {
      ar: [
        "مراجعة الرنين المغناطيسي والتاريخ المرضي",
        "اختبارات الحركة والقوة وتقييم شدة الألم",
        "علاج يدوي وتمارين تثبيت للعمود الفقري",
        "تعليم وضعيات الجلوس والحركة الصحيحة",
      ],
      en: [
        "MRI review and full medical history",
        "Movement, strength and pain-severity testing",
        "Manual therapy and spinal stabilisation exercise",
        "Posture and movement education for daily life",
      ],
    },
    techniques: {
      ar: ["العلاج اليدوي", "الشد الفقري", "العلاج الكهربائي", "الموجات فوق الصوتية", "تمارين علاجية"],
      en: ["Manual therapy", "Spinal traction", "Electrotherapy", "Ultrasound therapy", "Therapeutic exercise"],
    },
    sessions: {
      ar: "تختلف عدد الجلسات حسب الحالة، ويتم إعادة التقييم بشكل دوري.",
      en: "The number of sessions depends on your case; progress is re-assessed regularly.",
    },
  },
  {
    slug: "neuro-rehab",
    icon: "brain",
    image: "/images/services/neuro.webp",
    title: { ar: "تأهيل الشلل والحالات العصبية", en: "Paralysis & Neuro Rehab" },
    short: {
      ar: "تأهيل إصابات الحبل الشوكي والجلطات والأعصاب الطرفية واضطرابات المشي والاتزان.",
      en: "Rehabilitation after spinal cord injury, stroke, nerve injury and balance disorders.",
    },
    intro: {
      ar: "نعمل على استعادة التحكم الحركي والقوة والقدرة على أداء الأنشطة اليومية بأكبر قدر من الاستقلالية، من خلال برامج تأهيل مكثفة ومتابعة مستمرة مع المريض وأسرته.",
      en: "We focus on restoring motor control, strength and the ability to handle daily activities as independently as possible, through structured rehab programs and close follow-up with patients and their families.",
    },
    conditions: {
      ar: [
        "إصابات الحبل الشوكي",
        "الشلل بمختلف أنواعه",
        "التأهيل بعد الجلطة الدماغية",
        "إصابات الأعصاب الطرفية",
        "اضطرابات المشي والاتزان",
        "شلل الوجه (العصب السابع)",
      ],
      en: [
        "Spinal cord injuries",
        "Paralysis of all types",
        "Post-stroke rehabilitation",
        "Peripheral nerve injuries",
        "Gait and balance disorders",
        "Facial (Bell's) palsy",
      ],
    },
    approach: {
      ar: [
        "تقييم شامل للقوة والإحساس والتوازن",
        "تحديد أهداف وظيفية واضحة مع الأسرة",
        "تمارين التحكم الحركي والتدريب على المشي",
        "تحفيز كهربائي للأعصاب والعضلات",
      ],
      en: [
        "Full assessment of strength, sensation and balance",
        "Clear functional goals agreed with the family",
        "Motor-control exercise and gait training",
        "Neuromuscular electrical stimulation",
      ],
    },
    techniques: {
      ar: ["تمارين التحكم الحركي", "تدريب المشي والاتزان", "التحفيز الكهربائي", "العلاج اليدوي"],
      en: ["Motor-control training", "Gait & balance training", "Electrical stimulation", "Manual therapy"],
    },
    sessions: {
      ar: "برامج التأهيل العصبي غالباً ما تكون ممتدة، ويتم قياس التقدم كل عدة أسابيع.",
      en: "Neuro rehab programs are usually longer-term, with progress measured every few weeks.",
    },
  },
  {
    slug: "knee-arthritis",
    icon: "knee",
    image: "/images/services/knee.webp",
    title: { ar: "خشونة الركبة والمفاصل", en: "Knee & Joint Arthritis" },
    short: {
      ar: "تخفيف ألم الخشونة وتقوية العضلات المحيطة بالمفصل وتحسين مدى الحركة.",
      en: "Ease arthritis pain, strengthen the muscles around the joint and restore range of motion.",
    },
    intro: {
      ar: "الخشونة لا تعني أن عليك التعايش مع الألم. يساعد العلاج الطبيعي على تقليل الاحتكاك داخل المفصل، وتقوية العضلات الداعمة، واستعادة القدرة على المشي وصعود السلالم بثقة.",
      en: "Arthritis doesn't mean living with pain. Physiotherapy reduces load on the joint, strengthens the supporting muscles and gets you walking and climbing stairs with confidence again.",
    },
    conditions: {
      ar: [
        "خشونة الركبة",
        "خشونة مفصل الفخذ",
        "آلام الرضفة (صابونة الركبة)",
        "التهاب الأوتار حول الركبة",
        "إصابات الغضروف الهلالي",
      ],
      en: [
        "Knee osteoarthritis",
        "Hip osteoarthritis",
        "Patellofemoral (kneecap) pain",
        "Tendinitis around the knee",
        "Meniscus injuries",
      ],
    },
    approach: {
      ar: [
        "تقييم المفصل ومدى الحركة وقوة العضلات",
        "تقليل الألم والالتهاب بالأجهزة المساعدة",
        "تمارين تقوية متدرجة للعضلة الرباعية والفخذ",
        "برنامج منزلي للحفاظ على النتائج",
      ],
      en: [
        "Joint, range-of-motion and muscle-strength assessment",
        "Pain and inflammation control with supporting modalities",
        "Progressive quadriceps and hip strengthening",
        "Home program to keep your results",
      ],
    },
    techniques: {
      ar: ["الموجات التصادمية", "الموجات فوق الصوتية", "العلاج اليدوي", "تمارين التقوية"],
      en: ["Shockwave therapy", "Ultrasound therapy", "Manual therapy", "Strength training"],
    },
    sessions: {
      ar: "يشعر كثير من المرضى بتحسن ملحوظ خلال الأسابيع الأولى من البرنامج.",
      en: "Many patients notice a clear improvement within the first weeks of the program.",
    },
  },
  {
    slug: "shoulder",
    icon: "shoulder",
    image: "/images/services/shoulder.webp",
    title: { ar: "آلام وإصابات الكتف", en: "Shoulder Pain & Injuries" },
    short: {
      ar: "تأهيل الكتف المتجمد والتهاب الأوتار وإصابات الكفة المدورة.",
      en: "Rehab for frozen shoulder, tendinitis and rotator cuff injuries.",
    },
    intro: {
      ar: "الكتف من أكثر المفاصل حركة وأكثرها عرضة للإصابة. نستعيد مدى الحركة الكامل ونقوي عضلات الكفة المدورة لتعود لأنشطتك اليومية والرياضية بدون ألم.",
      en: "The shoulder is the body's most mobile joint and one of the most easily injured. We restore full range of motion and strengthen the rotator cuff so you can return to daily life and sport without pain.",
    },
    conditions: {
      ar: [
        "الكتف المتجمد",
        "التهاب أوتار الكتف",
        "إصابات وتمزقات الكفة المدورة",
        "متلازمة الانحشار",
        "التأهيل بعد خلع الكتف",
      ],
      en: [
        "Frozen shoulder",
        "Shoulder tendinitis",
        "Rotator cuff tears & injuries",
        "Impingement syndrome",
        "Rehab after shoulder dislocation",
      ],
    },
    approach: {
      ar: [
        "تقييم مدى الحركة واختبارات الأوتار",
        "تحريك يدوي للمفصل وتخفيف التيبس",
        "تقوية الكفة المدورة وعضلات لوح الكتف",
        "العودة التدريجية للأنشطة والرياضة",
      ],
      en: [
        "Range-of-motion and tendon testing",
        "Manual joint mobilisation to ease stiffness",
        "Rotator cuff and scapular strengthening",
        "Gradual return to activity and sport",
      ],
    },
    techniques: {
      ar: ["العلاج اليدوي", "الموجات التصادمية", "العلاج الكهربائي", "تمارين علاجية"],
      en: ["Manual therapy", "Shockwave therapy", "Electrotherapy", "Therapeutic exercise"],
    },
    sessions: {
      ar: "تختلف مدة التأهيل حسب نوع الإصابة ومرحلتها.",
      en: "Rehab length depends on the type and stage of the injury.",
    },
  },
  {
    slug: "heel-spur",
    icon: "foot",
    image: "/images/services/heel.webp",
    title: { ar: "الشوكة العظمية والتهاب اللفافة الأخمصية", en: "Heel Spur & Plantar Fasciitis" },
    short: {
      ar: "علاج بالموجات التصادمية وتمارين تأهيلية لتقليل الالتهاب وألم المشي.",
      en: "Shockwave therapy and targeted exercise to calm inflammation and walking pain.",
    },
    intro: {
      ar: "ألم الكعب مع أول خطوة في الصباح علامة شائعة لالتهاب اللفافة الأخمصية أو الشوكة العظمية. جلسات الموجات التصادمية مع تمارين الإطالة والتقوية من أكثر الطرق فعالية لتقليل الألم بدون حقن أو جراحة.",
      en: "Heel pain with your first steps in the morning is a classic sign of plantar fasciitis or a heel spur. Shockwave sessions combined with stretching and strengthening are among the most effective ways to reduce pain without injections or surgery.",
    },
    conditions: {
      ar: ["الشوكة العظمية (مسمار الكعب)", "التهاب اللفافة الأخمصية", "التهاب وتر أكيلس", "آلام القدم المزمنة"],
      en: ["Heel spur", "Plantar fasciitis", "Achilles tendinopathy", "Chronic foot pain"],
    },
    approach: {
      ar: [
        "تقييم القدم وطريقة المشي",
        "جلسات الموجات التصادمية",
        "تمارين إطالة وتقوية لعضلات القدم والسمانة",
        "نصائح الأحذية والأنشطة اليومية",
      ],
      en: [
        "Foot and gait assessment",
        "Shockwave therapy sessions",
        "Foot and calf stretching & strengthening",
        "Footwear and daily-activity advice",
      ],
    },
    techniques: {
      ar: ["الموجات التصادمية", "الموجات فوق الصوتية", "تمارين علاجية"],
      en: ["Shockwave therapy", "Ultrasound therapy", "Therapeutic exercise"],
    },
    sessions: {
      ar: "عادة ما تكون جلسات الموجات التصادمية أسبوعية لعدة أسابيع.",
      en: "Shockwave sessions are typically weekly over several weeks.",
    },
  },
  {
    slug: "post-surgery",
    icon: "bandage",
    image: "/images/photos/rehab-session.webp",
    title: { ar: "التأهيل بعد العمليات الجراحية", en: "Post-Surgical Rehab" },
    short: {
      ar: "برامج تعافٍ بعد تغيير المفاصل والرباط الصليبي وتثبيت الفقرات.",
      en: "Recovery programs after joint replacement, ACL reconstruction and spinal fusion.",
    },
    intro: {
      ar: "نجاح العملية الجراحية يعتمد بشكل كبير على التأهيل بعدها. نعمل بالتنسيق مع خطة الجراح لاستعادة الحركة والقوة بأمان وفي الوقت المناسب.",
      en: "A successful surgery depends heavily on the rehab that follows. We work alongside your surgeon's protocol to restore movement and strength safely and on schedule.",
    },
    conditions: {
      ar: [
        "تغيير مفصل الركبة أو الفخذ",
        "إعادة بناء الرباط الصليبي",
        "تثبيت الفقرات",
        "إصلاح الكفة المدورة",
        "الكسور بعد فك الجبس",
      ],
      en: [
        "Knee or hip replacement",
        "ACL reconstruction",
        "Spinal fusion",
        "Rotator cuff repair",
        "Fractures after cast removal",
      ],
    },
    approach: {
      ar: [
        "مراجعة تقرير العملية وتعليمات الجراح",
        "تقليل التورم والألم في المرحلة الأولى",
        "استعادة مدى الحركة والقوة تدريجياً",
        "التدريب الوظيفي والعودة للحياة الطبيعية",
      ],
      en: [
        "Review of the surgical report and surgeon's instructions",
        "Early-stage swelling and pain control",
        "Gradual return of range of motion and strength",
        "Functional training and return to normal life",
      ],
    },
    techniques: {
      ar: ["تمارين علاجية", "العلاج اليدوي", "التحفيز الكهربائي", "تدريب المشي"],
      en: ["Therapeutic exercise", "Manual therapy", "Electrical stimulation", "Gait training"],
    },
    sessions: {
      ar: "يبدأ التأهيل عادة بعد العملية مباشرة وفق بروتوكول الجراح.",
      en: "Rehab usually starts soon after surgery, following your surgeon's protocol.",
    },
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Treatment modalities                                                */
/* ------------------------------------------------------------------ */

export const modalities: { icon: "waves" | "zap" | "activity" | "move" | "hand"; title: Localized; text: Localized }[] = [
  {
    icon: "activity",
    title: { ar: "الموجات التصادمية", en: "Shockwave Therapy" },
    text: {
      ar: "لعلاج الشوكة العظمية والتهابات الأوتار المزمنة وتحفيز الالتئام.",
      en: "For heel spurs and chronic tendon problems, stimulating natural healing.",
    },
  },
  {
    icon: "waves",
    title: { ar: "الموجات فوق الصوتية", en: "Ultrasound Therapy" },
    text: {
      ar: "لتقليل الالتهاب وتحسين الدورة الدموية في الأنسجة العميقة.",
      en: "Reduces inflammation and improves circulation in deep tissue.",
    },
  },
  {
    icon: "zap",
    title: { ar: "العلاج الكهربائي", en: "Electrotherapy" },
    text: {
      ar: "تحفيز الأعصاب والعضلات وتخفيف الألم.",
      en: "Nerve and muscle stimulation plus pain relief.",
    },
  },
  {
    icon: "move",
    title: { ar: "الشد الفقري", en: "Spinal Traction" },
    text: {
      ar: "لتخفيف الضغط على الغضاريف والأعصاب في الرقبة والظهر.",
      en: "Takes pressure off discs and nerves in the neck and back.",
    },
  },
  {
    icon: "hand",
    title: { ar: "العلاج اليدوي", en: "Manual Therapy" },
    text: {
      ar: "تقنيات يدوية متخصصة يقدمها أخصائيون معتمدون من جامعات بريطانية.",
      en: "Specialist hands-on techniques from UK-certified therapists.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export type TeamMember = {
  slug: string;
  photo: string;
  name: Localized;
  role: Localized;
  credentials: Localized<string[]>;
};

export const team: TeamMember[] = [
  {
    slug: "ziad-ismail",
    photo: "/images/team/ziad-ismail.webp",
    name: { ar: "د. زياد إسماعيل", en: "Dr. Ziad Ismail" },
    role: { ar: "المدير الطبي", en: "Medical Director" },
    credentials: {
      ar: [
        "دبلومة رسم العضلات والأعصاب",
        "شهادة العلاج اليدوي من جامعة بريطانية",
        "شهادة في علاج العمود الفقري",
        "شهادة FIFA في الإصابات الرياضية",
      ],
      en: [
        "Diploma in EMG & nerve conduction",
        "Manual therapy certificate, UK university",
        "Spine therapy certification",
        "FIFA certificate in sports injuries",
      ],
    },
  },
  {
    slug: "kirellos-magdy",
    photo: "/images/team/kirellos-magdy.webp",
    name: { ar: "د. كيرلس مجدي", en: "Dr. Kirellos Magdy" },
    role: { ar: "المدير الطبي", en: "Medical Director" },
    credentials: {
      ar: [
        "شهادة العلاج اليدوي من جامعة بريطانية",
        "شهادة في علاج العمود الفقري",
        "شهادة في علاج العظام والمفاصل",
      ],
      en: [
        "Manual therapy certificate, UK university",
        "Spine therapy certification",
        "Bone & joint therapy certification",
      ],
    },
  },
  {
    slug: "kirellos-raafat",
    photo: "/images/team/kirellos-raafat.webp",
    name: { ar: "د. كيرلس رأفت", en: "Dr. Kirellos Raafat" },
    role: { ar: "شريك مؤسس", en: "Founding Partner" },
    credentials: {
      ar: [
        "دبلومة الميكانيكا الحيوية للعمود الفقري",
        "دبلومة العلاج اليدوي من جامعة بريطانية",
        "خبرة أكثر من 15 عاماً في العلاج اليدوي",
      ],
      en: [
        "Diploma in spinal biomechanics",
        "Manual therapy diploma, UK university",
        "15+ years of manual therapy experience",
      ],
    },
  },
  {
    slug: "marco-sami",
    photo: "/images/team/marco-sami.webp",
    name: { ar: "د. ماركو سامي", en: "Dr. Marco Sami" },
    role: { ar: "شريك مؤسس", en: "Founding Partner" },
    credentials: {
      ar: [
        "دبلومة رسم العضلات والأعصاب",
        "شهادة العلاج اليدوي من جامعة بريطانية",
        "شهادة FIFA في الإصابات الرياضية",
        "خبرة 15 عاماً في العلاج اليدوي",
      ],
      en: [
        "Diploma in EMG & nerve conduction",
        "Manual therapy certificate, UK university",
        "FIFA certificate in sports injuries",
        "15 years of manual therapy experience",
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/* Social proof                                                        */
/* ------------------------------------------------------------------ */

export const stats: { value: string; label: Localized }[] = [
  { value: "120K+", label: { ar: "مريض تعافى معنا", en: "Patients treated" } },
  { value: "5", label: { ar: "فروع في القاهرة والإسكندرية", en: "Branches in Cairo & Alex" } },
  { value: "100+", label: { ar: "أخصائي وفريق عمل", en: "Therapists & staff" } },
  { value: "80+", label: { ar: "سرير علاجي", en: "Treatment beds" } },
];

/** Real patient reviews taken from the clinic's Facebook page. */
export const testimonials: { name: Localized; text: Localized }[] = [
  {
    name: { ar: "حكمت أحمد خميس", en: "Hekmat Ahmed Khamis" },
    text: {
      ar: "ما شاء الله المركز ياخد امتياز في التقنيات الحديثة، والدكتورة على أعلى مستوى في العلم والذوق وطول البال. وأنا جربت العلاج وبحييهم جميعاً وبقدم لهم الشكر والتقدير.",
      en: "The center deserves top marks for its modern technology, and the doctor is outstanding in knowledge, manners and patience. I went through the treatment and I thank and appreciate all of them.",
    },
  },
  {
    name: { ar: "منى العجمي", en: "Mona El Agamy" },
    text: {
      ar: "المركز ممتاز جداً والأجهزة حديثة والمعاملة راقية جداً. والحمد لله من أول جلسة في تقدم في حالتي رغم إن حالتي صعبة جداً ومش بقف على رجلي. حقيقي أنصح أي حد محتاج علاج طبيعي يزور المركز.",
      en: "The center is excellent, the equipment is modern and the staff are very respectful. Thank God, I've made progress since the first session even though my case is very difficult and I couldn't stand on my feet. I honestly recommend the center to anyone who needs physiotherapy.",
    },
  },
  {
    name: { ar: "مصباح الهدى", en: "Mesbah El Hoda" },
    text: {
      ar: "مركز ممتاز جداً وعن تجربة، وكمان أحسن معاملة وأسعار معقولة جداً. ربنا يوفقكم لخدمة الناس.",
      en: "A truly excellent center, speaking from experience, with the best treatment of patients and very reasonable prices. May God help you keep serving people.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Approach & FAQ                                                      */
/* ------------------------------------------------------------------ */

export const approachSteps: { title: Localized; text: Localized }[] = [
  {
    title: { ar: "التقييم الشامل", en: "Thorough assessment" },
    text: {
      ar: "نبدأ بالتاريخ المرضي والأعراض، ثم تقييم الحركة والقوة والنشاط ومراجعة الأشعة.",
      en: "We start with your history and symptoms, then assess movement, strength and activity and review your scans.",
    },
  },
  {
    title: { ar: "خطة علاج فردية", en: "A plan built for you" },
    text: {
      ar: "لا توجد أجهزة ثابتة أو تمارين موحدة للجميع، كل خطة مصممة لحالتك وأهدافك.",
      en: "No fixed machines or one-size-fits-all routines. Every plan is built around your condition and goals.",
    },
  },
  {
    title: { ar: "العلاج والتعليم", en: "Treatment & education" },
    text: {
      ar: "تمارين علاجية وعلاج يدوي وأجهزة مساعدة، مع شرح واضح لحالتك وكيف تحمي نفسك.",
      en: "Therapeutic exercise, manual therapy and supporting modalities, plus clear advice on protecting yourself.",
    },
  },
  {
    title: { ar: "إعادة التقييم المستمرة", en: "Ongoing re-assessment" },
    text: {
      ar: "نقيس التقدم بشكل دوري ونعدل الخطة للوصول لأفضل مستوى وظيفي ممكن.",
      en: "We measure progress regularly and adjust the plan to reach the best function possible.",
    },
  },
];

export const faqs: { q: Localized; a: Localized }[] = [
  {
    q: { ar: "هل أحتاج إلى تحويل من طبيب قبل الحجز؟", en: "Do I need a doctor's referral to book?" },
    a: {
      ar: "لا، يمكنك الحجز مباشرة. إذا كان لديك تقرير طبي أو أشعة فأحضرها معك لتساعدنا في التقييم.",
      en: "No, you can book directly. If you have a medical report or scans, bring them along to help with your assessment.",
    },
  },
  {
    q: { ar: "ماذا أحضر معي في أول زيارة؟", en: "What should I bring to my first visit?" },
    a: {
      ar: "أحضر أي أشعة (رنين مغناطيسي، أشعة سينية) وتقارير طبية سابقة، وارتدِ ملابس مريحة تسمح بالحركة.",
      en: "Bring any scans (MRI, X-ray) and previous medical reports, and wear comfortable clothes you can move in.",
    },
  },
  {
    q: { ar: "كم تستغرق الجلسة؟", en: "How long is a session?" },
    a: {
      ar: "تستغرق جلسة التقييم الأولى وقتاً أطول لفهم حالتك بالكامل، وتختلف مدة الجلسات التالية حسب البرنامج العلاجي.",
      en: "The first assessment takes longer so we can fully understand your case. Follow-up sessions vary by treatment program.",
    },
  },
  {
    q: { ar: "كم عدد الجلسات التي سأحتاجها؟", en: "How many sessions will I need?" },
    a: {
      ar: "يعتمد ذلك على الحالة وشدتها. بعد التقييم الأول سيوضح لك الأخصائي الخطة المتوقعة ويتم إعادة التقييم بشكل دوري.",
      en: "It depends on your condition and its severity. After the first assessment your therapist will explain the expected plan, and progress is re-assessed regularly.",
    },
  },
  {
    q: { ar: "هل يمكن علاج الانزلاق الغضروفي بدون جراحة؟", en: "Can a slipped disc be treated without surgery?" },
    a: {
      ar: "في كثير من الحالات نعم. معظم حالات الانزلاق الغضروفي تتحسن بالعلاج الطبيعي المتخصص، ويحدد التقييم ما إذا كانت حالتك مناسبة للعلاج التحفظي.",
      en: "In many cases, yes. Most disc herniations improve with specialised physiotherapy, and your assessment will show whether conservative care suits your case.",
    },
  },
  {
    q: { ar: "ما هي مواعيد العمل؟", en: "What are your opening hours?" },
    a: {
      ar: "جميع الفروع تعمل يومياً من 10 صباحاً حتى 12 منتصف الليل.",
      en: "All branches are open every day from 10:00 AM until midnight.",
    },
  },
];
