"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { categoryLabel, formatPrice, GENDERS } from "@/lib/products";
import { ColourPicker, PurchaseRow, SizePicker, useProductSelection } from "./product-ui";

// The popup that opens when a product is chosen in the shop grid.
// Layout follows the reference: thumbnails + large photo on the left,
// name / price / colour / size / ADD TO CART on the right.
export default function ProductModal({ product, onClose }) {
  const dialogRef = useRef(null);
  const backdropRef = useRef(null);
  const closeRef = useRef(null);
  const selection = useProductSelection(product);
  const [imageIndex, setImageIndex] = useState(0);

  // Keep the latest onClose without re-running the open/lock effect below.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Fade/slide in, lock page scroll, Esc to close, restore focus afterwards.
  useEffect(() => {
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousFocus = document.activeElement;
    html.style.overflow = "hidden";
    closeRef.current?.focus();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(
        dialogRef.current,
        { autoAlpha: 0, y: 40, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }

    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  const images = product.images;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center md:items-center md:p-6" role="presentation">
      <div ref={backdropRef} className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative z-10 flex max-h-[94svh] w-full max-w-[1100px] flex-col overflow-y-auto rounded-t-2xl bg-white text-stone-900 shadow-2xl md:max-h-[88svh] md:flex-row md:overflow-hidden md:rounded-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-stone-800 shadow transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        {/* ---------- Gallery ---------- */}
        <div className="flex shrink-0 gap-3 bg-stone-50 p-3 md:w-[52%] md:p-5">
          {images.length > 1 && (
            <div className="hidden flex-col gap-2 md:flex">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative h-20 w-16 overflow-hidden rounded-sm border-2 ${
                    i === imageIndex ? "border-stone-900" : "border-transparent"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-stone-200 md:aspect-auto md:min-h-[520px]">
            <Image
              src={images[imageIndex]}
              alt={product.name}
              fill
              sizes="(min-width:768px) 520px, 100vw"
              className="object-cover"
              loading="eager"
            />
          </div>
        </div>

        {/* ---------- Info ---------- */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 md:pr-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {GENDERS[product.gender].label} · {categoryLabel(product.category)}
          </p>
          <h2 className="mt-2 pr-10 font-brand text-2xl font-bold leading-snug md:text-[28px]">{product.name}</h2>
          <p className="mt-1 text-xs text-stone-500">SKU: {product.sku}</p>
          <p className="mt-4 text-3xl font-bold">{formatPrice(product.price)}</p>
          <p className="mt-1 text-sm text-stone-600">{product.tagline}</p>

          <div className="mt-5 border-t border-dashed border-stone-300 pt-5">
            <ColourPicker product={product} selection={selection} />
          </div>

          <div className="mt-6">
            <SizePicker product={product} selection={selection} />
          </div>

          <div className="mt-7">
            <PurchaseRow product={product} selection={selection} />
          </div>

          {/* Write-up */}
          <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200 text-sm">
            <Section title="About this piece" defaultOpen>
              <p className="leading-relaxed text-stone-700">{product.story}</p>
            </Section>
            <Section title="Beads & materials">
              <ul className="list-disc space-y-1.5 pl-5 text-stone-700">
                {product.beads.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Section>
            <Section title="Details">
              <dl className="space-y-1.5 text-stone-700">
                {product.specs.map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-28 shrink-0 text-stone-500">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </Section>
            <Section title="Care">
              <ul className="list-disc space-y-1.5 pl-5 text-stone-700">
                {product.care.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, defaultOpen = false, children }) {
  return (
    <details className="group py-3" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold marker:hidden">
        {title}
        <span aria-hidden="true" className="text-lg leading-none transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-1 pt-3">{children}</div>
    </details>
  );
}
