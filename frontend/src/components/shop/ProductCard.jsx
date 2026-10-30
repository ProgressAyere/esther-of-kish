"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/products";
import { HeartButton } from "./product-ui";

// One tile in the shop grid: photo, name, price and a cart button.
// Clicking anywhere opens the product popup.
export default function ProductCard({ product, onOpen }) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="block w-full text-left"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-stone-200">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        <p className="mt-2.5 truncate text-[13px] text-stone-800">{product.name}</p>
      </button>

      <div className="mt-1 flex items-center justify-between">
        <p className="text-lg font-semibold text-stone-900">{formatPrice(product.price)}</p>
        <button
          type="button"
          onClick={() => onOpen(product)}
          aria-label={`Choose size and add ${product.name} to cart`}
          className="grid h-8 w-11 place-items-center rounded-full border border-stone-800 text-stone-900 transition hover:bg-stone-900 hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 4h2.2l2.1 10.2a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L19.5 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="19" r="1.3" />
            <circle cx="16.5" cy="19" r="1.3" />
            <path d="M12.5 9.2v3.6M10.7 11h3.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* favourite heart over the photo */}
      <HeartButton slug={product.slug} small className="absolute right-2 top-2" />
    </div>
  );
}
