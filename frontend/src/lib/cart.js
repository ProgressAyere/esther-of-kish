"use client";

// A tiny browser-side cart + wishlist so the "Add to cart" and heart buttons
// work today. It saves to localStorage and needs no provider.
// When the backend is ready, replace addToCart() with an API call.

import { useSyncExternalStore } from "react";

function createStore(storageKey) {
  const EMPTY = [];
  let value = EMPTY;
  let loaded = false;
  const listeners = new Set();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      value = raw ? JSON.parse(raw) : EMPTY;
    } catch {
      value = EMPTY;
    }
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      load();
      return value;
    },
    getServerSnapshot() {
      return EMPTY;
    },
    set(next) {
      load();
      value = next;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage full or blocked: keep working in memory */
      }
      listeners.forEach((l) => l());
    },
  };
}

const cartStore = createStore("eok-cart-v1");
const wishStore = createStore("eok-wishlist-v1");

// ---- cart -----------------------------------------------------------------

export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
}

export function useCartCount() {
  return useCart().reduce((n, item) => n + item.qty, 0);
}

// sizes: { length: "18 in", bracelet: "M" }
export function addToCart({ product, colour, sizes }) {
  const key = [product.slug, colour ?? "", JSON.stringify(sizes ?? {})].join("|");
  const items = cartStore.getSnapshot();
  const existing = items.find((i) => i.key === key);
  if (existing) {
    cartStore.set(items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)));
  } else {
    cartStore.set([
      ...items,
      {
        key,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        colour,
        sizes,
        qty: 1,
      },
    ]);
  }
}

export function removeFromCart(key) {
  cartStore.set(cartStore.getSnapshot().filter((i) => i.key !== key));
}

// ---- wishlist (hearts) ---------------------------------------------------

export function useWishlist() {
  return useSyncExternalStore(wishStore.subscribe, wishStore.getSnapshot, wishStore.getServerSnapshot);
}

export function toggleWishlist(slug) {
  const list = wishStore.getSnapshot();
  wishStore.set(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
}
