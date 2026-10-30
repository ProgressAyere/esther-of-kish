"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildLayout } from "./bead-layout";
import { hasIntroRevealed, onIntroReveal } from "@/lib/intro-events";

gsap.registerPlugin(ScrollTrigger);

// Desktop vs. mobile necklace. useSyncExternalStore returns null on the server
// and during hydration, then the real value, so there is no hydration mismatch.
const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToBreakpoint(callback) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getBreakpoint() {
  return window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop";
}
function getServerBreakpoint() {
  return null;
}

export default function BeadHero() {
  const rootRef = useRef(null);
  const mode = useSyncExternalStore(subscribeToBreakpoint, getBreakpoint, getServerBreakpoint);
  const layout = useMemo(() => (mode ? buildLayout(mode) : null), [mode]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !layout) return;

    const others = gsap.utils.toArray("[data-bead]", root);
    const pendantEl = root.querySelector("[data-pendant]");
    const thread = root.querySelector("[data-thread]");
    const clasp = root.querySelector("[data-clasp]");
    const intro = gsap.utils.toArray("[data-intro]", root);
    const outro = root.querySelector("[data-outro]");
    const stage = root.querySelector("[data-stage]");
    const lines = gsap.utils.toArray("[data-reveal]", root);
    const cue = root.querySelector("[data-reveal-fade]");
    if (!pendantEl || !thread || !clasp || !outro || !stage) return;

    const finals = layout.beads.filter((b) => !b.pendant);
    const pend = layout.beads.find((b) => b.pendant);
    const { x: cx, y: cy } = layout.centre;
    const heroScale = layout.heroD / pend.d;
    const R = gsap.utils.random;

    // Where each bead starts (off the top), and where it lands in the pile.
    const starts = finals.map(() => ({
      x: cx + R(-layout.vw * 0.55, layout.vw * 0.55),
      y: -R(120, 420),
      r: R(-220, 220),
    }));
    const piles = finals.map(() => {
      const a = R(0, Math.PI * 2);
      const radius = layout.heroD * 0.5 + R(0, layout.heroD * 0.45);
      return {
        x: cx + Math.cos(a) * radius * 1.1,
        y: cy + layout.heroD * 0.1 + Math.sin(a) * radius * 0.75,
        r: R(-360, 360),
      };
    });

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(pendantEl, { x: cx, y: cy, scale: heroScale, transformOrigin: "50% 50%" });
      gsap.set(others, {
        x: (i) => starts[i].x,
        y: (i) => starts[i].y,
        rotation: (i) => starts[i].r,
        scale: 0.5,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set(thread, { strokeDashoffset: 1 });
      gsap.set([clasp, outro], { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=500%", // scroll distance = 5 screens
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 2, // refresh before the sections pinned below it
        },
      });

      tl
        // 1. Intro text leaves, beads rain down into a pile around the hero bead
        .to(intro, { autoAlpha: 0, y: -30, ease: "power1.out", duration: 0.5 }, 0.1)
        .to(
          others,
          {
            x: (i) => piles[i].x,
            y: (i) => piles[i].y,
            rotation: (i) => piles[i].r,
            scale: 1,
            autoAlpha: 1,
            ease: "power2.out",
            duration: 1.2,
            stagger: { each: 0.05, from: "random" },
          },
          0.3
        )
        // 2. Pile slides onto the necklace curve; hero bead shrinks into the pendant
        .to(pendantEl, { x: pend.x, y: pend.y, scale: 1, ease: "power3.inOut", duration: 1.6 }, 2.7)
        .to(
          others,
          {
            x: (i) => finals[i].x,
            y: (i) => finals[i].y,
            rotation: 0,
            ease: "power3.inOut",
            duration: 1.3,
            stagger: { each: 0.045, from: "center" },
          },
          2.7
        )
        // 3. Thread draws, clasp and closing copy appear
        .to(thread, { strokeDashoffset: 0, duration: 1.2 }, 4.3)
        .to(clasp, { autoAlpha: 1, duration: 0.5 }, 4.9)
        .fromTo(
          outro,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.8 },
          4.9
        )
        .to({}, { duration: 0.6 }); // short hold on the finished necklace
    });

    // Reduced motion: skip the animation and show the finished necklace.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(pendantEl, { x: pend.x, y: pend.y, scale: 1, transformOrigin: "50% 50%" });
      gsap.set(others, {
        x: (i) => finals[i].x,
        y: (i) => finals[i].y,
        rotation: 0,
        scale: 1,
        autoAlpha: 1,
        transformOrigin: "50% 50%",
      });
      gsap.set(thread, { strokeDashoffset: 0 });
      gsap.set(intro, { autoAlpha: 0 });
      gsap.set([clasp, outro], { autoAlpha: 1 });
    });

    // Page-load reveal: wait for the brand intro (SiteHeader) to finish, then
    // lift the headline lines and fade the big bead in. If the intro already
    // played (e.g. you navigated back to the home page) just show everything.
    let stopListening = () => {};
    if (hasIntroRevealed()) {
      gsap.set(stage, { autoAlpha: 1 });
    } else {
      gsap.set(lines, { yPercent: 110 });
      if (cue) gsap.set(cue, { autoAlpha: 0 });
      gsap.set(stage, { autoAlpha: 0 });

      stopListening = onIntroReveal(() => {
        gsap.to(lines, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.12 });
        gsap.to(stage, { autoAlpha: 1, duration: 1.2, ease: "power2.out", delay: 0.3 });
        if (cue) gsap.to(cue, { autoAlpha: 1, duration: 0.8, delay: 0.9 });
      });
    }

    return () => {
      stopListening();
      mm.revert();
    };
  }, [layout]);

  const pendant = layout?.beads.find((b) => b.pendant);

  return (
    <section
      ref={rootRef}
      aria-label="Handcrafted bead jewellery"
      className="relative h-[100svh] w-full overflow-hidden bg-[linear-gradient(to_bottom,#fbf7f1,#efe3d3)] text-stone-800"
    >
      {/* Intro copy: replace with the client's wording */}
      <div data-intro className="absolute inset-x-0 top-[11%] z-10 px-6 text-center">
        <p className="overflow-hidden pb-1">
          <span
            data-reveal
            className="block text-xs uppercase tracking-[0.35em] text-stone-500"
          >
            Handcrafted bead jewellery
          </span>
        </p>
        <h1 className="mt-2 font-brand text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
          <span className="block overflow-hidden pb-[0.15em] pt-[0.05em]">
            <span data-reveal className="block">
              Every bead
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.15em] pt-[0.05em]">
            <span data-reveal className="block">
              tells a story
            </span>
          </span>
        </h1>
      </div>

      {layout && (
        <svg
          data-stage
          viewBox={`0 0 ${layout.vw} ${layout.vh}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="invisible absolute inset-0 h-full w-full"
        >
          {/* thread (drawn behind the beads) */}
          <path
            data-thread
            d={layout.pathD}
            pathLength={1}
            fill="none"
            stroke="#b58f5a"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />

          {/* clasp rings at the two ends */}
          <g data-clasp style={{ opacity: 0 }} fill="none" stroke="#c9962b" strokeWidth={4}>
            <circle cx={layout.start[0]} cy={layout.start[1]} r={10} />
            <circle cx={layout.end[0]} cy={layout.end[1]} r={10} />
          </g>

          {layout.beads
            .filter((b) => !b.pendant)
            .map((b) => (
              <image
                key={b.id}
                data-bead
                href={b.src}
                x={-b.size / 2}
                y={-b.size / 2}
                width={b.size}
                height={b.size}
              />
            ))}

          {/* pendant = the hero bead; rendered last so it sits on top */}
          {pendant && (
            <image
              data-pendant
              href={pendant.src}
              x={-pendant.size / 2}
              y={-pendant.size / 2}
              width={pendant.size}
              height={pendant.size}
            />
          )}
        </svg>
      )}

      {/* Closing copy + CTA */}
      <div data-outro className="invisible absolute inset-x-0 bottom-[6%] z-10 px-6 text-center">
        <h2 className="font-brand text-3xl font-bold sm:text-4xl">
          Made by hand, one bead at a time
        </h2>
        <Link
          href="/shop"
          className="mt-5 inline-block rounded-full bg-stone-900 px-7 py-3 text-sm tracking-wide text-white transition hover:bg-stone-700"
        >
          Shop the collection
        </Link>
      </div>

      {/* Scroll cue */}
      <div
        data-intro
        className="absolute inset-x-0 bottom-6 z-10 flex justify-center text-[11px] uppercase tracking-[0.3em] text-stone-500"
      >
        <div data-reveal-fade className="flex flex-col items-center gap-1">
          <span>Scroll</span>
          <span className="animate-bounce text-base leading-none">↓</span>
        </div>
      </div>
    </section>
  );
}
