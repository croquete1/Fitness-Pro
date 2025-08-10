// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Agenda inteligente",
      desc: "Marcações rápidas e visão semanal dos treinos.",
      icon: "/calendar.svg", // se não tiveres, troca por /window.svg
      fallback: "/window.svg",
    },
    {
      title: "Acompanhamento",
      desc: "Progresso, objetivos e métricas num só lugar.",
      icon: "/globe.svg",
      fallback: "/globe.svg",
    },
    {
      title: "Equipa e clientes",
      desc: "Gestão simples de treinadores e clientes.",
      icon: "/file.svg",
      fallback: "/file.svg",
    },
  ];

  return (
    <main className="min-h-svh bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* decor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-[500px] blur-3xl"
          style={{
            background:
              "radial-gradient(600px 200px at 50% 0%, rgba(56,189,248,.25), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-slate-600/80 backdrop-blur">
            <span className="size-1.5 rounded-full bg-sky-400" />
            Plataforma de gestão de treinos
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Fitness Pro
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-slate-600">
            Planeia treinos, acompanha progresso e gere a tua operação com
            uma experiência rápida e moderna.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md"
            >
              Iniciar sessão
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Criar conta
            </Link>
          </div>

          {/* mockup / imagem */}
          <div className="mx-auto mt-14 max-w-5xl rounded-2xl border bg-white/60 p-2 shadow-sm backdrop-blur">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
              <Image
                src="/window.svg"
                alt="Pré-visualização da aplicação"
                fill
                className="object-contain p-6"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="relative size-10 shrink-0 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                  <Image
                    src={f.icon}
                    alt=""
                    fill
                    className="p-2 object-contain opacity-80"
                    onError={(e) => {
                      // fallback simples para evitar 404 no build se faltar um svg
                      (e.currentTarget as HTMLImageElement).src = f.fallback;
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* logos de tecnologia */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 opacity-70">
          <Image src="/next.svg" alt="Next.js" width={80} height={20} />
          <Image src="/vercel.svg" alt="Vercel" width={80} height={20} />
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Fitness Pro
      </footer>
    </main>
  );
}
