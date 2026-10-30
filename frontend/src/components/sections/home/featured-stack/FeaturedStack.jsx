"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categoryLabel, formatPrice, GENDERS, getFeatured } from "@/lib/products";
import { ColourPicker, PurchaseRow, SizePicker, useProductSelection } from "@/components/shop/product-ui";

gsap.registerPlugin(ScrollTrigger);

// The pieces shown in the stack (edit FEATURED_SLUGS in lib/products.js).
const ITEMS = getFeatured();
const HOLD = 0.4; // extra scroll "rest" at the end of the stack
const pad = (n) => String(n).padStart(2, "0");

/**
 * Featured pieces: product photos stack on top of each other as you scroll
 * (modelled on the reference video). Click the top photo and the section
 * opens into the full product details; click the photo (or Close) to go back.
 */
export default function FeaturedStack() {
  const rootRef = useRef(null);
  const tlRef = useRef(null);
  const activeRef = useRef(0);
  const isOpenRef = useRef(false);
  const closeRef = useRef(() => {});

  const [active, setActive] = useState(0);
  const [detailIndex, setDetailIndex] = useState(0);
  const [openNonce, setOpenNonce] = useState(0);

  // --------------------------------------------------------------------------
  // 1. Pinned, scroll-scrubbed stack
  // --------------------------------------------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = ITEMS.length;
    const R = gsap.utils.random;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray("[data-card]", root);
      const rest = cards.map((_, i) => (i === 0 ? -2 : R(-5, 5))); // resting tilt of each card

      cards.forEach((card, i) => {
        if (i === 0) gsap.set(card, { rotation: rest[0], transformOrigin: "50% 50%" });
        else if (reduce) gsap.set(card, { autoAlpha: 0, rotation: rest[i], transformOrigin: "50% 50%" });
        else gsap.set(card, { yPercent: 135, scale: 0.4, rotation: R(-16, 16), transformOrigin: "50% 50%" });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => "+=" + (N - 1) * window.innerHeight * 0.9,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1, // after the bead hero above it
          onUpdate: (self) => {
            const i = Math.min(N - 1, Math.round(self.animation.time()));
            if (i !== activeRef.current) {
              activeRef.current = i;
              setActive(i);
            }
          },
        },
      });

      for (let i = 1; i < N; i++) {
        if (reduce) {
          tl.to(cards[i], { autoAlpha: 1, duration: 1 }, i - 1);
        } else {
          // next photo rises from the bottom, grows, straightens and lands on top
          tl.to(cards[i], { yPercent: 0, scale: 1, rotation: rest[i], duration: 1, ease: "power3.out" }, i - 1)
            // the photo underneath is pushed back a little
            .to(cards[i - 1], { scale: 0.94, duration: 1, ease: "power2.out" }, i - 1);
        }
      }
      tl.to({}, { duration: HOLD });
      tlRef.current = tl;
    }, root);

    // Other pinned sections (the bead hero) finish creating after this one
    // mounts, so re-measure once everything is in place.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. "VIEW" / "CLOSE" cursor label (desktop with a mouse only)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const cursor = document.createElement("div");
    cursor.setAttribute("aria-hidden", "true");
    cursor.className =
      "pointer-events-none fixed left-0 top-0 z-[115] rounded-md bg-black px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white";
    cursor.style.opacity = "0";
    cursor.style.visibility = "hidden";
    cursor.textContent = "View";
    document.body.appendChild(cursor);

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    const hide = () => gsap.to(cursor, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });

    const onMove = (e) => {
      const hit = e.target.closest?.("[data-hit]");
      if (!hit) return hide();
      cursor.textContent = hit.dataset.hit === "close" ? "Close" : "View";
      xTo(e.clientX + 16);
      yTo(e.clientY + 16);
      gsap.to(cursor, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", hide);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", hide);
      gsap.killTweensOf(cursor);
      cursor.remove();
    };
  }, []);

  // --------------------------------------------------------------------------
  // Geometry helper: where a card currently is (centre, size, tilt)
  // --------------------------------------------------------------------------
  const cardGeometry = (card) => {
    const r = card.getBoundingClientRect();
    return {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      width: card.offsetWidth * Number(gsap.getProperty(card, "scale")),
      rotation: Number(gsap.getProperty(card, "rotation")),
    };
  };
  const flipFrom = (geo, slot) => {
    const s = slot.getBoundingClientRect();
    return {
      x: geo.cx - (s.left + s.width / 2),
      y: geo.cy - (s.top + s.height / 2),
      scale: geo.width / s.width,
      rotation: geo.rotation,
    };
  };

  // --------------------------------------------------------------------------
  // 3. Open: the top photo flies to the detail layout (FLIP), text rises in
  // --------------------------------------------------------------------------
  const openDetail = () => {
    if (isOpenRef.current) return;
    isOpenRef.current = true;
    setDetailIndex(activeRef.current);
    setOpenNonce((n) => n + 1);
  };

  useEffect(() => {
    if (!openNonce) return;
    const root = rootRef.current;
    const card = gsap.utils.toArray("[data-card]", root)[detailIndex];
    const detail = root.querySelector("[data-detail]");
    const scroller = root.querySelector("[data-detail-scroll]");
    const bg = root.querySelector("[data-detail-bg]");
    const slot = root.querySelector("[data-slot]");
    const slotImg = root.querySelector("[data-slot-img]");
    const list = root.querySelector("[data-list]");
    const textEls = gsap.utils.toArray("[data-detail-in]", root);
    if (!card || !detail || !slot || !slotImg) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.style.overflow = "hidden"; // freeze page scroll while open

    const geo = cardGeometry(card); // where the photo is now
    gsap.set(detail, { autoAlpha: 1 });
    scroller.scrollTop = 0;
    const from = flipFrom(geo, slot); // ...relative to where it will end up

    gsap.set(card, { autoAlpha: 0 }); // the detail photo takes over, same place
    gsap.set(bg, { autoAlpha: 0 });
    gsap.set(textEls, { autoAlpha: 0, y: 30 });
    gsap.set(slotImg, { ...from, transformOrigin: "50% 50%" });

    const tl = gsap.timeline();
    tl.to(bg, { autoAlpha: 1, duration: reduce ? 0.2 : 0.6, ease: "power2.out" }, 0)
      .to(slotImg, { x: 0, y: 0, scale: 1, rotation: 0, duration: reduce ? 0.01 : 1, ease: "power4.inOut" }, 0)
      .to(textEls, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 }, reduce ? 0 : 0.5);
    if (list) tl.to(list, { autoAlpha: 0, x: -24, duration: 0.4 }, 0);

    return () => tl.kill();
  }, [openNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  // --------------------------------------------------------------------------
  // 4. Close: reverse of the above
  // --------------------------------------------------------------------------
  const closeDetail = () => {
    if (!isOpenRef.current) return;
    const root = rootRef.current;
    const card = gsap.utils.toArray("[data-card]", root)[detailIndex];
    const detail = root.querySelector("[data-detail]");
    const scroller = root.querySelector("[data-detail-scroll]");
    const bg = root.querySelector("[data-detail-bg]");
    const slot = root.querySelector("[data-slot]");
    const slotImg = root.querySelector("[data-slot-img]");
    const list = root.querySelector("[data-list]");
    const textEls = gsap.utils.toArray("[data-detail-in]", root);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scroller.scrollTop = 0;
    const back = flipFrom(cardGeometry(card), slot);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(card, { autoAlpha: 1 });
        gsap.set(detail, { autoAlpha: 0 });
        gsap.set(slotImg, { clearProps: "transform" });
        document.documentElement.style.overflow = "";
        isOpenRef.current = false;
      },
    });
    tl.to(textEls, { autoAlpha: 0, y: -10, duration: 0.25, stagger: { each: 0.03, from: "end" } }, 0)
      .to(
        slotImg,
        { ...back, duration: reduce ? 0.01 : 0.9, ease: "power4.inOut", transformOrigin: "50% 50%" },
        0.1
      )
      .to(bg, { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, reduce ? 0.1 : 0.5);
    if (list) tl.to(list, { autoAlpha: 1, x: 0, duration: 0.5 }, reduce ? 0.1 : 0.5);
  };
  useEffect(() => {
    closeRef.current = closeDetail;
  });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Clicking a name in the list scrolls the stack to that piece
  const goTo = (i) => {
    const tl = tlRef.current;
    const st = tl?.scrollTrigger;
    if (!st) return;
    const top = st.start + (i / tl.duration()) * (st.end - st.start);
    window.scrollTo({ top, behavior: "smooth" });
  };

  const current = ITEMS[active];
  const detailProduct = ITEMS[detailIndex];

  return (
    <section
      ref={rootRef}
      aria-label="Featured pieces"
      className="relative h-[100svh] w-full overflow-hidden bg-[#14110e] text-[#f3ece2]"
    >
      {/* top row (sits below the fixed site header) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-24 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-stone-400">Featured pieces</p>
        <Link
          href="/shop"
          className="pointer-events-auto text-xs uppercase tracking-[0.25em] text-stone-300 transition hover:text-white"
        >
          Shop all →
        </Link>
      </div>

      {/* ---------- Stack view: names on the left, photo stack on the right ---------- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pt-10 md:grid md:grid-cols-2 md:px-0 md:pt-8">
        <ul data-list className="hidden md:block md:justify-self-start md:pl-[14vw]">
          {ITEMS.map((p, i) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === active}
                className={`relative py-2.5 text-left font-brand text-2xl leading-tight transition-colors duration-300 lg:text-3xl ${
                  i === active ? "text-[#f3ece2]" : "text-stone-600 hover:text-stone-300"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -left-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#c9962b] transition-opacity duration-300 ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                />
                {p.name}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center md:justify-self-center">
          <div data-stack className="relative aspect-[4/5] h-[52svh] md:h-[62svh]">
            {ITEMS.map((p, i) => (
              <div
                key={p.slug}
                data-card
                className="absolute inset-0 overflow-hidden rounded-sm border border-white/10 bg-stone-800 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
                style={{ zIndex: i + 1 }}
              >
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="(min-width:768px) 36vw, 70vw"
                  className="object-cover"
                  loading="eager"
                />
              </div>
            ))}
            {/* click target for the top photo */}
            <button
              type="button"
              data-hit="open"
              onClick={openDetail}
              aria-label={`View details for ${current.name}`}
              className="absolute inset-0 z-[100] cursor-pointer"
            />
          </div>

          {/* mobile caption (the list is hidden on small screens) */}
          <div className="mt-6 text-center md:hidden">
            <p className="font-brand text-2xl">{current.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-stone-400">
              {pad(active + 1)} / {pad(ITEMS.length)} · Tap to view
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Detail view ---------- */}
      <div data-detail className="invisible absolute inset-0 z-30">
        <div data-detail-bg className="absolute inset-0 bg-[#14110e]" />

        <button
          type="button"
          data-detail-in
          onClick={closeDetail}
          className="absolute right-5 top-24 z-40 rounded-full border border-white/25 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-200 transition hover:border-white hover:text-white md:right-10"
        >
          Close ✕
        </button>

        <div data-detail-scroll className="relative h-full overflow-y-auto overscroll-contain">
          <div className="mx-auto grid min-h-full max-w-[1400px] gap-8 px-5 pb-12 pt-32 md:grid-cols-2 md:items-start md:gap-12 md:px-10 md:pt-24">
            <DetailContent key={detailProduct.slug} product={detailProduct} index={detailIndex} total={ITEMS.length} />

            <div className="order-1 flex justify-center md:order-2 md:sticky md:top-24 md:justify-end md:self-start">
              <div
                data-slot
                className="relative aspect-[4/5] w-[70vw] max-w-[360px] md:h-[calc(100svh-8rem)] md:w-auto md:max-w-none"
              >
                <div
                  data-slot-img
                  data-hit="close"
                  onClick={closeDetail}
                  className="absolute inset-0 cursor-pointer overflow-hidden rounded-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
                >
                  <Image
                    src={detailProduct.images[0]}
                    alt={detailProduct.name}
                    fill
                    sizes="(min-width:768px) 40vw, 70vw"
                    className="object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Left column of the detail view: the complete product info
function DetailContent({ product, index, total }) {
  const selection = useProductSelection(product);

  return (
    <div className="order-2 flex max-w-xl flex-col gap-5 md:order-1">
      <p data-detail-in className="text-[11px] uppercase tracking-[0.35em] text-stone-400">
        {pad(index + 1)} / {pad(total)} · {GENDERS[product.gender].label} · {categoryLabel(product.category)}
      </p>
      <h3 data-detail-in className="font-brand text-4xl font-bold leading-[1.05] md:text-6xl">
        {product.name}
      </h3>
      <p data-detail-in className="text-2xl">
        {formatPrice(product.price)}
      </p>
      <p data-detail-in className="text-sm leading-relaxed text-stone-300">
        {product.story}
      </p>

      <div data-detail-in>
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-stone-500">Beads &amp; materials</p>
        <ul className="space-y-1.5 text-[15px] text-stone-200">
          {product.beads.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      <div data-detail-in className="space-y-5">
        <ColourPicker product={product} selection={selection} tone="dark" />
        <SizePicker product={product} selection={selection} tone="dark" />
      </div>

      <div data-detail-in className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="sm:w-72">
          <PurchaseRow product={product} selection={selection} tone="dark" />
        </div>
        <Link
          href={`/shop/${product.gender}`}
          className="text-sm text-stone-300 underline-offset-4 transition hover:text-white hover:underline"
        >
          See all {GENDERS[product.gender].label.toLowerCase()}&apos;s pieces →
        </Link>
      </div>
    </div>
  );
}
