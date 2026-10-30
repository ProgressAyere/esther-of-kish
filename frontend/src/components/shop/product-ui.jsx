"use client";

import { useEffect, useRef, useState } from "react";
import { SIZE_GUIDES } from "@/lib/products";
import { addToCart, toggleWishlist, useWishlist } from "@/lib/cart";

// ---------------------------------------------------------------------------
// Selection state for one product (colour + a value for each size group)
// ---------------------------------------------------------------------------
export function useProductSelection(product) {
  const [colour, setColour] = useState(product.colours[0]?.name ?? null);
  const [sizes, setSizes] = useState(() =>
    Object.fromEntries(
      product.sizeGroups.filter((g) => g.options.length === 1).map((g) => [g.id, g.options[0].value])
    )
  );
  const [attempted, setAttempted] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const missing = product.sizeGroups.filter((g) => !sizes[g.id]);

  const add = () => {
    if (missing.length) {
      setAttempted(true);
      return false;
    }
    addToCart({ product, colour, sizes });
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 2200);
    return true;
  };

  return {
    colour,
    setColour,
    sizes,
    setSize: (groupId, value) => setSizes((s) => ({ ...s, [groupId]: value })),
    missing,
    attempted,
    added,
    add,
  };
}

// ---------------------------------------------------------------------------
// Tones: "light" (shop popup) and "dark" (home page detail)
// ---------------------------------------------------------------------------
const TONE = {
  light: {
    label: "text-stone-900",
    muted: "text-stone-500",
    pill: "border-stone-300 text-stone-800 hover:border-stone-900",
    pillOn: "border-stone-900 bg-stone-900 text-white",
    link: "text-stone-700 underline underline-offset-2 hover:text-stone-900",
    panel: "border-stone-200 bg-stone-50 text-stone-700",
    ring: "ring-stone-900",
    error: "text-red-600",
  },
  dark: {
    label: "text-[#f3ece2]",
    muted: "text-stone-400",
    pill: "border-white/25 text-stone-200 hover:border-white",
    pillOn: "border-[#f3ece2] bg-[#f3ece2] text-[#14110e]",
    link: "text-stone-300 underline underline-offset-2 hover:text-white",
    panel: "border-white/15 bg-white/5 text-stone-300",
    ring: "ring-[#f3ece2]",
    error: "text-red-400",
  },
};

// ---------------------------------------------------------------------------
// Colour swatches
// ---------------------------------------------------------------------------
export function ColourPicker({ product, selection, tone = "light" }) {
  const t = TONE[tone];
  if (!product.colours?.length) return null;
  return (
    <div>
      <p className={`text-sm ${t.label}`}>
        <span className="font-semibold">Colour:</span> {selection.colour}
      </p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {product.colours.map((c) => {
          const on = selection.colour === c.name;
          return (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={on}
              onClick={() => selection.setColour(c.name)}
              className={`h-9 w-9 rounded-full border border-black/10 transition ${
                on ? `ring-2 ring-offset-2 ${t.ring} ${tone === "dark" ? "ring-offset-[#14110e]" : "ring-offset-white"}` : "hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Size guide table
// ---------------------------------------------------------------------------
function SizeGuidePanel({ guideId, tone }) {
  const guide = SIZE_GUIDES[guideId];
  const t = TONE[tone];
  if (!guide) return null;
  return (
    <div className={`mt-3 rounded-md border p-4 text-xs leading-relaxed ${t.panel}`}>
      <p className={`mb-1 text-sm font-semibold ${t.label}`}>{guide.title}</p>
      <p className="mb-3">{guide.intro}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[260px] text-left">
          <thead>
            <tr className={t.label}>
              {guide.columns.map((c) => (
                <th key={c} className="py-1 pr-4 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row[0]} className="border-t border-current/10">
                {row.map((cell, i) => (
                  <td key={i} className="py-1 pr-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Size pills (one row per size group)
// ---------------------------------------------------------------------------
export function SizePicker({ product, selection, tone = "light" }) {
  const t = TONE[tone];
  const [openGuide, setOpenGuide] = useState(null);

  return (
    <div className="space-y-5">
      {product.sizeGroups.map((group) => {
        const value = selection.sizes[group.id];
        const showError = selection.attempted && !value;
        return (
          <div key={group.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className={`text-sm ${t.label}`}>
                <span className="font-semibold">{group.label}:</span> {value ?? <span className={t.muted}>Select</span>}
              </p>
              {group.guide && (
                <button
                  type="button"
                  onClick={() => setOpenGuide(openGuide === group.id ? null : group.id)}
                  className={`text-xs ${t.link}`}
                  aria-expanded={openGuide === group.id}
                >
                  Size guide
                </button>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((o) => {
                const on = value === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => selection.setSize(group.id, o.value)}
                    className={`min-w-14 rounded-full border px-4 py-2 text-sm transition ${on ? t.pillOn : t.pill}`}
                  >
                    {o.label}
                    {o.hint && (
                      <span className={`mt-0.5 block text-[10px] leading-none ${on ? "opacity-70" : t.muted}`}>
                        {o.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {showError && <p className={`mt-2 text-xs ${t.error}`}>Please select a {group.label.toLowerCase()}.</p>}
            {openGuide === group.id && <SizeGuidePanel guideId={group.guide} tone={tone} />}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heart button (wishlist)
// ---------------------------------------------------------------------------
export function HeartButton({ slug, tone = "light", small = false, className = "" }) {
  const wished = useWishlist().includes(slug);
  const look = small
    ? "h-9 w-9 border-transparent bg-white/85 text-stone-900 backdrop-blur hover:bg-white"
    : tone === "dark"
      ? "h-12 w-12 border-white/25 text-stone-200 hover:border-white"
      : "h-12 w-12 border-stone-300 text-stone-800 hover:border-stone-900";
  return (
    <button
      type="button"
      aria-pressed={wished}
      aria-label={wished ? "Remove from favourites" : "Add to favourites"}
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(slug);
      }}
      className={`grid shrink-0 place-items-center rounded-full border transition ${look} ${className}`}
    >
      <svg viewBox="0 0 24 24" width={small ? 18 : 22} height={small ? 18 : 22} fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
        <path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.9a4.3 4.3 0 0 1 7.5 2.6c0 5.4-7.5 10-7.5 10Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// "ADD TO CART" + heart
// ---------------------------------------------------------------------------
export function PurchaseRow({ product, selection, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={selection.add}
        className={`h-12 flex-1 rounded-sm text-sm font-bold tracking-[0.12em] transition ${
          dark
            ? "bg-[#f3ece2] text-[#14110e] hover:bg-white"
            : "bg-black text-white hover:bg-stone-800"
        }`}
      >
        {selection.added ? "ADDED ✓" : "ADD TO CART"}
      </button>
      <HeartButton slug={product.slug} tone={tone} />
    </div>
  );
}
