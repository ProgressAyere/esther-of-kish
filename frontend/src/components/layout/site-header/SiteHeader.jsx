"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { markIntroRevealed, resetIntroState } from "@/lib/intro-events";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site header + brand intro.
 *
 * Intro sequence (modelled on the "Kinetik" reference):
 *   1. Black screen.
 *   2. A thin cream line draws in at the centre.
 *   3. The line thickens into a bar and "Esther Of Kish" slides up inside it.
 *   4. Hold.
 *   5. The bar expands to fill the screen while the brand travels to the
 *      TOP-LEFT of the header and scales down to its real size.
 *   6. "Shop now" fades in (top-right), the overlay dissolves and the sections
 *      underneath play their own reveal (see lib/intro-events.js).
 *
 * The real header brand element is the one that moves, so there is no
 * hand-off or flicker: it is simply transformed to the centre at the start
 * and animated back to its natural place.
 */
export default function SiteHeader() {
  const rootRef = useRef(null);
  const pathname = usePathname();
  // The brand intro only plays when the site is first opened on the home page.
  // (Opening /shop directly, or navigating around later, skips it.)
  const [introActive] = useState(pathname === "/");
  const [scrolled, setScrolled] = useState(false);

  // Frosted background once the page has scrolled a little.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!introActive) {
      markIntroRevealed(); // nothing to wait for: sections can show straight away
      return;
    }

    const overlay = root.querySelector("[data-intro-overlay]");
    const bar = root.querySelector("[data-intro-bar]");
    const brand = root.querySelector("[data-brand]");
    const brandText = root.querySelector("[data-brand-text]");
    const cta = root.querySelector("[data-cta]");
    if (!overlay || !bar || !brand || !brandText || !cta) return;

    const html = document.documentElement;
    resetIntroState();

    // Reduced motion: skip the intro entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(overlay, { display: "none" });
      gsap.set([brand, cta], { autoAlpha: 1 });
      markIntroRevealed();
      return;
    }

    let cancelled = false;
    let ctx;

    const finalize = () => {
      gsap.set(overlay, { display: "none" });
      gsap.set([brand, cta], { autoAlpha: 1, clearProps: "transform" });
      html.style.overflow = "";
      ScrollTrigger.refresh(); // the hero pins itself, so re-measure now scroll is back
      markIntroRevealed();
    };

    html.style.overflow = "hidden"; // no scrolling while the intro plays
    const failSafe = window.setTimeout(finalize, 9000); // never leave the site covered

    document.fonts.ready.then(() => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Where the brand naturally sits in the header (top-left).
        const r = brand.getBoundingClientRect();

        // How big it should be while it sits in the centre bar.
        const targetW = vw < 640 ? vw * 0.7 : Math.min(vw * 0.34, 520);
        const scale = targetW / r.width;
        const dx = vw / 2 - (r.left + r.width / 2);
        const dy = vh / 2 - (r.top + r.height / 2);
        const textH = r.height * scale;
        const barH = textH * 1.5;
        const barW = r.width * scale + textH * 0.9;

        // Starting state
        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(bar, {
          xPercent: -50,
          yPercent: -50,
          width: barW,
          height: 2,
          scaleX: 0,
          autoAlpha: 0,
          transformOrigin: "50% 50%",
        });
        gsap.set(brand, {
          autoAlpha: 1,
          x: dx,
          y: dy,
          scale,
          transformOrigin: "50% 50%",
        });
        gsap.set(brandText, { yPercent: 115 });
        gsap.set(cta, { autoAlpha: 0, y: -14 });

        const tl = gsap.timeline({
          defaults: { ease: "power4.inOut" },
          delay: 0.25,
          onComplete: () => {
            window.clearTimeout(failSafe);
            finalize();
          },
        });

        tl
          // 2. thin line draws in
          .to(bar, { autoAlpha: 1, scaleX: 1, duration: 0.7, ease: "power3.out" })
          // 3. line thickens into the bar, wordmark slides up inside it
          .to(bar, { height: barH, duration: 0.8 }, ">0.1")
          .to(brandText, { yPercent: 0, duration: 0.8, ease: "power4.out" }, "<0.1")
          // 4. hold
          .addLabel("expand", "+=0.9")
          // 5. bar fills the screen, brand travels to the top-left
          .to(bar, { width: vw + 4, height: vh + 4, duration: 1.2 }, "expand")
          .to(brand, { x: 0, y: 0, scale: 1, duration: 1.2 }, "expand")
          // 6. Shop now arrives, overlay dissolves, sections reveal
          .to(cta, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, "expand+=1")
          .add(() => markIntroRevealed(), "expand+=1.2")
          .to(overlay, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "expand+=1.2");
      }, root);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      if (ctx) ctx.revert();
      html.style.overflow = "";
    };
  }, [introActive]);

  return (
    <div ref={rootRef}>
      {/* Intro overlay: black screen + the cream bar that grows into the page */}
      {introActive && (
        <div data-intro-overlay aria-hidden="true" className="fixed inset-0 z-[100] bg-black">
          <div data-intro-bar className="absolute left-1/2 top-1/2 bg-[#fbf7f1]" />
        </div>
      )}

      {/* Header (sits above the overlay so the brand can travel across it) */}
      <header
        className={`fixed inset-x-0 top-0 z-[110] flex h-16 items-center justify-between px-5 transition-[background-color,backdrop-filter] duration-300 md:h-20 md:px-10 ${
          scrolled ? "bg-[#fbf7f1]/80 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <Link
          href="/"
          data-brand
          className={`${introActive ? "invisible " : ""}inline-block font-brand text-2xl font-extrabold tracking-tight text-stone-900 md:text-3xl`}
        >
          <span className="block overflow-hidden py-[0.12em] leading-none">
            <span data-brand-text className="block">
              Esther Of Kish
            </span>
          </span>
        </Link>

        <div data-cta className={introActive ? "invisible" : undefined}>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium tracking-wide text-[#fbf7f1] transition-colors hover:bg-stone-700 md:px-6"
          >
            Shop now
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {/* Without JavaScript, never block the site */}
      <noscript>
        <style>{`[data-intro-overlay]{display:none}[data-brand],[data-cta]{visibility:visible}`}</style>
      </noscript>
    </div>
  );
}
