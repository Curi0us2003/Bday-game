// Shared shell for unbuilt sections. Each real component (Layer 5+)
// will replace its corresponding placeholder without touching this file
// or any routing that points to it.

export default function SectionPlaceholder({ label }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="label-mono">{label}</p>
      <p className="mt-2 text-ash font-sans text-sm">Not yet built</p>
    </section>
  )
}
