"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, GENDERS, productsFor } from "@/lib/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

// The full product grid for one gender (laid out like the "For You" reference),
// with category filters. Choosing a product opens the product popup.
export default function ShopCatalog({ gender }) {
  const info = GENDERS[gender];
  const all = useMemo(() => productsFor(gender), [gender]);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);

  const visible = category === "all" ? all : all.filter((p) => p.category === category);
  const close = useCallback(() => setSelected(null), []);
  const countIn = (id) => all.filter((p) => p.category === id).length;

  return (
    <main className="min-h-screen bg-[#fbf7f1] pb-24 pt-28 text-stone-900 md:pt-32">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/shop" className="hover:text-stone-900">Shop</Link>
          <span className="mx-1.5">/</span>
          <span className="text-stone-900">{info.label}</span>
        </nav>

        {/* title with side rules, like the reference */}
        <div className="mt-6 flex items-center justify-center gap-5">
          <span className="hidden h-px w-24 bg-stone-400 sm:block" />
          <h1 className="font-brand text-3xl font-bold md:text-4xl">{info.label}</h1>
          <span className="hidden h-px w-24 bg-stone-400 sm:block" />
        </div>
        <p className="mt-2 text-center text-sm text-stone-500">{info.blurb}</p>

        {/* filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter by category">
          <FilterPill active={category === "all"} onClick={() => setCategory("all")}>
            All <span className="opacity-60">{all.length}</span>
          </FilterPill>
          {CATEGORIES.map((c) => (
            <FilterPill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label} <span className="opacity-60">{countIn(c.id)}</span>
            </FilterPill>
          ))}
        </div>

        {/* grid */}
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((p) => (
            <ProductCard key={p.slug} product={p} onOpen={setSelected} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-16 text-center text-stone-500">Nothing here yet: check back soon.</p>
        )}

        {/* switch gender */}
        <div className="mt-20 text-center">
          <Link
            href={gender === "women" ? "/shop/men" : "/shop/women"}
            className="inline-block rounded-full border border-stone-900 px-7 py-3 text-sm tracking-wide transition hover:bg-stone-900 hover:text-white"
          >
            Shop {gender === "women" ? "Men" : "Women"} →
          </Link>
        </div>
      </div>

      {selected && <ProductModal key={selected.slug} product={selected} onClose={close} />}
    </main>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 text-stone-700 hover:border-stone-900"
      }`}
    >
      {children}
    </button>
  );
}
