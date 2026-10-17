import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">الصفحة غير موجودة · Page not found</h1>
      <div className="mt-8 flex gap-3">
        <Link href="/ar" className="btn-primary">الرئيسية</Link>
        <Link href="/en" className="btn-outline">Home</Link>
      </div>
    </section>
  );
}
