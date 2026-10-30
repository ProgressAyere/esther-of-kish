// ---------------------------------------------------------------------------
// Esther Of Kish: product catalog
//
// PLACEHOLDER COPY: the write-ups, bead specs, sizes and prices below were
// written from general beading knowledge. Confirm materials, sizes and prices
// with Esther before launch.
//
// PHOTOS: each category folder in /public currently has ONE photo, so every
// product in a category reuses it. When you add more photos, drop them into the
// folder and change that product's `images` array (first image = main photo,
// extra images appear as thumbnails in the popup).
// ---------------------------------------------------------------------------

export const CURRENCY = "₦"; // change to "$" etc. in one place

export function formatPrice(amount) {
  return CURRENCY + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const GENDERS = {
  women: { id: "women", label: "Women", blurb: "Necklaces, bracelets, earrings, rings and sets" },
  men: { id: "men", label: "Men", blurb: "Bold chains, stretch bracelets, studs and bands" },
};

export const CATEGORIES = [
  { id: "necklaces", label: "Necklaces", image: "/necklaces/necklace.png", code: "NK" },
  { id: "bracelets", label: "Bracelets", image: "/bracelets/bracelet.png", code: "BR" },
  { id: "earrings", label: "Earrings", image: "/earrings/earring.png", code: "ER" },
  { id: "rings", label: "Rings", image: "/rings/ring.png", code: "RG" },
  { id: "sets", label: "Sets", image: "/sets/sets.png", code: "ST" },
];

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

const BRACELET_SIZES = {
  S: { wrist: "14–15.5 cm", inches: "5.5–6.1 in", length: "16.5 cm" },
  M: { wrist: "15.5–17 cm", inches: "6.1–6.7 in", length: "18 cm" },
  L: { wrist: "17–18.5 cm", inches: "6.7–7.3 in", length: "19.5 cm" },
  XL: { wrist: "18.5–20 cm", inches: "7.3–7.9 in", length: "21 cm" },
};

const NECKLACE_POSITIONS = {
  16: "Choker: sits at the base of the neck",
  18: "Princess: rests at the collarbone",
  20: "Matinee: just below the collarbone",
  22: "Sits at the upper chest",
  24: "Opera: sits at mid-chest",
};

// Standard inner diameters (mm) for US ring sizes
const RING_DIAMETERS = {
  5: 15.7, 6: 16.5, 7: 17.3, 8: 18.2, 9: 18.9, 10: 19.8, 11: 20.6, 12: 21.4, 13: 22.2,
};

export const SIZE_GUIDES = {
  ring: {
    title: "Ring size guide",
    intro:
      "Beaded rings are woven to size and don't stretch, so measure carefully. Wrap a thin strip of paper around the base of your finger, mark where it overlaps, and measure the length in mm. Match it to the circumference below. Between sizes? Size up.",
    columns: ["US size", "Inner diameter", "Circumference"],
    rows: Object.entries(RING_DIAMETERS).map(([size, d]) => [
      size,
      `${d.toFixed(1)} mm`,
      `${(Math.PI * d).toFixed(1)} mm`,
    ]),
  },
  bracelet: {
    title: "Bracelet size guide",
    intro:
      "Wrap a soft tape measure (or a strip of paper) snugly around your wrist just above the wrist bone and note the measurement. Pick the size whose wrist range includes yours. If you like a looser drape, size up.",
    columns: ["Size", "Wrist", "Finished length"],
    rows: Object.entries(BRACELET_SIZES).map(([k, v]) => [k, `${v.wrist} (${v.inches})`, v.length]),
  },
  necklace: {
    title: "Necklace length guide",
    intro:
      "Lengths are measured around the full necklace, clasp to clasp. If you are between lengths, choose the longer one: all necklaces include a short extender chain.",
    columns: ["Length", "In cm", "Where it sits"],
    rows: Object.entries(NECKLACE_POSITIONS).map(([inch, where]) => [
      `${inch} in`,
      `${Math.round(inch * 2.54)} cm`,
      where,
    ]),
  },
};

const ringSizes = (list) => ({
  id: "ring",
  label: "Ring size (US)",
  guide: "ring",
  options: list.map((s) => ({ value: String(s), label: String(s), hint: `${RING_DIAMETERS[s].toFixed(1)} mm` })),
});

const braceletSizes = (list) => ({
  id: "bracelet",
  label: "Wrist size",
  guide: "bracelet",
  options: list.map((k) => ({ value: k, label: k, hint: BRACELET_SIZES[k].wrist })),
});

const necklaceLengths = (list, label = "Length") => ({
  id: "length",
  label,
  guide: "necklace",
  options: list.map((i) => ({ value: `${i} in`, label: `${i}"`, hint: `${Math.round(i * 2.54)} cm` })),
});

const oneSize = {
  id: "size",
  label: "Size",
  guide: null,
  options: [{ value: "One size", label: "One size" }],
};

// ---------------------------------------------------------------------------
// Shared care text
// ---------------------------------------------------------------------------

const CARE = {
  general: [
    "Keep away from water, perfume, hairspray and lotion: put your jewellery on last and take it off first.",
    "Remove before swimming, bathing, exercising or sleeping.",
    "Store flat or hanging in the pouch provided, away from direct heat and sunlight.",
    "Wipe gently with a soft, dry cloth.",
  ],
  stretch: [
    "Roll the bracelet on and off over your hand: never pull it apart.",
    "Keep away from water, perfume and lotion, which can weaken elastic cord over time.",
    "Store flat in the pouch provided. Wipe gently with a soft, dry cloth.",
  ],
  stone: [
    "Natural stones can chip if knocked: avoid hard impacts and sudden temperature changes.",
    "Keep away from water, perfume and lotion. Wipe with a soft, dry cloth.",
    "Store separately so harder beads don't scratch softer ones.",
  ],
  beadwork: [
    "Woven beadwork is delicate: avoid snagging on knits and rough surfaces.",
    "Keep dry and away from perfume and lotion. Wipe with a soft, dry cloth.",
    "Store flat in the pouch provided.",
  ],
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const catImage = (id) => CATEGORIES.find((c) => c.id === id).image;

let counter = {};
function make(p) {
  const cat = CATEGORIES.find((c) => c.id === p.category);
  const key = `${p.category}-${p.gender}`;
  counter[key] = (counter[key] ?? 0) + 1;
  return {
    images: [catImage(p.category)],
    sku: `EOK-${cat.code}-${p.gender === "women" ? "W" : "M"}-${String(counter[key]).padStart(3, "0")}`,
    ...p,
  };
}

export const PRODUCTS = [
  // ============================== WOMEN ==============================
  make({
    slug: "ileke-coral-layered-necklace",
    name: "Ileke Coral Layered Necklace",
    gender: "women",
    category: "necklaces",
    price: 28000,
    tagline: "Three strands of coral-red glass, finished in gold.",
    story:
      "Inspired by the Yoruba tradition of ileke beadwork, this three-strand necklace layers coral-red glass beads of graduated sizes with bright gold spacers. Every strand is strung bead by bead so it drapes softly and sits just right against the collarbone. Wear it with a plain neckline to let the colour speak, or stack it with a pearl strand for an easy evening look.",
    beads: [
      "6 mm and 8 mm coral-red glass beads in graduated sizes",
      "Gold-tone brass spacer beads between each section",
      "49-strand nylon-coated stainless steel beading wire for strength and a soft drape",
      "Gold-plated lobster clasp with a 5 cm extender chain",
    ],
    specs: [
      ["Strands", "3 (each strand is 2 in longer than the one inside it)"],
      ["Closure", "Lobster clasp + extender chain"],
      ["Best for", "Weddings, celebrations, statement everyday wear"],
    ],
    colours: [
      { name: "Coral & Gold", hex: "#d9503f" },
      { name: "Teal & Gold", hex: "#14a89a" },
      { name: "Royal Blue & Gold", hex: "#2f5bd8" },
    ],
    sizeGroups: [necklaceLengths([16, 18, 20], "Length (shortest strand)")],
    care: CARE.general,
  }),
  make({
    slug: "pearl-gold-seed-bead-strand",
    name: "Freshwater Pearl & Gold Seed Bead Strand",
    gender: "women",
    category: "necklaces",
    price: 22500,
    tagline: "One graceful strand, a little gold between every pearl.",
    story:
      "A single strand of freshwater pearls with tiny gold seed beads set between them. Pearls are natural, so no two strands are identical: slight differences in shape and lustre are part of the charm. Light enough for every day and polished enough for weddings and celebrations.",
    beads: [
      "5–6 mm freshwater pearls (near-round to rice-shaped)",
      "2 mm gold-plated glass seed beads (11/0) as spacers",
      "Hand-knotted on strong nylon thread",
      "Gold-plated clasp with a 5 cm extender chain",
    ],
    specs: [
      ["Pearl size", "5–6 mm"],
      ["Closure", "Spring-ring clasp + extender chain"],
      ["Best for", "Bridal looks, graduations, gifting"],
    ],
    colours: [
      { name: "Ivory", hex: "#f1ebdd" },
      { name: "Blush", hex: "#e8c9c1" },
      { name: "Grey", hex: "#b4b0ad" },
    ],
    sizeGroups: [necklaceLengths([16, 18, 20])],
    care: CARE.general,
  }),
  make({
    slug: "sunset-seed-bead-cuff",
    name: "Sunset Seed Bead Cuff",
    gender: "women",
    category: "bracelets",
    price: 18000,
    tagline: "Deep red to gold, woven one bead at a time.",
    story:
      "Woven in peyote stitch with Japanese Delica seed beads, this slim cuff fades from deep red through orange to gold like the last light of the day. The beads are tiny and uniform, so the finished cuff is smooth, flexible and surprisingly light on the wrist. It stacks beautifully with a watch or a gemstone bracelet.",
    beads: [
      "Miyuki Delica 11/0 cylinder beads (about 1.6 mm), hand-woven in peyote stitch",
      "Braided beading thread, every row passed through twice for durability",
      "Adjustable hook-and-bead-loop closure (about 1 cm of give)",
    ],
    specs: [
      ["Width", "Approx. 1.5 cm"],
      ["Technique", "Peyote stitch"],
      ["Closure", "Hook & bead loop, adjustable by 1 cm"],
    ],
    colours: [
      { name: "Sunset", hex: "#e0653a" },
      { name: "Ocean", hex: "#1f7f9f" },
      { name: "Blush", hex: "#e7a9b5" },
    ],
    sizeGroups: [braceletSizes(["S", "M", "L"])],
    care: CARE.beadwork,
  }),
  make({
    slug: "gemstone-stretch-stack",
    name: "Gemstone Stretch Stack (Set of 3)",
    gender: "women",
    category: "bracelets",
    price: 14500,
    tagline: "Three gemstone bracelets made to be worn together.",
    story:
      "Three stretch bracelets in complementary gemstones (amethyst, rose quartz and clear quartz in the signature colourway), designed to be worn together or mixed in with your watch. Round 6 mm beads keep the look classic and the fit comfortable. Natural stones vary a little in tone and pattern, so your stack will be one of a kind.",
    beads: [
      "6 mm round natural gemstone beads (the colourway changes the stones)",
      "Strong 0.8 mm clear elastic cord, double-knotted and sealed",
      "Sold as a set of three bracelets in the same size",
    ],
    specs: [
      ["Bead size", "6 mm"],
      ["Pieces", "3 bracelets"],
      ["Fit", "Stretch, no clasp"],
    ],
    colours: [
      { name: "Amethyst & Rose", hex: "#9b6fb3" },
      { name: "Amazonite & Aventurine", hex: "#5fb7a8" },
      { name: "Onyx & Hematite", hex: "#2a2a2a" },
    ],
    sizeGroups: [braceletSizes(["S", "M", "L"])],
    care: CARE.stretch.concat(CARE.stone.slice(0, 1)),
  }),
  make({
    slug: "beaded-chandelier-earrings",
    name: "Beaded Chandelier Earrings",
    gender: "women",
    category: "earrings",
    price: 9500,
    tagline: "A fan of fringe that moves with you.",
    story:
      "A brick-stitch fan topped with a cascade of beaded fringe, woven by hand in tiny Delica seed beads. They move beautifully when you turn your head but stay comfortable for a whole day because the beadwork is so light. Dress them up with a simple outfit and let them be the main event.",
    beads: [
      "Miyuki Delica 11/0 seed beads in a brick-stitch fan with beaded fringe",
      "Braided beading thread, reinforced at every join",
      "Hypoallergenic surgical-steel ear wires (gold tone)",
    ],
    specs: [
      ["Drop length", "Approx. 7 cm (2.75 in)"],
      ["Fitting", "Ear hooks, sold as a pair"],
      ["Weight", "Feather-light, comfortable for all-day wear"],
    ],
    colours: [
      { name: "Jewel Mix", hex: "#c2185b" },
      { name: "Black & Gold", hex: "#1a1a1a" },
      { name: "White & Silver", hex: "#e5e5e5" },
    ],
    sizeGroups: [oneSize],
    care: CARE.beadwork,
  }),
  make({
    slug: "crystal-teardrop-earrings",
    name: "Crystal Teardrop Drop Earrings",
    gender: "women",
    category: "earrings",
    price: 8000,
    tagline: "Faceted glass drops that catch every bit of light.",
    story:
      "Faceted glass teardrops in the Czech glass style, each one wire-wrapped by hand with a small gold bead cap. The cuts scatter light so they sparkle even in soft indoor lighting. Elegant enough for a wedding guest, simple enough for the office.",
    beads: [
      "10 × 14 mm faceted glass teardrop beads",
      "Gold-plated brass wire wraps and bead caps",
      "Hypoallergenic gold-tone ear hooks",
    ],
    specs: [
      ["Drop length", "Approx. 4.5 cm (1.75 in)"],
      ["Fitting", "Ear hooks, sold as a pair"],
      ["Best for", "Weddings, dinners, the office"],
    ],
    colours: [
      { name: "Champagne", hex: "#e6cfa3" },
      { name: "Emerald", hex: "#1f7a5a" },
      { name: "Ruby", hex: "#a3182d" },
    ],
    sizeGroups: [oneSize],
    care: CARE.general,
  }),
  make({
    slug: "beaded-band-ring",
    name: "Beaded Band Ring",
    gender: "women",
    category: "rings",
    price: 5500,
    tagline: "A slim woven band with a tiny geometric pattern.",
    story:
      "A slim band woven row by row in brick stitch with Delica seed beads, finished with a small geometric pattern. Because beadwork doesn't stretch, each ring is made to your size, so choose from the guide for a snug, comfortable fit. Wear one on its own or stack a few colours together.",
    beads: [
      "Miyuki Delica 11/0 seed beads in brick stitch",
      "Braided beading thread, double-passed for strength",
      "About 5 mm wide, flat inside for comfort",
    ],
    specs: [
      ["Width", "Approx. 5 mm"],
      ["Technique", "Brick stitch"],
      ["Fit", "Made to size (no stretch)"],
    ],
    colours: [
      { name: "Gold & Black", hex: "#c9962b" },
      { name: "Teal & Gold", hex: "#14a89a" },
      { name: "Rose", hex: "#d98ca0" },
    ],
    sizeGroups: [ringSizes([5, 6, 7, 8, 9, 10])],
    care: CARE.beadwork,
  }),
  make({
    slug: "amazonite-pearl-set",
    name: "Amazonite & Pearl Three-Piece Set",
    gender: "women",
    category: "sets",
    price: 58000,
    tagline: "Necklace, bracelet and earrings that were made to match.",
    story:
      "A matching necklace, stretch bracelet and pair of earrings that pair soft blue-green amazonite with creamy freshwater pearls and gold accents. Every piece is made from the same beads, so they look balanced together, and each one still works on its own. A thoughtful choice for weddings, graduations and gifts.",
    beads: [
      "Necklace: 6 mm amazonite and 5 mm freshwater pearls with gold seed bead spacers",
      "Bracelet: 6 mm amazonite and pearl stretch bracelet on clear elastic cord",
      "Earrings: amazonite bead drops on hypoallergenic gold-tone ear hooks",
      "Gold-plated lobster clasp and extender chain on the necklace",
    ],
    specs: [
      ["Includes", "Necklace, bracelet, pair of earrings"],
      ["Earring drop", "Approx. 4 cm"],
      ["Packaging", "Presented together in a gift pouch"],
    ],
    colours: [
      { name: "Amazonite", hex: "#6dc5b9" },
      { name: "Rose Quartz", hex: "#e8b4c0" },
      { name: "Lapis", hex: "#2f4a9a" },
    ],
    sizeGroups: [necklaceLengths([16, 18, 20], "Necklace length"), braceletSizes(["S", "M", "L"])],
    care: CARE.stone,
  }),

  // =============================== MEN ===============================
  make({
    slug: "onyx-hematite-bead-chain",
    name: "Black Onyx & Hematite Bead Chain",
    gender: "men",
    category: "necklaces",
    price: 19500,
    tagline: "Understated, solid and easy to wear every day.",
    story:
      "Matte black onyx beads broken up by polished hematite spacers give this chain a quiet, confident look with a satisfying weight. It sits comfortably under an open collar or over a tee. Simple enough to wear daily, distinctive enough to notice.",
    beads: [
      "8 mm matte black onyx beads",
      "Polished hematite spacer beads",
      "Stainless steel beading wire for strength",
      "Stainless steel lobster clasp with a 5 cm extender chain",
    ],
    specs: [
      ["Bead size", "8 mm"],
      ["Closure", "Lobster clasp + extender chain"],
      ["Best for", "Everyday wear, layering"],
    ],
    colours: [
      { name: "Matte Black", hex: "#1c1c1c" },
      { name: "Black & Gold", hex: "#b08d2a" },
      { name: "Grey & Silver", hex: "#8b8b8b" },
    ],
    sizeGroups: [necklaceLengths([20, 22, 24])],
    care: CARE.stone,
  }),
  make({
    slug: "tigers-eye-wood-necklace",
    name: "Tiger's Eye & Wood Bead Necklace",
    gender: "men",
    category: "necklaces",
    price: 16000,
    tagline: "Warm gold-brown stone with a band of moving light.",
    story:
      "Tiger's eye is known for its chatoyancy, a silky band of light that seems to shift as you move. Here it is paired with natural wooden bead spacers for a warm, earthy necklace that works with linen, denim and agbada alike. Each stone is different, so your necklace will have its own pattern.",
    beads: [
      "8 mm natural tiger's eye beads",
      "Natural wooden spacer beads",
      "Waxed cotton cord knotted between sections for a relaxed drape",
      "Stainless steel clasp with a 5 cm extender chain",
    ],
    specs: [
      ["Bead size", "8 mm"],
      ["Closure", "Lobster clasp + extender chain"],
      ["Best for", "Casual and traditional outfits"],
    ],
    colours: [
      { name: "Golden Brown", hex: "#a3641f" },
      { name: "Red Tiger's Eye", hex: "#7a2e1d" },
      { name: "Blue Tiger's Eye", hex: "#34536b" },
    ],
    sizeGroups: [necklaceLengths([20, 22, 24])],
    care: CARE.stone,
  }),
  make({
    slug: "lava-onyx-stretch-bracelet",
    name: "Lava Stone & Onyx Stretch Bracelet",
    gender: "men",
    category: "bracelets",
    price: 9500,
    tagline: "Textured lava rock with polished onyx accents.",
    story:
      "Porous, textured lava stone beads sit alongside smooth polished onyx for a bracelet that looks as good as it feels. Lava stone is naturally porous, so many people like to add a drop of essential oil to the beads. A strong stretch fit means no clasp to fiddle with.",
    beads: [
      "8 mm natural lava stone beads",
      "8 mm polished black onyx beads",
      "Thick 1 mm clear elastic cord, double-knotted and sealed",
    ],
    specs: [
      ["Bead size", "8 mm"],
      ["Fit", "Stretch, no clasp"],
      ["Best for", "Everyday wear, stacking"],
    ],
    colours: [
      { name: "Black Lava", hex: "#2b2b2b" },
      { name: "Grey Lava", hex: "#7c7c7c" },
      { name: "Brown Lava", hex: "#6b4a2f" },
    ],
    sizeGroups: [braceletSizes(["M", "L", "XL"])],
    care: CARE.stretch.concat(CARE.stone.slice(0, 1)),
  }),
  make({
    slug: "krobo-style-glass-bracelet",
    name: "Krobo-Style Glass Bead Bracelet",
    gender: "men",
    category: "bracelets",
    price: 11000,
    tagline: "Earthy, hand-finished glass beads with a West African spirit.",
    story:
      "Made with powder-glass beads in the style of Ghana's Krobo bead makers, whose recycled-glass beads are admired across West Africa. The matte, earthy tones and slightly irregular shapes give each bracelet a handmade character. Strung on strong cord with a sliding knot, so it adjusts to your wrist.",
    beads: [
      "Krobo-style powder-glass beads in mixed sizes (6–10 mm)",
      "Strong waxed cord with an adjustable sliding knot",
      "Each bead is slightly different, which is part of the character",
    ],
    specs: [
      ["Bead size", "6–10 mm, mixed"],
      ["Closure", "Sliding knot, adjustable by about 2 cm"],
      ["Best for", "Casual wear, gifting"],
    ],
    colours: [
      { name: "Earth", hex: "#8a5a3b" },
      { name: "Ocean", hex: "#2f6f8f" },
      { name: "Forest", hex: "#3f6b4a" },
    ],
    sizeGroups: [braceletSizes(["M", "L", "XL"])],
    care: CARE.general,
  }),
  make({
    slug: "matte-onyx-stud-earrings",
    name: "Matte Onyx Stud Earrings",
    gender: "men",
    category: "earrings",
    price: 7000,
    tagline: "A small, sharp detail.",
    story:
      "A single 6 mm matte black onyx bead set on a stainless steel post, simple and sharp. They sit close to the ear, so they are comfortable all day and easy to pair with any outfit. Sold as a pair, with secure butterfly backs.",
    beads: [
      "6 mm natural matte black onyx beads",
      "Hypoallergenic stainless steel posts with butterfly backs",
    ],
    specs: [
      ["Bead size", "6 mm"],
      ["Fitting", "Post & butterfly back, sold as a pair"],
      ["Best for", "Everyday wear"],
    ],
    colours: [
      { name: "Matte Black", hex: "#1c1c1c" },
      { name: "Hematite", hex: "#6d6d73" },
      { name: "Tiger's Eye", hex: "#a3641f" },
    ],
    sizeGroups: [oneSize],
    care: CARE.stone,
  }),
  make({
    slug: "monochrome-beaded-band-ring",
    name: "Monochrome Beaded Band Ring",
    gender: "men",
    category: "rings",
    price: 6500,
    tagline: "A broad woven band in black and silver.",
    story:
      "A broader woven band in black and silver Delica seed beads, finished with a clean geometric pattern. The beadwork is smooth against the skin and light enough to forget you are wearing it. Because it doesn't stretch, each ring is made to size, so check the size guide before you order.",
    beads: [
      "Miyuki Delica 11/0 seed beads in brick stitch",
      "Braided beading thread, double-passed for strength",
      "About 8 mm wide, flat inside for comfort",
    ],
    specs: [
      ["Width", "Approx. 8 mm"],
      ["Technique", "Brick stitch"],
      ["Fit", "Made to size (no stretch)"],
    ],
    colours: [
      { name: "Black & Silver", hex: "#2a2a2a" },
      { name: "Black & Gold", hex: "#b08d2a" },
      { name: "Navy & Silver", hex: "#1f2e4d" },
    ],
    sizeGroups: [ringSizes([8, 9, 10, 11, 12, 13])],
    care: CARE.beadwork,
  }),
  make({
    slug: "onyx-hematite-set",
    name: "Onyx & Hematite Gentleman's Set",
    gender: "men",
    category: "sets",
    price: 32000,
    tagline: "A matching chain and bracelet.",
    story:
      "A matching bead chain and stretch bracelet in matte black onyx with polished hematite spacers. Made from the same stones so they sit together naturally, and each one works well on its own. Presented together, it is an easy gift for birthdays, graduations and weddings.",
    beads: [
      "Necklace: 8 mm matte black onyx with hematite spacers on stainless steel wire",
      "Bracelet: 8 mm onyx and hematite on strong clear elastic cord",
      "Stainless steel lobster clasp and extender chain on the necklace",
    ],
    specs: [
      ["Includes", "Necklace and bracelet"],
      ["Bead size", "8 mm"],
      ["Packaging", "Presented together in a gift pouch"],
    ],
    colours: [
      { name: "Matte Black", hex: "#1c1c1c" },
      { name: "Black & Gold", hex: "#b08d2a" },
      { name: "Grey & Silver", hex: "#8b8b8b" },
    ],
    sizeGroups: [necklaceLengths([20, 22, 24], "Necklace length"), braceletSizes(["M", "L", "XL"])],
    care: CARE.stone,
  }),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// One featured piece per category photo for the home page stack
export const FEATURED_SLUGS = [
  "ileke-coral-layered-necklace",
  "sunset-seed-bead-cuff",
  "beaded-chandelier-earrings",
  "beaded-band-ring",
  "amazonite-pearl-set",
];

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const getFeatured = () => FEATURED_SLUGS.map(getProduct).filter(Boolean);
export const productsFor = (gender) => PRODUCTS.filter((p) => p.gender === gender);
