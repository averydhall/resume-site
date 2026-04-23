import Link from "next/link";

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="nav-label mb-10 text-white">PROJECTS</h1>
      <p className="text-lg leading-relaxed text-white/80">
        Projects content coming soon.
      </p>
      <Link
        href="/"
        className="mt-16 inline-block text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white"
      >
        ← back
      </Link>
    </main>
  );
}
