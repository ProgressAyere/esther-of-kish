import Link from "next/link";
import { CATEGORIES, GENDERS, productsFor } from "@/lib/products";

export const metadata = {
  title: "Shop | Esther Of Kish",
  description: "Shop handcrafted bead jewellery for women and men.",
};

// Step 1 of the shop: choose Women or Men.
export default function ShopPage() {
  const panels = [
    {
      ...GENDERS.women,
      href: "/shop/women",
      count: productsFor("women").length,
      tone: "bg-[linear-gradient(160deg,#fbf7f1,#efe3d3)] text-stone-900",
      chip: "border-stone-900/20 text-stone-700",
      beads: ["coral", "gold", "pearl"],
    },
    {
      ...GENDERS.men,
      href: "/shop/men",
      count: productsFor("men").length,
      tone: "bg-[linear-gradient(160deg,#1c1814,#0f0d0b)] text-[#f3ece2]",
      chip: "border-white/20 text-stone-300",
      beads: ["royal", "teal", "gold"],
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#fbf7f1] pt-16 md:pt-20">
      <div className="px-6 py-10 text-center md:py-14">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Shop</p>
        <h1 className="mt-3 font-brand text-4xl font-bold text-stone-900 md:text-6xl">Who are you shopping for?</h1>
      </div>

      <div className="grid flex-1 md:grid-cols-2">
        {panels.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className={`group relative flex min-h-[46svh] flex-col justify-end overflow-hidden p-8 transition-[filter] duration-500 md:min-h-[64svh] md:p-14 ${p.tone}`}
          >
            {/* decorative beads */}
            {p.beads.map((b, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={b}
                src={`/beads/bead-${b}.svg`}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute w-24 transition-transform duration-700 ease-out group-hover:scale-110 md:w-36"
                style={{
                  top: `${10 + i * 22}%`,
                  right: `${6 + (i % 2) * 18}%`,
                  transform: `rotate(${i * 25 - 20}deg)`,
                }}
              />
            ))}

            <div className="relative">
              <h2 className="font-brand text-5xl font-bold md:text-7xl">{p.label}</h2>
              <p className="mt-3 max-w-sm text-sm opacity-80">{p.blurb}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <span key={c.id} className={`rounded-full border px-3 py-1 text-xs ${p.chip}`}>
                    {c.label}
                  </span>
                ))}
              </div>
              <p className="mt-6 inline-flex items-center gap-2 text-sm tracking-wide">
                Shop {p.label} · {p.count} pieces
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
